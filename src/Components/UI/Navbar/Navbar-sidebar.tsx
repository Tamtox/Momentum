//Styles
import './Navbar-sidebar.scss';
//Dependencies
import React, { useEffect} from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useSelector,useDispatch } from 'react-redux';
import type {RootState} from '../../../Store/Store';
import {Box, Typography} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import {FaSun,FaMoon} from 'react-icons/fa';
import {CgArrowRightO,CgProfile,CgHomeAlt} from 'react-icons/cg';
import {BsFillJournalBookmarkFill,BsCalendar2Check,BsArchive} from 'react-icons/bs';
import {MdSchedule} from 'react-icons/md';
import {FiTarget} from 'react-icons/fi';
import {RiLogoutBoxRLine} from 'react-icons/ri';
//Components
import { authActions} from '../../../Store/Store';
import useAuthHooks from '../../../Hooks/useAuthHooks';

type NavbarProps = React.HTMLProps<HTMLDivElement>

const NavbarSidebar = React.forwardRef<HTMLDivElement,NavbarProps>((props,ref) => {
    const authHooks = useAuthHooks();
    const navigate = useNavigate();
    const isLoggedIn = !!useSelector<RootState>(state=>state.authSlice.token);
    const dispatch = useDispatch();
    const isCompact = useMediaQuery('(max-width:900px)');
    // Toggle dark mode slider
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    // Menus states 
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    // Close sidebar on link click if it is compact
    const closeSidebar = () => {
        isCompact && authActions.toggleSidebarVisibility(false)
    }
    // Sign In/Out Button Handler
    const signHandler = () => {
        isLoggedIn?authHooks.logout():navigate('/auth')
    }
    // Close/open sidebar if screen size changes 
    useEffect(()=>{
        dispatch(authActions.toggleSidebarVisibility(isCompact ? false : true));
    },[isCompact])
    return (
        <Box ref={ref} className={`nav-sidebar nav-${isDarkMode?'dark':'light'}  sidebar-${sidebarVisible?(sidebarFull?'full':'compact'):'hidden'}`}>
            <Box className='nav-sidebar-links'>
                <Box className={`toggle-sidebar nav-element${isDarkMode?'-dark':''}`} onClick={()=>{dispatch(authActions.toggleSidebarSize(!sidebarFull))}}>
                    <CgArrowRightO className={`nav-icon toggle-sidebar-arrow-${sidebarFull?'full':'compact'}`} />
                </Box>
                <NavLink onClick={closeSidebar} to="/" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-home`}>
                    <CgHomeAlt className='nav-icon' />
                    <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Home </Typography>
                </NavLink>
                <NavLink onClick={closeSidebar} to="/profile" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-profile`}>
                    <CgProfile className='nav-icon' />
                    <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Profile</Typography>
                </NavLink>
                <NavLink onClick={closeSidebar} to="/todo" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-todo`}>
                    <BsCalendar2Check className='nav-icon navigation-todo-icon' />
                    <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>To Do</Typography>
                </NavLink>
                <NavLink onClick={closeSidebar} to="/journal" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-journal`}>
                    <BsFillJournalBookmarkFill className='nav-icon navigation-journal-icon' />
                    <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Journal</Typography>
                </NavLink>
                <NavLink onClick={closeSidebar} to="/habits" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-habits`}>
                    <MdSchedule className='nav-icon navigation-habit-icon' />
                    <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Habits</Typography>
                </NavLink>
                <NavLink onClick={closeSidebar} to="/goals" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-goals`}>
                    <FiTarget className='nav-icon navigation-goal-icon' />
                    <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Goals</Typography>
                </NavLink>
                <NavLink onClick={closeSidebar} to="/archive" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-archive`}>
                    <BsArchive className='nav-icon'/>
                    <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Archive</Typography>
                </NavLink>
            </Box>
            <Box className='nav-sidebar-utility'>
                <Box className={`toggle-dark-mode nav-element${isDarkMode?'-dark':''}`} onClick={()=>{dispatch(authActions.setDarkMode())}}>
                    {isDarkMode ? <FaMoon className='nav-icon icon toggle-dark-mode-moon'/> : <FaSun className='nav-icon icon toggle-dark-mode-sun' />}
                    <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>{`Toggle ${isDarkMode ? "Light" : "Dark"} Mode`}</Typography>
                </Box>  
                <Box className={`log nav-element${isDarkMode?'-dark':''}`} onClick={signHandler}>
                    <RiLogoutBoxRLine className={`nav-icon sign-icon${isDarkMode?'-dark':''} icon`}/>
                    <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Log Out</Typography>
                </Box>
            </Box>
        </Box>
    )
});

export default NavbarSidebar