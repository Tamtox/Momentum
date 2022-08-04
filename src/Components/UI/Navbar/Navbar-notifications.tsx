//Styles
import './Navbar-notifications.scss';
//Dependencies
import React, { useEffect,useState} from 'react';
import { useNavigate } from 'react-router';
import { useSelector,useDispatch } from 'react-redux';
import type {RootState} from '../../../Store/Store';
import {TextField,Button} from '@mui/material';
import { DatePicker} from '@mui/lab';
import {CgArrowRight,CgArrowLeft} from 'react-icons/cg';
//Components
import { notificationActions } from '../../../Store/Store';
import type { NotificationInterface } from '../../../Misc/Interfaces';
import useNotificationHooks from '../../../Hooks/useNotificationHooks';

type NotificationProps = React.HTMLProps<HTMLDivElement>

const NavbarNotifications = React.forwardRef<HTMLDivElement,NotificationProps>((props,ref) => {
    const notificationHooks = useNotificationHooks();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // Toggle dark mode slider
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const notificationList = useSelector<RootState,NotificationInterface[]>(state=>state.notificationSlice.notificationList);
    const notificationListLoaded = useSelector<RootState,boolean>(state=>state.notificationSlice.notificationListLoaded);
    // Select Date for Notifications
    const [selectedDate, setSelectedDate] = useState(new Date());
    const selectNotificationDate = (newDate:Date|null) => {
        newDate = newDate || new Date ();
        setSelectedDate(newDate);
        notificationHooks.loadNotifications(newDate);
    }
    useEffect(() => {
        notificationListLoaded || notificationHooks.loadNotifications(new Date());
    }, [])
    return (
        <div ref={ref} className={`nav-notifications nav-${isDarkMode?'dark':'light'} nav-notifications-${isDarkMode?'dark':'light'}`}>
            <div className='nav-notifications-date-picker'>
                <Button variant='outlined' className={`button notifications-date-button`} onClick={()=>{selectNotificationDate(new Date(selectedDate.getTime() - 86400000))}}>
                    <CgArrowLeft className='notifications-date-icon icon-interactive nav-icon' />
                </Button>
                <DatePicker 
                inputFormat="dd/MM/yyyy" desktopModeMediaQuery='@media (min-width:769px)'
                renderInput={(props:any) => <TextField size='small' className={`focus date-picker notifications-date-picker`}  {...props} />}
                value={selectedDate} onChange={(newDate:Date|null)=>{selectNotificationDate(newDate)}}
                />
                <Button variant='outlined' className={`button notifications-date-button`} onClick={()=>{selectNotificationDate(new Date(selectedDate.getTime() + 86400000))}}>
                    <CgArrowRight className='notifications-date-icon icon-interactive nav-icon' />
                </Button>
            </div>
            {!!notificationList.length && <div className='nav-notifications-list'>
                {notificationList.map((notification:NotificationInterface)=>{
                    return (
                    <div className={`nav-notification`} key={notification._id}>
                        {notification.notificationParentTitle}
                    </div>
                    )
                })}
            </div>}
        </div>
    )
});

export default NavbarNotifications