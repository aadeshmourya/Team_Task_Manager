const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");


// MEMBER + ADMIN
router.get(
  "/member",
  protect,
  (req, res) => {

    res.json({
      message: "Member Route Accessed",
      user: req.user,
    });

  }
);


// ADMIN ONLY
router.get(
  "/admin",
  protect,
  allowRoles("admin"),
  (req, res) => {

    res.json({
      message: "Admin Route Accessed",
    });

  }
);

module.exports = router;