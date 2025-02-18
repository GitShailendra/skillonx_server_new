const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {verifyToken} = require('../middlewares/adminMiddleware');

router.post('/submit', upload.single('resume'), careerController.submitApplication);
router.get('/applications',verifyToken, careerController.getApplications);
// router.get('/applications/:id', getApplication);
router.get('/applications/:id/resume',verifyToken, careerController.downloadResume);
// router.get('/applications', applicationController.getApplications);

module.exports = router;