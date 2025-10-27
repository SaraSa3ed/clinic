const sequelize = require("./sequelize");
const dotenv = require("dotenv");

// Import all models
const {
  User,
  Storage,
  Branch,
  Service,
  Company,
  CompositeProduct,
  CompositeProductItem,
  Section,
  UserRole,
  
  Role,
  brandsSchema,
  categoriesSchema,
  inventorySchema,
  manufacturersSchema,
  productBranchesSchema,
  productsSchema,
  suppliersSchema,
  warehousesSchema,

  MainCategory,
  SubCategory,
  SparePart,
  OpeningStock,

  Consumables,
  StockCountSession,
  CountItem,
  Adjustment,
  RFQ,
  RFQItem,
  Quotation,
  ProcurementSettings,
  GoodsReceipt,
  GoodsReceiptItem,
  SupplierPaymentSchedule,
  SupplierContract,
  Survey,
  SurveyResponse,
  DentalAppointment,
  Doctor,
  InsuranceDeposit,
  Coupon,
  Plan,
  Subscription,
  LoyaltyMember,
  PointsTransaction,
  Expense,
  ExpenseCategory,
  LoyaltyRule,
  LoyaltyReward,
  
  // Supplier Settings schemas
  DropdownDefinition,
  SupplierCategory,
  SupplyRegion,
  PaymentTerm,
  
  // Company Settings schemas
  CompanyAttachment,
  CompanyAccount,
  
  // POS Models
  POSDevice,
  POSSettings,
  POSPaymentMethod,
  POSInvoiceTemplate,
  POSNotificationRule,
  POSReportTemplate,
  
  // Unit Template Models
  unitTemplateSchema,
  unitConversionSchema,
  
  // Inventory Transaction Models
  InventoryTransaction,
  InventoryTransactionItem,
  InventoryTransactionAttachment,
  InventoryTransactionLog,
  
  // Inventory Movement Models
  InventoryMovement,
  AIInsight,
  SmartAlert,
  
  // New Supplier System Models
  Supplier,
  SupplierInvoice,
  SupplierInvoiceItem,
  SupplierPayment,
  SupplierRating,
  
  // CRM Models
  Customer,
  Car,
  Contact,
  RelatedPerson,
  Feedback,
  Campaign,
  CampaignTarget,
  
} = require("../Model/index");
const serviceRepository = require("../Model/repository/serviceRepository");

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to SQL Server via Sequelize");

    // Sync tables in the correct order to respect foreign key dependencies
    // Base tables first
    try {
      await Company.sync({ force: false }); // Create Company table first
      console.log("Company table synchronized");
    } catch (err) {
      console.log("Company table already exists or error:", err.message);
    }
    
    try {
      await Branch.sync({ force: false }); // Create Branch table first
      console.log("Branch table synchronized");
    } catch (err) {
      console.log("Branch table already exists or error:", err.message);
    }
    
    try {
      await Section.sync({ force: false }); // Create Section table next
      console.log("Section table synchronized");
    } catch (err) {
      console.log("Section table already exists or error:", err.message);
    }
    
    
    
    try {
      await Role.sync({ force: false }); // Create Role table next
      console.log("Role table synchronized");
    } catch (err) {
      console.log("Role table already exists or error:", err.message);
    }
    
    
    
    
    
    
    

    
    try {
      await User.sync({ force: false }); // Create User table last
      console.log("User table synchronized");
    } catch (err) {
      console.log("User table already exists or error:", err.message);
    }
    
    try {
      await Storage.sync({ force: false }); // Create Storage table last
      console.log("Storage table synchronized");
    } catch (err) {
      console.log("Storage table already exists or error:", err.message);
    }

    try {
      await suppliersSchema.sync({ force: false });
      console.log("Suppliers table synchronized");
    } catch (err) {
      console.log("Suppliers table already exists or error:", err.message);
    }
    
    try {
      await brandsSchema.sync({ force: false });
      console.log("Brands table synchronized");
    } catch (err) {
      console.log("Brands table already exists or error:", err.message);
    }
    
    try {
      await categoriesSchema.sync({ force: false });
      console.log("Categories table synchronized");
    } catch (err) {
      console.log("Categories table already exists or error:", err.message);
    }
    
    try {
      await manufacturersSchema.sync({ force: false });
      console.log("Manufacturers table synchronized");
    } catch (err) {
      console.log("Manufacturers table already exists or error:", err.message);
    }
    
    try {
      await warehousesSchema.sync({ force: false });
      console.log("Warehouses table synchronized");
    } catch (err) {
      console.log("Warehouses table already exists or error:", err.message);
    }
    
    try {
      await productsSchema.sync({ force: false });
      console.log("Products table synchronized");
    } catch (err) {
      console.log("Products table already exists or error:", err.message);
    }
    
    try {
      await productBranchesSchema.sync({ force: false });
      console.log("ProductBranches table synchronized");
    } catch (err) {
      console.log("ProductBranches table already exists or error:", err.message);
    }
    
    try {
      await inventorySchema.sync({ force: false });
      console.log("Inventory table synchronized");
    } catch (err) {
      console.log("Inventory table already exists or error:", err.message);
    }
    
    try {
      await Service.sync({ force: false });
      console.log("Service table synchronized");
    } catch (err) {
      console.log("Service table already exists or error:", err.message);
    }

    try {
      await MainCategory.sync({ force: false });
      console.log("MainCategory table synchronized");
    } catch (err) {
      console.log("MainCategory table already exists or error:", err.message);
    }
    
    try {
      await SubCategory.sync({ force: false });
      console.log("SubCategory table synchronized");
    } catch (err) {
      console.log("SubCategory table already exists or error:", err.message);
    }
    
    try {
      await SparePart.sync({ force: false });
      console.log("SparePart table synchronized");
    } catch (err) {
      console.log("SparePart table already exists or error:", err.message);
    }
    
    try {
      await OpeningStock.sync({ force: false });
      console.log("OpeningStock table synchronized");
    } catch (err) {
      console.log("OpeningStock table already exists or error:", err.message);
    }

    try {
      await UserRole.sync({ force: false });
      console.log("UserRole table synchronized");
    } catch (err) {
      console.log("UserRole table already exists or error:", err.message);
    }
    
    try {
      await CompositeProduct.sync({ force: false });
      console.log("CompositeProduct table synchronized");
    } catch (err) {
      console.log("CompositeProduct table already exists or error:", err.message);
    }
    
    try {
      await CompositeProductItem.sync({ force: false });
      console.log("CompositeProductItem table synchronized");
    } catch (err) {
      console.log("CompositeProductItem table already exists or error:", err.message);
    }
    
    try {
      await Consumables.sync({ force: false });
      console.log("Consumables table synchronized");
    } catch (err) {
      console.log("Consumables table already exists or error:", err.message);
    }
    
    try {
      await StockCountSession.sync({ force: false });
      console.log("StockCountSession table synchronized");
    } catch (err) {
      console.log("StockCountSession table already exists or error:", err.message);
    }
    
    try {
      await CountItem.sync({ force: false });
      console.log("CountItem table synchronized");
    } catch (err) {
      console.log("CountItem table already exists or error:", err.message);
    }
    
    try {
      await Adjustment.sync({ force: false });
      console.log("Adjustment table synchronized");
    } catch (err) {
      console.log("Adjustment table already exists or error:", err.message);
    }
    
    
    try {
      await RFQ.sync({ force: false });
      console.log("RFQ table synchronized");
    } catch (err) {
      console.log("RFQ table already exists or error:", err.message);
    }
    
    try {
      await RFQItem.sync({ force: false });
      console.log("RFQItem table synchronized");
    } catch (err) {
      console.log("RFQItem table already exists or error:", err.message);
    }
    
    try {
      await Quotation.sync({ force: false });
      console.log("Quotation table synchronized");
    } catch (err) {
      console.log("Quotation table already exists or error:", err.message);
    }
    
    try {
      await ProcurementSettings.sync({ force: false });
      console.log("ProcurementSettings table synchronized");
    } catch (err) {
      console.log("ProcurementSettings table already exists or error:", err.message);
    }
    
     
    try {
      await GoodsReceipt.sync({ force: false });
      console.log("GoodsReceipt table synchronized");
    } catch (err) {
      console.log("GoodsReceipt table already exists or error:", err.message);
    }
    
    try {
      await GoodsReceiptItem.sync({ force: false });
      console.log("GoodsReceiptItem table synchronized");
    } catch (err) {
      console.log("GoodsReceiptItem table already exists or error:", err.message);
    }

   
    
    try {
      await SupplierPaymentSchedule.sync({ force: false });
      console.log("SupplierPaymentSchedule table synchronized");
    } catch (err) {
      console.log("SupplierPaymentSchedule table already exists or error:", err.message);
    }
    
    
    // Supplier Contracts
    try {
      await SupplierContract.sync({ force: false });
      console.log("SupplierContract table synchronized");
    } catch (err) {
      console.log("SupplierContract table already exists or error:", err.message);
    }

    // CRM Customers - Check if tables exist first to avoid conflicts
    try {
      await Customer.sync({ force: false });
      console.log("Customer table synchronized");
    } catch (err) {
      console.log("Customer table already exists or error:", err.message);
    }
    
    try {
      await Car.sync({ force: false });
      console.log("Car table synchronized");
    } catch (err) {
      console.log("Car table already exists or error:", err.message);
    }
    
    try {
      await Contact.sync({ force: false });
      console.log("Contact table synchronized");
    } catch (err) {
      console.log("Contact table already exists or error:", err.message);
    }
    
    try {
      await RelatedPerson.sync({ force: false });
      console.log("RelatedPerson table synchronized");
    } catch (err) {
      console.log("RelatedPerson table already exists or error:", err.message);
    }
    
    try {
      await Feedback.sync({ force: false });
      console.log("Feedback table synchronized");
    } catch (err) {
      console.log("Feedback table already exists or error:", err.message);
    }

    // Marketing Campaigns
    try {
      await Campaign.sync({ force: false });
      console.log("Campaign table synchronized");
    } catch (err) {
      console.log("Campaign table already exists or error:", err.message);
    }
    
    try {
      await CampaignTarget.sync({ force: false });
      console.log("CampaignTarget table synchronized");
    } catch (err) {
      console.log("CampaignTarget table already exists or error:", err.message);
    }

    // Surveys
    try {
      await Survey.sync({ force: false });
      console.log("Survey table synchronized");
    } catch (err) {
      console.log("Survey table already exists or error:", err.message);
    }
    
    try {
      await SurveyResponse.sync({ force: false });
      console.log("SurveyResponse table synchronized");
    } catch (err) {
      console.log("SurveyResponse table already exists or error:", err.message);
    }

    try {
      await DentalAppointment.sync({ force: false });
      console.log("DentalAppointment table synchronized");
    } catch (err) {
      console.log("DentalAppointment table already exists or error:", err.message);
    }

    try {
      await Doctor.sync({ force: false });
      console.log("Doctor table synchronized");
    } catch (err) {
      console.log("Doctor table already exists or error:", err.message);
    }

    // Insurance Deposits
    try {
      await InsuranceDeposit.sync({ force: false });
      console.log("InsuranceDeposit table synchronized");
    } catch (err) {
      console.log("InsuranceDeposit table already exists or error:", err.message);
    }

    // Coupons - إضافة جدول الكوبونات
    try {
      await Coupon.sync({ force: false });
      console.log("Coupon table synchronized");
    } catch (err) {
      console.log("Coupon table already exists or error:", err.message);
    }

    // Plans - إضافة جدول الخطط
    try {
      await Plan.sync({ force: false });
      console.log("Plan table synchronized");
    } catch (err) {
      console.log("Plan table already exists or error:", err.message);
    }

        // Subscriptions - إضافة جدول الاشتراكات
    try {
      await Subscription.sync({ force: false });
      console.log("Subscription table synchronized");
    } catch (err) {
      console.log("Subscription table already exists or error:", err.message);
    }

    // Loyalty Members - إضافة جدول أعضاء الولاء
    try {
      await LoyaltyMember.sync({ force: false });
      console.log("LoyaltyMember table synchronized");
    } catch (err) {
      console.log("LoyaltyMember table already exists or error:", err.message);
    }

    // Points Transactions - إضافة جدول معاملات النقاط
    try {
      await PointsTransaction.sync({ force: false });
      console.log("PointsTransaction table synchronized");
    } catch (err) {
      console.log("PointsTransaction table already exists or error:", err.message);
    }

    // Loyalty Rules - إضافة جدول قواعد الولاء
    try {
      await LoyaltyRule.sync({ force: false });
      console.log("LoyaltyRule table synchronized");
    } catch (err) {
      console.log("LoyaltyRule table already exists or error:", err.message);
    }

    // Loyalty Rewards - إضافة جدول مكافآت الولاء
    try {
      await LoyaltyReward.sync({ force: false });
      console.log("LoyaltyReward table synchronized");
    } catch (err) {
      console.log("LoyaltyReward table already exists or error:", err.message);
    }

    // Expense System - إنشاء جداول المصروفات والفئات الخاصة بها
    try {
      await ExpenseCategory.sync({ force: false });
      console.log("ExpenseCategory table synchronized");
    } catch (err) {
      console.log("ExpenseCategory table already exists or error:", err.message);
    }

    try {
      await Expense.sync({ force: false });
      console.log("Expense table synchronized");
    } catch (err) {
      console.log("Expense table already exists or error:", err.message);
    }

    // Supplier Reports System - إنشاء جداول تقارير الموردين
    try {
      await SupplierRating.sync({ force: false });
      console.log("SupplierRating table synchronized");
    } catch (err) {
      console.log("SupplierRating table already exists or error:", err.message);
    }

    // Supplier Settings schemas - إضافة جداول إعدادات الموردين
    try {
      await DropdownDefinition.sync({ force: false });
      console.log("DropdownDefinition table synchronized");
    } catch (err) {
      console.log("DropdownDefinition table already exists or error:", err.message);
    }

    try {
      await SupplierCategory.sync({ force: false });
      console.log("SupplierCategory table synchronized");
    } catch (err) {
      console.log("SupplierCategory table already exists or error:", err.message);
    }

    try {
      await SupplyRegion.sync({ force: false });
      console.log("SupplyRegion table synchronized");
    } catch (err) {
      console.log("SupplyRegion table already exists or error:", err.message);
    }

    try {
      await PaymentTerm.sync({ force: false });
      console.log("PaymentTerm table synchronized");
    } catch (err) {
      console.log("PaymentTerm table already exists or error:", err.message);
    }

    // Company Settings tables
    try {
      await CompanyAttachment.sync({ force: false });
      console.log("CompanyAttachment table synchronized");
    } catch (err) {
      console.log("CompanyAttachment table already exists or error:", err.message);
    }

    try {
      await CompanyAccount.sync({ force: false });
      console.log("CompanyAccount table synchronized");
    } catch (err) {
      console.log("CompanyAccount table already exists or error:", err.message);
    }

      // POS Tables Synchronization
  try {
    await POSDevice.sync({ force: false });
    console.log("POSDevice table synchronized");
  } catch (err) {
    console.log("POSDevice table already exists or error:", err.message);
  }

  // Unit Template Tables Synchronization
  try {
    await unitTemplateSchema.sync({ force: false });
    console.log("UnitTemplate table synchronized");
  } catch (err) {
    console.log("UnitTemplate table already exists or error:", err.message);
  }

  try {
    await unitConversionSchema.sync({ force: false });
    console.log("UnitConversion table synchronized");
  } catch (err) {
    console.log("UnitConversion table already exists or error:", err.message);
  }

    try {
      await POSSettings.sync({ force: false });
      console.log("POSSettings table synchronized");
    } catch (err) {
      console.log("POSSettings table already exists or error:", err.message);
    }

    try {
      await POSPaymentMethod.sync({ force: false });
      console.log("POSPaymentMethod table synchronized");
    } catch (err) {
      console.log("POSPaymentMethod table already exists or error:", err.message);
    }

    try {
      await POSInvoiceTemplate.sync({ force: false });
      console.log("POSInvoiceTemplate table synchronized");
    } catch (err) {
      console.log("POSInvoiceTemplate table already exists or error:", err.message);
    }

    try {
      await POSNotificationRule.sync({ force: false });
      console.log("POSNotificationRule table synchronized");
    } catch (err) {
      console.log("POSNotificationRule table already exists or error:", err.message);
    }

    try {
      await POSReportTemplate.sync({ force: false });
      console.log("POSReportTemplate table synchronized");
    } catch (err) {
      console.log("POSReportTemplate table already exists or error:", err.message);
    }
    
    // Inventory Transaction Tables Synchronization
    try {
      await InventoryTransaction.sync({ force: false });
      console.log("InventoryTransaction table synchronized");
    } catch (err) {
      console.log("InventoryTransaction table already exists or error:", err.message);
    }
    
    try {
      await InventoryTransactionItem.sync({ force: false });
      console.log("InventoryTransactionItem table synchronized");
    } catch (err) {
      console.log("InventoryTransactionItem table already exists or error:", err.message);
    }
    
    try {
      await InventoryTransactionAttachment.sync({ force: false });
      console.log("InventoryTransactionAttachment table synchronized");
    } catch (err) {
      console.log("InventoryTransactionAttachment table already exists or error:", err.message);
    }
    
    try {
      await InventoryTransactionLog.sync({ force: false });
      console.log("InventoryTransactionLog table synchronized");
    } catch (err) {
      console.log("InventoryTransactionLog table already exists or error:", err.message);
    }
    
    // Inventory Movement Tables Synchronization
    try {
      await InventoryMovement.sync({ force: false });
      console.log("InventoryMovement table synchronized");
    } catch (err) {
      console.log("InventoryMovement table already exists or error:", err.message);
    }
    
    try {
      await AIInsight.sync({ force: false });
      console.log("AIInsight table synchronized");
    } catch (err) {
      console.log("AIInsight table already exists or error:", err.message);
    }
    
    try {
      await SmartAlert.sync({ force: false });
      console.log("SmartAlert table synchronized");
    } catch (err) {
      console.log("SmartAlert table already exists or error:", err.message);
    }
    
    
    try {
      await SupplierInvoice.sync({ force: false });
      console.log("SupplierInvoice table synchronized");
    } catch (err) {
      console.log("SupplierInvoice table already exists or error:", err.message);
    }

    try {
      await SupplierInvoiceItem.sync({ force: false });
      console.log("SupplierInvoiceItem table synchronized");
    } catch (err) {
      console.log("SupplierInvoiceItem table already exists or error:", err.message);
    }

    try {
      await SupplierPayment.sync({ force: false });
      console.log("SupplierPayment table synchronized");
    } catch (err) {
      console.log("SupplierPayment table already exists or error:", err.message);
    }
    
    console.log("All models synchronized successfully");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};

module.exports = { 
  connectDB,
  // Export all models
  User,
  Storage,
  Branch,
  Service,
  Company,
  CompositeProduct,
  CompositeProductItem,
  Section,
  UserRole,
  Role,
  brandsSchema,
  categoriesSchema,
  inventorySchema,
  manufacturersSchema,
  productBranchesSchema,
  productsSchema,
  suppliersSchema,
  warehousesSchema,
  MainCategory,
  SubCategory,
  SparePart,
  OpeningStock,
  Consumables,
  StockCountSession,
  CountItem,
  Adjustment,
  RFQ,
  RFQItem,
  Quotation,
  ProcurementSettings,
  GoodsReceipt,
  GoodsReceiptItem,
  SupplierPaymentSchedule,
  SupplierContract,
  Survey,
  SurveyResponse,
  DentalAppointment,
  Doctor,
  InsuranceDeposit,
  Coupon,
  Plan,
  Subscription,
  LoyaltyMember,
  PointsTransaction,
  Expense,
  ExpenseCategory,
  LoyaltyRule,
  LoyaltyReward,
  DropdownDefinition,
  SupplierInvoice,
  SupplierInvoiceItem,
  SupplierPayment,
  SupplierRating,
  POSDevice,
  POSSettings,
  POSPaymentMethod,
  POSInvoiceTemplate,
  POSNotificationRule,
  POSReportTemplate
};
