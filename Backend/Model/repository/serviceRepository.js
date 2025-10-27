const { Service, Branch, categoriesSchema } = require("../index");
const { Op } = require("sequelize");

class ServiceRepository {
  async create(serviceData) {
    try {
      const service = await Service.create(serviceData);
      return service;
    } catch (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await Service.findByPk(id, {
        include: [
          { model: Branch, as: "branch" },
          { model: categoriesSchema, as: "category" },
        ],
      });
    } catch (error) {
      throw new Error(`Error finding service: ${error.message}`);
    }
  }

  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        branchId,
        categoryId,
        isActive,
        search,
        sortBy = "id",
        sortOrder = "DESC",
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (branchId) whereClause.branchId = branchId;
      if (categoryId) whereClause.categoryId = categoryId;
      if (isActive !== undefined) whereClause.isActive = isActive;
      if (search) {
        whereClause[Op.or] = [
          { arabicName: { [Op.like]: `%${search}%` } },
          { englishName: { [Op.like]: `%${search}%` } },
          { serviceCode: { [Op.like]: `%${search}%` } },
        ];
      }

      // First, try to get the basic structure without includes
      let queryOptions = {
        where: whereClause,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      // Only add includes if the basic query works
      try {
        const { count, rows } = await Service.findAndCountAll({
          ...queryOptions,
          include: [
            { model: Branch, as: "branch" },
            { model: categoriesSchema, as: "category" },
          ],
        });

        return {
          services: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit),
          },
        };
      } catch (includeError) {
        console.log("Include failed, trying without includes:", includeError.message);
        
        // Fallback to basic query without includes
        const { count, rows } = await Service.findAndCountAll(queryOptions);
        
        return {
          services: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit),
          },
        };
      }
    } catch (error) {
      console.error("ServiceRepository.findAll error:", error);
      throw new Error(`Error finding services: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      const [updatedRows] = await Service.update(updateData, {
        where: { id },
      });

      if (updatedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating service: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const deletedRows = await Service.destroy({
        where: { id },
      });
      return deletedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }
  }

  async findByBranch(branchId) {
    try {
      return await Service.findAll({
        where: { branchId, isActive: true },
        include: [
          { model: Branch, as: "branch" },
          { model: categoriesSchema, as: "category" },
        ],
        order: [["arabicName", "ASC"]],
      });
    } catch (error) {
      throw new Error(`Error finding services by branch: ${error.message}`);
    }
  }

  async findActiveServices(options = {}) {
    try {
      const { branchId, categoryId } = options;
      const whereClause = { isActive: true, serviceStatus: "active" };

      if (branchId) whereClause.branchId = branchId;
      if (categoryId) whereClause.categoryId = categoryId;

      // Try with includes first, fallback to basic query if it fails
      try {
        return await Service.findAll({
          where: whereClause,
          include: [
            { model: Branch, as: "branch" },
            { model: categoriesSchema, as: "category" },
          ],
          order: [["arabicName", "ASC"]],
        });
      } catch (includeError) {
        console.log("Include failed in findActiveServices, trying without includes:", includeError.message);
        
        // Fallback to basic query without includes
        return await Service.findAll({
          where: whereClause,
          order: [["arabicName", "ASC"]],
        });
      }
    } catch (error) {
      console.error("ServiceRepository.findActiveServices error:", error);
      throw new Error(`Error finding active services: ${error.message}`);
    }
  }

  async calculatePriceWithTax(serviceId) {
    try {
      const service = await this.findById(serviceId);
      if (!service) {
        throw new Error("Service not found");
      }

      let finalPrice = parseFloat(service.price);

      if (service.discountType && service.discountValue > 0) {
        if (service.discountType === "percentage") {
          finalPrice = finalPrice - finalPrice * (service.discountValue / 100);
        } else if (service.discountType === "fixed") {
          finalPrice = finalPrice - service.discountValue;
        }
      }

      if (service.taxType === "with_vat" && service.taxRate > 0) {
        const taxAmount = finalPrice * (service.taxRate / 100);
        finalPrice = finalPrice + taxAmount;
      }

      return {
        basePrice: parseFloat(service.price),
        discountAmount: service.discountValue || 0,
        taxAmount: service.taxType === "with_vat" ? finalPrice - finalPrice / (1 + service.taxRate / 100) : 0,
        finalPrice: Math.max(finalPrice, service.minimumPrice || 0),
      };
    } catch (error) {
      throw new Error(`Error calculating service price: ${error.message}`);
    }
  }
}

module.exports = new ServiceRepository();
