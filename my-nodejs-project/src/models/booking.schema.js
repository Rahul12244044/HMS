import mongoose from "mongoose";
const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming "User" model includes doctor profiles
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming same "User" model for patients
    required: true
  },
  date: {
    type: String, // e.g. "2025-06-05"
    required: true
  },
  time: {
    type: String, // e.g. "10:00"
    required: true
  },
  reason: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["booked", "completed", "cancelled"],
    default: "booked"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

export const bookingModel = mongoose.model("Appointment", appointmentSchema);
