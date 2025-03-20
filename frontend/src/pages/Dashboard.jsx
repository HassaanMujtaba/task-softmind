import { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import UserManagement from '../components/UserManagement';
import { TaskManagement } from '../components/TaskManagement';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const {user}=useAuth();
  const [activeTab, setActiveTab] = useState(0); 

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {user.role === 'admin' ? 'Admin Dashboard' : 'Manager Dashboard'}
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="admin dashboard tabs"
          sx={{ mb: 2 }}
        >
          <Tab label="User Management" />
          <Tab label="Task Management" />
        </Tabs>

        {/* Conditionally render the active component */}
        {activeTab === 0 && <UserManagement />}
        {activeTab === 1 && <TaskManagement />}
      </Box>
    </Container>
  );
};

export default Dashboard;