// Import necessary modules
const express = require('express');
const multer = require('multer');


// Import controller functions and middleware
const { refreshToken } = require('../controllers/RefreshToken');
const { verifyToken } = require('../middleware/VerifyToken');
const { getUsers, signupUser, loginUser, logoutUser, editUser, deleteUser, userDetails } = require('../controllers/Users');
const { createWorkplan, editWorkplan, deleteWorkplan, getAllWorkplans, getWorkplanById, checkWorkplanExists, getWorkplanDays, allPendingWorkplans, pendingWorkplansByUserId, pendingWorkplansByauthorizer, getWorkplanDaysByUserId, approveWorkplanByUserId, declineWorkplanByUserId, getWorkplansByAuthorizerCollate, approveWorkplanForVehicleAssignment, getWorkplansByAuthorizerAllocate, allocateVehicleAndPilot, getAllApprovedStateWorkplanForTheWeek} = require('../controllers/Workplan');
const { fetchAllUploads, userSpecificReports, handleFileUploads, deleteAFile, downloadAFile, workplansWithoutReport, workplansWithReport, getWorkplanWeekWithoutReport } = require('../controllers/Report');

// Create a router instance
const router = express.Router();
const upload = multer({ dest: 'uploads/' });


// Define routes with associated controller functions and middleware

// Route to fetch users (Protected with JWT verification middleware)
router.get('/users', getUsers); 
// Route to handle user signup
router.post('/signup', signupUser);
// Route to handle user login
router.put('/login', loginUser);
// Route to refresh JWT token
router.get('/token', refreshToken);
// Route to handle user logout
router.delete('/logout', logoutUser);
// Route to handle user information editing
router.put('/users/:userID', editUser);
// Route to handle user deletion
router.delete('/users/:userID', deleteUser);
// Route to handle user details retrieval
router.get('/userDetails/:userID', userDetails);

// Workplan routes

// Route to handle workplan creation
router.post('/workplans', createWorkplan);
// Route to handle editing a workplan
router.put('/workplans/:id', editWorkplan);
// Route to handle deleting a workplan
router.delete('/workplans/:id', deleteWorkplan);
// Route to fetch all workplans
router.get('/workplans', getAllWorkplans);
// Route to fetch a workplan by ID
router.get('/workplans/:id', getWorkplanById);
// Route to check if a workplan exists for a specific day
router.get('/workplans/check/:workplanDay', checkWorkplanExists);
// Route to fetch all workplan days
router.get('/workplans/days/all', getWorkplanDays);
// Route to fetch all workplan days by user ID
router.get('/workplans/days/all/:userId', getWorkplanDaysByUserId);
// Route to fetch all pending workplans
router.get('/workplans/pending/all', allPendingWorkplans);
// Route to fetch pending workplans by user ID
router.get('/workplans/pending/:userId', pendingWorkplansByUserId);
// Route to fetch pending workplans to be approved by authorizer
router.get('/workplans/pending/authorize/:userId', pendingWorkplansByauthorizer);
// Route to approve workplans by user ID
router.put('/workplans/approve/:userId', approveWorkplanByUserId);
// Route to approve workplans for vehicle assignment
router.put('/workplans/collate/:userId', approveWorkplanForVehicleAssignment);
// Route to fetch all approved state workplans for the week
router.get('/workplans/approved/weekly', getAllApprovedStateWorkplanForTheWeek);
// Route to allocate vehicle and pilot
router.put('/workplans/allocate/:userId', allocateVehicleAndPilot);
// Route to decline workplans by user ID
router.put('/workplans/decline/:userId', declineWorkplanByUserId);
// Route to fetch workplans for authorizer collation
router.get('/workplans/collate/all', getWorkplansByAuthorizerCollate);
// Route to fetch workplans for authorizer allocation
router.get('/workplans/allocate/all', getWorkplansByAuthorizerAllocate);


// Report Routes

router.get('/uploads', fetchAllUploads);
router.get('/user-reports', userSpecificReports);
router.post('/upload', upload.single('pdf'), handleFileUploads);
router.delete('/uploads/:filename', deleteAFile);
// router.get('/download/:filename', downloadAFile);

// Route to fetch workplans without a report
router.get('/workplansWithoutReport', workplansWithoutReport);

// Route to fetch workplans with a report
router.get('/workplansWithReport', workplansWithReport);


// Route to handle user details retrieval
router.get('/getWorkplanWeekWithoutReport/:userID', getWorkplanWeekWithoutReport);


// Export the router object directly
module.exports = router;
