import { useState } from 'react';
import { TextField, Button, MenuItem, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const TaskForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'pending',
    priority: initialData?.priority || 'medium',
    dueDate: initialData?.dueDate?.split('T')[0] || '',
    assignedTo: initialData?.assignedTo?._id || '',
    attachments: [],
  });

  const [files, setFiles] = useState([]);
  const { users } = useAuth(); // Getting users list from AuthContext

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
  
    Object.keys(formData).forEach(key => {
      if (key !== 'attachments' && formData[key] !== undefined && formData[key] !== null) {
        formDataToSend.append(key, formData[key]); 
      }
    });
  
    files.forEach(file => {
      formDataToSend.append('attachments', file);
    });

    await onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ '& > :not(style)': { m: 1 } }}>
      <TextField
        fullWidth
        label="Title"
        name="title"
        value={formData?.title}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        label="Description"
        name="description"
        multiline
        rows={4}
        value={formData?.description}
        onChange={handleChange}
        required
      />
      <TextField
        select
        fullWidth
        label="Status"
        name="status"
        value={formData?.status}
        onChange={handleChange}
      >
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="in-progress">In Progress</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
      </TextField>
      <TextField
        select
        fullWidth
        label="Priority"
        name="priority"
        value={formData?.priority}
        onChange={handleChange}
      >
        <MenuItem value="low">Low</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="high">High</MenuItem>
      </TextField>
      <TextField
        fullWidth
        type="date"
        label="Due Date"
        name="dueDate"
        value={formData?.dueDate}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        required
      />

      {/* Assign To Field */}
      <TextField
        select
        fullWidth
        label="Assign To"
        name="assignedTo"
        value={formData?.assignedTo}
        onChange={handleChange}
      >
        {users?.map((user) => (
          <MenuItem key={user._id} value={user._id}>
            {user.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        type="file"
        multiple
        onChange={handleFileChange}
        InputLabelProps={{ shrink: true }}
      />
      <Button type="submit" variant="contained" color="primary">
        {initialData?._id ? 'Update Task' : 'Create Task'}
      </Button>
    </Box>
  );
};

export default TaskForm;
