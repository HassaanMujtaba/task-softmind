import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Container,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../utils/axiosInstance";

const UserManagement = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const { user, users } = useAuth();
  const [usersData, setUsersData] = useState(users);

  const fetchUsers = async () => {
    try {
      setLoading(true); // Start loading
      const { data } = await apiRequest.get("/users/get-users");
      setUsersData(data?.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest.post("/users", formData);
      setOpen(false);
      fetchUsers();
      setFormData({ name: "", email: "", password: "", role: "user" });
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Add New User
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={4}
                  >
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              usersData.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="user">User</MenuItem>
            {user.role === "admin" && (
              <MenuItem value="manager">Manager</MenuItem>
            )}
            {user.role === "admin" && <MenuItem value="admin">Admin</MenuItem>}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
