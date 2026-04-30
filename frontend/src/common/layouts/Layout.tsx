import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react'; 
import type { Theme } from '@mui/material/styles';

const NAVBAR_HEIGHT = 64;
const DRAWER_WIDTH = 200;

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); 

  let backTo: string | undefined;
  if (location.pathname.startsWith("/list")) backTo = "/home";
  if (location.pathname.startsWith("/plantillas")) backTo = "/list";
  if (location.pathname.startsWith("/turnos")) backTo = "/home";
  if (location.pathname.startsWith("/historico")) backTo = "/turnos";
  if (location.pathname.startsWith("/add-espera")) backTo = "/espera";
  if (location.pathname.startsWith("/espera-paciente")) backTo = "/espera";
  else if (location.pathname.startsWith("/espera")) backTo = "/home";

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar
        backTo={backTo}
        onMenuClick={() => setSidebarOpen(true)} 
      />
      <Sidebar
        open={sidebarOpen}
        toggleSidebar={setSidebarOpen} 
      />
      <Box
        sx={(theme: Theme) => ({
          flexGrow: 1,
          pt: 2, pr: 1, pb: 2, pl: 1,
          mt: `${NAVBAR_HEIGHT}px`,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),

          marginLeft: sidebarOpen ? `${DRAWER_WIDTH}px` : 0,
          width: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          [theme.breakpoints.down('sm')]: {
            marginLeft: 0,
            width: '100%',
          },
        })}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;