import { Types } from "mongoose";

export enum IVehicleType {
  BIKE = "BIKE",
  CAR = "CAR",
  BICYCLE = "BICYCLE",
}

export interface IVehicleInfo {
  vehicleType: IVehicleType;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleNumberPlate?: string;
  seats?: number;
}

export enum IDriverStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
}

export interface IDriver {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  name?: string;
  email?: string;
  NIDNumber: number;
  licenseNumber: number;
  vehicleInfo: IVehicleInfo;
  isAvailable?: boolean;
  driverStatus?: IDriverStatus;
  isDeleted?: boolean;
  totalRides?: number;
  totalEarnings?: number;
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  rating?: number;
}
