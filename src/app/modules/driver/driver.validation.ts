import z from "zod";
import { IDriverStatus, IVehicleType } from "./driver.interface";

export const createDriverZodValidation = z.object({
  userId: z.string({ invalid_type_error: "User ID must be a string" }),

  NIDNumber: z
    .number({ invalid_type_error: "NID number must be a number." })
    .min(1000000000, { message: "NID must be at least 10 digits." })
    .max(999999999999999, { message: "NID must not exceed 15 digits." }),
  licenseNumber: z.number({ invalid_type_error: "License number Must be a number." }),

  vehicleInfo: z.object({
    vehicleType: z.enum(Object.values(IVehicleType) as [string]),
    vehicleModel: z.string({ message: "Vehicle Model must be a string" }),
    vehicleNumberPlate: z.string({ message: "Number Plate must be a string" }),
    vehicleColor: z
      .string({ message: "Vehicle color must be a string" })
      .optional(),
    seats: z
      .number({ message: "Seats must be a number" })
      .min(1, "At least 1 seat is required.")
      .optional(),
  }),
});

export const updateDriverZodValidation = z.object({
  name: z
    .string({ message: "Name must be a string." })
    .min(2, { message: "Name too short. Minimum 2 character long." })
    .max(50, { message: "Name too long." })
    .optional(),

  email: z
    .string({ message: "Email must be a string." })
    .email({ message: "Invalid email format." })
    .min(8, { message: "Email must be at least 8 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." })
    .optional(),

  NIDNumber: z
    .number({ message: "NID number must be a number." })
    .min(1000000000, { message: "NID must be at least 10 digits." })
    .max(999999999999999, { message: "NID must not exceed 15 digits." })
    .optional(),


  licenseNumber: z
    .number({ message: "License number Must be a number" })
    .optional(),

  vehicleInfo: z
    .object({
      vehicleType: z.enum(Object.values(IVehicleType) as [string]).optional(),
      vehicleModel: z
        .string({ message: "Vehicle Model must be a string." })
        .optional(),
      vehicleNumberPlate: z
        .string({ message: "Number Plate must be a string." })
        .optional(),
      vehicleColor: z
        .string({ message: "Vehicle color must be a string." })
        .optional(),
      seats: z
        .number({ message: "Seats must be a number." })
        .min(1, { message: "At least 1 seat is required." })
        .optional(),
    })
    .optional(),

  isAvailable: z.boolean({ message: "isAvailable must be a boolean." }).optional(),
  driverStatus: z.enum(Object.values(IDriverStatus) as [string]).optional(),
  isDeleted: z.boolean({ message: "isDeleted must be a boolean." }).optional(),


  totalRides: z.number({ message: "Total rides must be a number." }).optional(),
  
  totalEarnings: z
    .number({ message: "Total earnings must be a number." })
    .optional(),

  currentLocation: z
    .object({
      lat: z.number({ message: "Latitude must be a number." }),
      lng: z.number({ message: "Longitude must be a number." }),
    })
    .optional(),

  rating: z.number({ message: "Rating must be a number." }).optional(),
});