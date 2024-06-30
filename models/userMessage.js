const mongoose = require("mongoose");

// Define the schema
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
    message: {
      text: {
        type: String,
        default: "",
      },
      image: {
        type: String,
        default: "",
      },
    },
    status: {
      type: String,
      default: "unseen",
    },
  },
  { timestamps: true }
);

// Create the model
const UserMessage = mongoose.model("UserMessage", messageSchema);

// Export the model
module.exports = UserMessage;
