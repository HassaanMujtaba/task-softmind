import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/axiosInstance';

export const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', assignedTo: '' });
  const { users, user } = useAuth();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Build query string from filters
      const query = new URLSearchParams();
      if (filters.status) query.append('status', filters.status);
      if (filters.priority) query.append('priority', filters.priority);
      if (filters.assignedTo) query.append('assignedTo', filters.assignedTo);

      const { data } = await apiRequest.get(`/tasks?${query.toString()}`);
      console.log(data, 'aaa');
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]); // Refetch when filters change

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingTask) {
        await apiRequest.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await apiRequest.post('/tasks', formData);
      }
      fetchTasks();
      setShowForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    try {
      await apiRequest.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <Container >
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Task Management
        </Typography>

     
        

        {(user.role === 'admin' || user.role === 'manager') && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setEditingTask(null);
              setShowForm(!showForm);
            }}
            sx={{ mb: 2 }}
          >
            {showForm ? 'Close Form' : 'Create New Task'}
          </Button>
        )}
      
        {showForm && (
          <TaskForm
            onSubmit={handleSubmit}
            initialData={editingTask}
          />
        )}
          <Box sx={{ display: 'flex',flexDirection:{ xs: "column", sm: "row", md: "row", lg: "row" }, gap: 2, mb: 2 ,mt:4,justifyContent:'end' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              label="Status"
              variant='outlined'
              sx={{ fontSize:'12px'}}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              label="Priority"
              sx={{ fontSize:'12px'}}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Assigned To</InputLabel>
            <Select
              name="assignedTo"
              value={filters.assignedTo}
              onChange={handleFilterChange}
              label="Assigned To"
              sx={{ fontSize:'12px'}}
            >
              <MenuItem value="">All</MenuItem>
              {users.map(u => (
                <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TaskList
            tasks={tasks} // Pass server-filtered tasks
            onEdit={handleEdit}
            onDelete={handleDelete}
            myTasks={false}
            onStatusChange={handleStatusChange}
          />
        )}
      </Box>
    </Container>
  );
};