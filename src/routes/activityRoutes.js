const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Activity routes placeholder" });
});

module.exports = router;
