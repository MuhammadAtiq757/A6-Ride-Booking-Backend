import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { DriverServices } from "./driver.service";

// Create Driver
const createDriver = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const newDriver = await DriverServices.createDriver(payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Driver Created Successfully",
    data: newDriver,
  });
});


// Get Single Driver
const getSingleDriver = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const decodedToken = req.user as JwtPayload;
  const singleDriver = await DriverServices.getSingleDriver(id, decodedToken);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver Retrieve Successfully",
    data: singleDriver,
  });
});

// Update Driver Status for admin
const updateDriverStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  const driver = await DriverServices.updateDriverStatus(id, payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Driver Approved Successfully",
    data: driver,
  });
});


// Get All Drivers for admin
const getAllDrivers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const drivers = await DriverServices.getAllDrivers(query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver Retrieve Successfully",
    data: drivers,
  });
});

// Get Me
const getMe = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload
  const result = await DriverServices.getMe(decodedToken.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your Driver Profile Retrieved Successfully",
    data: result.data
  })
})

// Update My Driver Profile
const updateWonDriverProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const updateData = { ...req.body };
  const verifiedToken = req.user;
  const updatedWonDriverProfile = await DriverServices.updateWonDriverProfile(userId, updateData, verifiedToken as JwtPayload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver profile updated successfully",
    data: updatedWonDriverProfile,
  });
});

const getDriversRides = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userId = user.userId; 
  const result = await DriverServices.getDriversRides(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Completed rides retrieved successfully",
    data: result.data,
  });
});

export const DriverControllers = {
  getMe,
  createDriver,
  getAllDrivers,
  getSingleDriver,
  updateDriverStatus,
  updateWonDriverProfile,
  getDriversRides
};