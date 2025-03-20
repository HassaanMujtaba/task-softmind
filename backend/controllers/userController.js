import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import { extractRoleFromToken } from '../utils/extractRole.js';

const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(error.status || 500);
    res.json({ success: false, message: error.message || 'Internal Server Error' });
  }
};


const registerUser = async (req, res) => {
  try {
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

    if (!user) {
      res.status(400);
      throw new Error('Invalid user data');
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(error.status || 500);
    res.json({ success: false, message: error.message || 'Internal Server Error' });
  }
};


const getUsersByRole = async (req, res) => {
  try {
    const role = extractRoleFromToken(req.headers.authorization);

    let filter = {};

    if (role === 'admin') {
      filter = { role: { $in: ['user', 'manager'] } };
    } else if (role === 'manager') {
      filter = { role: 'user' };
    } else {
      res.status(403);
      throw new Error('Access Denied');
    }

    const users = await User.find(filter).select('-password'); 

    if (!users) {
      res.status(404);
      throw new Error('No users found');
    }

    res.status(200).json({ success: true, users });
  } catch (error) {
    
    res.status(error.status || 500);
    res.json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

export { authUser, registerUser, getUsersByRole };