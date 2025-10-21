import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { cancelRideZodSchema, createRideZodSchema, rideFeedbackZodSchema, updateRideStatusZodSchema } from "./ride.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { rideControllers } from "./ride.controller";


const router = Router();

router.post(
  "/request-ride",
  checkAuth(Role.RIDER),
  validateRequest(createRideZodSchema),
  rideControllers.requestForRide
);

router.get(
  "/all-ride-admin",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  rideControllers.getAllRidesForAdmin
);

router.get("/all-ride-riders", checkAuth(Role.RIDER), rideControllers.getAllRidesForRider);

router.get(
  "/available-ride-driver",
  checkAuth(Role.DRIVER),
  rideControllers.getAvailableRides
);


router.get("/my-ride/:id",
  checkAuth(...Object.values(Role)),
  rideControllers.getSingleRideForRider
)

router.get("/driver/rides/:id",
  checkAuth(Role.DRIVER),
  rideControllers.getSingleRideForDriver
);

router.patch(
  "/accept/:rideId",
  checkAuth(Role.DRIVER),
  rideControllers.driverAcceptRide
);

router.patch(
  "/status/:rideId",
  checkAuth(Role.DRIVER, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateRideStatusZodSchema),
  rideControllers.updateRideStatus
);

router.patch(
  "/cancel/:rideId",
  checkAuth(...Object.values(Role)),
  validateRequest(cancelRideZodSchema),
  rideControllers.cancelRide
);

router.post(
  "/feedback/:rideId",
  checkAuth(...Object.values(Role)),
  validateRequest(rideFeedbackZodSchema),
  rideControllers.giveFeedback
);

export const RideRoutes = router;