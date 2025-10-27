const SupplierInvoice = require("../Model/supplierInvoiceModel");
const { suppliersSchema } = require("../Model");
const multer = require("multer");
const path = require("path");
const { Op } = require("sequelize");

exports.list = async (req, res) => {
  try {
    const { supplier_id, status, q } = req.query;
    const where = { isDeleted: false };
    if (supplier_id) where.supplier_id = supplier_id;
    if (status) where.status = status;
    if (q) where.invoiceNumber = { [Op.like]: `%${q}%` };
    const rows = await SupplierInvoice.findAll({ where, order: [["invoiceDate", "DESC"]] });
    // Attach supplier object if available
    const supplierIds = Array.from(new Set(rows.map(r => r.supplier_id).filter(Boolean)));
    const supplierMap = new Map();
    if (supplierIds.length) {
      const suppliers = await suppliersSchema.findAll({ where: { supplier_id: supplierIds } });
      suppliers.forEach(s => supplierMap.set(s.supplier_id, s));
    }
    const data = rows.map(r => ({
      ...r.toJSON(),
      supplier: supplierMap.get(r.supplier_id) || null,
    }));
    res.json({ status: "success", results: data.length, data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const row = await SupplierInvoice.findByPk(req.params.id);
    if (!row) return res.status(404).json({ status: "fail", message: "Invoice not found" });
    res.json({ status: "success", data: row });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    const created = await SupplierInvoice.create(payload).then((i) => i.calculateTotals());
    await created.save();
    res.status(201).json({ status: "success", data: created });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

// Dress intake: minimal payload, optional file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "Uploads", "invoices")),
  filename: (req, file, cb) => cb(null, `INV_${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

exports.uploadMiddleware = upload.single("invoice_file");

exports.createDressIntake = async (req, res) => {
  try {
    const {
      productName,
      supplierName,
      quantity,
      price,
      invoiceDate,
      paymentMethod
    } = req.body || {};

    const mapPaymentMethod = (val) => {
      if (!val) return null;
      const v = String(val).toLowerCase();
      // DB ENUM: 'تحويل_بنكي','شيك','نقد','بطاقة_ائتمان','أخرى'
      if (v === 'cash' || v === 'نقد' || v === 'نقدي') return 'نقد';
      if (v === 'transfer' || v === 'تحويل' || v === 'تحويل_بنكي' || v === 'bank') return 'تحويل_بنكي';
      if (v === 'credit' || v === 'card' || v === 'بطاقة' || v === 'بطاقة_ائتمان') return 'بطاقة_ائتمان';
      if (v === 'cheque' || v === 'شيك') return 'شيك';
      return 'أخرى';
    };

    if (!productName || !supplierName || !quantity || !price) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        missing: [
          !productName && "productName",
          !supplierName && "supplierName",
          !quantity && "quantity",
          !price && "price",
        ].filter(Boolean)
      });
    }

    // Find supplier by name (ar or en)
    const supplier = await suppliersSchema.findOne({
      where: {
        // naive match on either arabic or english name
        // Note: for production, pass supplier_id directly
        name_ar: supplierName,
      }
    }) || await suppliersSchema.findOne({ where: { name_en: supplierName } });

    if (!supplier) {
      return res.status(400).json({ status: "error", message: "Supplier not found" });
    }

    const subtotal = Number(quantity) * Number(price);
    const payload = {
      invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`,
      supplier_id: supplier.supplier_id,
      invoiceDate: invoiceDate || new Date().toISOString().slice(0, 10),
      subtotal,
      taxAmount: 0,
      discountAmount: 0,
      shippingAmount: 0,
      totalAmount: subtotal,
      paidAmount: 0,
      currency: "EGP",
      paymentMethod: mapPaymentMethod(paymentMethod),
      notes: `Dress intake for ${productName}`,
      attachments: req.file ? [{ field: "invoice_file", path: `/Uploads/invoices/${req.file.filename}`, name: req.file.originalname }] : null,
    };

    const created = await SupplierInvoice.create(payload).then((i) => i.calculateTotals());
    await created.save();
    res.status(201).json({ status: "success", data: created });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const row = await SupplierInvoice.findByPk(req.params.id);
    if (!row) return res.status(404).json({ status: "fail", message: "Invoice not found" });
    
    // تحديث الحقول المحددة فقط، وليس جميع الحقول
    const allowedFields = ['notes', 'internalNotes', 'status', 'approvalStatus', 'dueDate', 'deliveryDate'];
    const updateData = {};
    
    // إضافة الحقول المسموح بها فقط
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updateData[field] = req.body[field];
      }
    });
    
    // تحديث البيانات فقط إذا كان هناك حقول للتحديث
    if (Object.keys(updateData).length > 0) {
      await row.update(updateData);
      await row.save();
    }
    
    res.json({ status: "success", data: row });
  } catch (err) {
    console.error('خطأ في تحديث الفاتورة:', err);
    res.status(400).json({ status: "error", message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const row = await SupplierInvoice.findByPk(req.params.id);
    if (!row) return res.status(404).json({ status: "fail", message: "Invoice not found" });
    
    // استخدام hard delete بدلاً من soft delete
    await row.destroy({ force: true });
    
    res.status(204).end();
  } catch (err) {
    console.error('خطأ في حذف الفاتورة:', err);
    res.status(400).json({ status: "error", message: err.message });
  }
};


