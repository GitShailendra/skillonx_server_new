// controllers/adminController.js
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const University = require("../models/University")
const mongoose = require('mongoose')
const Workshop  =require('../models/Workshop')
const Student = require("../models/Student")
exports.createAdmin = async (req, res) => {
    try {
        const { email, password, setupKey } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Log the setup process
        console.log('Starting admin creation process...');
        console.log('Setup key received:', setupKey);
        console.log('Environment setup key:', "this-is-secret");

        // Verify setup key
        if (setupKey !== "this-is-secret") {
            console.log('Setup key verification failed');
            return res.status(401).json({
                success: false,
                message: 'Invalid setup key'
            });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin already exists');
            return res.status(400).json({
                success: false,
                message: 'Admin already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin
        const admin = new Admin({
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin created successfully');

        res.status(201).json({
            success: true,
            message: 'Admin created successfully'
        });

    } catch (error) {
        console.error('Admin creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating admin'
        });
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        console.log(admin)
        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create token
        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_KEY,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: admin._id,
                email: admin.email,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
};

exports.logout =async (req,res)=>{
    try{
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0)
          });
          res.json({ message: 'Logged out successfully',success:true});
    }catch(error){
        console.error('Logout error:', error);
    }
}

exports.getUniversities = async (req,res)=>{
    try{
        const universities = await University.find()
        res.status(201).json({
            success: true,
            message: 'Universities fetched successfully',
            universities:universities
        });
        }catch(error){
            console.log(error,"debug the error");
            res.status(500).json({
                success: false,
                message: error.message || 'Error fetching Universities'
            });
    }
}
exports.deleteUniversity = async (req,res)=>{
    try {
        const { id } = req.params;

        // Check if id is valid
        if (!id) {
            return res.status(400).json({ message: 'University ID is required' });
        }

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find the university first
            const university = await University.findById(id);
            
            if (!university) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'University not found' });
            }

            // Delete related workshops
            await Workshop.deleteMany({ 
                _id: { $in: university.workshops } 
            }, { session });

            // Remove university references from students
            await Student.updateMany(
                { university: id },
                { $unset: { university: "" } },
                { session }
            );

            
            

            // Finally delete the university
            const deletedUniversity = await University.findByIdAndDelete(id, { session });

            // Commit the transaction
            await session.commitTransaction();

            res.status(200).json({
                message: 'University and related data deleted successfully',
                university: deletedUniversity
            });

        } catch (error) {
            // If anything fails, abort transaction
            await session.abortTransaction();
            throw error;
        } finally {
            // End session
            session.endSession();
        }

    } catch (error) {
        console.error('Error in deleteUniversity:', error);
        res.status(500).json({
            message: 'Error deleting university',
            error: error.message
        });
    }
}

exports.getStudents = async (req,res)=> {
    try{
        const student = await Student.find()
        res.status(201).json({
            success: true,
            message: 'Student fetched successfully',
            students:student
        });
        }catch(error){
            console.log(error,"debug the error");
            res.status(500).json({
                success: false,
                message: error.message || 'Error fetching Student'
            });
    }
}

// controllers/adminController.js

// controllers/adminController.js

exports.getDashboard = async (req, res) => {
    try {
        // Get total counts
        const [
            totalStudents,
            totalUniversities,
            totalWorkshops,
            recentStudents,
            recentWorkshops
        ] = await Promise.all([
            Student.countDocuments(),
            University.countDocuments(),
            Workshop.countDocuments(),
            // Get 5 most recent students without population
            Student.find({})
                .select('firstName lastName assessmentResults universityName')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(), // Using lean() for better performance
            // Get 5 most recent workshops
            Workshop.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .lean()
        ]);
        console.log('Raw Recent Students:', recentStudents); // Debug log
        console.log('total workshop',totalWorkshops)
        console.log(recentWorkshops)

        // If you need university names, fetch them separately
        const universityIds = recentStudents
            .map(student => student.university)
            .filter(id => id); // Filter out null/undefined

        const universities = universityIds.length > 0 
            ? await University.find({ _id: { $in: universityIds } })
                .select('name')
                .lean()
            : [];

        // Create a map of university ids to names for quick lookup
        const universityMap = universities.reduce((acc, uni) => {
            acc[uni._id.toString()] = uni.name;
            return acc;
        }, {});

        const dashboardData = {
            stats: {
                totalStudents,
                totalUniversities,
                totalAssessments: totalWorkshops,
                totalCourses: await Workshop.distinct('course').length
            },
            recentStudents: recentStudents.map(student => ({
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                university: student.universityName 
                   
                
            })),
            recentAssessments: recentWorkshops.map(workshop => ({
                id: workshop._id,
                title: workshop.title || 'Untitled Workshop',
                course: workshop.course || 'No Course Assigned',
                submissions: workshop.submissions?.length || 0,
                avgScore: workshop.averageScore || 0
            }))
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('Dashboard data fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
};