import MenuIcon from "@mui/icons-material/Menu";
import PaidIcon from "@mui/icons-material/Paid";
import SavingsIcon from "@mui/icons-material/Savings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WalletIcon from "@mui/icons-material/Wallet";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  AppBar,
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
  Button,
  Stack,
} from "@mui/material";
import { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 250;

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    label: "Income",
    path: "/income",
    icon: <PaidIcon />,
  },
  {
    label: "Expenses",
    path: "/expenses",
    icon: <ReceiptLongIcon />,
  },
  {
    label: "Budgets",
    path: "/budgets",
    icon: <WalletIcon />,
  },
  {
    label: "Savings",
    path: "/savings",
    icon: <SavingsIcon />,
  },
];

const AppShell = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const drawer = useMemo(
    () => (
      <Box>
        <Toolbar>
          <Stack>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Finance Tracker
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Personal Budget Control
            </Typography>
          </Stack>
        </Toolbar>
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                "&.active": {
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    ),
    []
  );

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen((prev) => !prev)}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user?.name || "Welcome"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {user?.email || ""}
            </Typography>
          </Box>

          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="finance tracker navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          p: { xs: 2, sm: 3 },
          mt: "64px",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppShell;
