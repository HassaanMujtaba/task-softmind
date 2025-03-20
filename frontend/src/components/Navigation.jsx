import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false); // State for mobile drawer

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Define navigation items based on user role
  const navItems = [
    ...(user?.role === "admin" ? [{ path: "/admin", label: "Admin Dashboard" }] : []),
    ...(user?.role === "manager" ? [{ path: "/manager", label: "Manager Dashboard" }] : []),
    ...(user?.role !== "admin" && user?.role !== "user" ? [{ path: "/tasks", label: "My Tasks" }] : []),
    { path: "/login", label: "Logout", onClick: handleLogout },
  ];

  // Drawer content for mobile
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Task Manager
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={item.onClick || (() => navigate(item.path))}
            sx={{
              justifyContent: "center",
              bgcolor: location.pathname === item.path ? "rgba(255, 255, 255, 0.1)" : "transparent",
            }}
          >
            <ListItemText
              primary={item.label}
              sx={{
                "& .MuiTypography-root": {
                  textDecoration: location.pathname === item.path ? "underline" : "none",
                  color: "black",
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Manager
          </Typography>
         
          {/* Desktop Navigation */}
          {user && (
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              {user.role === "admin" && (
                <Button
                  color="inherit"
                  onClick={() => navigate("/tasks")}
                  sx={{
                    textDecoration: location.pathname === "/tasks" ? "underline" : "none",
                  }}
                >
                  Admin Dashboard
                </Button>
              )}
              {user.role === "manager" && (
                <Button
                  color="inherit"
                  onClick={() => navigate("/manager")}
                  sx={{
                    textDecoration: location.pathname === "/manager" ? "underline" : "none",
                  }}
                >
                  Manager Dashboard
                </Button>
              )}
              {user.role !== "admin" && user.role !== "user" && (
                <Button
                  color="inherit"
                  onClick={() => navigate("/tasks")}
                  sx={{
                    textDecoration: location.pathname === "/tasks" ? "underline" : "none",
                  }}
                >
                  My Tasks
                </Button>
              )}
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  textDecoration: location.pathname === "/login" && !user ? "underline" : "none",
                }}
              >
                Logout
              </Button>
            </Box>
          )}

          {/* Mobile Menu Icon */}
          {user && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better performance on mobile
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
        color="black"
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navigation;