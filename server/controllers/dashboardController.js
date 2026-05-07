const Task = require("../models/Task");

const getDashboardData = async (req, res) => {
  try {

    // total tasks
    const totalTasks = await Task.countDocuments();

    // status counts
    const todoTasks = await Task.countDocuments({
      status: "To Do",
    });

    const inProgressTasks = await Task.countDocuments({
      status: "In Progress",
    });

    const doneTasks = await Task.countDocuments({
      status: "Done",
    });

    // overdue tasks
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: "Done" },
    });

    // tasks per user
    const tasksPerUser = await Task.aggregate([
      {
        $group: {
          _id: "$assignedTo",
          total: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      tasksPerUser,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  getDashboardData,
};