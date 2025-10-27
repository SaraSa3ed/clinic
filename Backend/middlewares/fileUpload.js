const multer = require("multer");
const path = require("path");
const fs = require("fs");
const appError = require("../utils/appError");

// إعداد Multer لرفع الملفات محليًا
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../Uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // حد 10 ميجا للملفات
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new appError("فقط الصور (jpg, jpeg, png) وملفات PDF مسموح بها", 400));
  },
});

// دالة ديناميكية لمعالجة الملفات المرفوعة محليًا
const uploadFilesLocally = async (files, modelFields) => {
  // فحص وجود الملفات
  if (!files || typeof files !== 'object') {
    console.log('No files provided to uploadFilesLocally');
    return [];
  }
  
  const uploadedFiles = [];
  for (const fieldName of modelFields) {
    if (files[fieldName] && Array.isArray(files[fieldName]) && files[fieldName].length > 0) {
      const file = files[fieldName][0]; // افتراض ملف واحد لكل حقل
      if (file && file.filename) {
        uploadedFiles.push({
          fieldName,
          link: `/Uploads/${file.filename}`, // المسار النصي للملف
        });
        console.log(`File uploaded successfully: ${fieldName} -> ${file.filename}`);
      } else {
        console.log(`Invalid file object for field: ${fieldName}`, file);
      }
    } else {
      console.log(`No files found for field: ${fieldName}`);
    }
  }
  
  console.log('Total uploaded files:', uploadedFiles.length);
  return uploadedFiles;
};

// Middleware ديناميكي لرفع الملفات بناءً على حقول الموديل
const dynamicUpload = (modelFields) => {
  return upload.fields(modelFields.map((field) => ({ name: field, maxCount: 1 })));
};

module.exports = { dynamicUpload, uploadFilesLocally };
