// Backend: controllers/workshopController.js
const Workshop = require('../models/Workshop');
const University = require('../models/University');
const Student = require("../models/Student")
exports.addWorkshopToUniversity = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      category,
      level,
      duration,
      batchSize,
      mode,
      highlights,
      universityId
    } = req.body;

    // Create new workshop
    const workshop = await Workshop.create({
      title,
      description,
      image,
      category,
      level,
      duration,
      batchSize,
      mode,
      highlights,
      university: universityId
    });

    // Add workshop to university's workshops array
    await University.findByIdAndUpdate(
      universityId,
      { $push: { workshops: workshop._id } }
    );

    res.status(201).json({
      status: 'success',
      data: workshop
    });
  } catch (error) {
    console.error('Workshop creation error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getUniversityWorkshops = async (req, res) => {
  try {
    const { universityId } = req.params;
    console.log(universityId)
    const workshops = await Workshop.find({ university: universityId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: workshops
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.deleteUniversityWorkshop=async(req,res)=>{
  try{
    const {workshopId} = req.params
    console.log(workshopId)
    const workshop = await Workshop.findByIdAndDelete({workshopId})
    res.status(200).json({
      status: 'deleted successfully',
      data: workshop
    });
  }catch(e){
    console.log(e)
  }
}
exports.getWorkshops = async (req, res) => {
  try {
    // User info is available in req.user through your session middleware
    const { studentId } = req.params;
    console.log(studentId)
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    console.log(student)

    // Find university with matching name and populate workshops
    const university = await University.findOne({ 
      universityName: student.universityName 
    }).populate('workshops');

    if (!university) {
      console.log("no university found")
      return res.status(404).json({ 
        message: 'No workshops found for your university' 
      });
    }

    res.status(200).json({ 
      workshops: university.workshops,
      universityName: university.universityName
    });

  } catch (error) {
    console.error('Error fetching workshops:', error);
    res.status(500).json({ 
      message: 'Error fetching workshops', 
      error: error.message 
    });
  }
};