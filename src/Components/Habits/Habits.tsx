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
import { habitsActions,authActions } from '../../Store/Store';
import type {RootState} from '../../Store/Store';

const Habits:React.FC = () => {
    const token = Cookies.get('token');
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const dispatch = useDispatch();
    const habitList = useSelector<RootState,{habitTitle:string,habitTime:string|null,habitCreationDate:string,habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},goalId:string|null,_id:string}[]>(state=>state.habitsSlice.habitList);
    const habitEntries = useSelector<RootState,{habitTitle:string,habitTime:string|null,habitStatus:string,habitId:string,date:string,_id:string}[]>(state=>state.habitsSlice.habitEntries);
    // States: date,toggle new habit, loader
    const [selectedDate, setSelectedDate] = useState(new Date());
    // Set detailed item
    const [detailedHabit,setDetailedItem] = useState()
    // Toggle new/detailed habit
    const [toggleNewHabit,setToggleNewHabit] = useState(false);
    // Load habits data
    async function loadHabitsData(date:Date) {
        dispatch(authActions.setLoading(true))
        try {
            const habitsResponse:{data:{habitList:any[]}} = await axios.request({
                method:'POST',
                url:`http://localhost:3001/habits/getHabits`,
                data:{selectedDate:date.toString()},
                headers:{Authorization: `Bearer ${token}`}
            })
            console.log(habitsResponse.data.habitList)
            // dispatch(habitsActions.setHabits(todoList.data))
        } catch (error) {
            if (axios.isAxiosError(error)) {
                error.response !== undefined?alert(error.response!.data):alert(error.message)
            } else {
                console.log(error);
            }
        }
        dispatch(authActions.setLoading(false))   
    }
    // Load selected date's data
    function loadSelectedDateData(newDate:Date|null) {
        if(newDate === null) {
            newDate = new Date()
        }
        setSelectedDate(newDate)
        loadHabitsData(newDate)
    }
    // Delete habit
    function deleteHabit(habitName:string) {
    }
    // Change habit status
    function changeHabitStatus(date:Date,habitName:string,status:string):any {
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
            {loading?<Loading height='100%'/>:
            <Box className='habit-list'>
                {habitEntries.map((habitEntry:any)=>{
                    return (
                        <Card className='habit-entry'>

                        </Card>
                    )
                })}
                {habitList.map((habitListEntry:any)=>{
                    return (
                        <Card className='habit-list-entry'>

                        </Card>
                    )
                })}
                <Card className='habit-item'>123</Card>
                <Card className='habit-item'>123</Card>
            </Box>
            } 
            {toggleNewHabit && <AddNewHabit detailedHabit={undefined} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToHabits={():any=>setToggleNewHabit(false)} />}
        </Container>
    )
}

export default Habits