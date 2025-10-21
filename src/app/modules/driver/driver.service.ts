import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IDriver, IDriverStatus } from "./driver.interface";
import { Driver } from "./driver.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../user/user.interface";
import { Ride } from "../ride/ride.model";

const createDriver = async (payload: Partial<IDriver>) => {
  const user = await User.findById(payload.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.isVerified) {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is Not Verified. Contact support.");
  }

  if (user.isBlocked === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is blocked. Contact support.");
  }

  const isExistDriver = await Driver.findOne({ userId: payload.userId });

  if (isExistDriver) {
    if (isExistDriver.driverStatus === IDriverStatus.PENDING) {
      throw new AppError(httpStatus.BAD_REQUEST, "Please wait for admin approval!");
    }
    if (isExistDriver.driverStatus === IDriverStatus.SUSPENDED) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are suspended. Please contact the office!");
    }
    throw new AppError(httpStatus.BAD_REQUEST, "Driver profile already exists.");
  }

  const driver = await Driver.create(payload);
  return driver;
};

const getAllDrivers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Driver.find(), query);

  const drivers = await queryBuilder.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([
    drivers.build(),
    queryBuilder.getMeta(),
  ]);

  return { data, meta };
};

// Get Single Driver for admin and super admin
const getSingleDriver = async (id: string, decodedToken: JwtPayload) => {
  const driver = await Driver.findById(id);
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }
  if (decodedToken.role === Role.DRIVER || decodedToken.role === Role.RIDER) {
    if (decodedToken.userId !== driver.userId.toString()) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not permitted.");
    }
    return driver;
  }
  if (
    decodedToken.role === Role.ADMIN ||
    decodedToken.role === Role.SUPER_ADMIN
  ) {
    return driver;
  }
  throw new AppError(httpStatus.FORBIDDEN, "Invalid role access");
};

// update DriverStatus and information only for admin and super admin
export const updateDriverStatus = async (id: string, payload: Partial<IDriver>) => {

  const session = await Driver.startSession();
  session.startTransaction();

  try {
    const driver = await Driver.findById(id).session(session);
    if (!driver) {
      throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    if (
      driver.driverStatus === IDriverStatus.APPROVED
    ) {
      throw new AppError(httpStatus.BAD_REQUEST, "Driver is already approved");
    }

    Object.assign(driver, payload);

    await driver.save({ session });

    if (payload.driverStatus === IDriverStatus.APPROVED) {
      await User.findByIdAndUpdate(
        driver.userId,
        { role: Role.DRIVER },
        { session }
      );
    }

    await session.commitTransaction();
    return driver;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// get me
const getMe = async (userId: string) => {
  const driver = await Driver.findOne({ userId })
  return {
    data: driver
  }
};

// update driver won profile (with limit)
const updateWonDriverProfile = async (userId: string, payload: Partial<IDriver>, decodedToken: JwtPayload) => {

  const driver = await Driver.findOne({ userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  if (payload.driverStatus) {
    if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to update your role"
      );
    }
  }

  const updatedDriver = await Driver.findOneAndUpdate(
    { userId: userId },
    payload,
    { new: true, runValidators: true }
  );

  return {
    data: updatedDriver
  }
};


const getDriversRides = async (userId: string) => {
 
  const driver = await Driver.findOne({ userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }
  
  const rides = await Ride.find({ driverId: driver._id })
    .sort({ createdAt: -1 });

  return {
    data: rides,
    count: rides.length,
  };
};

export const DriverServices = {
  getMe,
  createDriver,
  getAllDrivers,
  getSingleDriver,
  updateDriverStatus,
  updateWonDriverProfile,
  getDriversRides,
};