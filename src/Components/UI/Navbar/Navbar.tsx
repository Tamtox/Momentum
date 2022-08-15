//Styles
import './Navbar.scss';
//Dependencies
import React, { useEffect,useState,useRef } from 'react';
import { useNavigate } from 'react-router';
import { useSelector,useDispatch } from 'react-redux';
import type {RootState} from '../../../Store/Store';
import {Typography,Tooltip} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import {RiLoginBoxLine,RiLogoutBoxRLine} from 'react-icons/ri';
import {FaSun,FaMoon,FaBars} from 'react-icons/fa';
import {BiBell} from 'react-icons/bi';
//Components
import NavbarSidebar from './Navbar-sidebar';
import NavbarNotifications from './Navbar-notifications';
import { authActions} from '../../../Store/Store';
import useAuthHooks from '../../../Hooks/useAuthHooks';

const Navbar:React.FC = () => {
    const isLoggedIn = !!useSelector<RootState>(state=>state.authSlice.token);
    const authHooks = useAuthHooks();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isCompact = useMediaQuery('(max-width:900px)');
    // Toggle dark mode slider
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    // Menus states 
    const [notificationsVisible,setNotificationsVisible] = useState(false);
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
        } else if(isCompact && !sidebarRef.current?.contains(event.target)) {
            dispatch(authActions.toggleSidebarVisibility(false));
        }
    } 
    // Sign In/Out Button Handler
    const signHandler = () => {
        isLoggedIn?authHooks.logout():navigate('/auth')
    }
    // Close notifications / sidebar if click is outside
    useEffect(()=>{
        document.addEventListener('click',outsideClickHandler,true);
        return () => {
            document.removeEventListener('click',outsideClickHandler,true);
        }
    },[notificationsVisible,isCompact,sidebarVisible])
    return (
        <header className={`navbar ${isDarkMode?'nav-dark':'nav-light'}`}>
            {isLoggedIn && 
            <div className='navbar-main'>
                <div className={`toggle-sidebar-icon-container navbar-icon-container${isDarkMode ? '-dark' : ''}`} ref={sidebarIconRef} >
                    <FaBars className={`icon-interactive toggle-sidebar-icon${isDarkMode ? '-dark' : ''}`} />
                </div>
            </div>}
            <Typography className={`navbar-title`} component="h6" variant="h6">Momentum</Typography>
            <div className={`navbar-utility`}>
                {/* {isLoggedIn &&<Tooltip title="Notifications" enterDelay={3000}>
                    <div className={`navbar-icon-container${isDarkMode ? '-dark' : ''} nav-notifications-icon-container`} ref={notificationsIconRef}>
                        <BiBell className={`nav-notifications-icon${isDarkMode?'-dark':''} icon`} />
                    </div>
                </Tooltip>} */}
                <Tooltip title={`${isDarkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode'}`} enterDelay={3000}>
                    <div className={`toggle-dark-mode navbar-icon-container${isDarkMode ? '-dark' : ''}`} onClick={()=>{dispatch(authActions.setDarkMode())}}>
                        {isDarkMode ? <FaMoon className='icon toggle-dark-mode-moon'/> : <FaSun className='icon toggle-dark-mode-sun' />}
                    </div>
                </Tooltip>
                <Tooltip title={`${isLoggedIn ? 'Sign Out' : 'Sign In'}`} enterDelay={3000}>
                    <div className={`sign-buttons navbar-icon-container${isDarkMode ? '-dark' : ''}`} onClick={signHandler}>
                        {isLoggedIn ? <RiLogoutBoxRLine className={`sign-icon${isDarkMode?'-dark':''} icon`}/> : <RiLoginBoxLine className={`sign-icon${isDarkMode?'-dark':''} icon`}/>}
                    </div>
                </Tooltip>
            </div>
            {isLoggedIn && <NavbarSidebar ref={sidebarRef}/>}
            {notificationsVisible && <NavbarNotifications ref={notificationsMenuRef}/>}
        </header>
    )
}

export default Navbar