// server/controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { promisify } from 'util';
import AppError from '../utils/appError.js';
import bcrypt from 'bcryptjs';

// Helper to create JWT token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// 1. SIGNUP
export const signup = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const newUser = await User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      password: hashedPassword,
      department: req.body.department,
      designation: req.body.designation,
      role: req.body.role || 'employee'
    });

    const token = signToken(newUser._id);

    // Remove password from output
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (err) {
    next(err);
  }
};

// 2. LOGIN
export const login = async (req, res, next) => {
  try {
    console.log('req.body:', req.body);
    const { email, password } = req.body;
    console.log('email:', email);
    console.log('password:', password);
    const user = await User.findOne({ email });
    console.log('user:', user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log('Incorrect email or password');
      return next(new AppError('Incorrect email or password', 401));
    }
    const token = signToken(user._id);
    console.log('token:', token);
    res.status(200).json({
      status: 'success',
      token,
      user,
    });
  } catch (err) {
    console.log('Error:', err);
    next(err);
  }
};

// 3. PROTECT MIDDLEWARE (to be used in routes)
export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in.', 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError('User no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

// 4. ROLE RESTRICTION MIDDLEWARE
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission for this action', 403)
      );
    }
    next();
  };
};