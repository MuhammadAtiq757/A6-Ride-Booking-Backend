import { Types } from "mongoose";

export enum IRideStatus {
  REQUESTED = "REQUESTED",
  ACCEPTED = "ACCEPTED",
  IN_TRANSIT = "IN_TRANSIT",
  PICKED_UP = "PICKED_UP",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface ILocation {
  lati: number;
  long: number;
  address?: string;
}

export interface IRide {
  riderId: Types.ObjectId;
  driverId?: Types.ObjectId;
  cancelledBy?: Types.ObjectId;
  cancelReason?: string;
  pickupLocation: ILocation;
  destination: ILocation;
  rideStatus: IRideStatus;
  fare?: number;
  distance?: number;
  timestampsLog: {
    requestedAt: Date;
    acceptedAt?: Date;
    pickedUpAt?: Date;
    inTransitAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
  };
  feedback?: string
  rating?: number
}
