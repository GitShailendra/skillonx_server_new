require("dotenv").config();
const express = require("express");
const app = express();
const path = require('path');
const connectDB = require('./config/db');
const cors = require("cors")
const cookieParser = require("cookie-parser")
const expressSession = require("express-session")
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
const OnlineUserRoute = require("./routes/OnlineUserRoute")
const OfflineUserRoute = require("./routes/OfflineUserRoute")
const QuestionRoute = require("./routes/QuestionRoutes")
const CheckType = require("./routes/CheckType")
const addWorkshop = require("./routes/addWorkshop")
const addAssessments = require("./routes/addAssessments")
const adminRoute = require("./routes/adminRoutes")
const courseRequest = require("./routes/courseRequest")
const careerRoutes = require("./routes/careerRoutes")
// const TestRoute = require("./routes/testRoute")
// const workshopRoutes = require("./routes/workshopRoutes")
connectDB();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://skillonx.com",
      "https://magnificent-bublanina-c141eb.netlify.app"
      
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization','X-Requested-With', 'Accept']
   
   
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use(cookieParser());
app.use(expressSession({
  resave:false,
  saveUninitialized:false,
  secret: "secret",
}))
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
app.use("/api",OnlineUserRoute)
app.use("/api/offline",OfflineUserRoute)
app.use("/questions",QuestionRoute)
app.use("/check-type",CheckType)
app.use("/workshops",addWorkshop)
app.use("/assessments",addAssessments)
app.use("/admin",adminRoute)
app.use("/course-requests",courseRequest)
app.use("/careers",careerRoutes)
// app.use("/send",TestRoute)
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
