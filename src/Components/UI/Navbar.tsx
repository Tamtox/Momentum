//Styles
import './Navbar.scss';
//Dependencies
import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useSelector,useDispatch,} from 'react-redux';
import type {RootState} from '../../Store/Store';
import {Box,Typography,Fab} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
//Components
import { authActions,todoActions,scheduleActions,journalActions,habitsActions } from '../../Store/Store';

const  Navbar:React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const compact = useMediaQuery('(max-width:900px)');
    // Toggle dark mode slider
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const toggleDarkMode = () => {
        dispatch(authActions.setDarkMode())
    }
    const isLoggedIn = !!useSelector<RootState>(state=>state.authSlice.token);
    //Logout
    function logout() {
        navigate('/auth');
        dispatch(todoActions.clearToDoList());
        dispatch(journalActions.clearEntry());
        dispatch(habitsActions.clearHabitData());
        dispatch(scheduleActions.clearSchedule());
        dispatch(authActions.logout());
    }
    let sidebar = (
        <Box className={`nav-sidebar nav-${isDarkMode?'dark':'light'}  sidebar-${sidebarVisible?(sidebarFull?'full':'compact'):'hidden'}`}>
            <Box className={`toggle-sidebar nav-element${isDarkMode?'-dark':''}`} onClick={()=>{dispatch(authActions.toggleSidebarSize())}}>
                <Icon className={`nav-icon toggle-sidebar-arrow${sidebarFull?'-full':'-compact'}`} icon="ep:arrow-right-bold" />
            </Box>
            <NavLink to="/" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-home`}>
                <Icon className='nav-icon' icon="bx:home" />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Home</Typography>
            </NavLink>
            <NavLink to="/profile" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-profile`}>
                <Icon className='nav-icon' icon="iconoir:profile-circled" />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Profile</Typography>
            </NavLink>
            <NavLink to="/todo" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-todo`}>
                <Icon className='nav-icon' icon="wpf:todo-list" />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>To Do</Typography>
            </NavLink>
            <NavLink to="/journal" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-journal`}>
                <Icon className='nav-icon' icon="uil:diary-alt" />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Journal</Typography>
            </NavLink>
            <NavLink to="/habits" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-habits`}>
                <Icon className='nav-icon' icon="akar-icons:schedule" />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Habits</Typography>
            </NavLink>
            <NavLink to="/goals" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-goals`}>
                <Icon className='nav-icon' icon="icon-park-outline:target" />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Goals</Typography>
            </NavLink>
        </Box>
    )
    // Sign In/Out Button Handler
    const signHandler = () => {
        isLoggedIn?logout():navigate('/auth')
    }
    useEffect(()=>{
        compact? dispatch(authActions.toggleSidebarVisibility(false)) : dispatch(authActions.toggleSidebarVisibility(true))
    },[compact])
    return (
        <Box component="header" className={`navbar ${isDarkMode?'nav-dark':'nav-light'}`}>
            {isLoggedIn && <Icon className='icon-interactive toggle-sidebar nav-icon' onClick={()=>{dispatch(authActions.toggleSidebarVisibility(null))}} icon="codicon:three-bars" />}
            <Typography className={`navbar-title`} component="h6" variant="h6">Momentum</Typography>
            <Box className={`navbar-utility`}>
                <Box className="toggle-dark-mode" onClick={toggleDarkMode}>
                    <Icon className='icon toggle-dark-mode-moon' icon="logos:moon" />
                    <Box className={`toggle-dark-mode-slider ${isDarkMode?"dark":"light"}`}></Box>
                    <Icon className='icon toggle-dark-mode-sun' icon="twemoji:sun" />
                </Box>
                <Box className='sign-buttons'>
                    <Fab onClick={signHandler} variant="extended" className={`button-fab sign-button`}>{isLoggedIn?'Sign Out':'Sign In'}</Fab>
                    <Icon className='sign-icon icon' icon={isLoggedIn?"fa-solid:sign-out-alt":"fa-solid:sign-in-alt"} onClick={signHandler} />
                </Box>
            </Box>
            {isLoggedIn && sidebar}
        </Box>
)
}

export default Navbar