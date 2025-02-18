const Application = require('../models/Career')

exports.submitApplication = async (req, res) => {
    try {
      const application = new Application({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        position: req.body.position,
        coverLetter: req.body.coverLetter,
        resume: {
          data: req.file.buffer,
          contentType: req.file.mimetype
        }
      });
  
      await application.save();
      res.status(201).json({ 
        success: true, 
        message: 'Application submitted successfully'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  };

  exports.getApplications = async (req, res) => {
    try {
      
      const applications = await Application.find()
        .select('-resume.data') // Exclude resume data from the response
        .sort({ appliedAt: -1 }); // Sort by latest first
      
      res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching applications',
        error: error.message
      });
    }
  };
  
  // // Get single application
  // exports.getApplication = async (req, res) => {
  //   try {
  //     const application = await Application.findById(req.params.id)
  //       .select('-resume.data'); // Exclude resume data
      
  //     if (!application) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Application not found'
  //       });
  //     }
  
  //     res.status(200).json({
  //       success: true,
  //       data: application
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: 'Error fetching application',
  //       error: error.message
  //     });
  //   }
  // };
  
  // Download resume
  exports.downloadResume = async (req, res) => {
    try {
      const application = await Application.findById(req.params.id);
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
  
      if (!application.resume || !application.resume.data) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
  
      res.set({
        'Content-Type': application.resume.contentType,
        'Content-Disposition': `attachment; filename=${application._id}_resume`
      });
  
      res.send(application.resume.data);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error downloading resume',
        error: error.message
      });
    }
  };