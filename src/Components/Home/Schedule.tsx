//Styles
import './Schedule.scss';
//Dependencies
import React, { useEffect,useState} from 'react';
import { useNavigate } from 'react-router';
import { useSelector,useDispatch } from 'react-redux';
import type {RootState} from '../../Store/Store';
import {TextField,Button,Typography,Card} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {CgArrowRight,CgArrowLeft} from 'react-icons/cg';
//Components
import { scheduleActions } from '../../Store/Store';
import type { ScheduleInterface } from '../../Misc/Interfaces';
import useScheduleHooks from '../../Hooks/useScheduleHooks';
import Loading from '../Misc/Loading';

const Schedule:React.FC = () => {
    const scheduleHooks = useScheduleHooks();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const scheduleLoading = useSelector<RootState,boolean>(state=>state.scheduleSlice.scheduleLoading);
    const scheduleList = useSelector<RootState,ScheduleInterface[]>(state=>state.scheduleSlice.scheduleList);
    const scheduleListLoaded = useSelector<RootState,boolean>(state=>state.scheduleSlice.scheduleListLoaded);
     // Select Date for Schedule
    const [selectedDate, setSelectedDate] = useState(new Date());
    const selectScheduleDate = (newDate:Date|null) => {
        newDate = newDate || new Date ();
        setSelectedDate(newDate);
        scheduleHooks.loadScheduleItems(newDate);
    }
    // const sortedList = notificationList.sort((itemA,itemB)=>new Date(itemA.date).getTime() - new Date(itemB.date).getTime());
    // console.log(sortedList);
    console.log(scheduleList)
    useEffect(() => {
        scheduleListLoaded || scheduleHooks.loadScheduleItems(new Date());
    }, [])
    return(
        <div className={`schedule`}>
            <Typography className='schedule-title'>Schedule</Typography>
            <div className='schedule-date'>
                <Button variant='outlined' className={`button schedule-date-button`} onClick={()=>{selectScheduleDate(new Date(selectedDate.getTime() - 86400000))}}>
                    <CgArrowLeft className='schedule-date-icon icon-interactive nav-icon' />
                    <Typography className='schedule-date-button-text'>Prev Day</Typography>
                </Button>   
                <DatePicker 
                inputFormat="dd/MM/yyyy" desktopModeMediaQuery='@media (min-width:769px)'
                renderInput={(props:any) => <TextField size='small' className={`focus date-picker schedule-date-picker`}  {...props} />}
                value={selectedDate} onChange={(newDate:Date|null)=>{selectScheduleDate(newDate)}}
                />
                <Button variant='outlined' className={`button schedule-date-button`} onClick={()=>{selectScheduleDate(new Date(selectedDate.getTime() + 86400000))}}>
                    <Typography className='schedule-date-button-text'>Next Day</Typography>
                    <CgArrowRight className='schedule-date-icon icon-interactive nav-icon' />
                </Button>
            </div>
            {scheduleLoading ? <Loading height='80vh'/>:
            <div className={`schedule-list`}>
                {scheduleList.map((schedule:ScheduleInterface)=>{
                    return (
                    <Card variant='elevation' className={`schedule-item scale-in schedule-${schedule.parentType}`} key={schedule._id}>
                        {schedule.time && <div className={`schedule-item-time`}>
                            <Typography className={`schedule-item-time-text`}>{`${schedule.time.split(':')[0]}:${schedule.time.split(':')[1]}`}</Typography>
                        </div>}
                        <div className={`schedule-item-title`}>
                            <Typography className={`schedule-item-title-text`}>{schedule.parentTitle}</Typography>
                        </div>
                    </Card>
                    )
                })}
            </div>}
        </div>
    )
}

export default Schedule
