import User from '../models/User.js';
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';

// Generate JWT token
const signToken = (id, isAdmin = false) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Create and send token to client
const createSendToken = (user, statusCode, res, isAdmin = false) => {
  const token = signToken(user._id, isAdmin);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user: {
      ...user._doc,
      isAdmin,
    },
  });
};

// Register new user
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Create new user
    const newUser = await User.create({
      fullName,
      email,
      password,
      role: 'employee', // Default role is employee
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    next(err);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, userId, password } = req.body;

    // Check if either email or userId is provided along with password
    if ((!email && !userId) || !password) {
      return next(new AppError('Please provide email/userId and password', 400));
    }

    // First check if it's an admin login (admins still use email)
    if (email) {
      const admin = await Admin.findOne({ email }).select('+password');

      if (admin) {
        // Compare passwords directly using bcrypt
        const isPasswordCorrect = await bcrypt.compare(password, admin.password);

        if (isPasswordCorrect) {
          // Admin login successful
          return createSendToken(admin, 200, res, true);
        }
      }
    }

    // If not admin, check regular user
    let user;

    if (userId) {
      // If userId is provided, check if it has PF prefix
      const searchUserId = userId.startsWith('PF') ? userId.substring(2) : userId;
      user = await User.findOne({ userId: searchUserId }).select('+password');
    } else if (email) {
      // If email is provided
      user = await User.findOne({ email }).select('+password');
    }

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect credentials', 401));
    }

    // User login successful
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Protect routes - middleware to check if user is logged in
export const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    let currentUser;

    if (decoded.isAdmin) {
      currentUser = await Admin.findById(decoded.id);
    } else {
      currentUser = await User.findById(decoded.id);
    }

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    req.isAdmin = decoded.isAdmin || false;
    next();
  } catch (err) {
    next(err);
  }
};

// Restrict to certain roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Admin always has access
    if (req.isAdmin) return next();

    // For regular users, check role
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email, userId } = req.body;
    let user = null;
    let admin = null;
    if (email) {
      admin = await Admin.findOne({ email });
    }
    if (userId) {
      // Remove PF prefix if present
      const searchUserId = userId.startsWith('PF') ? userId.substring(2) : userId;
      user = await User.findOne({ userId: searchUserId });
    } else if (email && !admin) {
      // If not admin, try user by email
      user = await User.findOne({ email });
    }
    if (!user && !admin) {
      return next(new AppError('No user found with that email or userId.', 404));
    }
    // Use user or admin for reset
    const account = user || admin;
    // 2) Generate the random reset token
    if (!account.createPasswordResetToken) {
      return next(new AppError('Password reset not supported for this account.', 400));
    }
    const resetToken = account.createPasswordResetToken();
    await account.save({ validateBeforeSave: false });
    // 3) Send it to user's email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetURL = `${clientUrl}/reset-password/${resetToken}`;
    const message = `Forgot your password? Click the link below to reset your password: ${resetURL}\n\nIf you didn't forget your password, please ignore this email!`;
    try {
      const emailToSend = account.email;
      const emailSent = await sendEmail({
        email: emailToSend,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });
      if (!emailSent) {
        account.passwordResetToken = undefined;
        account.passwordResetExpires = undefined;
        await account.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending the email. Try again later!', 500));
      }
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      account.passwordResetToken = undefined;
      account.passwordResetExpires = undefined;
      await account.save({ validateBeforeSave: false });
      return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
  } catch (err) {
    next(err);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // This is handled by a pre-save middleware in the User model

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Update password
export const updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    let user;

    if (req.isAdmin) {
      user = await Admin.findById(req.user.id).select('+password');
    } else {
      user = await User.findById(req.user.id).select('+password');
    }

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res, req.isAdmin);
  } catch (err) {
    next(err);
  }
};

// Check if email exists
export const checkEmail = async (req, res, next) => {
  try {
    const { email, userId } = req.body;
    let user = null;
    let admin = null;
    if (email) {
      admin = await Admin.findOne({ email });
    }
    if (userId) {
      // Remove PF prefix if present
      const searchUserId = userId.startsWith('PF') ? userId.substring(2) : userId;
      user = await User.findOne({ userId: searchUserId });
    } else if (email && !admin) {
      // If not admin, try user by email
      user = await User.findOne({ email });
    }
    res.status(200).json({
      status: 'success',
      exists: !!(user || admin),
    });
  } catch (err) {
    next(err);
  }
};

// Direct password reset (without token)
export const directReset = async (req, res, next) => {
  try {
    const { email, userId, password, confirmPassword } = req.body;
    // Check if passwords match
    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }
    let user = null;
    let admin = null;
    if (email) {
      admin = await Admin.findOne({ email });
      user = await User.findOne({ email });
    }
    if (userId) {
      // Remove PF prefix if present
      const searchUserId = userId.startsWith('PF') ? userId.substring(2) : userId;
      user = await User.findOne({ userId: searchUserId });
    }
    if (!user && !admin) {
      return next(new AppError('No user found with that email address or userId', 404));
    }
    // Update password for the found account
    if (user) {
      user.password = password;
      await user.save();
    } else if (admin) {
      admin.password = password;
      await admin.save();
    }
    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully',
    });
  } catch (err) {
    next(err);
  }
};
