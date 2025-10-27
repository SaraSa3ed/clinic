const { 
  getAllUsers, 
  CreateUser, 
  getCurrentUserPermissions,
  updateUser,
  updateUserAccount,
  uploadUserSignature,
  getUserPermissions,
  updateUserPermissions,
  getUserModules,
  updateUserModules,
  toggleUserStatus,
  deleteUser
} = require("../controllers/userController");
const { dynamicUpload } = require("../middlewares/fileUpload");
const { isLoggedIn } = require("../middlewares/isLoggedIn");

const Router = require("express").Router();

const userFileFields = ["profilePicture", "idCardPicture", "resume", "certificates", "contract", "anotherAttachments"];

Router.route("/").get(getAllUsers).post(dynamicUpload(userFileFields), CreateUser);

// Update user general information
Router.route("/:id")
  .patch(updateUser)
  .delete(deleteUser);

// Get current user permissions
Router.route("/permissions").get(isLoggedIn, getCurrentUserPermissions);

// User account management routes
Router.route("/:id/account")
  .patch(updateUserAccount);

// User signature upload
Router.route("/:id/signature")
  .post(dynamicUpload(["signature"]), uploadUserSignature);

// User permissions management
Router.route("/:id/permissions")
  .get(getUserPermissions)
  .patch(updateUserPermissions);

// User modules management
Router.route("/:id/modules")
  .get(getUserModules)
  .patch(updateUserModules);

// Toggle user status
Router.route("/:id/status")
  .patch(toggleUserStatus);

module.exports = Router;
