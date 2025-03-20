import asyncHandler from 'express-async-handler';
import Task from '../models/taskModel.js';
import { taskSchema } from '../utils/validationSchema.js';
import { extractRoleFromToken } from '../utils/extractRole.js';
import User from '../models/userModel.js';


const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status, priority, dueDate } = req.body;
  await taskSchema.validate(
    { title, description, assignedTo, status, priority, dueDate },
    { abortEarly: false }
  );
  
  const createdBy = extractRoleFromToken(req.headers.authorization, 'id'); 
  const task = await Task.create({
    title,
    description,
    assignedTo,
    status,
    priority,
    dueDate,
    createdBy
  });
  
  res.status(201).json(task);
});


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
            return res.status(403).json({
              message: 'Managers can only filter tasks assigned to users',
            });
          }
          filter.assignedTo = assignedTo; 
        } else {
          filter.assignedTo = { $in: validUserIds }; 
        }
      } else if (role === 'admin') {
        if (assignedTo) {
          filter.assignedTo = assignedTo;
        }
      }
    }

    console.log('Filter applied:', filter);
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};



const updateTask = asyncHandler(async (req, res) => {
  try {
    const { status } = req.query; 
    console.log(status)
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (status !== undefined) {
      task.status = status;
    } else {
      const { title, description, assignedTo, priority, dueDate, status } = req.body;
      console.log(title, description, assignedTo, priority, dueDate)
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (status !== undefined) task.status = status;
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