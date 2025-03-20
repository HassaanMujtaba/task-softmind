import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Chip, Link, Select, MenuItem, Box, Modal, Typography, List, ListItem, ListItemText,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/axiosInstance';
import { Label } from '@mui/icons-material';

const TaskList = ({ tasks, onEdit, onDelete, myTasks, onStatusChange }) => {
  const { user } = useAuth();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedTaskHistory, setSelectedTaskHistory] = useState([]);

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await apiRequest.put(`/tasks/${taskId}?status=${newStatus}`, { status: newStatus });
      onStatusChange(taskId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const handleViewHistory = (task) => {
    setSelectedTaskHistory(task.history || []);
    setOpenHistory(true);
  };

  const handleCloseHistory = () => {
    setOpenHistory(false);
    setSelectedTaskHistory([]);
  };
  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status</TableCell>
              <TableCell onClick={() => handleSort('priority')} style={{ cursor: 'pointer' }}>Priority</TableCell>
              <TableCell onClick={() => handleSort('dueDate')} style={{ cursor: 'pointer' }}>Due Date</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Created By</TableCell>
              {!myTasks && <TableCell>Attachments</TableCell>}
              <TableCell>Actions</TableCell>
              <TableCell>History</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                {myTasks ? (
                  <TableCell>
                    <Select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      variant="standard"
                      fullWidth
                      sx={{ fontSize: '14px' }}
                    >
                      {['pending', 'in-progress', 'completed'].map((status) => (
                        <MenuItem key={status} value={status} sx={{ fontSize: '12px' }}>
                          {status.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                ) : (
                  <TableCell><Chip label={task.status} color="primary" /></TableCell>
                )}
                <TableCell><Chip label={task.priority} color={getPriorityColor(task.priority)} /></TableCell>
                <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>{task.assignedTo?.name}</TableCell>
                <TableCell>{task.createdBy?.name}</TableCell>
                <TableCell>
                  {task.attachments?.map((attachment, index) => (
                    <Link key={index} href={attachment.url} target="_blank" rel="noopener noreferrer" display="block">
                      {attachment.filename}
                    </Link>
                  ))}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                  
                    {!myTasks && (user.role === 'admin' || user.role === 'manager' || user._id === task.createdBy._id) && (
                      <>
                        <IconButton onClick={() => onEdit(task)}>
                          <EditIcon sx={{ color: 'lightblue' }} />
                        </IconButton>
                        <IconButton onClick={() => onDelete(task._id)}>
                          <DeleteIcon sx={{ color: 'red' }} />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </TableCell>
                <TableCell>  <IconButton onClick={() => handleViewHistory(task)}>
                      <VisibilityIcon sx={{ color: 'green' }} />
                    </IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openHistory} onClose={handleCloseHistory}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
        }}>
          <Typography variant="h6" component="h2" gutterBottom>Task History</Typography>
          {selectedTaskHistory.length === 0 ? (
            <Typography>No history available.</Typography>
          ) : (
            <List sx={{overflowY: 'auto', maxHeight: 400}}>
              {selectedTaskHistory.map((entry, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${index+1}: Updated by: ${entry.updatedBy?.name || 'Unknown'}`}
                    secondary={
                      <>
                      <Label>Updated At:</Label>
                        <Typography component="span" variant="body2">
                          {new Date(entry.updatedAt).toLocaleString()}
                        </Typography>
                        <br />
                        {entry.changes &&
                          <Typography key={index} component="span" variant="body2">
                            {`${entry.changes.field}: ${entry.changes.oldValue} → ${entry.changes.newValue}`}
                            <br />
                          </Typography>
                        }
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Button onClick={handleCloseHistory} variant="contained" sx={{ mt: 2 }}>Close</Button>
        </Box>
      </Modal>
    </>
  );
};

export default TaskList;