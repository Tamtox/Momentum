//Styles
import './Habits.scss';
//Dependencies
import {useSelector,useDispatch} from 'react-redux';
import React,{ useState,useEffect} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Container,TextField,Button,Box,Typography,Card,Fab } from '@mui/material';
import { DatePicker } from '@mui/lab';
import { Icon } from '@iconify/react';
//Components
import Loading from '../Misc/Loading';
import AddNewHabit from './Add-new-habit';
import { habitsActions,authActions,goalActions } from '../../Store/Store';
import type {RootState} from '../../Store/Store';

const Habits:React.FC = () => {
    const token = Cookies.get('token');
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const dispatch = useDispatch();
    const datepickerDate = useSelector<RootState,string>(state=>state.habitsSlice.datepickerDate);
    const habitList = useSelector<RootState,{habitTitle:string,habitTime:string|null,habitCreationDate:string,habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},goalId:string|null,goalTargetDate:string|null,_id:string}[]>(state=>state.habitsSlice.habitList);
    // Date selection and max date for datepicker
    const currentWeekStartTime = new Date().getTime() + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
    const currentWeekEnd = new Date(new Date(currentWeekStartTime+86400000*6).setHours(23,59,59,999));
    const [selectedDate, setSelectedDate] = useState(new Date(datepickerDate));
    const selectedDateWeekStart = selectedDate.getTime() + 86400000 * (selectedDate.getDay()? 1 - selectedDate.getDay() : -6);
    // Weekday list for labels 
    const weekdaysList = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    // Set detailed item
    const [detailedHabit,setDetailedItem] = useState();
    // Toggle new/detailed habit
    const [toggleNewHabit,setToggleNewHabit] = useState(false);
    // Toggle Habit List / Habit Entries
    const [habitListMode,setHabitListMode] = useState(true);
    // Load habits data
    const loadHabitsData = async (date:Date) => {
        dispatch(authActions.setLoading(true))
        try {
            const habitsResponse:{data:{habitList:any[],habitEntries:any[]}} = await axios.request({
                method:'POST',
                url:`http://localhost:3001/habits/getHabits`,
                data:{selectedDate:date.toString()},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(habitsActions.setHabits({habitList:habitsResponse.data.habitList,habitEntries:habitsResponse.data.habitEntries,date:date.toString()}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))   
    }
    // Load selected date's data
    const loadSelectedDateData = async (newDate:Date|null) => {
        if(newDate === null) {
            newDate = new Date()
        }
        // Load new week date only when week changes
        const selectedWeekStartTime = selectedDate.getTime() + 86400000 * (selectedDate.getDay()? 1 - selectedDate.getDay() : -6);
        const selectedWeekStart = new Date(new Date(selectedWeekStartTime).setHours(0,0,0,0));
        const selectedWeekEnd = new Date(new Date(selectedWeekStartTime+86400000*6).setHours(23,59,59,999));
        if(newDate.getTime()<selectedWeekStart.getTime() || newDate.getTime()> selectedWeekEnd.getTime()) {
            loadHabitsData(newDate)
        }
        setSelectedDate(newDate);
    }
    // Delete habit
    const deleteHabit = async (habitId:string,pairedGoalId?:string) => {
        try {
            await axios.request({
                method:'DELETE',
                url:`http://localhost:3001/habits/deleteHabit`,
                data:{_id:habitId},
                headers:{Authorization: `Bearer ${token}`}
            })
            if(pairedGoalId) {
                await axios.request({
                    method:'DELETE',
                    url:`http://localhost:3001/goals/deleteGoal`,
                    headers:{Authorization: `Bearer ${token}`},
                    data:{_id:pairedGoalId}
                })
                dispatch(goalActions.deleteGoal(pairedGoalId))
            }
            dispatch(habitsActions.deleteHabit(habitId))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
    }
    // Change habit status
    const changeHabitStatus = async (habitId:string,habitEntryId:string,habitEntryStatus:string) => {
        try {
            await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/habits/updateHabitEntryStatus`,
                data:{_id:habitEntryId,habitEntryStatus:habitEntryStatus==="Pending"?"Complete":"Pending"},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(habitsActions.changeHabitStatus({habitEntryId,habitId}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
    }
    useEffect(() => {
        if(!!token && habitList.length<1) {
            loadHabitsData(new Date())
        }
    }, [])
    return (
        <Container component="main" className={`habits ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Box className={`habit-controls${isDarkMode?'-dark':''}`}>
                <DatePicker 
                inputFormat="dd/MM/yyyy" className={`habit-date-picker date-picker`} desktopModeMediaQuery='@media (min-width:769px)' maxDate={currentWeekEnd}
                renderInput={(props) => <TextField size='small' className={`focus date-picker journal-date`}  {...props} />}
                value={selectedDate} onChange={newDate=>{loadSelectedDateData(newDate);}}
                />
                <Card variant='elevation' className={`habit-list-label`} onClick={()=>{setHabitListMode(!habitListMode)}}>
                    {habitListMode? "Habit List" : `Week : ${new Date(selectedDateWeekStart).toLocaleDateString()} - ${new Date(selectedDateWeekStart+86400000*6).toLocaleDateString()}`}
                    <Icon className='habit-list-label-icon' icon="heroicons-outline:switch-vertical" />
                </Card>
                <Button variant="outlined" className={`add-new-habit button`} onClick={()=>{setToggleNewHabit(!toggleNewHabit)}}>New Habit</Button>
            </Box>
            {loading ? <Loading height='80vh'/> :
            <Box className={`habit habit-${habitListMode ? 'list' : 'entries'} scale-in`}>
                {!habitListMode && 
                <Card variant='elevation' className={`habit-item habit-entry-item`}>
                    <Typography className={`habit-list-item-habit-title`}>Habit Title</Typography>
                    <Box className={`habit-entries-weekdays`}>
                        {weekdaysList.map(weekday=>{
                            return <Typography className={`habit-entry-weekday`}>{weekday}</Typography>
                        })}
                    </Box>
                </Card>}
                {habitList.map((habitListItem:any)=>{
                    if(habitListMode) {
                        return(
                        <Card variant='elevation' className={`habit-item habit-list-item`} key={habitListItem._id}>
                            <Box className='habit-list-item-icons'>
                                <Icon onClick={()=>{setDetailedItem(habitListItem);setToggleNewHabit(!toggleNewHabit)}} className={`icon-interactive detailed-habit-icon`} icon="feather:edit" />
                                <Icon onClick={()=>{deleteHabit(habitListItem._id,habitListItem.goalId)}} className={`icon-interactive delete-habit-icon`} icon="clarity:remove-line" />
                            </Box>
                            <Typography className={`habit-list-item-habit-title`}>{habitListItem.habitTitle}</Typography>
                        </Card>)
                    } else {
                        if(habitListItem.habitEntries.length>0) {
                            return (
                                <Card variant='elevation' className={`habit-item habit-entry-item`} key={habitListItem._id}>
                                    <Typography className={`habit-list-item-habit-title`}>{habitListItem.habitTitle}</Typography>
                                    <Box className={`habit-entries-weekdays`}>
                                    {habitListItem.habitEntries.map((habitEntry:any)=>{
                                        return (
                                            <Box key={habitEntry._id} className={`habit-entry-weekday habit-entry-weekday${habitEntry.weekday}`}>
                                                <Icon className={`icon-interactive habit-entry-icon ${habitEntry.habitEntryStatus}`} onClick={()=>{changeHabitStatus(habitListItem._id,habitEntry._id,habitEntry.habitEntryStatus)}} icon={`akar-icons:${habitEntry.habitEntryStatus === 'Complete' ? 'check-' : ''}box`} />
                                            </Box>
                                        )
                                    })}
                                    </Box>
                                </Card>
                            )
                        } else {return null}
                    }
                })}
            </Box>
            } 
            {toggleNewHabit && <AddNewHabit detailedHabit={detailedHabit} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToHabits={():any=>setToggleNewHabit(false)} />}
        </Container>
    )
}

export default Habits