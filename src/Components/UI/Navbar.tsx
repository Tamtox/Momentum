//Styles
import './Navbar.scss';
//Dependencies
import React,{ useState } from 'react';
import { Icon } from '@iconify/react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useSelector,useDispatch,} from 'react-redux';
import type {RootState} from '../../Store/Store';
import {Button,Box,Typography,Fab} from '@mui/material';
//Components
import { authActions,todoActions,scheduleActions,journalActions,habitsActions } from '../../Store/Store';

const  Navbar:React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // Toggle dark mode slider
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode)
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
      // Toggle sidebar size
    const [sidebarFull,setSidebarFull] = useState(false);
    // Toggle sidebar 
    const [sidebarVisible,setSidebarVisible] = useState(true);
    let sidebar = (
        <Box className={`nav-sidebar ${isDarkMode?'nav-dark':'nav-light'} ${!sidebarVisible&&'display-none'} sidebar${sidebarFull?'-full':'-compact'}`}>
            <Box className={`toggle-sidebar nav-element${isDarkMode?'-dark':''}`} onClick={()=>{setSidebarFull(!sidebarFull)}}>
                <Icon className={`nav-icon hover-filter toggle-sidebar-arrow${sidebarFull?'-full':'-compact'}`} icon="ep:arrow-right-bold" />
            </Box>
            <NavLink to="/profile" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-profile`}>
                <Icon className='nav-icon hover-filter' icon="iconoir:profile-circled" />
                <Typography className={`${!sidebarFull&&'display-none'}`}>Profile</Typography>
            </NavLink>
            <NavLink to="/todo" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-todo`}>
                <Icon className='nav-icon hover-filter' icon="wpf:todo-list" />
                <Typography className={`${!sidebarFull&&'display-none'}`}>To Do</Typography>
            </NavLink>
            <NavLink to="/journal" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-journal`}>
                <Icon className='nav-icon hover-filter' icon="uil:diary-alt" />
                <Typography className={`${!sidebarFull&&'display-none'}`}>Journal</Typography>
            </NavLink>
            <NavLink to="/habits" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-habits`}>
                <Icon className='nav-icon hover-filter' icon="akar-icons:schedule" />
                <Typography className={`${!sidebarFull&&'display-none'}`}>Habits</Typography>
            </NavLink>
        </Box>
    )
    // Sign In/Out Button Handler
    const signHandler = () => {
        isLoggedIn?logout():navigate('/auth')
    }
    return (
        <Box component="header" className={`navbar ${isDarkMode?'nav-dark':'nav-light'}`}>
            {isLoggedIn && <Icon className='toggle-sidebar nav-icon hover-filter' onClick={()=>{setSidebarVisible(!sidebarVisible)}} icon="codicon:three-bars" />}
            <Typography className={`navbar-title`} component="h6" variant="h6">Momentum</Typography>
            <Box className={`navbar-utility`}>
                <Box className="toggle-dark-mode" onClick={toggleDarkMode}>
                    <Icon className='icon toggle-dark-mode-moon' icon="logos:moon" />
                    <Box className={`toggle-dark-mode-slider ${isDarkMode?"dark":"light"}`}></Box>
                    <Icon className='icon toggle-dark-mode-sun' icon="twemoji:sun" />
                </Box>
                <Box className='sign-buttons'>
                    <Fab onClick={signHandler} variant="extended" className={`button-fab sign-button`}>{isLoggedIn?'Sign Out':'Sign In'}</Fab>
                    <Icon className='sign-icon icon hover-filter' icon={isLoggedIn?"fa-solid:sign-out-alt":"fa-solid:sign-in-alt"} onClick={signHandler} />
                </Box>
            </Box>
            {isLoggedIn && sidebar}
        </Box>
)
}

export default Navbar