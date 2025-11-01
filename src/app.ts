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

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for secure cookies on Vercel
app.set("trust proxy", 1);

// Session config
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,         // must be true on HTTPS (Vercel)
      sameSite: "none",     // allow cross-site cookies
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://a6-ride-booking-frontend-gkzn.vercel.app",
  "https://a6-ride-booking-frontend.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g., Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// API routes
app.use("/api/v1", router);

// Health check
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the GoWay System API",
  });
});

// Error handlers
app.use(globalErrorHandler);
app.use(notFound);

export default app;
