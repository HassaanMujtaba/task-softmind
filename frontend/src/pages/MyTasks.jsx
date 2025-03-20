import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { apiRequest } from '../utils/axiosInstance';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { users,user } = useAuth();
  const fetchTasks = async () => {
    try {
      const { data } = await apiRequest.get('/tasks?myTasks=true');
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, []);
  

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
      console.error("Error deleting task:", error);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Tasks
        </Typography>
      
        <TaskList
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          myTasks={true}
          onStatusChange={handleStatusChange}
        />
      </Box>
    </Container>
  );
};

export default MyTasks;