//Styles
import './Navbar.scss';
//Dependencies
import React,{ useState } from 'react';
import { Icon } from '@iconify/react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useSelector,useDispatch,} from 'react-redux';
import type {RootState} from '../../Store/Store';
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
        <div className={`nav-sidebar ${isDarkMode?'nav-dark':'nav-light'} ${!sidebarVisible&&'display-none'} sidebar${sidebarFull?'-full':'-compact'}`}>
                <div className={`toggle-sidebar nav-element${isDarkMode?'-dark':''}`} onClick={()=>{setSidebarFull(!sidebarFull)}}>
                    <Icon className={`nav-icon hover-filter toggle-sidebar-arrow${sidebarFull?'-full':'-compact'}`} icon="ep:arrow-right-bold" />
                </div>
                <NavLink to="/profile" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-profile`}>
                    <Icon className='nav-icon hover-filter' icon="iconoir:profile-circled" />
                    <span className={`${!sidebarFull&&'display-none'}`}>Profile</span>
                </NavLink>
                <NavLink to="/todo" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-todo`}>
                    <Icon className='nav-icon hover-filter' icon="wpf:todo-list" />
                    <span className={`${!sidebarFull&&'display-none'}`}>To Do</span>
                </NavLink>
                <NavLink to="/journal" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-journal`}>
                    <Icon className='nav-icon hover-filter' icon="uil:diary-alt" />
                    <span className={`${!sidebarFull&&'display-none'}`}>Journal</span>
                </NavLink>
                <NavLink to="/habits" className={(navData)=>`nav-link${navData.isActive?isDarkMode?'-active-dark':'-active':''} nav-element${isDarkMode?'-dark':''} navigation-habits`}>
                    <Icon className='nav-icon hover-filter' icon="akar-icons:schedule" />
                    <span className={`${!sidebarFull&&'display-none'}`}>Habits</span>
                </NavLink>
            </div>
    )
    // Sign buttons
    let signButtons = isLoggedIn?
        <div className='signout'>
            <Icon className='signout-icon icon hover-filter' icon="fa-solid:sign-out-alt" onClick={logout} />
            <button className={`signout-button button${isDarkMode?'-dark':''} hover${isDarkMode?'-dark':''}`} onClick={logout}>Sign Out</button>
        </div>
        :
        <div className='signin'>
            <NavLink to='/auth' className={`signin-button link${isDarkMode?'-dark':''} hover button${isDarkMode?'-dark':''}`}>Sign In</NavLink>
            <NavLink className={`link${isDarkMode?'-dark':''}`} to='/auth'><Icon className={`signin-icon icon hover-filter`} icon="fa-solid:sign-in-alt" /></NavLink>
        </div>
    return (
        <nav>
            <div className={`navbar ${isDarkMode?'nav-dark':'nav-light'}`}>
                {isLoggedIn && <Icon className='toggle-sidebar nav-icon hover-filter' onClick={()=>{setSidebarVisible(!sidebarVisible)}} icon="codicon:three-bars" />}
                <div className={`navbar-title`}>Momentum</div>
                <div className={`navbar-utility`}>
                    <div className="toggle-dark-mode" onClick={toggleDarkMode}>
                        <Icon className='icon toggle-dark-mode-moon' icon="logos:moon" />
                        <div className={`toggle-dark-mode-slider ${isDarkMode?"dark":"light"}`}></div>
                        <Icon className='icon toggle-dark-mode-sun' icon="twemoji:sun" />
                    </div>
                    {signButtons}
                </div>
                {isLoggedIn && sidebar}
            </div>
        </nav>
    )
}

export default Navbar