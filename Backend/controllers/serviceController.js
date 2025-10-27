const serviceRepository = require("../Model/repository/serviceRepository");
const catchAsync = require("../utils/catchAsync");

const serviceController = {
  createService: catchAsync(async (req, res) => {
    const service = await serviceRepository.create(req.body);
    res.status(201).json({
      status: "success",
      data: { service },
    });
  }),

  getAllServices: catchAsync(async (req, res) => {
    const services = await serviceRepository.findAll(req.query);
    res.status(200).json({
      status: "success",
      data: { services },
    });
  }),

  getServiceById: catchAsync(async (req, res) => {
    const service = await serviceRepository.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        status: "fail",
        message: "Service not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: { service },
    });
  }),

  updateService: catchAsync(async (req, res) => {
    const service = await serviceRepository.update(req.params.id, req.body);
    if (!service) {
      return res.status(404).json({
        status: "fail",
        message: "Service not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: { service },
    });
  }),

  deleteService: catchAsync(async (req, res) => {
    const deleted = await serviceRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        status: "fail",
        message: "Service not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Service deleted successfully",
    });
  }),

  getServicesByBranch: catchAsync(async (req, res) => {
    const services = await serviceRepository.findByBranch(req.params.branchId);
    res.status(200).json({
      status: "success",
      data: { services },
    });
  }),

  getActiveServices: catchAsync(async (req, res) => {
    const services = await serviceRepository.findActiveServices(req.query);
    res.status(200).json({
      status: "success",
      data: { services },
    });
  }),

  calculateServicePrice: catchAsync(async (req, res) => {
    const priceInfo = await serviceRepository.calculatePriceWithTax(req.params.id);
    res.status(200).json({
      status: "success",
      data: { priceInfo },
    });
  }),
};

module.exports = serviceController;
