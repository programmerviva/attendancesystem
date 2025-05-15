import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Get employee dashboard data
export const getEmployeeDashboard = async (req, res, next) => {
  try {
    // Get the current user from the request (set by the protect middleware)
    const employee = req.user;
    
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    // You can fetch additional data here like:
    // - Recent attendance records
    // - Leave balance
    // - Upcoming holidays
    // - Announcements
    // For now, we'll just return the employee data

    res.status(200).json({
      status: 'success',
      data: {
        employee: {
          id: employee._id,
          empId: employee.empId,
          name: `${employee.fullName.first} ${employee.fullName.last}`,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          joiningDate: employee.joiningDate,
          // Don't include sensitive information like password
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get employee profile
export const getEmployeeProfile = async (req, res, next) => {
  try {
    const employee = req.user;
    
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile: {
          id: employee._id,
          empId: employee.empId,
          fullName: employee.fullName,
          email: employee.email,
          mobile: employee.mobile,
          department: employee.department,
          designation: employee.designation,
          joiningDate: employee.joiningDate,
          profileImage: employee.profileImage || '',
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update employee profile
export const updateEmployeeProfile = async (req, res, next) => {
  try {
    const { mobile, profileImage } = req.body;
    
    // Only allow updating certain fields
    const updateData = {};
    if (mobile) updateData.mobile = mobile;
    if (profileImage) updateData.profileImage = profileImage;
    
    // Find and update the employee
    const updatedEmployee = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedEmployee) {
      return next(new AppError('Employee not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        employee: {
          id: updatedEmployee._id,
          empId: updatedEmployee.empId,
          fullName: updatedEmployee.fullName,
          email: updatedEmployee.email,
          mobile: updatedEmployee.mobile,
          profileImage: updatedEmployee.profileImage || '',
        }
      }
    });
  } catch (err) {
    next(err);
  }
};