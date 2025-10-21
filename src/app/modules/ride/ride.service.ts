import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IRide, IRideStatus } from "./ride.interface";
import { User } from "../user/user.model";
import { JwtPayload } from "jsonwebtoken";
import { IsActive, Role } from "../user/user.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Driver } from "../driver/driver.model";
import { Ride } from "./ride.model";
import { Types } from "mongoose";


const requestForRide = async (payload: Partial<IRide>, decodedToken: JwtPayload) => {
    if (!payload.riderId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Rider id not found");
    }

    const rider = await User.findById(payload.riderId).select("-password");

    if (!rider) {
        throw new AppError(httpStatus.NOT_FOUND, "Rider not found");
    }
    if (rider.isDeleted || rider.isActive !== IsActive.ACTIVE) {
        throw new AppError(httpStatus.FORBIDDEN, "Rider is not active");
    }
    if (!payload.riderId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Rider id not found");
    }
    if (rider.isBlocked === "BLOCKED") {
        throw new AppError(httpStatus.BAD_REQUEST, "You are blocked. Contact admin.");
    }
    if (decodedToken.userId !== payload.riderId) {
        throw new AppError(httpStatus.FORBIDDEN, "Rider id not match");
    }
    if (!payload.pickupLocation?.lati || !payload.pickupLocation?.long || !payload.destination?.lati || !payload.destination?.long) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid pickup or destination coordinates");
    }
    if (payload.pickupLocation?.lati === payload.destination?.lati && payload.pickupLocation?.long === payload.destination?.long) {
        throw new AppError(httpStatus.BAD_REQUEST, "Pickup and Destination cannot be same");
    }

    const existingRide = await Ride.findOne({
        riderId: payload.riderId,
        rideStatus: {
            $in: [
                IRideStatus.REQUESTED,
                IRideStatus.ACCEPTED,
                IRideStatus.IN_TRANSIT,
            ],
        },
    });
    if (existingRide) {
        throw new AppError(httpStatus.CONFLICT, "You already have an ongoing ride request");
    }

    const requestPayload: Partial<IRide> = {
        ...payload,
        rideStatus: IRideStatus.REQUESTED,
        timestampsLog: {
            requestedAt: new Date(),
        },
    };

    const rideCreated = await Ride.create(requestPayload);

    await rider.save();
    return rideCreated;
};


const getAllRidesForRider = async (query: Record<string, string>, decodedToken: JwtPayload) => {
    const queryBuilder = new QueryBuilder(
        Ride.find({ riderId: decodedToken.userId }),
        query
    );
    const allRides = await queryBuilder.filter().sort().fields().paginate();
    const [data, meta] = await Promise.all([
        allRides.build(),
        queryBuilder.getMeta(),
    ]);
    return { meta: meta, data: data };
};


const getAvailableRides = async (query: Record<string, string>, decodedToken: JwtPayload) => {

    const driver = await Driver.findOne({ userId: decodedToken.userId });
    if (!driver) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    if (driver.driverStatus !== "APPROVED") {
        throw new AppError(httpStatus.FORBIDDEN, "Driver not approved yet");
    }

    const queryBuilder = new QueryBuilder(
        Ride.find({
            rideStatus: IRideStatus.REQUESTED,
            driverId: { $exists: false }
        }).populate('riderId', 'name email phone'),
        query
    );

    const rides = await queryBuilder.filter().sort().fields().paginate();
    const [data, meta] = await Promise.all([
        rides.build(),
        queryBuilder.getMeta(),
    ]);

    return { meta: meta, data: data };
};

const driverAcceptRide = async (rideId: string, decodedToken: JwtPayload) => {
    const driver = await Driver.findOne({ userId: decodedToken.userId });
    if (!driver) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    if (driver.driverStatus !== "APPROVED") {
        throw new AppError(httpStatus.FORBIDDEN, "Driver not approved");
    }

    const activeRide = await Ride.findOne({
        driverId: driver._id,
        rideStatus: {
            $in: [IRideStatus.ACCEPTED, IRideStatus.PICKED_UP, IRideStatus.IN_TRANSIT]
        }
    });

    if (activeRide) {
        throw new AppError(httpStatus.CONFLICT, "Driver already has an active ride");
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
        throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
    }

    if (ride.rideStatus !== IRideStatus.REQUESTED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Ride is not available for acceptance");
    }

    if (ride.driverId) {
        throw new AppError(httpStatus.CONFLICT, "Ride already accepted by another driver");
    }

    ride.driverId = driver._id;
    ride.rideStatus = IRideStatus.ACCEPTED;
    ride.timestampsLog.acceptedAt = new Date();

    await ride.save();

    return await Ride.findById(rideId)
        .populate('riderId', 'name email phone')
        .populate('driverId');
};


const updateRideStatus = async (rideId: string, payload: { rideStatus: IRideStatus; cancelReason?: string }, decodedToken: JwtPayload) => {
    const { rideStatus, cancelReason } = payload;

    const ride = await Ride.findById(rideId);
    if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");

    const role = decodedToken.role;

    if (role !== Role.ADMIN && role !== Role.SUPER_ADMIN && role !== Role.DRIVER) {
        throw new AppError(httpStatus.FORBIDDEN, "Unauthorized to update ride status");
    }

    if (role === Role.DRIVER) {
        const driver = await Driver.findOne({ userId: decodedToken.userId });
        if (!driver || ride.driverId?.toString() !== driver._id?.toString()) {
            throw new AppError(httpStatus.FORBIDDEN, "You can only update your assigned rides");
        }
    }

    if (ride.rideStatus === IRideStatus.REQUESTED) {
        if (rideStatus !== IRideStatus.ACCEPTED && rideStatus !== IRideStatus.CANCELLED) {
            throw new AppError(httpStatus.BAD_REQUEST, `Cannot transition from REQUESTED to ${rideStatus}`);
        }
    } else if (ride.rideStatus === IRideStatus.ACCEPTED) {
        if (rideStatus !== IRideStatus.PICKED_UP && rideStatus !== IRideStatus.CANCELLED) {
            throw new AppError(httpStatus.BAD_REQUEST, `Cannot transition from ACCEPTED to ${rideStatus}`);
        }
    } else if (ride.rideStatus === IRideStatus.PICKED_UP) {
        if (rideStatus !== IRideStatus.IN_TRANSIT && rideStatus !== IRideStatus.CANCELLED) {
            throw new AppError(httpStatus.BAD_REQUEST, `Cannot transition from PICKED_UP to ${rideStatus}`);
        }
    } else if (ride.rideStatus === IRideStatus.IN_TRANSIT) {
        if (rideStatus !== IRideStatus.COMPLETED && rideStatus !== IRideStatus.CANCELLED) {
            throw new AppError(httpStatus.BAD_REQUEST, `Cannot transition from IN_TRANSIT to ${rideStatus}`);
        }
    } else if (ride.rideStatus === IRideStatus.COMPLETED || ride.rideStatus === IRideStatus.CANCELLED) {
        throw new AppError(httpStatus.BAD_REQUEST, `Cannot change ride status from ${ride.rideStatus}`);
    }

    ride.rideStatus = rideStatus;

    if (rideStatus === IRideStatus.ACCEPTED) {
        ride.timestampsLog.acceptedAt = new Date();
    } else if (rideStatus === IRideStatus.PICKED_UP) {
        ride.timestampsLog.pickedUpAt = new Date();
    } else if (rideStatus === IRideStatus.IN_TRANSIT) {
        ride.timestampsLog.inTransitAt = new Date();
    } else if (rideStatus === IRideStatus.COMPLETED) {
        ride.timestampsLog.completedAt = new Date();
    } else if (rideStatus === IRideStatus.CANCELLED) {
        ride.timestampsLog.cancelledAt = new Date();
        ride.cancelledBy = new Types.ObjectId(decodedToken.userId);
        if (cancelReason) ride.cancelReason = cancelReason;
    }

    await ride.save();

    return await Ride.findById(rideId)
        .populate('riderId', 'name email phone')
        .populate('driverId');
};



const getAllRidesForAdmin = async (query: Record<string, string>, decodedToken: JwtPayload) => {
    if (decodedToken.role === Role.ADMIN || Role.SUPER_ADMIN) {
        const queryBuilder = new QueryBuilder(Ride.find(), query);
        const rides = await queryBuilder.filter().sort().fields().paginate();
        const [data, meta] = await Promise.all([
            rides.build(),
            queryBuilder.getMeta(),
        ]);
        return { meta: meta, data: data };
    }
};

const getSingleRideForRider = async (rideId: string, riderId: string) => {

    const singleRide = await Ride.findById(rideId)

    if (!singleRide) {
        throw new AppError(httpStatus.NOT_FOUND, "Ride Information Not Found")
    }


    if (String(singleRide.riderId) !== riderId) {
        throw new AppError(httpStatus.BAD_REQUEST, "This Ride Is Not Yours!")
    }

    return {
        data: singleRide
    }
}

const getSingleRideForDriver = async (rideId: string, userId: string) => {
    const ride = await Ride.findById(rideId);

    if (!ride) {
        throw new AppError(httpStatus.NOT_FOUND, "Ride Information Not Found");
    }

    const driver = await Driver.findOne({ userId });
    if (!driver) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }

    if (ride.driverId?.toString() !== driver._id.toString()) {
        throw new AppError(httpStatus.FORBIDDEN, "This Ride Is Not Yours!");
    }

    return ride;
};



const cancelRide = async (rideId: string, cancelReason: string, decodedToken: JwtPayload) => {
    const ride = await Ride.findById(rideId);
    if (!ride) {
        throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
    }
    if (ride.rideStatus === IRideStatus.COMPLETED || ride.rideStatus === IRideStatus.CANCELLED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Cannot cancel a completed or already cancelled ride");
    }

    if (decodedToken.role === Role.RIDER) {
        if (ride.riderId.toString() !== decodedToken.userId) {
            throw new AppError(httpStatus.FORBIDDEN, "You can only cancel your own rides");
        }
        if (ride.rideStatus === IRideStatus.PICKED_UP || ride.rideStatus === IRideStatus.IN_TRANSIT) {
            throw new AppError(httpStatus.BAD_REQUEST, "Cannot cancel ride after pickup");
        }
    }

    ride.rideStatus = IRideStatus.CANCELLED;
    ride.timestampsLog.cancelledAt = new Date();
    ride.cancelledBy = new Types.ObjectId(decodedToken.userId);
    ride.cancelReason = cancelReason;

    await ride.save();

    return await Ride.findById(rideId)
        .populate('riderId', 'name email phone')
        .populate('driverId');
};



const giveFeedback = async (rideId: string, userId: string, feedback: string) => {
    try {
        const ride = await Ride.findById(rideId);
        if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");

        if (!ride.driverId) throw new AppError(httpStatus.BAD_REQUEST, "No driver assigned to this ride");

        if (ride.riderId.toString() !== userId) {
            throw new AppError(httpStatus.BAD_REQUEST, "You are not authorized to give feedback on this ride");
        }

        if (ride.feedback) throw new AppError(httpStatus.BAD_REQUEST, "Feedback already submitted");

        if (ride.rideStatus !== IRideStatus.COMPLETED) {
            throw new AppError(httpStatus.BAD_REQUEST, "Feedback allowed only for completed rides");
        }

        const rider = await User.findById(ride.riderId);
        if (!rider || rider.isBlocked === IsActive.BLOCKED) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is not allowed to submit feedback");
        }


        ride.feedback = feedback;
        await ride.save();

        return {
            rideId: ride._id,
            driverId: ride.driverId,
            feedback: ride.feedback,
        };
    } catch (error) {
        console.error("Error giving feedback:", error);
        throw error;
    }
};




export const rideService = {
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