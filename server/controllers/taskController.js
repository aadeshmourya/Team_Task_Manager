const Task = require("../models/Task");
const Project = require("../models/Project");


// CREATE TASK
const createTask = async (req, res) => {
  try {

    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
    } = req.body;

    // check project exists
    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // only project admin can create tasks
    if (
      existingProject.admin.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Only admin can create tasks",
      });
    }

    const isProjectMember = existingProject.members.some(
      (member) => member.toString() === assignedTo
    );

    if (!isProjectMember) {
      return res.status(400).json({
        message: "Task can only be assigned to a project member",
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      createdBy: req.user.id,
      priority,
      dueDate,
    });

    res.status(201).json(task);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// GET TASKS
const getTasks = async (req, res) => {
  try {

    let tasks;

    // ADMIN → see all tasks
    if (req.user.role === "admin") {

      tasks = await Task.find()
        .populate("assignedTo", "name email")
        .populate("project", "title")
        .populate("createdBy", "name");

    }

    // MEMBER → only assigned tasks
    else {

      tasks = await Task.find({
        assignedTo: req.user.id,
      })
        .populate("assignedTo", "name email")
        .populate("project", "title")
        .populate("createdBy", "name");

    }

    res.json(tasks);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// UPDATE TASK STATUS
const updateTaskStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // only assigned user can update
    if (
      task.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Only assigned user can update task",
      });
    }

    task.status = status;

    await task.save();

    res.json(task);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// DELETE TASK
const deleteTask = async (req, res) => {
  try {

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await task.deleteOne();

    res.json({
      message: "Task deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
};
