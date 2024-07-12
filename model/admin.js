import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: "string", required: true },
  email: { type: "string", required: true, unique: true },
  password: { type: "string", required: true },
});

const UserAdmin = mongoose.model("Admin", adminSchema);

export default UserAdmin;
