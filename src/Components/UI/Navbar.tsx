//Styles
import './Navbar.scss';
//Dependencies
import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useSelector,useDispatch } from 'react-redux';
import type {RootState} from '../../Store/Store';
import {Typography,Fab} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import {CgArrowRightO,CgProfile} from 'react-icons/cg';
import {BsFillJournalBookmarkFill,BsCalendar2Check,BsArchive} from 'react-icons/bs';
import {MdSchedule} from 'react-icons/md';
import {FaSun,FaMoon,FaBars} from 'react-icons/fa';
import {FiTarget,FiLogIn,FiLogOut} from 'react-icons/fi';
//Components
import { authActions} from '../../Store/Store';
import useAuthHooks from '../../Hooks/useAuthHooks';

const  Navbar:React.FC = () => {
    const isLoggedIn = !!useSelector<RootState>(state=>state.authSlice.token);
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
    // Sidebar
    let sidebar = (
        <div className={`nav-sidebar nav-${isDarkMode?'dark':'light'}  sidebar-${sidebarVisible?(sidebarFull?'full':'compact'):'hidden'}`}>
            <div className={`toggle-sidebar nav-element${isDarkMode?'-dark':''}`} onClick={()=>{dispatch(authActions.toggleSidebarSize())}}>
                <CgArrowRightO className={`nav-icon toggle-sidebar-arrow${sidebarFull?'-full':'-compact'}`} />
            </div>
            {/* <NavLink to="/" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-home`}>
                <CgHomeAlt className='nav-icon' />
                <Typography className={`nav-text ${!sidebarFull&&'display-none'}`}>Home</Typography>
            </NavLink> */}
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
    useEffect(()=>{
        compact? dispatch(authActions.toggleSidebarVisibility(false)) : dispatch(authActions.toggleSidebarVisibility(true))
    },[compact])
    return (
        <header className={`navbar ${isDarkMode?'nav-dark':'nav-light'}`}>
            {isLoggedIn && <FaBars className='icon-interactive toggle-sidebar nav-icon' onClick={()=>{dispatch(authActions.toggleSidebarVisibility(null))}} />}
            <Typography className={`navbar-title`} component="h6" variant="h6">Momentum</Typography>
            <div className={`navbar-utility`}>
                <div className={`toggle-dark-mode${isDarkMode?'-dark':''}`} onClick={toggleDarkMode}>
                    <FaMoon className='icon toggle-dark-mode-moon'/>
                    <div className={`toggle-dark-mode-slider ${isDarkMode?"dark":"light"}`}></div>
                    <FaSun className='icon toggle-dark-mode-sun' />
                </div>
                <div className='sign-buttons'>
                    <Fab onClick={signHandler} variant="extended" className={`button-fab sign-button`}>{isLoggedIn?'Sign Out':'Sign In'}</Fab>
                    {isLoggedIn ? <FiLogOut className='sign-icon icon-interactive icon' onClick={signHandler} /> : <FiLogIn className='sign-icon icon-interactive icon' onClick={signHandler} />}
                </div>
            </div>
            {isLoggedIn && sidebar}
        </header>
)
}

export default Navbar