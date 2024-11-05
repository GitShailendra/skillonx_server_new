require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require('./config/db');
const cors = require("cors")
const home = require("./routes/home")
// const userRoutes = require("./routes/userRoutes")
const PORT = process.env.PORT||5000;
const featureCourseEnrollment = require('./routes/featuredCourseEnrollment')
const professionalCourse = require("./routes/professionaCourse")
const scheduleConsultation = require('./routes/scheduleConsultation')
const WorkshopSchedule = require("./routes/WorkshopSchedule")
const SchedduleVisit = require("./routes/ScheduleVisit")
const SubmitQuestion = require("./routes/SubmitQuestion")
const Student = require("./routes/Student")
const University = require("./routes/University")
const Email = require("./routes/Email")
connectDB();
app.use(cors());
app.use(express.json());
app.use("/home",home)
app.use("/stayconnected",Email)
app.use('/student', Student);
app.use("/university",University)
app.use('/createenrollment',featureCourseEnrollment)
app.use("/createprofessionalcourse",professionalCourse)
app.use("/scheduleconsultation",scheduleConsultation)
app.use("/workshop",WorkshopSchedule)
app.use("/schedule-visit",SchedduleVisit)
app.use("/questions-not-found",SubmitQuestion)
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
