const express = require("express");
const router = express.Router();
const {
  getFriends,
  sendMessage,
  getMessages,
  getLastMessage,
  seenMessage,
} = require("../controllers/userControllers");

router.get("/", (req, res) => {
  res.json({ message: "hello world" });
});

router.get("/getFriends", getFriends);
router.post("/sendMessage", sendMessage);
router.get("/getMessages", getMessages);
router.get("/getLastMessage", getLastMessage);
router.post("/seen-message", seenMessage);

module.exports = router;
