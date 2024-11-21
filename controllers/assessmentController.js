const Workshop = require('../models/Workshop');
const University = require('../models/University');
const Student = require("../models/Student")
const Assessment = require("../models/AssessmentModel")
exports.addAssessmentToUniversity = async (req, res) => {
    try {
      
        const { title, description, questions, universityId,workshopId } = req.body;
        console.log(workshopId)
        const workshop = await Workshop.findById(workshopId);
        if (!workshop) {
            return res.status(404).json({
                status: 'error',
                message: 'Workshop not found'
            });
        }

        // 2. Get workshop duration and convert to number
        const durationDays = parseInt(workshop.duration);
        if (isNaN(durationDays)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid workshop duration'
            });
        }
        const existingAssessments = await Assessment.countDocuments({
          title: workshop.title,
          university: universityId
      });

      // 4. Check if assessment limit reached
      if (existingAssessments >= durationDays) {
          return res.status(400).json({
              status: 'error',
              message: `Cannot add more assessments. Maximum ${durationDays} assessments allowed for ${durationDays} days workshop duration. Already added: ${existingAssessments}`
          });
      }
      const assessment = await Assessment.create({
        title: workshop.title, // Use workshop title to match in getAssessmentsStudent
        description,
        questions,
        university: universityId,
        workshopId: workshop._id, // Store reference to workshop
        assessmentNumber: existingAssessments + 1, // Track which assessment this is
        totalAssessments: durationDays // Store total number of assessments allowed
    });

    // 6. Update university with new assessment
    await University.findByIdAndUpdate(
        universityId,
        { $push: { assessments: assessment._id } }
    );
    res.status(201).json({
      status: 'success',
      data: {
          assessment,
          workshopInfo: {
              title: workshop.title,
              duration: durationDays,
              assessmentsAdded: existingAssessments + 1,
              remainingAssessments: durationDays - (existingAssessments + 1)
          }
      }
  });
    } catch (error) {
      console.error('Assessment creation error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  };

  exports.getAssesments = async (req, res) => {
    try {
      const { universityId } = req.params;
      console.log(universityId)
      const assessment = await University.findById(universityId).populate('assessments');
      if (!assessment) {
        return res.status(404).json({
          status: 'error',
          message: 'assessment not found'
        });
      }
      console.log(assessment)
      res.status(200).json({
        status: 'success',
        data: assessment.assessments
      });

    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  };
  exports.getAssessmentsStudent = async (req, res) => {
    try {
        const { studId } = req.params;
        
        // Find student and populate their workshops
        const student = await Student.findById(studId)
            .populate('workshops')
            .populate('assessmentResults.assessmentId')
        console.log(student)
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (!student.workshops || student.workshops.length === 0) {
            return res.status(404).json({ 
                message: 'No workshops registered for this student'
            });
        }
        
        // Get workshop titles from student's registered workshops
        const workshopTitles = student.workshops.map(workshop => workshop.title);

        // Find university with matching name and populate assessments
        const university = await University.findOne({ 
            universityName: student.universityName 
        }).populate({
            path: 'assessments',
            match: { title: { $in: workshopTitles } } // Only populate assessments matching workshop titles
        });

        if (!university) {
            return res.status(404).json({ 
                message: 'University not found' 
            });
        }

        if (!university.assessments || university.assessments.length === 0) {
            return res.status(404).json({ 
                message: 'No assessments available for your registered workshops' 
            });
        }

        

      // Filter out submitted assessments
      const unsubmittedAssessments = university.assessments.filter(assessment => {
        const isSubmitted = student.assessmentResults.some(
            result => result.assessmentId && 
            result.assessmentId._id.toString() === assessment._id.toString()
        );
        return !isSubmitted; // Keep only unsubmitted assessments
    });

    // If all assessments are submitted
    if (unsubmittedAssessments.length === 0) {
        return res.status(200).json({ 
            message: 'All assessments have been submitted'
        });
    }

    // Return only unsubmitted assessments
    res.status(200).json({ 
        assessment: unsubmittedAssessments,
        universityName: university.universityName
    });

    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ 
            message: 'Error fetching assessments', 
            error: error.message 
        });
    }
};