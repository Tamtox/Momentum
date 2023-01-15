// Styles
import './Archive.scss';
// Components
import Loading from '../Misc/Loading';
import Toolbar from '../UI/Toolbar/Toolbar';
import {RootState} from '../../Store/Store';
import useTodoHooks from '../../Hooks/useTodoHooks';
import useHabitHooks from '../../Hooks/useHabitHooks';
import useGoalHooks from '../../Hooks/userGoalHooks';
import type { TodoInterface,GoalInterface,HabitInterface } from '../../Misc/Interfaces';
//Dependencies
import {useSelector} from 'react-redux';
import React,{useState,useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import { Container,Button,Typography,Card,Box} from '@mui/material';
import { sortByQueries } from '../../Misc/Helper-functions';

const Archive:React.FC = () => {
    const todoHooks = useTodoHooks();
    const habitHooks = useHabitHooks();
    const goalHooks = useGoalHooks();
    const todoArchive = useSelector<RootState,TodoInterface[]>(state=>state.todoSlice.archivedTodoList);
    const habitArchive = useSelector<RootState,HabitInterface[]>(state=>state.habitsSlice.archivedHabitList)
    const goalArchive = useSelector<RootState,GoalInterface[]>(state=>state.goalSlice.archivedGoalList)
    const todoArchiveLoaded = useSelector<RootState,boolean>(state=>state.todoSlice.archivedTodoListLoaded);
    const habitArchiveLoaded = useSelector<RootState,boolean>(state=>state.habitsSlice.archivedHabitListLoaded)
    const goalArchiveLoaded = useSelector<RootState,boolean>(state=>state.goalSlice.archivedGoalListLoaded)
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    // Archive mode
    const [archiveMode,setArchiveMode] = useState('todo');
    const setArchiveModeHandler = (newMode:any):any => {
        setArchiveMode(newMode);
    }
    // Sorting by query params
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')] ;
    let unfilteredList:any[] = [] ;
    if(archiveMode === 'todo') {unfilteredList = [...todoArchive]}
    if(archiveMode === 'habit') {unfilteredList = [...habitArchive]}
    if(archiveMode === 'goal') {unfilteredList = [...goalArchive]}
    const filteredList = sortByQueries(unfilteredList,archiveMode,sortQuery,searchQuery);
    // Restore from archive
    const restoreItem = (item:any) => {
        if(archiveMode === 'todo') {
            todoHooks.toggleTodoArchiveStatus(item);
        } else if( archiveMode === 'goal') {
            goalHooks.toggleGoalArchiveStatus(item);
        } else if(archiveMode === 'habit') {
            habitHooks.toggleHabitArchiveStatus(item);
        }
    }
    useEffect(() => {
        (archiveMode === 'todo' && todoArchiveLoaded) || todoHooks.loadArchivedTodoData();
        (archiveMode === 'goal' && goalArchiveLoaded) || goalHooks.loadArchivedGoalData();
        (archiveMode === 'habit' && habitArchiveLoaded) || habitHooks.loadArchivedHabitsData();
    }, [archiveMode])
    return (
        <Container component="main" className={`archive ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Toolbar mode={"archive"} archiveMode={archiveMode} setArchiveMode={(e:any):any=>{setArchiveModeHandler(e.target.value)}}/>
            {loading? <Loading height='80vh'/> :
            <Box className="archive-list">
                {filteredList.map((archiveItem)=>{
                    return (
                        <Card variant='elevation' className={`archive-item scale-in`} key={archiveItem._id}>
                            <Button className={`restore-item`} onClick={()=>{restoreItem(archiveItem)}}>Restore</Button>
                            <Box  className={`archive-item-title`}>
                                <Typography className='archive-item-title-text'>{archiveItem.title}</Typography>
                            </Box>
                        </Card>
                    )
                })}
            </Box>}
        </Container>
    )
}

export default Archive