// Backend: controllers/workshopController.js
const Workshop = require('../models/Workshop');
const University = require('../models/University');
const Student = require("../models/Student")
const Material = require("../models/materialSchema")
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
      universityId,
      workshopPassword  // New field
    } = req.body;

    // Create new workshop with password
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
      university: universityId,
      password: workshopPassword  // Save the password
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
exports.verifyWorkshopPassword = async (req, res) => {
  try {
    const { workshopId, password } = req.body;

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({
        status: 'error',
        message: 'Workshop not found'
      });
    }

    if (workshop.password !== password) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid workshop password'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Password verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
exports.submitMaterial = async (req,res)=>{
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    const material = new Material({
      title: req.body.title,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileData: req.file.buffer.toString('base64'),
      workshopId: req.body.workshopId,
      universityId: req.body.universityId
    });

    await material.save();
    console.log(material)
    await University.findByIdAndUpdate(
      req.body.universityId,
      { $push: { materialId: material._id } }
    );
  
    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      material: {
        _id: material._id,
        title: material.title,
        fileName: material.fileName,
        fileType: material.fileType,
        fileSize: material.fileSize
      }
    });
  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading material'
    });
  }
}
exports.getMaterail=async (req,res)=>{
  try {
    const { workshopId } = req.params;
    const studentId = req.query.studentId; // Get studentId from query
    
    console.log('Checking access for:', { workshopId, studentId });

    // First check if student is registered for this workshop
    const workshop = await Workshop.findOne({
      _id: workshopId,
      'registrations.student': studentId, // Check in registrations array
      'registrations.status': { $ne: 'cancelled' } // Ensure registration is not cancelled
    });

    if (!workshop) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not registered for this workshop'
      });
    }

    // If student is registered, fetch the materials
    const materials = await Material.find({ workshopId })
      .select('-fileData') // Exclude the actual file data for listing
      .sort({ uploadDate: -1 });
    console.log(materials)
    res.json({
      success: true,
      materials,
      isRegistered: true
    });

  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching materials'
    });
  }
}
exports.downloadMaterial = async (req,res)=>{
  try {
    const { materialId } = req.params;
    const studentId = req.query.studentId;

    // First get the material to check its workshop
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if student is registered for the workshop
    const workshop = await Workshop.findOne({
      _id: material.workshopId,
      'registrations.student': studentId,
      'registrations.status': { $ne: 'cancelled' }
    });

    if (!workshop) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not registered for this workshop'
      });
    }

    // Get student's registration status
    const registration = workshop.registrations.find(
      reg => reg.student.toString() === studentId
    );

    // Optional: Add additional checks based on registration status
    // if (registration.status === 'registered' && !registration.attendance) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Please attend the workshop to access materials'
    //   });
    // }

    // Convert base64 to buffer and send file
    const fileBuffer = Buffer.from(material.fileData, 'base64');

    res.setHeader('Content-Type', material.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${material.fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    res.send(fileBuffer);

  } catch (error) {
    console.error('Error downloading material:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading material'
    });
  }
}
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