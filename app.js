const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 4000;
// db connection......
const connectDB = require("./config/url");
connectDB();
// middleware......
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// router....
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/messenger", authRoutes);
app.use("/api/messenger", userRoutes);

app.get("/", (req, res) => {
  res.send("hello sumit");
});
app.listen(PORT, () => console.log(`server listen at port ${PORT}`));
