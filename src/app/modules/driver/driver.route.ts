import { Router } from "express";
import { DriverControllers } from "./driver.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import {
  createDriverZodValidation,
  updateDriverZodValidation,
} from "./driver.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router();


// driver apply
router.post(
  "/apply-for-driver",
  checkAuth(Role.RIDER),
  validateRequest(createDriverZodValidation),
  DriverControllers.createDriver
);

// get all driver (for admin)
router.get(
  "/get-all-drivers",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DriverControllers.getAllDrivers
);

// get me (driver won)
router.get(
  "/me",
  checkAuth(Role.DRIVER),
  DriverControllers.getMe
);

router.get(
  "/completed-ride",
  checkAuth(Role.DRIVER),
  DriverControllers.getDriversRides
);

// driver update (won)
router.patch(
  "/update-my-driver-profile",
  checkAuth(Role.DRIVER),
  validateRequest(updateDriverZodValidation),
  DriverControllers.updateWonDriverProfile
);

// driver update and staus update (admin)
router.post(
  "/driver-status/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateDriverZodValidation),
  DriverControllers.updateDriverStatus
);

// driver get single (admin)
router.get(
  "/:id",
  checkAuth(Role.ADMIN),
  DriverControllers.getSingleDriver
);




export const DriverRoutes = router;