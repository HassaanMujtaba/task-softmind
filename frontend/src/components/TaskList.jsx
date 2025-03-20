import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Link,
  InputLabel,
  MenuItem,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../context/AuthContext";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { apiRequest } from "../utils/axiosInstance";
const TaskList = ({ tasks, onEdit, onDelete, myTasks ,onStatusChange}) => {
  const { user } = useAuth();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
  const handleStatusChange = async (taskId, newStatus) => {
    console.log("Updating status for task:", taskId, "New Status:", newStatus); // Debugging log
  
    try {
      await apiRequest.put(`/tasks/${taskId}?status=${newStatus}`, { status: newStatus });
      onStatusChange(taskId, newStatus);
      
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              onClick={() => handleSort("title")}
              style={{ cursor: "pointer" }}
            >
              Title
            </TableCell>
            <TableCell>Description</TableCell>
            <TableCell
              onClick={() => handleSort("status")}
              style={{ cursor: "pointer" }}
            >
              Status
            </TableCell>
            <TableCell
              onClick={() => handleSort("priority")}
              style={{ cursor: "pointer" }}
            >
              Priority
            </TableCell>
            <TableCell
              onClick={() => handleSort("dueDate")}
              style={{ cursor: "pointer" }}
            >
              Due Date
            </TableCell>
            <TableCell>Assigned To</TableCell>
            <TableCell>Created By</TableCell>
            {!myTasks && <TableCell>Attachments</TableCell>}
            {!myTasks && <TableCell>Actions</TableCell>}
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
                  onChange={(e) => {
                    console.log("Selected Value:", e.target.value);
                    handleStatusChange(task._id, e.target.value);
                  }}
                  variant="standard"
                  fullWidth
                  sx={{ fontSize: "14px" }}
                >
                  {["pending", "in-progress", "completed"].map((status) => (
                    <MenuItem key={status} value={status} sx={{ fontSize: "12px" }}>
                      {status.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              ) : (
                <TableCell>
                  <Chip label={task.status} color="primary" />
                </TableCell>
              )}
              <TableCell>
                <Chip
                  label={task.priority}
                  color={getPriorityColor(task.priority)}
                />
              </TableCell>
              <TableCell>
                {new Date(task.dueDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{task.assignedTo?.name}</TableCell>
              <TableCell>{task.createdBy?.name}</TableCell>
              <TableCell>
                {task.attachments?.map((attachment, index) => (
                  <Link
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    display="block"
                  >
                    {attachment.filename}
                  </Link>
                ))}
              </TableCell>
              {!myTasks && <TableCell>
                {(user.role === "admin" ||
                  user.role === "manager" ||
                  user._id === task.createdBy._id) && (
                  <Box sx={{ display: "flex" }}>
                    <IconButton onClick={() => onEdit(task)}>
                      <EditIcon sx={{ color: "lightblue" }} />
                    </IconButton>
                    <IconButton onClick={() => onDelete(task._id)}>
                      <DeleteIcon sx={{ color: "red" }}/>
                    </IconButton>
                  </Box>
                )}
              </TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskList;
