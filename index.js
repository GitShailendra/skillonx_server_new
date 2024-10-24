require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors")
const home = require("./routes/home")
const PORT = process.env.PORT||5000;
app.use(cors());
app.use("/home",home)
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
