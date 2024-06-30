const mongoose = require("mongoose");
const User = require("../models/userRegister");
const UserMessage = require("../models/userMessage");
const { status } = require("express/lib/response");

const lastMsgGet = async (myId, fdId) => {
  const messages = await UserMessage.find({
    $or: [
      { senderId: myId, receiverId: fdId },
      { senderId: fdId, receiverId: myId },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(1);

  return messages[0]; // Return the single message or undefined if no messages exist
};

const getLastMessage = async (req, res) => {
  const myId = req.query.id;
  let friendMsg = [];
  try {
    // Find all users and exclude the password field
    const friends = await User.find().select("-password");
    for (let i = 0; i < friends.length; i++) {
      const msg = await lastMsgGet(myId, friends[i]._id);
      friendMsg = [
        ...friendMsg,
        { friendId: friends[i]._id, friendName: friends[i].username, msg },
      ];
    }

    res.status(200).json({
      friendMsg,
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching friends.",
      error: error.message,
    });
  }
};

const getFriends = async (req, res) => {
  try {
    // Find all users and exclude the password field
    const friends = await User.find().select("-password");
    res.status(200).json({
      success: true,
      friends,
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching friends.",
      error: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  const { senderId, senderName, receiverId, receiverName, message, status } =
    req.body;

  try {
    const newMessage = await new UserMessage({
      senderId,
      senderName,
      receiverId,
      receiverName,
      message,
      status,
    });
    await newMessage.save();
    console.log("new message", newMessage);
    return res.status(201).json({ success: true, newMessage });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMessages = async (req, res) => {
  const myId = req.query.senderId;
  const fdId = req.query.receiverId;
  try {
    const messages = await UserMessage.find({
      $or: [
        { senderId: myId, receiverId: fdId },
        { senderId: fdId, receiverId: myId },
      ],
    });

    return res.status(200).json({
      myMsg: messages,
    });
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const seenMessage = async (req, res) => {
  console.log("body", req.body._id);
  const messageId = req.body._id; // Corrected variable name to messageId

  try {
    // Update the status of the message
    const updateStatus = await UserMessage.findByIdAndUpdate(
      messageId, // Pass the message ID directly to findByIdAndUpdate
      { status: "seen" }, // Update status to "seen"
      { new: true } // To return the updated document
    );

    if (!updateStatus) {
      return res
        .status(404)
        .json({ status: false, message: "Message not found" });
    }

    res.status(200).json({ status: true });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};
module.exports = {
  getFriends,
  sendMessage,
  getMessages,
  getLastMessage,
  seenMessage,
};
