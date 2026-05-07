const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createProject,
  getProjects,
  addMember,
  removeMember,
} = require("../controllers/projectController");


// CREATE PROJECT
router.post("/", protect, createProject);


// GET PROJECTS
router.get("/", protect, getProjects);


// ADD MEMBER
router.put("/:id/add-member", protect, addMember);


// REMOVE MEMBER
router.put("/:id/remove-member", protect, removeMember);

module.exports = router;