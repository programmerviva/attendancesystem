import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { promisify } from 'util';
import AppError from '../utils/appError.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Helper to create JWT token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

// 1. SIGNUP
export const signup = async (req, res, next) => {
  try {
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    // Hash the password manually instead of relying on pre-save hook
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    
    // Create new user with hashed password
    const newUser = await User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      mobile: req.body.mobile,
      password: hashedPassword,
      department: req.body.department || 'Administration',
      designation: req.body.designation || 'Employee',
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
    console.error('Signup error:', err);
    next(err);
  }
};

// 2. LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);

    // Hardcoded admin login as fallback
    if ((email === 'admin@example.com' && password === 'admin123') || 
        (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD)) {
      
      console.log('Admin login successful');
      
      // Create a mock admin user object for frontend
      const adminUser = {
        _id: '000000000000000000000000', // Mock ID for admin
        fullName: { first: 'Admin', last: 'User' },
        email: email,
        role: 'admin',
        department: 'Administration',
        designation: 'Administrator'
      };
      
      // Generate token for admin
      const token = jwt.sign(
        { isAdmin: true }, 
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '90d' }
      );
      
      return res.status(200).json({
        status: 'success',
        token,
        user: adminUser
      });
    }
    
    // Regular employee login from MongoDB
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('User not found:', email);
      return next(new AppError('Incorrect email or password', 401));
    }

    console.log('Found user:', user.email);
    console.log('Password in DB:', user.password ? 'exists' : 'missing');
    
    // Compare passwords using bcrypt
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isPasswordCorrect);

    if (isPasswordCorrect) {
      const token = signToken(user._id);
      
      // Remove password from output
      const userObj = user.toObject();
      delete userObj.password;
      
      console.log('Employee login successful:', userObj.email);
      
      res.status(200).json({
        status: 'success',
        token,
        user: userObj
      });
    } else {
      console.log('Password incorrect for:', email);
      return next(new AppError('Incorrect email or password', 401));
    }
  } catch (err) {
    console.error('Login error:', err);
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

    // Decode the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if it's an admin token
    if (decoded.isAdmin) {
      // Set admin user object
      req.user = {
        _id: '000000000000000000000000',
        fullName: { first: 'Admin', last: 'User' },
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        role: 'admin'
      };
      return next();
    }
    
    // For regular users, find in database
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