const { Op } = require("sequelize");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
const productsRepo = require("../Model/repository/productsRepository");
const inventoryRepo = require("../Model/repository/inventoryRepository");
const warehousesRepo = require("../Model/repository/warehousesRepository");
const productBranchesRepo = require("../Model/repository/productBranchesRepository");
// const { productsSchema } = require("../Model/index");

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const {
    page,
    limit,
    search,
    categoryId,
    brandId,
    status,
    warehouseId,
    expiryDate,
    batchNumber,
    sortBy,
    sortOrder,
  } = req.query;

  const { products, pagination } = await productsRepo.findAll({
    page,
    limit,
    search,
    categoryId,
    brandId,
    status,
    warehouseId,
    expiryDate,
    batchNumber,
    sortBy,
    sortOrder,
  });

  res.status(200).json({
    status: "success",
    results: products.length,
    total: pagination.total,
    data: {
      products,
      pagination,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await productsRepo.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const inventory = await inventoryRepo.findByProductId(req.params.id);

  const productBranches = await productBranchesRepo.findByProductId(req.params.id);

  res.status(200).json({
    status: "success",
    data: {
      product,
      inventory,
      productBranches,
    },
  });
});

// Search products
exports.searchProducts = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  
  if (!q) {
    return next(new AppError("Search query is required", 400));
  }

  const products = await productsRepo.search(q);

  res.status(200).json({
    status: "success",
    results: products.length,
    data: products
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const {
    name_ar,
    name_en,
    description,
    product_id,
    barcode,
    category_id,
    brand_id,
    manufacturer_id,
    supplier_id,
    selling_price,
    rental_price,
    current_stock,
    weight_kg,
    status,
    model,
    shelf_location,
    image_url,
    color,
    size,
    material,
  } = req.body;

  const existingProduct = await productsRepo.findBySku(product_id);
  if (existingProduct) {
    return next(new AppError("Product with this SKU already exists", 400));
  }

  const product = await productsRepo.create({
    product_id,
    name_ar,
    name_en,
    description,
    barcode,
    category_id,
    brand_id,
    manufacturer_id,
    supplier_id,
    selling_price,
    rental_price,
    current_stock: current_stock ?? 0,
    weight_kg,
    status: status || "active",
    model,
    shelf_location: shelf_location || null,
    image_url: image_url || null,
    color: color || null,
    size: size || null,
    material: material || null,
    created_by: req.user?.id || null,
    updated_by: req.user?.id || null,
  });

  res.status(201).json({
    status: "success",
    data: {
      product,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await productsRepo.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (req.body.product_id && req.body.product_id !== product.product_id) {
    const existingProduct = await productsRepo.findBySku(req.body.product_id);
    if (existingProduct) {
      return next(new AppError("Product with this SKU already exists", 400));
    }
  }

  // لا حاجة لتحويل صورة أو أبعاد لسلاسل هنا، يتم حقن image_url من الميدل وير عند الرفع

  const updatedProduct = await productsRepo.update(id, { ...req.body, updated_by: req.user?.id || null });

  res.status(200).json({
    status: "success",
    data: {
      product: updatedProduct,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await productsRepo.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const inventoryCount = await inventoryRepo.countByProductId(id);
  if (inventoryCount > 0) {
    return next(new AppError("Cannot delete product with existing inventory records", 400));
  }

  const productBranchesCount = await productBranchesRepo.countByProductId(id);
  if (productBranchesCount > 0) {
    return next(new AppError("Cannot delete product with existing product branches", 400));
  }

  await productsRepo.delete(id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const products = await productsRepo.findByCategory(categoryId);

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getProductsByBrand = catchAsync(async (req, res, next) => {
  const { brandId } = req.params;

  const products = await productsRepo.findByBrand(brandId);

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

exports.searchProducts = catchAsync(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new AppError("Please provide a search query", 400));
  }

  const products = await productsRepo.search(q);

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getLowStockProducts = catchAsync(async (req, res, next) => {
  const products = await productsRepo.findLowStock();

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getProductInventory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const inventory = await inventoryRepo.findByProductWithWarehouse(id);

  res.status(200).json({
    status: "success",
    data: {
      inventory,
    },
  });
});

exports.updateProductStock = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { warehouse_id, quantity, operation_type, notes } = req.body;

  if (!["add", "subtract", "set"].includes(operation_type)) {
    return next(new AppError("Invalid operation type. Use: add, subtract, or set", 400));
  }

  const product = await productsRepo.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const warehouse = await warehousesRepo.findById(warehouse_id);
  if (!warehouse) {
    return next(new AppError("Warehouse not found", 404));
  }

  const updatedInventory = await inventoryRepo.updateStock(id, warehouse_id, quantity, operation_type, notes);

  res.status(200).json({
    status: "success",
    data: {
      inventory: updatedInventory,
    },
  });
});

exports.getProductStats = catchAsync(async (req, res, next) => {
  const stats = await productsRepo.getStatistics();

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.bulkUpdateProducts = catchAsync(async (req, res, next) => {
  const { productIds, updates } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError("Please provide an array of product IDs", 400));
  }

  const results = await productsRepo.bulkUpdate(productIds, updates);

  res.status(200).json({
    status: "success",
    data: {
      updated: results.updated,
      failed: results.failed,
    },
  });
});

exports.exportProducts = catchAsync(async (req, res, next) => {
  const { format = "csv" } = req.query;

  const products = await productsRepo.findAllWithDetails();

  res.setHeader("Content-Type", format === "csv" ? "text/csv" : "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="products.${format}"`);

  if (format === "csv") {
    const csv = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category?.name || "",
      brand: p.brand?.name || "",
      price: p.unit_price,
      stock: p.total_stock || 0,
      status: p.status,
    }));

    const headers = Object.keys(csv[0]).join(",");
    const rows = csv.map((row) => Object.values(row).join(","));
    const csvContent = [headers, ...rows].join("\n");

    res.send(csvContent);
  } else {
    res.json(products);
  }
});

exports.importProducts = catchAsync(async (req, res, next) => {
  const { products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return next(new AppError("Please provide an array of products to import", 400));
  }

  const results = await productsRepo.bulkImport(products);

  res.status(200).json({
    status: "success",
    data: {
      imported: results.imported,
      failed: results.failed,
    },
  });
});

exports.getProductWithInventory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await productsRepo.findByIdWithDetails(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const inventory = await inventoryRepo.findByProductWithWarehouse(id);

  res.status(200).json({
    status: "success",
    data: {
      product,
      inventory,
    },
  });
});

exports.getProductsByWarehouse = catchAsync(async (req, res, next) => {
  const { warehouseId } = req.params;

  const products = await productsRepo.findByWarehouse(warehouseId);

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getProductPricing = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await productsRepo.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const pricing = {
    unit_price: product.unit_price,
    cost_price: product.cost_price,
    profit_margin: (((product.unit_price - product.cost_price) / product.cost_price) * 100).toFixed(2),
    tax_rate: product.tax_rate,
    final_price: product.unit_price * (1 + product.tax_rate / 100),
  };

  res.status(200).json({
    status: "success",
    data: {
      pricing,
    },
  });
});

exports.getProductAvailability = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await productsRepo.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const availability = await productsRepo.getAvailability(id);

  res.status(200).json({
    status: "success",
    data: {
      availability,
    },
  });
});

exports.getProductMovementHistory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { start_date, end_date } = req.query;

  const history = await inventoryRepo.getMovementHistory(id, start_date, end_date);

  res.status(200).json({
    status: "success",
    data: {
      history,
    },
  });
});

// Update product stock directly
exports.updateProductStock = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { quantity, operation = "add" } = req.body;

  console.log('=== updateProductStock Debug ===');
  console.log('Product ID:', id);
  console.log('Quantity:', quantity);
  console.log('Operation:', operation);

  if (!quantity || quantity <= 0) {
    return next(new AppError("Quantity must be a positive number", 400));
  }

  const product = await productsRepo.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  console.log('Current product stock:', product.current_stock);
  console.log('Product data:', JSON.stringify(product, null, 2));

  let newStock;
  if (operation === "add") {
    newStock = (product.current_stock || 0) + quantity;
  } else if (operation === "subtract") {
    newStock = (product.current_stock || 0) - quantity;
    if (newStock < 0) {
      return next(new AppError("Insufficient stock", 400));
    }
  } else if (operation === "set") {
    newStock = quantity;
  } else {
    return next(new AppError('Invalid operation. Use "add", "subtract", or "set"', 400));
  }

  console.log('New stock to set:', newStock);

  const updatedProduct = await productsRepo.update(id, { current_stock: newStock });
  
  console.log('Updated product:', updatedProduct ? 'Success' : 'Failed');
  if (updatedProduct) {
    console.log('New stock in updated product:', updatedProduct.current_stock);
  }

  res.status(200).json({
    status: "success",
    data: {
      product: updatedProduct,
    },
    message: `Stock ${operation === "set" ? "set" : operation === "subtract" ? "decreased" : "increased"} successfully`,
  });
});
