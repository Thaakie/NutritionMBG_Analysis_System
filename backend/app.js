require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rootRoutes = require("./routes/rootRoutes");
const apiRoutes = require("./routes/apiRoutes");

const app = express();
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: CLIENT_ORIGINS,
  }),
);
app.use(express.json());

app.use("/", rootRoutes);
app.use("/api", apiRoutes);

module.exports = app;
