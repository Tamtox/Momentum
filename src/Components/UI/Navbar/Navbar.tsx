//Styles
import './Navbar.scss';
//Dependencies
import React, { useEffect,useState,useRef } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import type {RootState} from '../../../Store/Store';
import {Typography, Box} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import {FaBars} from 'react-icons/fa';
import {BiBell} from 'react-icons/bi';
//Components
import NavbarSidebar from './Navbar-sidebar';
import NavbarNotifications from './Navbar-notifications';
import { authActions} from '../../../Store/Store';

const Navbar:React.FC = () => {
    const isLoggedIn = !!useSelector<RootState>(state=>state.authSlice.token);
    const dispatch = useDispatch();
    const isCompact = useMediaQuery('(max-width:900px)');
    // Toggle dark mode slider
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    // Menus states 
    const [notificationsVisible,setNotificationsVisible] = useState(false);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const notificationsMenuRef = useRef<HTMLDivElement>(null);
    const notificationsIconRef = useRef<HTMLDivElement>(null);
    const sidebarIconRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const outsideClickHandler = (event:any) => {
        // Toggle notifications menu or close it if click happens elsewhere
        if(!!notificationsIconRef.current?.contains(event.target)) {
            setNotificationsVisible(!notificationsVisible);
        } else if(!notificationsMenuRef.current?.contains(event.target)) {
            setNotificationsVisible(false);
        }   
        // Toggle sidebar or close it if click happens elsewhere
        if(!!sidebarIconRef.current?.contains(event.target)) {
            dispatch(authActions.toggleSidebarVisibility(!sidebarVisible));
            dispatch(authActions.toggleSidebarSize(false));
        } else if(isCompact && !sidebarRef.current?.contains(event.target)) {
            dispatch(authActions.toggleSidebarVisibility(false));
        }
    } 
    // Close notifications / sidebar if click is outside
    useEffect(()=>{
        document.addEventListener('click',outsideClickHandler,true);
        return () => {
            document.removeEventListener('click',outsideClickHandler,true);
        }
    },[notificationsVisible,isCompact,sidebarVisible])
    return (
        //${isCompact ? (isDarkMode?'nav-dark':'nav-light') : sidebarVisible ? "" : "navbar-hidden"}
        <>
            {isLoggedIn ? <header className={`navbar ${isDarkMode?'nav-dark':'nav-light'} ${sidebarVisible || isCompact ? "" : "navbar-hidden"} navbar-${sidebarFull?'full':'compact'}`}>
                {isLoggedIn && 
                <Box className='navbar-main'>
                    <Box className={`toggle-sidebar-icon-container${isDarkMode ? '-dark' : ''}`} ref={sidebarIconRef} >
                        <FaBars className={`toggle-sidebar-icon${isDarkMode ? '-dark' : ''}`} />
                        <Typography className={`toggle-sidebar-text${isDarkMode ? '-dark' : ''} ${(!isCompact && !sidebarFull) &&'display-none'}`}>
                            Momentum
                        </Typography>
                    </Box>
                </Box>}
                {/* <Typography className={`navbar-title`} component="h6" variant="h6">Momentum</Typography>
                <Box className={`navbar-utility`}>
                    {/* {isLoggedIn &&<Tooltip title="Notifications" enterDelay={3000}>
                        <Box className={`navbar-icon-container${isDarkMode ? '-dark' : ''} nav-notifications-icon-container`} ref={notificationsIconRef}>
                            <BiBell className={`nav-notifications-icon${isDarkMode?'-dark':''} icon`} />
                        </Box>
                    </Tooltip>}
                </Box> */}
                {notificationsVisible && <NavbarNotifications ref={notificationsMenuRef}/>}
            </header> : null}
            {isLoggedIn ? <NavbarSidebar ref={sidebarRef}/> : null}
        </>
    )
}

export default Navbar