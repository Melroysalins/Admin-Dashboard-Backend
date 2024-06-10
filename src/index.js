import dotenv from "dotenv";

import { app } from "./app.js";
import ConnectDB from "./Db/index.js";

dotenv.config({
  path: "./.env",
});

ConnectDB()
  .then(() =>
    app.listen(process.env.PORT, () => {
      console.log("Connected to database at port !!", process.env.PORT);
    })
  )
  .catch((error) => {
    console.log("Failed to connect !!", error);
  });
