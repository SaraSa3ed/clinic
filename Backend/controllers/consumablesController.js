const { Consumables } = require("../Model"); // Adjust path based on your project structure
const AppError = require("../utils/appError");
const { uploadFilesLocally } = require("../middlewares/fileUpload");

// Create a new consumable
const consumablesFileFields = ["attachmentImage"];

exports.createConsumable = async (req, res, next) => {
  try {
    // استخدام Middleware لرفع الملفات تم تهيئته في الـ router
    // معالجة الملفات المرفوعة محليًا
    if (req.files) {
      const uploadedFiles = await uploadFilesLocally(req.files, consumablesFileFields);
      const consumableData = { ...req.body };
      uploadedFiles.forEach((file) => {
        consumableData[file.fieldName] = file.link;
      });
      console.log(req.body);
      const consumable = await Consumables.create(consumableData);
      res.status(201).json({
        status: "success",
        data: consumable,
      });
    } else {
      const uploadedFiles = [];

      // إعداد البيانات مع مسارات الملفات
      const consumableData = { ...req.body };
      uploadedFiles.forEach((file) => {
        consumableData[file.fieldName] = file.link;
      });
      console.log(req.body);
      const consumable = await Consumables.create(consumableData);
      res.status(201).json({
        status: "success",
        data: consumable,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get all consumables
exports.getAllConsumables = async (req, res, next) => {
  try {
    const consumables = await Consumables.findAll();
    res.status(200).json({
      status: "success",
      data: consumables,
    });
  } catch (error) {
    next(error);
  }
};

// Get single consumable by ID
exports.getConsumableById = async (req, res, next) => {
  try {
    const consumable = await Consumables.findByPk(req.params.id);
    if (!consumable) {
      throw new AppError("Consumable not found", 404);
    }
    res.status(200).json({
      status: "success",
      data: consumable,
    });
  } catch (error) {
    next(error);
  }
};

// Update a consumable
exports.updateConsumable = async (req, res, next) => {
  try {
    const consumable = await Consumables.findByPk(req.params.id);
    if (!consumable) {
      throw new AppError("Consumable not found", 404);
    }
    await consumable.update(req.body);
    res.status(200).json({
      status: "success",
      data: consumable,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a consumable
exports.deleteConsumable = async (req, res, next) => {
  try {
    const consumable = await Consumables.findByPk(req.params.id);
    if (!consumable) {
      throw new AppError("Consumable not found", 404);
    }
    await consumable.destroy();
    res.status(204).json({
      status: "success",
      message: "Consumable deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
