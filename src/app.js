import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";

import cloudinary from "cloudinary";

const app = express();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.use(
  cors({
    origin: process.env.CORS, // Replace with your frontend URL
    credentials: true,
  })
);

app.use(
  express.urlencoded({
    urlencoded: true,
    extended: true,
  })
);

app.use(cookieparser());

app.use(express.json());

app.use(express.static("public"));

import { router } from "./routes/admin.routes.js";

app.use("/api", router);

export { app };
