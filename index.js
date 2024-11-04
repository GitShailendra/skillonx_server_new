require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require('./config/db');
const cors = require("cors")
const home = require("./routes/home")
const userRoutes = require("./routes/userRoutes")
const PORT = process.env.PORT||5000;
connectDB();
app.use(cors());
app.use(express.json());
app.use("/home",home)
app.use('/api/users', userRoutes);
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
