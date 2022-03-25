//Styles
import './Navbar.scss';
//Dependencies
import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useSelector,useDispatch,} from 'react-redux';
import type {RootState} from '../../Store/Store';
import {Box,Typography,Fab} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import {CgArrowRightO,CgProfile,CgMenu,CgHomeAlt} from 'react-icons/cg';
import {BsFillJournalBookmarkFill,BsCalendar2Check} from 'react-icons/bs';
import {MdSchedule} from 'react-icons/md';
import {FaSun,FaMoon} from 'react-icons/fa';
import {FiTarget,FiLogIn,FiLogOut} from 'react-icons/fi';
//Components
import { authActions} from '../../Store/Store';
import useAuthHooks from '../../Hooks/useAuthHooks';

const  Navbar:React.FC = () => {
    const authHooks = useAuthHooks();
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
    let sidebar = (
        <Box className={`nav-sidebar nav-${isDarkMode?'dark':'light'}  sidebar-${sidebarVisible?(sidebarFull?'full':'compact'):'hidden'}`}>
            <Box className={`toggle-sidebar nav-element${isDarkMode?'-dark':''}`} onClick={()=>{dispatch(authActions.toggleSidebarSize())}}>
                <CgArrowRightO className={`nav-icon toggle-sidebar-arrow${sidebarFull?'-full':'-compact'}`} />
            </Box>
            <NavLink to="/" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-home`}>
                <CgHomeAlt className='nav-icon' />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Home</Typography>
            </NavLink>
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
        </Box>
    )
    // Sign In/Out Button Handler
    const signHandler = () => {
        isLoggedIn?authHooks.logout():navigate('/auth')
    }
    useEffect(()=>{
        compact? dispatch(authActions.toggleSidebarVisibility(false)) : dispatch(authActions.toggleSidebarVisibility(true))
    },[compact])
    return (
        <Box component="header" className={`navbar ${isDarkMode?'nav-dark':'nav-light'}`}>
            {isLoggedIn && <CgMenu className='icon-interactive toggle-sidebar nav-icon' onClick={()=>{dispatch(authActions.toggleSidebarVisibility(null))}} />}
            <Typography className={`navbar-title`} component="h6" variant="h6">Momentum</Typography>
            <Box className={`navbar-utility`}>
                <Box className={`toggle-dark-mode${isDarkMode?'-dark':''}`} onClick={toggleDarkMode}>
                    <FaMoon className='icon toggle-dark-mode-moon'/>
                    <Box className={`toggle-dark-mode-slider ${isDarkMode?"dark":"light"}`}></Box>
                    <FaSun className='icon toggle-dark-mode-sun' />
                </Box>
                <Box className='sign-buttons'>
                    <Fab onClick={signHandler} variant="extended" className={`button-fab sign-button`}>{isLoggedIn?'Sign Out':'Sign In'}</Fab>
                    {isLoggedIn ? <FiLogOut className='sign-icon icon-interactive icon' onClick={signHandler} /> : <FiLogIn className='sign-icon icon-interactive icon' onClick={signHandler} />}
                </Box>
            </Box>
            {isLoggedIn && sidebar}
        </Box>
)
}

export default Navbar