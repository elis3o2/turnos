import { Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faChevronLeft, faHouse, faCalendarCheck, faClock, faGear} from '@fortawesome/free-solid-svg-icons';
const NAVBAR_HEIGHT = 64;
const DRAWER_WIDTH = 200;

const Sidebar = ({ open, toggleSidebar }: { open: boolean; toggleSidebar: (open: boolean) => void }) => {

    return (
        <Drawer 
            anchor='left' 
            open={open}
            variant='persistent'
            slotProps={{
                paper: {
                    sx: {
                        width: DRAWER_WIDTH,
                        backgroundColor: (theme) => theme.palette.background.default,
                        color: (theme) => theme.palette.text.primary,
                        borderRight: (theme) => `1px solid ${theme.palette.divider}`, 
                        boxShadow: (theme) => theme.shadows[4]
                    }
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, height: NAVBAR_HEIGHT}}>
                <IconButton onClick={() => toggleSidebar(false)} sx={{ color: (theme) => theme.palette.text.primary }}>
                    <FontAwesomeIcon icon={faChevronLeft} size='1x' />
                </IconButton>
            </Box>

            <Divider />

            <List>
                <ListItemButton 
                    component={Link} 
                    to='/' 
                    sx={{ 
                        color: (theme) => theme.palette.text.primary, 
                        mt: -1,
                        gap: 2
                    }}
                >
                    <FontAwesomeIcon icon={faHouse} size='1x' />
                    <ListItemText primary='Inicio' />
                </ListItemButton>

                <Divider variant='middle' />

                <ListItemButton 
                    component={Link} 
                    to='/turnos' 
                    sx={{ 
                        color: (theme) => theme.palette.text.primary, 
                        gap: 2
                    }}
                >
                    <FontAwesomeIcon icon={faCalendarCheck} size='1x' />
                    <ListItemText primary='Turnos' />
                </ListItemButton>

                <Divider variant='middle' />

                <ListItemButton 
                    component={Link} 
                    to='/espera' 
                    sx={{ 
                        color: (theme) => theme.palette.text.primary, 
                        gap: 2
                    }}
                >
                    <FontAwesomeIcon icon={faClock} size='1x' />
                    <ListItemText primary='Espera' />
                </ListItemButton>

                <Divider variant='middle' />

                <ListItemButton 
                    component={Link} 
                    to='/list' 
                    sx={{ 
                        color: (theme) => theme.palette.text.primary, 
                        gap: 2
                    }}
                >
                    <FontAwesomeIcon icon={faGear} size='1x' />
                    <ListItemText primary='Configuración' />
                </ListItemButton>

            </List>
        </Drawer>
    );
}

export default Sidebar;
