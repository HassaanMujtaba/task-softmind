import asyncHandler from 'express-async-handler';
import Task from '../models/taskModel.js';
import { taskSchema } from '../utils/validationSchema.js';
import { extractRoleFromToken } from '../utils/extractRole.js';
import User from '../models/userModel.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';


const upload = multer({ storage: multer.memoryStorage() });


const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, filename: file.originalname });
      }
    );
    stream.end(file.buffer);
  });
};

const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    await taskSchema.validate(
      { title, description, assignedTo, status, priority, dueDate },
      { abortEarly: false }
    );

    const createdBy = extractRoleFromToken(req.headers.authorization, 'id');
    if (!createdBy) {
      res.status(401);
      throw new Error('Unauthorized: Invalid or missing token');
    }

    const attachments = [];


    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadedFile = await uploadToCloudinary(file);
          attachments.push(uploadedFile);
        } catch (uploadError) {
          console.error('Error uploading file to Cloudinary:', uploadError);
          res.status(500);
          throw new Error('Failed to upload attachment');
        }
      }
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate,
      createdBy,
      attachments,
    });

    if (!task) {
      res.status(500);
      throw new Error('Failed to create task');
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Error in createTask:', error);
    res.status(error.status || 500);
    res.json({ success: false, message: error.message || 'Internal Server Error' });
  }
};


const getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, myTasks } = req.query;
    const role = extractRoleFromToken(req.headers.authorization);
    const userId = extractRoleFromToken(req.headers.authorization, 'id');

    if (!role || !userId) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    let filter = {};
    const hasQueryParams = status || priority || assignedTo || myTasks !== undefined;

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (myTasks !== undefined) {
      filter.assignedTo = userId;
    } else {
      if (role === 'user') {
        filter.assignedTo = userId;
      } else if (role === 'manager') {
        const userIds = await User.find({ role: 'user' }).select('_id');
        const validUserIds = userIds.map(u => u._id.toString());
        if (assignedTo) {
          if (!validUserIds.includes(assignedTo)) {
            return res.status(403).json({ message: 'Managers can only filter tasks assigned to users' });
          }
          filter.assignedTo = assignedTo;
        } else {
          filter.assignedTo = { $in: validUserIds };
        }
      } else if (role === 'admin') {
        if (assignedTo) filter.assignedTo = assignedTo;
      }
    }

 
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .populate('history.updatedBy', 'name email'); 

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};



const updateTask = asyncHandler(async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedBy = extractRoleFromToken(req.headers.authorization, 'id');
    const changes = [];

    const trackChange = (field, oldValue, newValue) => {
      if (oldValue !== newValue && newValue !== undefined) {
        changes.push({
          field,
          oldValue: oldValue?.toString(),
          newValue: newValue.toString()
        });
      }
    };

    const { title, description, assignedTo, priority, dueDate, status } = req.body;
    trackChange('title', task.title, title);
    trackChange('description', task.description, description);
    trackChange('assignedTo', task.assignedTo?.toString(), assignedTo);
    trackChange('priority', task.priority, priority);
    trackChange('dueDate', task.dueDate?.toISOString(), dueDate);
    trackChange('status', task.status, status);

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) task.status = status;

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedFile = await uploadToCloudinary(file);
        task.attachments.push(uploadedFile);
      }
    }

    if (changes.length > 0) {
      changes.forEach(change => {
        task.history.push({
          updatedBy,
          updatedAt: new Date(),
          changes: change
        });
      });
      task.markModified('history');
    }

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: 'Error updating task', error: error.message });
  }
});



const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }


  if (
    req.user.role !== 'admin' &&
    task.createdBy.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this task');
  }

  await task.deleteOne();
  res.json({ message: 'Task removed' });
});

export { createTask, getTasks, updateTask, deleteTask };