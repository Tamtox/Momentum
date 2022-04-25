//Styles
import './Habits.scss';
//Dependencies
import {useSelector} from 'react-redux';
import React,{ useState,useEffect } from 'react';
import {Container,TextField,Button,Box,Typography,Card,FormControl,InputLabel,Select,MenuItem} from '@mui/material';
import { DatePicker } from '@mui/lab';
import {IoCheckboxOutline,IoSquareOutline} from 'react-icons/io5';
import { useNavigate,useLocation } from 'react-router-dom';
//Components
import Loading from '../Misc/Loading';
import AddNewHabit from './Add-new-habit';
import type {RootState} from '../../Store/Store';
import useHabitHooks from '../../Hooks/useHabitHooks';

const filterList = (list:any[],sortQuery:string|null,searchQuery:string|null) => {
    if(sortQuery) {
        if (sortQuery === 'dateAsc') { list = list.sort((itemA,itemB)=> new Date(itemA.habitCreationDate).getTime() - new Date(itemB.habitCreationDate).getTime()) };
        if (sortQuery === 'dateDesc') { list = list.sort((itemA,itemB)=> new Date(itemB.habitCreationDate).getTime() - new Date(itemA.habitCreationDate).getTime()) };
        if (sortQuery === 'noEntries') { list = list.filter(item=>item.habitEntries.length<1) };
        if (sortQuery === 'hasEntries') { list = list.filter(item=>item.habitEntries.length>0) };
    }
    if(searchQuery) {
        list = list.filter(item=>item.habitTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list
}

const Habits:React.FC = () => {
    const habitHooks = useHabitHooks();
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const datepickerDate = new Date(useSelector<RootState,string>(state=>state.habitsSlice.datepickerDate));
    const habitList = useSelector<RootState,{habitTitle:string,habitTime:string|null,habitCreationDate:string,habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},goalId:string|null,goalTargetDate:string|null,_id:string}[]>(state=>state.habitsSlice.habitList);
    const habitListLoaded = useSelector<RootState,boolean>(state=>state.habitsSlice.habitListLoaded);
    // Sorting by query params
    const [navigate,location] = [useNavigate(),useLocation()];
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')] 
    function setQueries(sortQuery:string|null,searchQuery:string|null) {
        const sortQueryString = sortQuery ? `?sort=${sortQuery}` : ''
        const searchQueryString = searchQuery ? sortQuery ? `&search=${searchQuery}` : `?search=${searchQuery}` : ''
        navigate(`/habits${sortQueryString}${searchQueryString}`);
    }
    const [queries,setNewQueries] = useState({sortQuery:searchQuery || '',searchQuery:searchQuery || ''}) ;
    const sortQueryHandler = (e:any) => {
        setNewQueries((prevState)=>({
            ...prevState,
            sortQuery:e.target.value
        }))
        setQueries(e.target.value,queries.searchQuery);
    }
    const searchQueryHandler = (e:any) => {
        setNewQueries((prevState)=>({
            ...prevState,
            searchQuery:e.target.value
        }))
        setQueries(queries.sortQuery,e.target.value);
    }
    const filteredList = filterList([...habitList],sortQuery,searchQuery);
    // Date selection and max date for datepicker
    const currentWeekStartTime = new Date().getTime() + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
    const currentWeekEnd = new Date(new Date(currentWeekStartTime+86400000*6).setHours(23,59,59,999));
    const datepickerDateWeekStart = datepickerDate.getTime() + 86400000 * (datepickerDate.getDay()? 1 - datepickerDate.getDay() : -6);
    const [selectedDate, setSelectedDate] = useState(new Date(new Date(datepickerDateWeekStart).setHours(0,0,0,0)));
    const [selectedDateWeekEnd, setSelectedDateWeekEnd] = useState(new Date(new Date(datepickerDateWeekStart+86400000*6).setHours(23,59,59,999)));
    // Weekday list for labels 
    const weekdaysList:{[key:string|number]:string} = { 0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat' };
    // Set detailed item
    const [detailedHabit,setDetailedItem] = useState();
    // Toggle new/detailed habit
    const [toggleNewHabit,setToggleNewHabit] = useState(false);
    // Load selected date's data
    const loadSelectedDateData = async (newDate:Date|null) => {
        newDate = newDate || new Date ();
        // Load new week date only when week changes
        const selectedWeekStartTime = selectedDate.getTime() + 86400000 * (selectedDate.getDay()? 1 - selectedDate.getDay() : -6);
        const selectedWeekStart = new Date(new Date(selectedWeekStartTime).setHours(0,0,0,0));
        const selectedWeekEnd = new Date(new Date(selectedWeekStartTime+86400000*6).setHours(23,59,59,999));
        const newWeekStartTime = newDate.getTime() + 86400000 * (newDate.getDay()? 1 - newDate.getDay() : -6);
        const newWeekStart = new Date(new Date(newWeekStartTime).setHours(0,0,0,0));
        const newWeekEnd = new Date(new Date(newWeekStartTime+86400000*6).setHours(23,59,59,999));
        if(newDate.getTime()<selectedWeekStart.getTime() || newDate.getTime()> selectedWeekEnd.getTime()) {
            habitHooks.loadHabitsData(newDate)
        }
        setSelectedDate(new Date(newWeekStart));
        setSelectedDateWeekEnd(new Date(newWeekEnd));
    }
    useEffect(() => {
        habitListLoaded || habitHooks.loadHabitsData(new Date());
    }, [])
    return (
        <Container component="main" className={`habits ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Box className={`habit-controls${isDarkMode?'-dark':''}`}>
                <FormControl className='sort-habits select' size='small' >
                    <InputLabel id="habits-sort-label">Sort</InputLabel>
                    <Select labelId="habits-sort-label" value={queries.sortQuery} onChange={sortQueryHandler} size='small' label="Sort">
                        <MenuItem value="">Default</MenuItem>
                        <MenuItem value="dateAsc">Creation Date Ascending</MenuItem>
                        <MenuItem value="dateDesc">Creation Date Descending</MenuItem>
                        <MenuItem value="noEntries">Habits without entries</MenuItem>
                        <MenuItem value="hasEntries">Habits with entries</MenuItem>
                    </Select>
                </FormControl>
                <TextField className={`search-habits`} sx={{width:"calc(min(100%, 33rem))"}} variant='outlined' value={queries.searchQuery} onChange={searchQueryHandler}  size='small' label="Search"/>
                <Button variant="outlined" className={`add-new-habit button`} onClick={()=>{setToggleNewHabit(!toggleNewHabit)}}>New Habit</Button>
            </Box>
            <Box className={`habit-week-range${isDarkMode?'-dark':''}`}>
                    <DatePicker 
                    inputFormat="dd/MM/yyyy" className={`habit-date-picker date-picker`} desktopModeMediaQuery='@media (min-width:769px)' maxDate={currentWeekEnd}
                    renderInput={(props) => <TextField size='small' className={`focus date-picker habit-date`}  {...props} />}
                    value={selectedDate} onChange={newDate=>{loadSelectedDateData(newDate);}}
                    />
                    to
                    <DatePicker 
                    inputFormat="dd/MM/yyyy" className={`habit-date-picker date-picker`} desktopModeMediaQuery='@media (min-width:769px)' maxDate={currentWeekEnd}
                    renderInput={(props) => <TextField size='small' className={`focus date-picker habit-date`}  {...props} />}
                    value={selectedDateWeekEnd} onChange={newDate=>{loadSelectedDateData(newDate);}} disabled
                    />
                </Box>
            {loading ? <Loading height='80vh'/> :
            <Box className={`habit-list scale-in`}>
                {filteredList.map((habitListItem:any)=>{
                    return(
                        <Card variant='elevation' className={`habit-list-item`} key={habitListItem._id}>
                            <Box className={`habit-list-item-title`} onClick={()=>{setDetailedItem(habitListItem);setToggleNewHabit(!toggleNewHabit)}}> 
                                <Typography className={`habit-list-item-title-text`}>{habitListItem.habitTitle}</Typography>
                            </Box>
                            <Box className={`habit-weekdays`}>
                                {habitListItem.habitEntries.map((habitEntry:any)=>{
                                    return (
                                        <Box key={habitEntry._id} className={`habit-weekday`}>
                                            <Typography className={`habit-weekday-label`}>{weekdaysList[habitEntry.weekday]}</Typography>
                                            {habitEntry.habitEntryStatus === 'Complete' ? 
                                            <IoCheckboxOutline className={`icon-interactive habit-weekday-icon ${habitEntry.habitEntryStatus}`} onClick={()=>{habitHooks.changeHabitStatus(habitListItem._id,habitEntry._id,habitEntry.habitEntryStatus)}}/> : 
                                            <IoSquareOutline className={`icon-interactive habit-weekday-icon ${habitEntry.habitEntryStatus}`} onClick={()=>{habitHooks.changeHabitStatus(habitListItem._id,habitEntry._id,habitEntry.habitEntryStatus)}}/>}
                                        </Box>
                                    )
                                })}
                            </Box>
                        </Card>
                    )
                })}
            </Box>
            } 
            {toggleNewHabit && <AddNewHabit detailedHabit={detailedHabit} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToHabits={():any=>setToggleNewHabit(false)} />}
        </Container>
    )
}

export default Habits