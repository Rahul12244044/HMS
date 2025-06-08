import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  availableSlots: {
    type: Map,
    of: [String],  // Each value is an array of strings
    required: true,
  }
});

export const slotModel = mongoose.model("Slots", slotSchema);
