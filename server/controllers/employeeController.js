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
          userId: employee.userId,
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
          userId: employee.userId,
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
    // Accept all editable fields from the request body
    const allowedFields = [
      'mobile', 'profileImage', 'address', 'city', 'state', 'country', 'postalCode',
      'department', 'designation', 'joiningDate', 'manager', 'email'
    ];
    const updateData = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    }
    
    // Convert dates to start of day for accurate comparison
    if (updateData.joiningDate) {
      const joiningDate = new Date(updateData.joiningDate);
      joiningDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      updateData.joiningDate = joiningDate; // Store the clean date
    }

    // Prevent future joining date
    if (updateData.joiningDate) {
      const joiningDate = new Date(updateData.joiningDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (joiningDate > today) {
        return next(new AppError(`Joining date cannot be in the future. Received: ${updateData.joiningDate}`, 400));
      }
    }

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
          userId: updatedEmployee.userId,
          empId: updatedEmployee.empId,
          fullName: updatedEmployee.fullName,
          email: updatedEmployee.email,
          mobile: updatedEmployee.mobile,
          department: updatedEmployee.department,
          designation: updatedEmployee.designation,
          joiningDate: updatedEmployee.joiningDate,
          address: updatedEmployee.address,
          city: updatedEmployee.city,
          state: updatedEmployee.state,
          country: updatedEmployee.country,
          postalCode: updatedEmployee.postalCode,
          manager: updatedEmployee.manager,
          profileImage: updatedEmployee.profileImage || ''
        }
      }
    });
  } catch (err) {
    next(err);
  }
};