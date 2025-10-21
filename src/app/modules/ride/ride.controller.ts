import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { rideService } from "./ride.service";
import { JwtPayload } from "jsonwebtoken";


const requestForRide = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await rideService.requestForRide(req.body, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Ride requested successfully",
    data: result,
  });
});


const getAllRidesForRider = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const query = req.query as Record<string, string>;
  const rides = await rideService.getAllRidesForRider(query, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride Retrieve Successfully",
    data: rides,
  });
});

const getAvailableRides = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const query = req.query as Record<string, string>;
  const rides = await rideService.getAvailableRides(query, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Available rides retrieved successfully",
    data: rides,
  });
});

const getAllRidesForAdmin = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const query = req.query as Record<string, string>;
  const rides = await rideService.getAllRidesForAdmin(query, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride Retrieve Successfully",
    data: rides,
  });
});

const driverAcceptRide = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params;
  const decodedToken = req.user as JwtPayload;
  const result = await rideService.driverAcceptRide(rideId, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride accepted successfully",
    data: result,
  });
});

const updateRideStatus = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params;
  const decodedToken = req.user as JwtPayload;
  const result = await rideService.updateRideStatus(rideId, req.body, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride status updated successfully",
    data: result,
  });
});

const cancelRide = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params;
  const decodedToken = req.user as JwtPayload;
  const { cancelReason } = req.body;
  const result = await rideService.cancelRide(rideId, cancelReason, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride cancelled successfully",
    data: result,
  });
});

const getSingleRideForRider = catchAsync(async (req: Request, res: Response) => {
  const rideId = req.params.id
  const riderInfo = req.user as JwtPayload
  const riderId = riderInfo.userId
  const result = await rideService.getSingleRideForRider(rideId, riderId)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Your Ride Information Retrieved!",
    data: result.data
  });
});


const getSingleRideForDriver = catchAsync(async (req: Request, res: Response) => {
  const rideId = req.params.id;
  const driverInfo = req.user as JwtPayload;

  const result = await rideService.getSingleRideForDriver(rideId, driverInfo.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your Ride Information Retrieved!",
    data: result,
  });
});



const giveFeedback = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params;
  const { feedback } = req.body;
  const user = req.user as JwtPayload
  const userId = user.userId

  const result = await rideService.giveFeedback(rideId, userId, feedback);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Feedback submitted successfully",
    data: result,
  });
});

export const rideControllers = {
  requestForRide,
  getAllRidesForRider,
  getAllRidesForAdmin,
  getSingleRideForRider,
  giveFeedback,

  getAvailableRides,
  driverAcceptRide,
  updateRideStatus,
  cancelRide,
  getSingleRideForDriver
};