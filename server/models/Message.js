import mongoose, { model } from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    recipient: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", MessageSchema);
