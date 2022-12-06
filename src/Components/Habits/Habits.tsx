//Styles
import './Habits.scss';
//Dependencies
import React,{ useState,useEffect } from 'react';
import {useSelector} from 'react-redux';
import {Container,TextField,Button,Typography,Card} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { CgArrowLeft, CgArrowRight } from 'react-icons/cg';
import {IoCheckboxOutline,IoSquareOutline} from 'react-icons/io5';
import { useLocation,useNavigate } from 'react-router-dom';
//Components
import Toolbar from '../UI/Toolbar/Toolbar';
import Loading from '../Misc/Loading';
import type {RootState} from '../../Store/Store';
import useHabitHooks from '../../Hooks/useHabitHooks';
import type {HabitInterface,HabitEntryInterface} from '../../Misc/Interfaces';

const filterList = (list:HabitInterface[],sortQuery:string|null,searchQuery:string|null) => {
    if(sortQuery) {
        if (sortQuery === 'dateAsc') { list = list.sort((itemA:HabitInterface,itemB:HabitInterface)=> new Date(itemA.creationDate).getTime() - new Date(itemB.creationDate).getTime()) };
        if (sortQuery === 'dateDesc') { list = list.sort((itemA:HabitInterface,itemB:HabitInterface)=> new Date(itemB.creationDate).getTime() - new Date(itemA.creationDate).getTime()) };
        if (sortQuery === 'noEntries') { list = list.filter((item:HabitInterface)=>Object.values(item.entries).every(item => item === null))};
        if (sortQuery === 'hasEntries') { list = list.filter((item:HabitInterface)=>Object.values(item.entries).some(item => item !== null))};
    }
    if(searchQuery) {
        list = list.filter((item:HabitInterface)=>{
            if(item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item._id.includes(searchQuery.toLowerCase())) {
                return item;
            } else {
                return false;
            }
        });
    }
    return list
}

const Habits:React.FC = () => {
    const habitHooks = useHabitHooks();
    const habitLoading = useSelector<RootState,boolean>(state=>state.habitsSlice.habitLoading);
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const datepickerDate = new Date(useSelector<RootState,string>(state=>state.habitsSlice.datepickerDate));
    const habitList = useSelector<RootState,HabitInterface[]>(state=>state.habitsSlice.habitList);
    const habitListLoaded = useSelector<RootState,boolean>(state=>state.habitsSlice.habitListLoaded);
    // Sorting by query params
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')] 
    const filteredList = filterList([...habitList],sortQuery,searchQuery);
    const datepickerDateWeekStart = datepickerDate.getTime() + 86400000 * (datepickerDate.getDay()? 1 - datepickerDate.getDay() : -6);
    const [selectedDate, setSelectedDate] = useState(new Date(new Date(datepickerDateWeekStart)));
    const [selectedDateWeekEnd, setSelectedDateWeekEnd] = useState(new Date(new Date(datepickerDateWeekStart+86400000*6)));
    // Weekday list for labels 
    const weekdays = [1,2,3,4,5,6,0];
    const weekdaysList:{[key:string|number]:string} = { 0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat' };
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
        if(habitListLoaded === false) {
            habitHooks.loadHabitsData(new Date(new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6)));
        }
    }, [])
    return (
        <Container component="main" className={`habits ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Toolbar mode={'habit'} addNewItem={():any=>navigate(`${location.pathname}/new-habit`)}/>
            <div className={`habit-week-range${isDarkMode?'-dark':''} scale-in`}>
                    <Button variant='outlined' className={`button habit-date-button`} onClick={()=>{loadSelectedDateData(new Date(selectedDate.getTime() - 86400000 * 7))}}>
                        <CgArrowLeft className='habit-date-button-icon icon-interactive nav-icon' />
                        <Typography className='habit-date-button-text'>Prev Week</Typography>
                    </Button> 
                    <DatePicker 
                        inputFormat="dd/MM/yyyy" className={`habit-date-picker date-picker`} desktopModeMediaQuery='@media (min-width:769px)'
                        renderInput={(props) => <TextField size='small' className={`focus date-picker habit-date`}  {...props} />}
                        value={selectedDate} onChange={(newDate:Date|null)=>{loadSelectedDateData(newDate);}}
                    />
                    -
                    <DatePicker 
                        inputFormat="dd/MM/yyyy" className={`habit-date-picker date-picker`} desktopModeMediaQuery='@media (min-width:769px)'
                        renderInput={(props) => <TextField size='small' className={`focus date-picker habit-date`}  {...props} />}
                        value={selectedDateWeekEnd} onChange={(newDate:Date|null)=>{loadSelectedDateData(newDate);}} disabled
                    />
                    <Button variant='outlined' className={`button habit-date-button`} onClick={()=>{loadSelectedDateData(new Date(selectedDate.getTime() + 86400000 * 7))}}>
                        <Typography className='habit-date-button-text'>Next Week</Typography>
                        <CgArrowRight className='habit-date-button-icon icon-interactive nav-icon' />
                    </Button> 
                </div>
            {habitLoading ? <Loading height='80vh'/> :
            <div className={`habit-list scale-in`}>
                {filteredList.map((habitListItem:HabitInterface)=>{
                    return (
                        <Card variant='elevation' className={`habit-list-item`} key={habitListItem._id}>
                            <div className={`habit-list-item-title`} onClick={()=>{navigate(`${location.pathname}/${habitListItem._id}`)}}> 
                                <Typography className={`habit-list-item-title-text`}>{habitListItem.title}</Typography>
                            </div>
                            {Object.values(habitListItem.entries).every(entry=> entry === null) ? 
                                <Button onClick={()=>{habitHooks.populateHabit(new Date(selectedDate),habitListItem._id)}} className={`populate-week`}>Poplulate with Entries</Button> 
                                :<div className={`habit-weekdays`}>
                                    {weekdays.map((weekday:number)=>{
                                        const habitEntry:HabitEntryInterface | null | boolean = habitListItem.entries[weekday];
                                        if(habitEntry && typeof(habitEntry) === 'object') {
                                            const isCurrentDay = new Date(habitEntry.date).toLocaleDateString('en-GB') === new Date().toLocaleDateString('en-GB');
                                            return (
                                                <div key={weekday} className={`habit-weekday`} onClick={()=>{habitHooks.changeHabitStatus(habitEntry,weekday)}}>
                                                    <Typography className={`habit-weekday-label ${isCurrentDay && 'current-day'}`}>{weekdaysList[weekday]}</Typography>
                                                    {habitEntry.status === 'Complete' ? 
                                                    <IoCheckboxOutline className={`icon-interactive habit-weekday-icon ${habitEntry.status}`} /> : 
                                                    <IoSquareOutline className={`icon-interactive habit-weekday-icon ${habitEntry.status}`} />}
                                                </div>
                                            )
                                        } else if(habitEntry) {
                                            const adjustedTime = selectedDate.setHours(12,0,0,0) + (new Date().getTimezoneOffset() * -1 * 60 * 1000);
                                            const date = weekday ? new Date(adjustedTime + ((weekday - 1) * 86400000)).toISOString() : new Date(adjustedTime + (6 * 86400000)).toISOString();
                                            const blankEntry:HabitEntryInterface = {date,status:"Pending",dateCompleted:null,habitId:habitListItem._id,_id:''};
                                            const isCurrentDay = new Date(blankEntry.date).toLocaleDateString('en-GB') === new Date().toLocaleDateString('en-GB');
                                            return (
                                                <div key={weekday} className={`habit-weekday`} onClick={()=>{habitHooks.changeHabitStatus(blankEntry,weekday)}}>
                                                    <Typography className={`habit-weekday-label ${isCurrentDay && 'current-day'}`}>{weekdaysList[weekday]}</Typography>
                                                    <IoSquareOutline className={`icon-interactive habit-weekday-icon Pending`} />
                                                </div>
                                            )
                                        } else {
                                            return null;
                                        }
                                    })}
                                </div>
                            }
                        </Card>
                    )
                })}
            </div>
            } 
        </Container>
    )
}

export default Habits