const brandsSchema = require("./schema/brandsSchema");
const categoriesSchema = require("./schema/categoriesSchema");
const inventorySchema = require("./schema/inventorySchema");
const manufacturersSchema = require("./schema/manufacturersSchema");
const productBranchesSchema = require("./schema/productBranchesSchema");
const productsSchema = require("./schema/productsSchema");
const suppliersSchema = require("./schema/suppliersSchema");
const warehousesSchema = require("./schema/warehousesSchema");
const unitTemplateSchema = require("./schema/unitTemplateSchema");
const unitConversionSchema = require("./schema/unitConversionSchema");

const User = require("./userModel");
const Role = require("./roleModel");
const UserRole = require("./user_roleModel");
const Service = require("./serviceModel");
const Branch = require("./branchesModel");
const Storage = require("./storageModel");
const Company = require("./companyModel");
const CompositeProduct = require("./composite_products");
const CompositeProductItem = require("./composite_product_itemsModel");
const Section = require("./sectionModel");

const SparePart = require("./sparePartModel");
const MainCategory = require("./mainCategoryModel");
const SubCategory = require("./subCategoryModel");
const OpeningStock = require("./openingStockModel");

const Consumables = require("./consumablesModel");
const CountItem = require("./schema/countItemSchema");
const Coupon = require("./couponModel");
const Adjustment = require("./schema/adjustmentSchema");
const StockCountSession = require("./schema/stockCountSessionSchema");
const RFQ = require("./schema/rfqSchema");
const RFQItem = require("./schema/rfqItemSchema");
const Quotation = require("./schema/quotationSchema");
const ProcurementSettings = require("./schema/procurementSettingsSchema");
const GoodsReceipt = require("./schema/goodsReceiptSchema");
const GoodsReceiptItem = require("./schema/goodsReceiptItemSchema");
const SupplierPaymentSchedule = require("./schema/supplierPaymentScheduleSchema");
const SupplierContract = require("./schema/supplierContractSchema");
const Customer = require("./schema/customerSchema");
const Car = require("./schema/carSchema");
const Contact = require("./schema/contactSchema");
const RelatedPerson = require("./schema/relatedPersonSchema");
const Feedback = require("./schema/feedbackSchema");
const Survey = require("./schema/surveySchema");
const SurveyResponse = require("./schema/surveyResponseSchema");
const DentalAppointment = require("./schema/dentalAppointmentSchema");
const Doctor = require("./doctorModel");
const InsuranceDeposit = require("./schema/insuranceDepositSchema");
const CompanyAttachment = require("./schema/companyAttachmentSchema");
const CompanyAccount = require("./schema/companyAccountSchema");
const Campaign = require("./schema/campaignSchema");
const CampaignTarget = require("./schema/campaignTargetSchema");
const Subscription = require("./subscriptionModel");
const Plan = require("./planModel");
const LoyaltyMember = require("./loyaltyMemberModel");
const PointsTransaction = require("./pointsTransactionModel");
const LoyaltyRule = require("./loyaltyRuleModel");
const LoyaltyReward = require("./loyaltyRewardModel");
const DropdownDefinition = require("./schema/dropdownDefinitionSchema");
const SupplierCategory = require("./schema/supplierCategorySchema");
const SupplyRegion = require("./schema/supplyRegionSchema");
const PaymentTerm = require("./schema/paymentTermSchema");

// Expense Models
const Expense = require("./expenseModel");
const ExpenseCategory = require("./expenseCategoryModel");

// POS Models
const POSDevice = require("./posDeviceModel");
const POSSettings = require("./posSettingsModel");
const POSPaymentMethod = require("./posPaymentMethodModel");
const POSInvoiceTemplate = require("./posInvoiceTemplateModel");
const POSNotificationRule = require("./posNotificationRuleModel");
const POSReportTemplate = require("./posReportTemplateModel");

// Inventory Transaction Models
const {
  InventoryTransaction,
  InventoryTransactionItem,
  InventoryTransactionAttachment,
  InventoryTransactionLog
} = require("./schema/inventoryTransactionSchema");

// Inventory Movement Models
const InventoryMovement = require("./inventoryMovementModel");
const AIInsight = require("./aiInsightModel");
const SmartAlert = require("./smartAlertModel");

// Use existing suppliersSchema instead of a new Supplier model
const Supplier = suppliersSchema;
const SupplierInvoice = require("./supplierInvoiceModel");
const SupplierInvoiceItem = require("./supplierInvoiceItemModel");
const SupplierPayment = require("./supplierPaymentModel");
const SupplierRating = require("./schema/supplierRatingSchema");

// Company relationships
Company.hasMany(Branch, { foreignKey: "companyId", as: "branches" });
Branch.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// Company attachments and account relationships
Company.hasMany(CompanyAttachment, { foreignKey: "company_id", as: "attachments" });
CompanyAttachment.belongsTo(Company, { foreignKey: "company_id", as: "company" });

Company.hasMany(CompanyAccount, { foreignKey: "company_id", as: "accounts" });
CompanyAccount.belongsTo(Company, { foreignKey: "company_id", as: "company" });

// Branch relationships
Branch.hasMany(User, { foreignKey: "branchId", as: "users" });
User.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });
// في موديل Branch
Branch.hasMany(Storage, { foreignKey: "branchId", as: "storages" });

// في موديل Storage
Storage.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

// POS Relationships
Company.hasMany(POSDevice, { foreignKey: "companyId", as: "posDevices" });
POSDevice.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Branch.hasMany(POSDevice, { foreignKey: "branchId", as: "posDevices" });
POSDevice.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

Company.hasMany(POSSettings, { foreignKey: "companyId", as: "posSettings" });
POSSettings.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Branch.hasMany(POSSettings, { foreignKey: "branchId", as: "posSettings" });
POSSettings.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

Company.hasMany(POSPaymentMethod, { foreignKey: "companyId", as: "posPaymentMethods" });
POSPaymentMethod.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Company.hasMany(POSInvoiceTemplate, { foreignKey: "companyId", as: "posInvoiceTemplates" });
POSInvoiceTemplate.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Company.hasMany(POSNotificationRule, { foreignKey: "companyId", as: "posNotificationRules" });
POSNotificationRule.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Company.hasMany(POSReportTemplate, { foreignKey: "companyId", as: "posReportTemplates" });
POSReportTemplate.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// Section relationships
Section.hasMany(User, { foreignKey: "sectionId", as: "users" });
User.belongsTo(Section, { foreignKey: "sectionId", as: "section" });

// User relationships
User.hasMany(UserRole, { foreignKey: "userId", as: "userRoles" });
UserRole.belongsTo(User, { foreignKey: "userId", as: "user" });

// Role relationships
Role.hasMany(UserRole, { foreignKey: "roleId", as: "userRoles" });
UserRole.belongsTo(Role, { foreignKey: "roleId", as: "role" });

// Category relationships
categoriesSchema.hasMany(productsSchema, { foreignKey: "category_id", as: "products" });
productsSchema.belongsTo(categoriesSchema, { foreignKey: "category_id", as: "category" });

categoriesSchema.hasMany(categoriesSchema, { foreignKey: "parent_category_id", as: "subcategories" });
categoriesSchema.belongsTo(categoriesSchema, { foreignKey: "parent_category_id", as: "parentCategory" });

brandsSchema.hasMany(productsSchema, { foreignKey: "brand_id", as: "products" });
productsSchema.belongsTo(brandsSchema, { foreignKey: "brand_id", as: "brand" });

manufacturersSchema.hasMany(productsSchema, { foreignKey: "manufacturer_id", as: "products" });
productsSchema.belongsTo(manufacturersSchema, { foreignKey: "manufacturer_id", as: "manufacturer" });

suppliersSchema.hasMany(productsSchema, { foreignKey: "supplier_id", as: "products" });
productsSchema.belongsTo(suppliersSchema, { foreignKey: "supplier_id", as: "supplier" });

suppliersSchema.hasMany(SparePart, { foreignKey: "supplier_id", as: "spareParts" });
SparePart.belongsTo(suppliersSchema, { foreignKey: "supplier_id", as: "supplier" });

// Product relationships
productsSchema.hasMany(inventorySchema, { foreignKey: "product_id", as: "inventory" });
inventorySchema.belongsTo(productsSchema, { foreignKey: "product_id", as: "product" });

// Product audit relationships
productsSchema.belongsTo(User, { foreignKey: "created_by", as: "creator" });
productsSchema.belongsTo(User, { foreignKey: "updated_by", as: "updater" });

productsSchema.hasMany(productBranchesSchema, { foreignKey: "product_id", as: "productBranches" });
productBranchesSchema.belongsTo(productsSchema, { foreignKey: "product_id", as: "product" });

productsSchema.hasMany(CompositeProductItem, { foreignKey: "productId", as: "compositeItems" });
CompositeProductItem.belongsTo(productsSchema, { foreignKey: "productId", as: "product" });

// DentalAppointment relationships (بدون foreign key constraints)
productsSchema.hasMany(DentalAppointment, { 
  foreignKey: "treatment_id", 
  as: "dentalAppointments",
  constraints: false  // إزالة foreign key constraint
});
DentalAppointment.belongsTo(productsSchema, { 
  foreignKey: "treatment_id", 
  as: "treatment",
  constraints: false  // إزالة foreign key constraint
});

// Doctor relationships
Branch.hasMany(Doctor, { foreignKey: "branch_id", as: "doctors" });
Doctor.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

// Warehouse relationships
warehousesSchema.hasMany(inventorySchema, { foreignKey: "warehouse_id", as: "inventory" });
inventorySchema.belongsTo(warehousesSchema, { foreignKey: "warehouse_id", as: "warehouse" });

warehousesSchema.hasMany(SparePart, { foreignKey: "warehouse_id", as: "spareParts" });
SparePart.belongsTo(warehousesSchema, { foreignKey: "warehouse_id", as: "warehouse" });

// Add missing association between Warehouses and Branch
warehousesSchema.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });
Branch.hasMany(warehousesSchema, { foreignKey: "branch_id", as: "warehouses" });

// Branch relationships with products
Branch.hasMany(productBranchesSchema, { foreignKey: "branch_id", as: "productBranches" });
productBranchesSchema.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

Branch.hasMany(SparePart, { foreignKey: "branch_Id", as: "spareParts" });
SparePart.belongsTo(Branch, { foreignKey: "branch_Id", as: "branch" });

// Composite Product relationships
CompositeProduct.hasMany(CompositeProductItem, { foreignKey: "compositeProductId", as: "items" });
CompositeProductItem.belongsTo(CompositeProduct, { foreignKey: "compositeProductId", as: "compositeProduct" });

// Service relationships
Service.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });
Branch.hasMany(Service, { foreignKey: "branchId", as: "services" });

Service.belongsTo(categoriesSchema, { foreignKey: "categoryId", as: "category" });
categoriesSchema.hasMany(Service, { foreignKey: "categoryId", as: "services" });

// Unit Template relationships
unitTemplateSchema.hasMany(unitConversionSchema, { foreignKey: "template_id", as: "conversions" });
unitConversionSchema.belongsTo(unitTemplateSchema, { foreignKey: "template_id", as: "template" });

// Category relationships
MainCategory.hasMany(SubCategory, { foreignKey: "mainCategory_Id", as: "subCategories" });
SubCategory.belongsTo(MainCategory, { foreignKey: "mainCategory_Id", as: "mainCategory" });

SubCategory.hasMany(SparePart, { foreignKey: "subCategory_Id", as: "spareParts" });
SparePart.belongsTo(SubCategory, { foreignKey: "subCategory_Id", as: "subCategory" });

MainCategory.hasMany(SparePart, { foreignKey: "mainCategory_Id", as: "spareParts" });
SparePart.belongsTo(MainCategory, { foreignKey: "mainCategory_Id", as: "mainCategory" });

// CRM relationships
Customer.hasMany(Car, { foreignKey: "customerId", as: "cars" });
Car.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

Customer.hasMany(Contact, { foreignKey: "customerId", as: "contacts" });
Contact.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

Customer.hasMany(RelatedPerson, { foreignKey: "customerId", as: "relatedCustomers" });
RelatedPerson.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

Customer.hasMany(Feedback, { foreignKey: "customerId", as: "feedbacks" });
Feedback.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

// Survey relationships
Survey.hasMany(SurveyResponse, { foreignKey: "surveyId", as: "responses", onDelete: "CASCADE" });
SurveyResponse.belongsTo(Survey, { foreignKey: "surveyId", as: "survey" });

Customer.hasMany(SurveyResponse, { foreignKey: "customerId", as: "surveyResponses", onDelete: "SET NULL" });
SurveyResponse.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

// Campaign relationships
Campaign.hasMany(CampaignTarget, { foreignKey: "campaignId", as: "targets", onDelete: "CASCADE" });
CampaignTarget.belongsTo(Campaign, { foreignKey: "campaignId", as: "campaign" });

Customer.hasMany(CampaignTarget, { foreignKey: "customerId", as: "campaignTargets", onDelete: "CASCADE" });
CampaignTarget.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

// Opening Stock relationships
Branch.hasMany(OpeningStock, { foreignKey: "branch_id", as: "openingStocks" });
OpeningStock.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

warehousesSchema.hasMany(OpeningStock, { foreignKey: "warehouse_id", as: "openingStocks" });
OpeningStock.belongsTo(warehousesSchema, { foreignKey: "warehouse_id", as: "warehouse" });

productsSchema.hasMany(OpeningStock, { foreignKey: "product_id", as: "openingStocks" });
OpeningStock.belongsTo(productsSchema, { foreignKey: "product_id", as: "product" });

SparePart.hasMany(OpeningStock, { foreignKey: "spare_part_id", as: "openingStocks" });
OpeningStock.belongsTo(SparePart, { foreignKey: "spare_part_id", as: "sparePart" });

// Relationships for Consumables table
Consumables.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branch",
  onDelete: "RESTRICT",
});

Consumables.belongsTo(warehousesSchema, {
  foreignKey: "warehouseId",
  targetKey: "warehouse_id",
  as: "warehouse",
  onDelete: "RESTRICT",
});

Consumables.belongsTo(categoriesSchema, {
  foreignKey: "categoryId",
  as: "category",
  onDelete: "RESTRICT",
});

Consumables.belongsTo(suppliersSchema, {
  foreignKey: "supplierId",
  targetKey: "supplier_id",
  as: "supplier",
  onDelete: "RESTRICT",
});

// Commented out temporarily to fix foreign key constraint error
// Consumables.belongsTo(unitTemplateSchema, {
//   foreignKey: "unitId",
//   targetKey: "template_id",
//   as: "UnitTemplate",
//   onDelete: "RESTRICT",
// });

// Inverse relationships
Branch.hasMany(Consumables, {
  foreignKey: "branchId",
  as: "consumables",
});

warehousesSchema.hasMany(Consumables, {
  foreignKey: "warehouseId",
  as: "consumables",
});

// Commented out temporarily to fix foreign key constraint error
// unitTemplateSchema.hasMany(Consumables, {
//   foreignKey: "unitId",
//   as: "consumables",
// });

// Procurement relationships
RFQ.hasMany(RFQItem, { foreignKey: "rfqId", as: "items" });
RFQItem.belongsTo(RFQ, { foreignKey: "rfqId", as: "rfq" });


Quotation.belongsTo(RFQ, { foreignKey: "rfqId", as: "rfq" });


// Goods Receipt relationships
GoodsReceipt.hasMany(GoodsReceiptItem, { foreignKey: "goodsReceiptId", as: "items" });
GoodsReceiptItem.belongsTo(GoodsReceipt, { foreignKey: "goodsReceiptId", as: "goodsReceipt" });





            // POS Models Relationships
            // Company relationships with POS
            Company.hasMany(POSDevice, { foreignKey: "companyId", as: "companyPosDevices" });
            Company.hasMany(POSSettings, { foreignKey: "companyId", as: "companyPosSettings" });
            Company.hasMany(POSPaymentMethod, { foreignKey: "companyId", as: "companyPosPaymentMethods" });
            Company.hasMany(POSInvoiceTemplate, { foreignKey: "companyId", as: "companyPosInvoiceTemplates" });
            Company.hasMany(POSNotificationRule, { foreignKey: "companyId", as: "companyPosNotificationRules" });
            Company.hasMany(POSReportTemplate, { foreignKey: "companyId", as: "companyPosReportTemplates" });

            // Branch relationships with POS
            Branch.hasMany(POSDevice, { foreignKey: "branchId", as: "branchPosDevices" });
            Branch.hasMany(POSSettings, { foreignKey: "branchId", as: "branchPosSettings" });

            // Warehouse relationships with POS
            warehousesSchema.hasMany(POSDevice, { foreignKey: "warehouseId", as: "warehousePosDevices" });

// User relationships with POS
User.hasMany(POSDevice, { foreignKey: "createdBy", as: "userCreatedPosDevices" });
User.hasMany(POSDevice, { foreignKey: "updatedBy", as: "userUpdatedPosDevices" });
User.hasMany(POSSettings, { foreignKey: "createdBy", as: "userCreatedPosSettings" });
User.hasMany(POSSettings, { foreignKey: "updatedBy", as: "userUpdatedPosSettings" });
User.hasMany(POSPaymentMethod, { foreignKey: "createdBy", as: "userCreatedPosPaymentMethods" });
User.hasMany(POSPaymentMethod, { foreignKey: "updatedBy", as: "userUpdatedPosPaymentMethods" });
User.hasMany(POSInvoiceTemplate, { foreignKey: "createdBy", as: "userCreatedPosInvoiceTemplates" });
User.hasMany(POSInvoiceTemplate, { foreignKey: "updatedBy", as: "userUpdatedPosInvoiceTemplates" });
User.hasMany(POSNotificationRule, { foreignKey: "createdBy", as: "userCreatedPosNotificationRules" });
User.hasMany(POSNotificationRule, { foreignKey: "updatedBy", as: "userUpdatedPosNotificationRules" });
User.hasMany(POSReportTemplate, { foreignKey: "createdBy", as: "userCreatedPosReportTemplates" });
User.hasMany(POSReportTemplate, { foreignKey: "updatedBy", as: "userUpdatedPosReportTemplates" });

// POS Models belong to relationships
POSDevice.belongsTo(Company, { foreignKey: "companyId", as: "deviceCompany" });
POSDevice.belongsTo(Branch, { foreignKey: "branchId", as: "deviceBranch" });
POSDevice.belongsTo(warehousesSchema, { foreignKey: "warehouseId", as: "deviceWarehouse" });
POSDevice.belongsTo(User, { foreignKey: "createdBy", as: "deviceCreator" });
POSDevice.belongsTo(User, { foreignKey: "updatedBy", as: "deviceUpdater" });

POSSettings.belongsTo(Company, { foreignKey: "companyId", as: "settingsCompany" });
POSSettings.belongsTo(Branch, { foreignKey: "branchId", as: "settingsBranch" });
POSSettings.belongsTo(User, { foreignKey: "createdBy", as: "settingsCreator" });
POSSettings.belongsTo(User, { foreignKey: "updatedBy", as: "settingsUpdater" });

POSPaymentMethod.belongsTo(Company, { foreignKey: "companyId", as: "paymentCompany" });
POSPaymentMethod.belongsTo(User, { foreignKey: "createdBy", as: "paymentCreator" });
POSPaymentMethod.belongsTo(User, { foreignKey: "updatedBy", as: "paymentUpdater" });

POSInvoiceTemplate.belongsTo(Company, { foreignKey: "companyId", as: "invoiceCompany" });
POSInvoiceTemplate.belongsTo(User, { foreignKey: "createdBy", as: "invoiceCreator" });
POSInvoiceTemplate.belongsTo(User, { foreignKey: "updatedBy", as: "invoiceUpdater" });

POSNotificationRule.belongsTo(Company, { foreignKey: "companyId", as: "notificationCompany" });
POSNotificationRule.belongsTo(User, { foreignKey: "createdBy", as: "notificationCreator" });
POSNotificationRule.belongsTo(User, { foreignKey: "updatedBy", as: "notificationUpdater" });

POSReportTemplate.belongsTo(Company, { foreignKey: "companyId", as: "reportCompany" });
POSReportTemplate.belongsTo(User, { foreignKey: "createdBy", as: "reportCreator" });
POSReportTemplate.belongsTo(User, { foreignKey: "updatedBy", as: "reportUpdater" });

// Inventory Movement Relationships
Company.hasMany(InventoryMovement, { foreignKey: "companyId", as: "inventoryMovements" });
InventoryMovement.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Branch.hasMany(InventoryMovement, { foreignKey: "branchId", as: "inventoryMovements" });
InventoryMovement.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

User.hasMany(InventoryMovement, { foreignKey: "userId", as: "inventoryMovements" });
InventoryMovement.belongsTo(User, { foreignKey: "userId", as: "user" });

// AI Insights Relationships
Company.hasMany(AIInsight, { foreignKey: "companyId", as: "aiInsights" });
AIInsight.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Branch.hasMany(AIInsight, { foreignKey: "branchId", as: "aiInsights" });
AIInsight.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

// Smart Alerts Relationships
Company.hasMany(SmartAlert, { foreignKey: "companyId", as: "smartAlerts" });
SmartAlert.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Branch.hasMany(SmartAlert, { foreignKey: "branchId", as: "smartAlerts" });
SmartAlert.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

// Supplier System Relationships
// Suppliers schema uses supplier_id and table Suppliers without company/branch foreign keys in schema
// Associations to Company/Branch are skipped to match existing schema

Supplier.hasMany(SupplierInvoice, { foreignKey: "supplier_id", sourceKey: "supplier_id", as: "invoices" });
SupplierInvoice.belongsTo(Supplier, { foreignKey: "supplier_id", targetKey: "supplier_id", as: "supplier" });

Supplier.hasMany(SupplierPayment, { foreignKey: "supplier_id", sourceKey: "supplier_id", as: "payments" });
SupplierPayment.belongsTo(Supplier, { foreignKey: "supplier_id", targetKey: "supplier_id", as: "supplier" });

SupplierInvoice.hasMany(SupplierInvoiceItem, { foreignKey: "invoiceId", as: "items" });
SupplierInvoiceItem.belongsTo(SupplierInvoice, { foreignKey: "invoiceId", as: "invoice" });

SupplierInvoice.hasMany(SupplierPayment, { foreignKey: "invoiceId", as: "invoicePayments" });
SupplierPayment.belongsTo(SupplierInvoice, { foreignKey: "invoiceId", as: "invoice" });

Branch.hasMany(SupplierInvoice, { foreignKey: "branchId", as: "supplierInvoices" });
SupplierInvoice.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

Branch.hasMany(SupplierPayment, { foreignKey: "branchId", as: "supplierPayments" });
SupplierPayment.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

// Expense System Relationships
Company.hasMany(ExpenseCategory, { foreignKey: "companyId", as: "expenseCategories" });
ExpenseCategory.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Branch.hasMany(ExpenseCategory, { foreignKey: "branchId", as: "expenseCategories" });
ExpenseCategory.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

User.hasMany(ExpenseCategory, { foreignKey: "createdBy", as: "createdExpenseCategories" });
ExpenseCategory.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

User.hasMany(ExpenseCategory, { foreignKey: "updatedBy", as: "updatedExpenseCategories" });
ExpenseCategory.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

ExpenseCategory.hasMany(Expense, { foreignKey: "categoryId", as: "expenses" });
Expense.belongsTo(ExpenseCategory, { foreignKey: "categoryId", as: "category" });

Company.hasMany(Expense, { foreignKey: "companyId", as: "expenses" });
Expense.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Branch.hasMany(Expense, { foreignKey: "branchId", as: "expenses" });
Expense.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

User.hasMany(Expense, { foreignKey: "createdBy", as: "createdExpenses" });
Expense.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

User.hasMany(Expense, { foreignKey: "updatedBy", as: "updatedExpenses" });
Expense.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

User.hasMany(Expense, { foreignKey: "approvedBy", as: "approvedExpenses" });
Expense.belongsTo(User, { foreignKey: "approvedBy", as: "approver" });

// Export models with associations
module.exports = {
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
  SparePart,
  MainCategory,
  SubCategory,
  OpeningStock,
  brandsSchema,
  categoriesSchema,
  inventorySchema,
  manufacturersSchema,
  productBranchesSchema,
  productsSchema,
  suppliersSchema,
  warehousesSchema,
  unitTemplateSchema,
  unitConversionSchema,
  Consumables,
  CountItem,
  Adjustment,
  StockCountSession,
  RFQ,
  RFQItem,
  Quotation,
  ProcurementSettings,
  GoodsReceipt,
  GoodsReceiptItem,
  SupplierPaymentSchedule,
  SupplierContract,

  Customer,
  Car,
  Contact,
  RelatedPerson,
  Feedback,
  Survey,
  SurveyResponse,
  DentalAppointment,
  Doctor,
  InsuranceDeposit,
  CompanyAttachment,
  CompanyAccount,
  Campaign,
  CampaignTarget,
  Coupon,
  Subscription,
  Plan,
  LoyaltyMember,
  PointsTransaction,
  LoyaltyRule,
  LoyaltyReward,
  DropdownDefinition,
  SupplierCategory,
  SupplyRegion,
  PaymentTerm,
  POSDevice,
  POSSettings,
  POSPaymentMethod,
  POSInvoiceTemplate,
  POSNotificationRule,
  POSReportTemplate,
  
  // Inventory Transaction Models
  InventoryTransaction,
  InventoryTransactionItem,
  InventoryTransactionAttachment,
  InventoryTransactionLog,
  
  // Inventory Movement Models
  InventoryMovement,
  AIInsight,
  SmartAlert,
  
  // Supplier System Models
  Supplier,
  SupplierInvoice,
  SupplierInvoiceItem,
  SupplierPayment,
  SupplierRating,
  
  // Expense System Models
  Expense,
  ExpenseCategory,
};

// Additional Supplier relationships (avoiding duplicates)
Supplier.hasMany(SupplierRating, { foreignKey: "supplier_id", sourceKey: "supplier_id", as: "ratings" });
SupplierRating.belongsTo(Supplier, { foreignKey: "supplier_id", targetKey: "supplier_id", as: "supplier" });
