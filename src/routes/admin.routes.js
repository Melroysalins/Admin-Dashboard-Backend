import Router from "express";
import {
  changePassword,
  editUserDetails,
  getuserDetails,
  loginAdmin,
  registerAdmin,
} from "../controller/admin.controller.js";
import {
  adminStore,
  getStoreDetails,
  goStoreLive,
  goStoreOffline,
  updateStore,
  verifyStore,
} from "../controller/adminstore.controller.js";
import processImage from "../middleware/processimage.js";
import { Singleupload } from "../middleware/multer.middleware.js";
import {
  ProductController,
  getParticularProduct,
  getallProducts,
  setDeleteProduct,
  updateParticularProdcut,
} from "../controller/adminProduct.controller.js";

const router = Router();

router.route("/admin/register").post(registerAdmin);

router.route("/admin/login").post(loginAdmin);

router.route("/admin/store").post(Singleupload, processImage, adminStore);

router.route("/admin/getstore/:storeID").post(getStoreDetails);

router.route("/admin/getuser/:_id").get(getuserDetails);

router
  .route("/admin/edituser/profile")
  .post(Singleupload, processImage, editUserDetails);

router.route("/admin/verifystore").post(verifyStore);

router.route("/admin/changepassword").post(changePassword);

router
  .route("/admin/uploadproduct")
  .post(Singleupload, processImage, ProductController);

router.route("/admin/getproducts").post(getallProducts);

router
  .route("/admin/updatestore")
  .post(Singleupload, processImage, updateStore);

router
  .route("/admin/updateproduct")
  .post(Singleupload, processImage, updateParticularProdcut);

router.route("/admin/getparticularproduct").post(getParticularProduct);

router.route("/admin/storelive").post(goStoreLive);
router.route("/admin/offline").post(goStoreOffline);

router.route("/admin/deleteproduct").post(setDeleteProduct);

export { router };
