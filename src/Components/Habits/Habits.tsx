//Styles
import './Habits.scss';
//Dependencies
import {useSelector} from 'react-redux';
import React,{ useState,useEffect } from 'react';
import {Container,TextField,Button,Typography,Card,FormControl,InputLabel,Select,MenuItem,OutlinedInput,InputAdornment} from '@mui/material';
import { DatePicker } from '@mui/lab';
import {IoCheckboxOutline,IoSquareOutline,IoCloseCircleOutline} from 'react-icons/io5';
import { useNavigate,useLocation } from 'react-router-dom';
//Components
import Loading from '../Misc/Loading';
import AddNewHabit from './Add-new-habit';
import type {RootState} from '../../Store/Store';
import useHabitHooks from '../../Hooks/useHabitHooks';
import type {HabitInterface,HabitEntryInterface} from '../../Misc/Interfaces';

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
    const habitList = useSelector<RootState,HabitInterface[]>(state=>state.habitsSlice.habitList);
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
    const searchQueryHandler = (searchString:string) => {
        setNewQueries((prevState)=>({
            ...prevState,
            searchQuery:searchString
        }))
        setQueries(queries.sortQuery,searchString);
    }
    const filteredList = filterList([...habitList],sortQuery,searchQuery);
    // Date selection and max date for datepicker
    const currentWeekStartTime = new Date().getTime() + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
    const currentWeekEnd = new Date(new Date(currentWeekStartTime+86400000*6).setHours(23,59,59,999));
    const datepickerDateWeekStart = datepickerDate.getTime() + 86400000 * (datepickerDate.getDay()? 1 - datepickerDate.getDay() : -6);
    const [selectedDate, setSelectedDate] = useState(new Date(new Date(datepickerDateWeekStart)));
    const [selectedDateWeekEnd, setSelectedDateWeekEnd] = useState(new Date(new Date(datepickerDateWeekStart+86400000*6)));
    // Weekday list for labels 
    const weekdaysList:{[key:string|number]:string} = { 0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat' };
    // Set detailed item
    const [detailedHabit,setDetailedItem] = useState<HabitInterface|undefined>();
    // Toggle new/detailed habit
    const [toggleNewHabit,setToggleNewHabit] = useState(false);
    // Load selected date's data
    const loadSelectedDateData = async (newDate:Date|null) => {
        newDate = newDate || new Date ();
        // Load new week date only when week changes
        const selectedWeekStartTime = selectedDate.setHours(0,0,0,0) + 86400000 * (selectedDate.getDay()? 1 - selectedDate.getDay() : -6);
        const newWeekStartTime = new Date(newDate).setHours(0,0,0,0) + 86400000 * (newDate.getDay()? 1 - newDate.getDay() : -6);
        if(newDate.getTime() < selectedWeekStartTime || newDate.getTime() > new Date(selectedWeekStartTime).setHours(23,59,59,999)) {
            habitHooks.loadHabitsData(new Date(newWeekStartTime))
        }
        setSelectedDate(new Date(newWeekStartTime));
        setSelectedDateWeekEnd(new Date(new Date(newWeekStartTime + 86400000 * 6)));
    }
    useEffect(() => {
        habitListLoaded || habitHooks.loadHabitsData(new Date(new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6)));
    }, [])
    return (
        <Container component="main" className={`habits ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <div className={`habit-controls${isDarkMode?'-dark':''} scale-in`}>
                <FormControl className='sort-habits select' size='small' >
                    <InputLabel id="habits-sort-label">Sort</InputLabel>
                    <Select labelId="habits-sort-label" value={queries.sortQuery} onChange={sortQueryHandler} size='small' label="Sort">
                        <MenuItem value="">All Habits</MenuItem>
                        <MenuItem value="dateAsc">Creation Date Ascending</MenuItem>
                        <MenuItem value="dateDesc">Creation Date Descending</MenuItem>
                        <MenuItem value="noEntries">Habits without entries</MenuItem>
                        <MenuItem value="hasEntries">Habits with entries</MenuItem>
                    </Select>
                </FormControl>
                <FormControl className={`search-habits`} sx={{width:"calc(min(100%, 33rem))"}} size='small' variant="outlined">
                    <InputLabel>Search</InputLabel>
                    <OutlinedInput value={queries.searchQuery} onChange={(e)=>{searchQueryHandler(e.target.value)}} label="Search" 
                        endAdornment={<InputAdornment position="end">{!!queries.searchQuery.length && <IoCloseCircleOutline onClick={()=>{searchQueryHandler('')}} className={`icon-interactive opacity-transition clear-input`}/>}</InputAdornment>}
                    />
                </FormControl>
                <Button variant="outlined" className={`add-new-habit button`} onClick={()=>{setToggleNewHabit(!toggleNewHabit);loadSelectedDateData(new Date())}}>New Habit</Button>
            </div>
            <div className={`habit-week-range${isDarkMode?'-dark':''} scale-in`}>
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
                </div>
            {loading ? <Loading height='80vh'/> :
            <div className={`habit-list scale-in`}>
                {filteredList.map((habitListItem:HabitInterface)=>{
                    return(
                        <Card variant='elevation' className={`habit-list-item`} key={habitListItem._id}>
                            <div className={`habit-list-item-title`} onClick={()=>{setDetailedItem(habitListItem);setToggleNewHabit(!toggleNewHabit)}}> 
                                <Typography className={`habit-list-item-title-text`}>{habitListItem.habitTitle}</Typography>
                            </div>
                            {habitListItem.habitEntries.length < 1 ? 
                            <Button onClick={()=>{habitHooks.populateHabit(new Date(selectedDate),habitListItem._id)}} className={`populate-week`}>Poplulate with Entries</Button> :
                            <div className={`habit-weekdays`}>
                                {habitListItem.habitEntries.map((habitEntry:HabitEntryInterface)=>{
                                    const isCurrentDay = new Date(habitEntry.date).toLocaleDateString('en-GB') === new Date().toLocaleDateString('en-GB');
                                    return (
                                        <div key={habitEntry._id} className={`habit-weekday`} onClick={()=>{habitHooks.changeHabitStatus(habitListItem._id,habitEntry._id,habitEntry.habitEntryStatus)}}>
                                            <Typography className={`habit-weekday-label ${isCurrentDay && 'current-day'}`}>{weekdaysList[new Date(habitEntry.date).getDay()]}</Typography>
                                            {habitEntry.habitEntryStatus === 'Complete' ? 
                                            <IoCheckboxOutline className={`icon-interactive habit-weekday-icon ${habitEntry.habitEntryStatus}`} /> : 
                                            <IoSquareOutline className={`icon-interactive habit-weekday-icon ${habitEntry.habitEntryStatus}`} />}
                                        </div>
                                    )
                                })}
                            </div>
                            }
                        </Card>
                    )
                })}
            </div>
            } 
            {toggleNewHabit && <AddNewHabit detailedHabit={detailedHabit} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToHabits={():any=>setToggleNewHabit(false)} />}
        </Container>
    )
}

export default Habits