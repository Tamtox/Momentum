//Styles
import './Navbar.scss';
//Dependencies
import React, { useEffect,useState,useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useSelector,useDispatch } from 'react-redux';
import type {RootState} from '../../Store/Store';
import {Typography,Tooltip} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import {CgArrowRightO,CgProfile} from 'react-icons/cg';
import {BsFillJournalBookmarkFill,BsCalendar2Check,BsArchive} from 'react-icons/bs';
import {MdSchedule} from 'react-icons/md';
import {RiLoginBoxLine,RiLogoutBoxRLine} from 'react-icons/ri';
import {FaSun,FaMoon,FaBars} from 'react-icons/fa';
import {FiTarget} from 'react-icons/fi';
import {BiBell} from 'react-icons/bi';
//Components
import { authActions} from '../../Store/Store';
import useAuthHooks from '../../Hooks/useAuthHooks';

const  Navbar:React.FC = () => {
    const isLoggedIn = !!useSelector<RootState>(state=>state.authSlice.token);
    const authHooks = useAuthHooks();
    const navigate = useNavigate();
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
        }
        else if(!notificationsMenuRef.current?.contains(event.target)) {
            setNotificationsVisible(false);
        }   
        // Toggle sidebar or close it if click happens elsewhere
        if(!!sidebarIconRef.current?.contains(event.target)) {
            dispatch(authActions.toggleSidebarVisibility(!sidebarVisible));
        }
        else if(isCompact && !sidebarRef.current?.contains(event.target)) {
            dispatch(authActions.toggleSidebarVisibility(false));
        }
    } 
    // Notifications Bar
    let notifications = (
        <div className={`nav-notifications nav-${isDarkMode?'dark':'light'} nav-notifications-${isDarkMode?'dark':'light'}`} ref={notificationsMenuRef} onClick={outsideClickHandler}>
            <div className={`nav-notification`}>Example Notification</div>
            <div className={`nav-notification`}>Example Notification</div>
            <div className={`nav-notification`}>Example Notification</div>
            <div className={`nav-notification`}>Example Notification</div>
        </div>
    )
    // Sidebar
    let sidebar = (
        <div className={`nav-sidebar nav-${isDarkMode?'dark':'light'}  sidebar-${sidebarVisible?(sidebarFull?'full':'compact'):'hidden'}`} ref={sidebarRef}>
            {/* <NavLink to="/" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-home`}>
                <CgHomeAlt className='nav-icon' />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Home</Typography>
            </NavLink> */}
            <div className={`toggle-sidebar nav-element${isDarkMode?'-dark':''}`} onClick={()=>{dispatch(authActions.toggleSidebarSize())}}>
                <CgArrowRightO className={`nav-icon toggle-sidebar-arrow-${sidebarFull?'full':'compact'}`} />
            </div>
            <NavLink to="/profile" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-profile`}>
                <CgProfile className='nav-icon' />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Profile</Typography>
            </NavLink>
            <NavLink to="/todo" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-todo`}>
                <BsCalendar2Check className='nav-icon' />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>To Do</Typography>
            </NavLink>
            <NavLink to="/journal" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-journal`}>
                <BsFillJournalBookmarkFill className='nav-icon' />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Journal</Typography>
            </NavLink>
            <NavLink to="/habits" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-habits`}>
                <MdSchedule className='nav-icon' />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Habits</Typography>
            </NavLink>
            <NavLink to="/goals" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-goals`}>
                <FiTarget className='nav-icon' />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Goals</Typography>
            </NavLink>
            <NavLink to="/archive" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-archive`}>
                <BsArchive className='nav-icon' />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Archive</Typography>
            </NavLink>
        </div>
    )
    // Sign In/Out Button Handler
    const signHandler = () => {
        isLoggedIn?authHooks.logout():navigate('/auth')
    }
    // Close/open sidebar if screen size changes 
    useEffect(()=>{
        dispatch(authActions.toggleSidebarVisibility(isCompact ? false : true));
    },[isCompact])
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
                {isLoggedIn &&<Tooltip title="Notifications" enterDelay={3000}>
                    <div className={`navbar-icon-container${isDarkMode ? '-dark' : ''} nav-notifications-icon-container`} ref={notificationsIconRef}>
                        <BiBell className={`nav-notifications-icon${isDarkMode?'-dark':''} icon`} />
                    </div>
                </Tooltip>}
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
            {isLoggedIn && sidebar}
            {notificationsVisible && notifications}
        </header>
    )
}

export default Navbar