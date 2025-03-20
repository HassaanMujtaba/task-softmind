import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import Register from './pages/Register';
import MyTasks from './pages/MyTasks';
import Dashboard from './pages/Dashboard';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Navigation />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/tasks"
              element={
                <PrivateRoute>
                  <MyTasks />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute roles={['admin']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/manager"
              element={
                <PrivateRoute roles={['manager', 'admin']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/tasks" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;