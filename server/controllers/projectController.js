const Project = require("../models/Project");


// CREATE PROJECT
const createProject = async (req, res) => {
  try {

    const { title, description } = req.body;

    const project = await Project.create({
      title,
      description,
      admin: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json(project);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// GET USER PROJECTS
const getProjects = async (req, res) => {
  try {

    const projects = await Project.find({
      members: req.user.id,
    })
    .populate("members", "name email role")
    .populate("admin", "name email");

    res.json(projects);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// ADD MEMBER
const addMember = async (req, res) => {
  try {

    const { userId } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // only admin can add
    if (project.admin.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only admin can add members",
      });
    }

    // avoid duplicate members
    if (project.members.includes(userId)) {
      return res.status(400).json({
        message: "User already added",
      });
    }

    project.members.push(userId);

    await project.save();

    res.json({
      message: "Member added successfully",
      project,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// REMOVE MEMBER
const removeMember = async (req, res) => {
  try {

    const { userId } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // only admin
    if (project.admin.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only admin can remove members",
      });
    }

    if (project.admin.toString() === userId) {
      return res.status(400).json({
        message: "Project admin cannot be removed",
      });
    }

    project.members = project.members.filter(
      (member) => member.toString() !== userId
    );

    await project.save();

    res.json({
      message: "Member removed successfully",
      project,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  createProject,
  getProjects,
  addMember,
  removeMember,
};
