const { Op } = require("sequelize");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Customer = require("../Model/schema/customerSchema");
const Car = require("../Model/schema/carSchema");
const Contact = require("../Model/schema/contactSchema");
const RelatedPerson = require("../Model/schema/relatedPersonSchema");

// Include relations
const includeRelations = [
  { model: Car, as: "cars" },
  { model: Contact, as: "contacts" },
  { model: RelatedPerson, as: "relatedCustomers" },
];

exports.list = catchAsync(async (req, res) => {
  const { q, type, limit = 50, offset = 0 } = req.query;
  const where = {};
  if (type) where.customerType = type;
  if (q) {
    where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { phone: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } },
    ];
  }
  const { rows, count } = await Customer.findAndCountAll({
    where,
    include: includeRelations,
    order: [["createdAt", "DESC"]],
    limit: Number(limit),
    offset: Number(offset),
  });
  res.json({ status: "success", data: rows, total: count });
});

exports.getById = catchAsync(async (req, res, next) => {
  const customer = await Customer.findByPk(req.params.id, { include: includeRelations });
  if (!customer) return next(new AppError("Customer not found", 404));
  res.json({ status: "success", data: customer });
});

exports.create = catchAsync(async (req, res) => {
  console.log('=== Customer Create Request ===');
  console.log('Body:', req.body);
  console.log('Files:', req.files);
  
  // البيانات الأساسية المطلوبة فقط
  const customerData = {
    name: req.body.name?.trim(),
    phone: req.body.phone?.trim(),
    phone2: req.body.phone2?.trim() || null,
    notes: req.body.notes?.trim() || null,
    customerType: req.body.customerType || 'Individual'
  };
  
  // التحقق من البيانات المطلوبة
  if (!customerData.name || !customerData.phone) {
    return res.status(400).json({
      status: "error",
      message: "الاسم ورقم الجوال مطلوبان"
    });
  }
  
  // معالجة الملفات المرفوعة
  const files = req.files || {};
  console.log('Files received:', files);
  
  if (files.personalPhoto && files.personalPhoto[0]?.filename) {
    customerData.personalPhotoUrl = `http://localhost:5011/Uploads/${files.personalPhoto[0].filename}`;
    console.log('Personal photo URL:', customerData.personalPhotoUrl);
  }
  if (files.nationalIdImage && files.nationalIdImage[0]?.filename) {
    customerData.nationalIdImageUrl = `http://localhost:5011/Uploads/${files.nationalIdImage[0].filename}`;
    console.log('National ID image URL:', customerData.nationalIdImageUrl);
  }
  
  console.log('Creating customer with data:', customerData);
  
  try {
    const created = await Customer.create(customerData);
    console.log('Customer created successfully:', created.id);
    
    // إرجاع البيانات
    res.status(201).json({ status: "success", data: created });
  } catch (dbError) {
    console.error('Database error creating customer:', dbError);
    res.status(400).json({ 
      status: "error", 
      message: "خطأ في قاعدة البيانات: " + dbError.message
    });
  }
});

exports.update = catchAsync(async (req, res, next) => {
  console.log('=== Customer Update Request ===');
  console.log('Body:', req.body);
  console.log('Files:', req.files);
  
  // البيانات الأساسية المطلوبة فقط
  const customerData = {
    name: req.body.name?.trim(),
    phone: req.body.phone?.trim(),
    phone2: req.body.phone2?.trim() || null,
    notes: req.body.notes?.trim() || null,
    customerType: req.body.customerType || 'Individual'
  };
  
  const existing = await Customer.findByPk(req.params.id);
  if (!existing) return next(new AppError("Customer not found", 404));
  
  // التحقق من البيانات المطلوبة
  if (!customerData.name || !customerData.phone) {
    return res.status(400).json({
      status: "error",
      message: "الاسم ورقم الجوال مطلوبان"
    });
  }
  
  // معالجة الملفات المرفوعة
  const files = req.files || {};
  console.log('Files received for update:', files);
  
  if (files.personalPhoto && files.personalPhoto[0]?.filename) {
    customerData.personalPhotoUrl = `http://localhost:5011/Uploads/${files.personalPhoto[0].filename}`;
    console.log('Personal photo URL:', customerData.personalPhotoUrl);
  }
  if (files.nationalIdImage && files.nationalIdImage[0]?.filename) {
    customerData.nationalIdImageUrl = `http://localhost:5011/Uploads/${files.nationalIdImage[0].filename}`;
    console.log('National ID image URL:', customerData.nationalIdImageUrl);
  }
  
  console.log('Updating customer with data:', customerData);
  await existing.update(customerData);
  
  res.json({ status: "success", data: existing });
});

exports.remove = catchAsync(async (req, res, next) => {
  const existing = await Customer.findByPk(req.params.id);
  if (!existing) return next(new AppError("Customer not found", 404));
  await Car.destroy({ where: { customerId: existing.id } });
  await Contact.destroy({ where: { customerId: existing.id } });
  await RelatedPerson.destroy({ where: { customerId: existing.id } });
  await existing.destroy();
  res.status(204).json({ status: "success" });
});


