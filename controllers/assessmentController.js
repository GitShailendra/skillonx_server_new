const Workshop = require('../models/Workshop');
const University = require('../models/University');
const Student = require("../models/Student")
const Assessment = require("../models/AssessmentModel")
exports.addAssessmentToUniversity = async (req, res) => {
    try {
      
        const { title, description, questions, universityId } = req.body;
        const assessment =   await Assessment.create({
            title,
            description,
            questions,
            university:universityId
        });
        await University.findByIdAndUpdate(
            universityId,
            {$push:{assessments:assessment._id}}
        );
        res.status(201).json({
            status: 'success',
            data: assessment
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
            .populate('workshops'); // Populate workshops array
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

        res.status(200).json({ 
            assessment: university.assessments,
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