const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branchesController");
const storageController = require("../controllers/storageController");

const { dynamicUpload } = require("../middlewares/fileUpload");

const branchFileFields = ["branchImageAttachment", "licenceAttachment", "anotherAttachments"];
const storageFileFields = [
  "storageImageAttachment",
  "licenceAttachment",
  "safetyCertificationAttachment",
  "WarehousePlansAttachment",
  "inventoryReportsAttachment",
  "anotherAttachments",
];

router.route("/")
  .get(branchController.getAllBranches)
  .post(dynamicUpload(branchFileFields), branchController.createBranch);
router
  .route("/:id/storages")
  .post(dynamicUpload(storageFileFields), branchController.createStorage)
  .get(branchController.getBranchStorages);
router
  .route("/:id")
  .get(branchController.getBranchById)
  .patch(dynamicUpload(branchFileFields), branchController.updateBranch)

  .delete(branchController.deleteBranch);

module.exports = router;
