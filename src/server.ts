import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { connectRedis } from "./app/config/redis.config";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

// Connect to database & Redis only once
(async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("✅ Connected to MongoDB");

    await connectRedis();
    console.log("✅ Connected to Redis");

    await seedSuperAdmin();
    console.log("✅ Super Admin Seeded (if not exists)");
  } catch (error) {
    console.error("❌ Error initializing server:", error);
  }
})();

// ❗ Export the app for Vercel
export default app;
