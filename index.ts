import * as express from "express";
import * as mongoose from "mongoose";
import Shops from "./models/shops";
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(5005, () => {
  console.log("started my server");
});

const url =
  "mongodb+srv://Password:Password@cluster0.m9g1x.mongodb.net/maps?retryWrites=true&w=majority";

mongoose.connect(url, { useNewUrlParser: true }).then((data) => {
  console.log("connected to database");
});

app.get("/shops", (req, res, next) => {
  const options = {
    location: {
      $geoWithin: {
        $centerSphere: [[77.4520708, 28.68467], 15 / 3963.2],
      },
    },
  };
  Shops.find(options).then((data) => {
    res.send(data);
  });
});

app.get("/drivers/nearby", async (req, res) => {
  try {
    //const { latitude, longitude, maxDistance } = req.query; // Assuming the latitude, longitude, and maxDistance are provided as query parameters

    const drivers = await Shops.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat("30.2707"), parseFloat("13.0827")],
          },
          $maxDistance: parseInt("2"),
        },
      },
    });

    res.status(200).json(drivers);
  } catch (error) {
    console.error("Error fetching nearby drivers:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching nearby drivers." });
  }
});

app.post("/shop", async (req, res) => {
  try {
    const { title, latitude, longitude } = req.body; // Assuming the request body contains the driver's name, latitude, and longitude
    console.log(">>>body", req.body);
    const driver = new Shops({
      title,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    const savedDriver = await driver.save();

    res.status(201).json(savedDriver);
  } catch (error) {
    console.error("Error creating driver:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the driver." });
  }
});

app.get("/", (req, res) => {
  res.status(200).json("hello");
});
