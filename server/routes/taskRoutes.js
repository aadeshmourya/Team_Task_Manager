const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
} = require("../controllers/taskController");


// CREATE TASK
router.post("/", protect, createTask);


// GET TASKS
router.get("/", protect, getTasks);


// UPDATE STATUS
router.put("/:id/status", protect, updateTaskStatus);


// DELETE TASK
router.delete("/:id", protect, deleteTask);

module.exports = router;