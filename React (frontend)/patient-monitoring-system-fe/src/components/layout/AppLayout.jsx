import { useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Chip,
  Button
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const drawerWidth = 260;

const AppLayout = ({ navItems, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const title = useMemo(() => {
    const active = navItems.find((item) => location.pathname.startsWith(item.path));
    return active?.label || "Patient Monitoring System";
  }, [location.pathname, navItems]);

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
          Patient Monitor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Smart care workspace
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => handleNavigate(item.path)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={logout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(249, 251, 255, 0.92)"
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {title}
          </Typography>
          <Chip
            label={user?.role || "USER"}
            color="primary"
            variant="outlined"
            sx={{ mr: 1.5, fontWeight: 700 }}
          />
          <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontWeight: 700 }}>
            {user?.fullName?.slice(0, 1)?.toUpperCase() || "U"}
          </Avatar>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" }
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider"
            }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          pt: { xs: 10, md: 11 },
          ml: { md: `${drawerWidth}px` }
        }}
      >
        <Box className="app-fade-in">{children}</Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
