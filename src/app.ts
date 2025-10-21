import cors from "cors";
import express, { Request, Response } from "express";
import expressSession from "express-session";
import { envVars } from "./app/config/env";
import { router } from "./app/routes";
import "./app/config/passport";
import passport from "passport";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware setup
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.set("trust proxy", 1);

// Security headers
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Static file serving
app.use("/api/v1", router);

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the LoopRide System API ",
  });
});

// Global error handler
app.use(globalErrorHandler);

// Not found handler
app.use(notFound);

export default app;
