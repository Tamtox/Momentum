//Styles
import './Navbar-sidebar.scss';
//Dependencies
import React, { useEffect,useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';
import type {RootState} from '../../../Store/Store';
import {Typography} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import {CgArrowRightO,CgProfile} from 'react-icons/cg';
import {BsFillJournalBookmarkFill,BsCalendar2Check,BsArchive} from 'react-icons/bs';
import {MdSchedule} from 'react-icons/md';
import {FiTarget} from 'react-icons/fi';
//Components
import { authActions} from '../../../Store/Store';

type SidebarProps = React.HTMLProps<HTMLDivElement>

const NavbarSidebar = React.forwardRef<HTMLDivElement,SidebarProps>((props,ref) => {
    const dispatch = useDispatch();
    const isCompact = useMediaQuery('(max-width:900px)');
    // Toggle dark mode slider
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    // Menus states 
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    // Close/open sidebar if screen size changes 
    useEffect(()=>{
        dispatch(authActions.toggleSidebarVisibility(isCompact ? false : true));
    },[isCompact])
    return (
        <div ref={ref} className={`nav-sidebar nav-${isDarkMode?'dark':'light'}  sidebar-${sidebarVisible?(sidebarFull?'full':'compact'):'hidden'}`}>
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
});

export default NavbarSidebar