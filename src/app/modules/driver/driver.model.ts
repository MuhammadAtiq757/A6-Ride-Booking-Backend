import { model, Schema } from "mongoose";
import {
  IDriver,
  IDriverStatus,
  IVehicleInfo,
  IVehicleType,
} from "./driver.interface";

const vehicleSchema = new Schema<IVehicleInfo>(
  {
    vehicleType: {
      type: String,
      enum: Object.values(IVehicleType),
      required: true,
    },
    vehicleModel: { type: String },
    vehicleNumberPlate: { type: String },
    vehicleColor: { type: String },
    seats: { type: Number },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const driverSchema = new Schema<IDriver>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    name: { type: String },
    email: { type: String },

    NIDNumber: { type: Number, required: true, unique: true },
    licenseNumber: { type: Number, required: true, unique: true },
    vehicleInfo: vehicleSchema,

    isAvailable: { type: Boolean, default: false },
    driverStatus: {
      type: String,
      enum: Object.values(IDriverStatus),
      default: IDriverStatus.PENDING,
    },
    isDeleted: { type: Boolean, default: false },
    rating: { type: Number },
    totalRides: { type: Number },
    totalEarnings: { type: Number },

    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Driver = model<IDriver>("Driver", driverSchema);