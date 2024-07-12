import express from "express";
import bodyParser from "body-parser";
import Employee from "./model/employee.js";
import UserAdmin from "./model/admin.js";
import mongoose, { trusted } from "mongoose";
import bcrypt from "bcrypt";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const saltRound = process.env.SALT_ROUND;
const secretKey = process.env.SECRET_KEY;

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const app = express();
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(cookieParser());

const url = process.env.MONGO_CONNECTION;

mongoose.connect(url).then(() => {
  console.log("Connected to the database");
});

/////admin /////

app.post("/register_admin", async (req, res) => {
  const { username, email, password } = req.body;

  const adminUser = await UserAdmin.findOne({ email });
  if (adminUser)
    return res.status(409).json({ message: "Admin already exists" });

  const hashedPassword = await bcrypt.hash(password, saltRound);

  try {
    const admin = await UserAdmin.create({
      username,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Admin cannot be created",
    });
  }
});

app.get("/admin", async (req, res) => {
  try {
    const admin = await UserAdmin.find();
    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Admin not found",
    });
  }
});

///////////////////////////////////////

///////Login authentication

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await UserAdmin.findOne({ username });

  const passok = await bcrypt.compare(password, user.password);
  if (passok) {
    jwt.sign(
      { username: user.username, id: user._id },
      secretKey,
      {},
      (err, token) => {
        if (err) throw err;

        res.cookie("token", token).json({
          id: user._id,
          username: user.username,
        });
      }
    );
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secretKey, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token").json("ok");
});
/////////////////////////////////////////

/// Employee /////////////////////////////////////////

app.get("/employee", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Employee not found",
    });
  }
});

app.post("/create_employee", async (req, res) => {
  const { username, email, mobileNumber, designation, gender, course, imgUrl } =
    req.body;

  try {
    const user = await Employee.findOne({ email });

    if (user)
      return res.status(409).json({ message: "Employee already exists" });

    const employee = await Employee.create({
      username,
      email,
      mobileNumber,
      designation,
      gender,
      course,
    });

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "User cannot be created",
    });
  }
});

app.patch("/employee/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedEmployee,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Employee could not be updated",
    });
  }
});

app.get("/employee/:id", async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findById(id);
  res.status(200).json({
    success: true,
    data: employee,
  });
});

app.delete("/employee/:id", async (req, res) => {
  const { id } = req.params;
  await Employee.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    data: null,
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
