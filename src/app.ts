import express, { Request, Response } from "express";
import cors from "cors";
import expressSession from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";

import { envVars } from "./app/config/env";
import { router } from "./app/routes";
import "./app/config/passport";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";

const app = express();

// ---------- Middleware ---------- //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Session Setup ---------- //
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // for cross-origin
    },
  })
);

// ---------- Passport ---------- //
app.use(passport.initialize());
app.use(passport.session());

// ---------- Cookies ---------- //
app.use(cookieParser());
app.set("trust proxy", 1); // trust first proxy (Vercel)

// ---------- CORS ---------- //
const allowedOrigins = [
  "http://localhost:5173", // dev frontend
  "https://a6-ride-booking-frontend-gkzn.vercel.app", // production frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser requests (Postman)
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed from this origin"), false);
      }
    },
    credentials: true, // allow cookies
  })
);

// Handle preflight requests for all routes
app.options("*", cors({ origin: allowedOrigins, credentials: true }));

// ---------- Routes ---------- //
app.use("/api/v1", router);

// ---------- Health Check ---------- //
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the GoWay System API",
  });
});

// ---------- Error Handling ---------- //
app.use(globalErrorHandler);
app.use(notFound);

export default app;
