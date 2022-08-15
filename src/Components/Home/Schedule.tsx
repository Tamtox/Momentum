//Styles
import './Schedule.scss';
//Dependencies
import React, { useEffect,useState} from 'react';
import { useNavigate } from 'react-router';
import { useSelector,useDispatch } from 'react-redux';
import type {RootState} from '../../Store/Store';
import {TextField,Button,Typography,Card} from '@mui/material';
import { DatePicker} from '@mui/lab';
import {CgArrowRight,CgArrowLeft} from 'react-icons/cg';
//Components
import { notificationActions } from '../../Store/Store';
import type { NotificationInterface } from '../../Misc/Interfaces';
import useNotificationHooks from '../../Hooks/useNotificationHooks';
import Loading from '../Misc/Loading';

const Schedule:React.FC = () => {
    const notificationHooks = useNotificationHooks();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const userData = useSelector<RootState,{email:string,name:string,emailConfirmationStatus:string,}>(state=>state.authSlice.user);
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
    // const sortedList = notificationList.sort((itemA,itemB)=>new Date(itemA.date).getTime() - new Date(itemB.date).getTime());
    // console.log(sortedList);
    useEffect(() => {
        notificationListLoaded || notificationHooks.loadNotifications(new Date());
    }, [])
    return(
        <div className={`schedule`}>
            <Typography className='schedule-title'>Schedule</Typography>
            <div className='schedule-date'>
                <Button variant='outlined' className={`button schedule-date-button`} onClick={()=>{selectNotificationDate(new Date(selectedDate.getTime() - 86400000))}}>
                    <CgArrowLeft className='schedule-date-icon icon-interactive nav-icon' />
                    <Typography className='schedule-date-button-text'>Prev Date</Typography>
                </Button>   
                <DatePicker 
                inputFormat="dd/MM/yyyy" desktopModeMediaQuery='@media (min-width:769px)'
                renderInput={(props:any) => <TextField size='small' className={`focus date-picker schedule-date-picker`}  {...props} />}
                value={selectedDate} onChange={(newDate:Date|null)=>{selectNotificationDate(newDate)}}
                />
                <Button variant='outlined' className={`button schedule-date-button`} onClick={()=>{selectNotificationDate(new Date(selectedDate.getTime() + 86400000))}}>
                    <Typography className='schedule-date-button-text'>Next Date</Typography>
                    <CgArrowRight className='schedule-date-icon icon-interactive nav-icon' />
                </Button>
            </div>
            {loading ? <Loading height='80vh'/>:
            <div className={`schedule-list`}>
                {notificationList.map((notification:NotificationInterface)=>{
                    const notificationLocaleTimeArr = new Date(notification.date).toLocaleTimeString().split(':');
                    return (
                    <Card variant='elevation' className={`schedule-item scale-in`} key={notification._id}>
                        <Typography>{`${notificationLocaleTimeArr[0]}:${notificationLocaleTimeArr[1]}`}</Typography>
                        <Typography>{notification.notificationParentTitle}</Typography>
                    </Card>
                    )
                })}
            </div>}
        </div>
    )
}

export default Schedule
