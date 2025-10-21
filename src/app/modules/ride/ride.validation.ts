import z from "zod";
import { IRideStatus } from "./ride.interface";

export const createRideZodSchema = z.object({
    riderId: z.string({ message: "Rider id is required and must be a string." }),
    vehicleType: z.string({
        message: "VehicleType is required and must be a string",
    }),

    pickupLocation: z.object({
        lati: z.number({
            message: "Pickup latitude is required and must be a number.",
        }),
        long: z.number({
            message: "Pickup longitude is required and must be a number.",
        }),
        address: z.string({ message: "Address must be a string." })
    }),

    destination: z.object({
        lati: z.number({
            message: "Destination Latitude is required and must be a number.",
        }),
        long: z.number({
            message: "Destination longitude is required and must be a number.",
        }),
        address: z.string({ message: "Address must be a string." })
    }),
});


export const updateRideStatusZodSchema = z.object({
    rideStatus: z.enum(Object.values(IRideStatus) as [string, ...string[]], {
        message: "Invalid ride status"
    }),
    cancelReason: z.string().optional(),
});

export const cancelRideZodSchema = z.object({
    cancelReason: z.string({
        message: "Cancel reason is required and must be a string.",
    }).min(1, "Cancel reason cannot be empty"),
});


export const rideFeedbackZodSchema = z.object({
  feedback: z.string(),
});