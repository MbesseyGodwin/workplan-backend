// Import necessary modules
const express = require('express');

// Import controller functions and middleware
const { refreshToken } = require('../controllers/RefreshToken');
const { verifyToken } = require('../middleware/VerifyToken');
const { getUsers, signupUser, loginUser, logoutUser, editUser, deleteUser, userDetails } = require('../controllers/Users');
const { createWorkplan, editWorkplan, deleteWorkplan, getAllWorkplans, getWorkplanById, checkWorkplanExists, getWorkplanDays, allPendingWorkplans, pendingWorkplansByUserId, pendingWorkplansByauthorizer, getWorkplanDaysByUserId, approveWorkplanByUserId, declineWorkplanByUserId, getWorkplansByAuthorizerCollate, approveWorkplanForVehicleAssignment, getWorkplansByAuthorizerAllocate, allocateVehicleAndPilot, getAllApprovedStateWorkplanForTheWeek} = require('../controllers/Workplan');

// Create a router instance
const router = express.Router();

// Define routes with associated controller functions and middleware
// router.get('/users', verifyToken, getUsers); // Route to fetch users, protected with JWT verification middleware

router.get('/users', getUsers); // Route to fetch users, protected with JWT verification middleware
router.post('/signup', signupUser); // Route to handle user signup
router.put('/login', loginUser); // Route to handle user login
router.get('/token', refreshToken); // Route to refresh JWT token
router.delete('/logout', logoutUser); // Route to handle user logout
router.put('/users/:userID', editUser); // Route to handle user information editing
router.delete('/users/:userID', deleteUser); // Route to handle user deletion
router.get('/userDetails/:userID', userDetails); // Route to handle user details retrieval

// Workplan routes
router.post('/workplans', createWorkplan); // Route to handle workplan creation
router.put('/workplans/:id', editWorkplan); // Route to handle editing a workplan
router.delete('/workplans/:id', deleteWorkplan); // Route to handle deleting a workplan
router.get('/workplans', getAllWorkplans); // Route to fetch all workplans
router.get('/workplans/:id', getWorkplanById); // Route to fetch a workplan by ID
router.get('/workplans/check/:workplanDay', checkWorkplanExists); // Route to check if a workplan exists for a specific day

router.get('/workplans/days/all', getWorkplanDays);

router.get('/workplans/days/all/:userId', getWorkplanDaysByUserId);

router.get('/workplans/pending/all', allPendingWorkplans);

// Route to get pending workplans by user ID
router.get('/workplans/pending/:userId', pendingWorkplansByUserId);


// Route to get pending workplans to be approved by authorizer
router.get('/workplans/pending/authorize/:userId', pendingWorkplansByauthorizer);

// Define the route for approving workplans by user ID
router.put('/workplans/approve/:userId', approveWorkplanByUserId);


// this is the API route that will assign vehicle to francis for vehicle allocation
// API route to approve workplans for vehicle assignment
router.put('/workplans/collate/:userId', approveWorkplanForVehicleAssignment);


// API route for showing all the workplan, the returnd data means it has been approved by supervisor, by dr nnadi and fracis have assigned vehicle and a pilot
router.get('/workplans/approved/weekly', getAllApprovedStateWorkplanForTheWeek);



// API route for vehicle assignment which is then seen globally, after francis assigns vehicle, the list is pushed to the state workplan where all users can see
router.put('/workplans/allocate/:userId', allocateVehicleAndPilot);



// Define the route for declining workplans by user ID
router.put('/workplans/decline/:userId', declineWorkplanByUserId);


router.get('/workplans/collate/all', getWorkplansByAuthorizerCollate);

router.get('/workplans/allocate/all', getWorkplansByAuthorizerAllocate);


// Export the router object directly
module.exports = router;

