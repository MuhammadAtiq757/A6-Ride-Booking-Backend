/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { connectRedis } from "./app/config/redis.config";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

// Start the server and connect to the database
const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected To MongoDb Successfully");
    server = app.listen(envVars.PORT, () => {
      console.log(`Server is Running On Port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

// Immediately invoke the startServer function to start the server
(async () => {
  await connectRedis();
  await startServer();
  await seedSuperAdmin();
})();

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("Signal Termination Happened..! Server Is Shutting Down..!");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Handle manual shutdown and unhandled rejections
process.on("SIGINT", () => {
  console.log("Signal Interrupt Happened..! Server Is Shutting Down..!");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Handle unhandled rejections and uncaught exceptions
process.on("unhandledRejection", () => {
  console.log("Unhandled Rejection Happened..! Server Is Shutting Down..!");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception Happened..! Server Is Shutting Down..!", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});