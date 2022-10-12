//Styles
import './Navbar-notifications.scss';
//Dependencies
import React, { useEffect,useState} from 'react';
import { useNavigate } from 'react-router';
import { useSelector,useDispatch } from 'react-redux';
import type {RootState} from '../../../Store/Store';
import {TextField,Button,Typography} from '@mui/material';
import { DatePicker} from '@mui/lab';
import {CgArrowRight,CgArrowLeft} from 'react-icons/cg';
//Components
import { scheduleActions } from '../../../Store/Store';
import type { ScheduleInterface } from '../../../Misc/Interfaces';
import useScheduleHooks from '../../../Hooks/useScheduleHooks';

type NotificationProps = React.HTMLProps<HTMLDivElement>

const NavbarNotifications = React.forwardRef<HTMLDivElement,NotificationProps>((props,ref) => {
    const scheduleHooks = useScheduleHooks();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // Toggle dark mode slider
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const notificationList = useSelector<RootState,ScheduleInterface[]>(state=>state.scheduleSlice.scheduleList[new Date().toLocaleDateString('en-Gb')]) || [];
    const notificationListLoaded = useSelector<RootState,boolean>(state=>state.scheduleSlice.scheduleListLoaded);
    // Select Date for Notifications
    const [selectedDate, setSelectedDate] = useState(new Date());
    const selectNotificationDate = (newDate:Date|null) => {
        newDate = newDate || new Date ();
        setSelectedDate(newDate);
        scheduleHooks.loadScheduleItems(newDate);
    }
    const sortedList = notificationList.sort((itemA,itemB)=>new Date(itemA.date).getTime() - new Date(itemB.date).getTime());
    console.log(sortedList);
    useEffect(() => {
        notificationListLoaded || scheduleHooks.loadScheduleItems(new Date());
    }, [])
    return (
        <div ref={ref} className={`nav-notifications nav-notifications-${isDarkMode?'dark':'light'}`}>
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
                {notificationList.map((notification:ScheduleInterface)=>{
                    return (
                    <div className={`nav-notification`} key={notification._id}>
                        <Typography>{new Date(notification.date).toLocaleTimeString()}</Typography>
                        <Typography>{notification.parentTitle}</Typography>
                    </div>
                    )
                })}
            </div>}
        </div>
    )
});

export default NavbarNotifications
