//Styles
import './Habits.scss';
//Dependencies
import React,{ useEffect, useReducer } from 'react';
import {useSelector} from 'react-redux';
import {Container,TextField,Button,Typography,Card, Box} from '@mui/material';
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
import { sortByQueries } from '../../Misc/Helper-functions';

interface IHabitsWeekdatesState {
    selectedDateWeekStart: Date,
    selectedDateWeekEnd: Date,
    isCurrentWeek: boolean
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
    const [navigate,location] = [useNavigate(),useLocation()];
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')] 
    const filteredList = sortByQueries([...habitList],"habit",sortQuery,searchQuery);
    // Week start and end 
    const currentWeekStart = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
    const nextWeekStart = currentWeekStart + 86400000 * 7 - 1;
    const selectedDateWeekStart = new Date(datepickerDate.setHours(0,0,0,0) + 86400000 * (datepickerDate.getDay()? 1 - datepickerDate.getDay() : -6));
    const selectedDateWeekEnd = new Date(new Date(selectedDateWeekStart).setHours(23,59,59,999) + 86400000 * 6);
    const isCurrentWeek = selectedDateWeekStart.getTime() === currentWeekStart ? true : false
    const [state,setState] = useReducer((state:IHabitsWeekdatesState,action:Partial<IHabitsWeekdatesState>) => ({...state,...action}),{selectedDateWeekStart,selectedDateWeekEnd,isCurrentWeek});
    // Weekday list for labels 
    const weekdays = [1,2,3,4,5,6,0];
    const weekdaysList:{[key:string|number]:string} = { 0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat' };
    // Load selected date's data
    const loadSelectedDateData = async (newDate:Date|null) => {
        newDate = newDate || new Date ();
        // Load new week date only when week changes
        const oldWeekStart = state.selectedDateWeekStart.getTime();
        const oldWeekEnd = state.selectedDateWeekEnd.getTime();
        const newWeekStartTime = new Date(newDate).setHours(0,0,0,0) + 86400000 * (newDate.getDay()? 1 - newDate.getDay() : -6);
        if(newDate.getTime() < oldWeekStart || newWeekStartTime > oldWeekEnd) {
            habitHooks.loadHabitsData(new Date(newWeekStartTime))
        }
        setState({
            selectedDateWeekStart:new Date(newWeekStartTime),
            selectedDateWeekEnd:new Date(new Date(newWeekStartTime).setHours(23,59,59,999)),
            isCurrentWeek:newWeekStartTime === currentWeekStart ? true : false,
        });
    }
    useEffect(() => {
        const currentWeekStart = new Date(new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6));
        habitListLoaded || habitHooks.loadHabitsData(currentWeekStart);
    }, [])
    return (
        <Container component="main" className={`habits ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Toolbar mode={'habit'} addNewItem={():any=>navigate(`${location.pathname}/new-habit`)}/>
            <Box className={`habit-week-range${isDarkMode?'-dark':''} scale-in`}>
                <Button variant='outlined' className={`button habit-date-button`} onClick={()=>{loadSelectedDateData(new Date(state.selectedDateWeekStart.getTime() - 86400000 * 7))}}>
                    <CgArrowLeft className='habit-date-button-icon icon-interactive nav-icon' />
                    <Typography className='habit-date-button-text'>Prev Week</Typography>
                </Button> 
                <DatePicker 
                    inputFormat="dd/MM/yyyy" className={`habit-date-picker date-picker`} desktopModeMediaQuery='@media (min-width:769px)'
                    renderInput={(props) => <TextField size='small' className={`focus date-picker habit-date`}  {...props} />}
                    value={state.selectedDateWeekStart} onChange={(newDate:Date|null)=>{loadSelectedDateData(newDate);}} maxDate={new Date(nextWeekStart)}
                />
                <DatePicker 
                    inputFormat="dd/MM/yyyy" className={`habit-date-picker date-picker`} desktopModeMediaQuery='@media (min-width:769px)'
                    renderInput={(props) => <TextField size='small' className={`focus date-picker habit-date`}  {...props} />}
                    value={state.selectedDateWeekEnd} onChange={(newDate:Date|null)=>{loadSelectedDateData(newDate);}} disabled
                />
                <Button disabled={state.isCurrentWeek ? true : false} variant='outlined' className={`button habit-date-button`} onClick={()=>{loadSelectedDateData(new Date(state.selectedDateWeekStart.getTime() + 86400000 * 7))}}>
                    <Typography className='habit-date-button-text'>Next Week</Typography>
                    <CgArrowRight className='habit-date-button-icon icon-interactive nav-icon' />
                </Button> 
            </Box>
            {habitLoading ? <Loading height='80vh'/> : 
            <Box className={`habit-list scale-in`}>
                {filteredList.map((habitListItem:HabitInterface)=>{
                    return (
                        <Card variant='elevation' className={`habit-list-item`} key={habitListItem._id}>
                            <Box className={`habit-list-item-title`} onClick={()=>{navigate(`${location.pathname}/${habitListItem._id}`)}}> 
                                <Typography className={`habit-list-item-title-text`}>{habitListItem.title}</Typography>
                            </Box>
                            {Object.values(habitListItem.entries).every(entry=> entry === null) ? 
                                <Button onClick={()=>{habitHooks.populateHabit(new Date(selectedDateWeekStart),habitListItem)}} className={`populate-week`}>Poplulate with Entries</Button> 
                                :<Box className={`habit-weekdays`}>
                                    {weekdays.map((weekday:number)=>{
                                        const habitEntry:HabitEntryInterface | null = habitListItem.entries[weekday];
                                        if(habitEntry) {
                                            const isCurrentDay = new Date(habitEntry.date).toLocaleDateString('en-GB') === new Date().toLocaleDateString('en-GB');
                                            return (
                                                <Box key={weekday} className={`habit-weekday`} onClick={()=>{habitHooks.changeHabitStatus(habitEntry,weekday)}}>
                                                    <Typography className={`habit-weekday-label ${isCurrentDay && 'current-day'}`}>{weekdaysList[weekday]}</Typography>
                                                    {habitEntry.status === 'Complete' ? 
                                                    <IoCheckboxOutline className={`icon-interactive habit-weekday-icon ${habitEntry.status}`} /> : 
                                                    <IoSquareOutline className={`icon-interactive habit-weekday-icon ${habitEntry.status}`} />}
                                                </Box>
                                            )
                                        } else {
                                            return null;
                                        }
                                    })}
                                </Box>
                            }
                        </Card>
                    )
                })}
            </Box>
            } 
        </Container>
    )
}

export default Habits
