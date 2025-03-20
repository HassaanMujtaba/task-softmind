import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import { extractRoleFromToken } from '../utils/extractRole.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


const getUsersByRole = asyncHandler(async (req, res) => {
  try {
   
    const role = extractRoleFromToken(req.headers.authorization);
     console.log(role)
    let filter = {};

    if (role === "admin") {
      filter = { role: { $in: ["user", "manager"] } };
    } else if (role === "manager") {
      filter = { role: "user" };
    } else {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    const users = await User.find(filter).select("-password"); // Exclude password

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log("Error fetching users by role:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});



export { authUser, registerUser ,getUsersByRole};