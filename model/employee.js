import mongoose, { Model } from "mongoose";

const employeeSchema = new mongoose.Schema({
  username: { type: "string", required: true },
  email: { type: "string", required: true, unique: true },
  mobileNumber: { type: "number" },
  designation: { type: "string" },
  gender: { type: "string" },
  course: { type: "string" },

  createdAt: { type: "Date", default: new Date() },
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
