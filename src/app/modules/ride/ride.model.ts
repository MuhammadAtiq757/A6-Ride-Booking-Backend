import { Schema, model } from "mongoose";
import { IRide, IRideStatus } from "./ride.interface";

const rideSchema = new Schema<IRide>(
    {
        riderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        driverId: { type: Schema.Types.ObjectId, ref: "Driver" },
        cancelledBy: { type: Schema.Types.ObjectId },
        cancelReason: { type: String },

        pickupLocation: {
            lati: { type: Number, required: true },
            long: { type: Number, required: true },
            address: { type: String }
        },

        destination: {
            lati: { type: Number, required: true },
            long: { type: Number, required: true },
            address: { type: String }
        },

        rideStatus: {
            type: String,
            enum: Object.values(IRideStatus),
            default: IRideStatus.REQUESTED,
        },

        fare: { type: Number, },
        distance: { type: Number },

        timestampsLog: {
            requestedAt: {
                type: Date,
                default: Date.now,
            },
            acceptedAt: Date,
            pickedUpAt: Date,
            startedAt: Date,
            completedAt: Date,
            cancelledAt: Date,
        },

        feedback: { type: String },
        rating: { type: Number }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

export const Ride = model<IRide>("Ride", rideSchema);