//Styles
import './Habits.scss';
//Dependencies
import {useSelector,useDispatch} from 'react-redux';
import React,{ useState,useEffect} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Container,TextField,Button,Box,Typography,FormControl,InputLabel,Select,MenuItem,Card } from '@mui/material';
import { DatePicker } from '@mui/lab';
//Components
import Loading from '../Misc/Loading';
import AddNewHabit from './Add-new-habit';
import { habitsActions,authActions,goalActions } from '../../Store/Store';
import type {RootState} from '../../Store/Store';

const Habits:React.FC = () => {
    const token = Cookies.get('token');
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const dispatch = useDispatch();
    const habitList = useSelector<RootState,{habitTitle:string,habitTime:string|null,habitCreationDate:string,habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},goalId:string|null,goalTargetDate:string|null,_id:string}[]>(state=>state.habitsSlice.habitList);
    const habitEntries = useSelector<RootState,{habitEntryStatus:string,habitId:string,year:string,month:string,date:string,weekday:string,weekStart:string,weekEnd:string,_id:string}[]>(state=>state.habitsSlice.habitEntries);
    console.log(habitList,habitEntries);
    // States: date,toggle new habit, loader
    const [selectedDate, setSelectedDate] = useState(new Date());
    // Set detailed item
    const [detailedHabit,setDetailedItem] = useState()
    // Toggle new/detailed habit
    const [toggleNewHabit,setToggleNewHabit] = useState(false);
    // Load habits data
    const loadHabitsData = async (date:Date) => {
        dispatch(authActions.setLoading(true))
        try {
            const habitsResponse:{data:{habitList:any[]}} = await axios.request({
                method:'POST',
                url:`http://localhost:3001/habits/getHabits`,
                data:{selectedDate:date.toString()},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(habitsActions.setHabits(habitsResponse.data))
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
        setSelectedDate(newDate)
        loadHabitsData(newDate)
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
    const changeHabitStatus = async (habitEntryId:string) => {
        try {
            await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/habits/updateHabitEntryStatus`,
                data:{_id:habitEntryId},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(habitsActions.changeHabitStatus(habitEntryId))
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
            <Box className='habit-controls'>
                <DatePicker 
                inputFormat="DD/MM/YYYY" desktopModeMediaQuery='@media (min-width:769px)'
                renderInput={(props) => <TextField size='small' className={`focus date-picker journal-date`}  {...props} />}
                value={selectedDate} onChange={newDate=>{loadSelectedDateData(newDate);}}
                />
                <Button variant="outlined" className={`add-new-habit button`} onClick={()=>{setToggleNewHabit(!toggleNewHabit)}}>New Habit</Button>
            </Box>
            {loading?<Loading height='80vh'/>:
            <Box className='habit-list'>
                {habitEntries.map((habitEntry:any)=>{
                    return (
                        <Card className='habit-entry' key={habitEntry._id}>

                        </Card>
                    )
                })}
                {habitList.map((habitListItem:any)=>{
                    return (
                        <Card className='habit-list-item' key={habitListItem._id}>

                        </Card>
                    )
                })}
            </Box>
            } 
            {toggleNewHabit && <AddNewHabit detailedHabit={undefined} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToHabits={():any=>setToggleNewHabit(false)} />}
        </Container>
    )
}

export default Habits