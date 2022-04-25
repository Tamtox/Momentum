// Styles
import './Archive.scss';
// Components
import Loading from '../Misc/Loading';
import {RootState} from '../../Store/Store';
import useTodoHooks from '../../Hooks/useTodoHooks';
import useHabitHooks from '../../Hooks/useHabitHooks';
import useGoalHooks from '../../Hooks/userGoalHooks';
//Dependencies
import {useSelector} from 'react-redux';
import React,{useState,useEffect} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import { Container,TextField,Button,Box,Typography,FormControl,InputLabel,Select,MenuItem,Card} from '@mui/material';

const filterList = (list:any[],sortQuery:string|null,searchQuery:string|null) => {
    if(sortQuery) {
        if (sortQuery === 'dateAsc') { list = list.sort((itemA,itemB)=> new Date(itemA.todoCreationDate).getTime() - new Date(itemB.todoCreationDate).getTime()) };
        if (sortQuery === 'dateDesc') { list = list.sort((itemA,itemB)=> new Date(itemB.todoCreationDate).getTime() - new Date(itemA.todoCreationDate).getTime()) };
        if (sortQuery === 'statusPend') { list = list.filter(item=>item.todoStatus === 'Pending') };
        if (sortQuery === 'statusComp') { list = list.filter(item=>item.todoStatus === 'Complete') };
    }
    if(searchQuery) {
        list = list.filter(item=>item.todoTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list
}

const Archive:React.FC = () => {
    const todoHooks = useTodoHooks();
    const habitHooks = useHabitHooks();
    const goalHooks = useGoalHooks();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const todoArchive = useSelector<RootState,{todoTitle:string,todoDescription:string,todoCreationDate:string,todoTargetDate:string|null,todoStatus:string,_id:string}[]>(state=>state.todoSlice.archivedTodoList);
    const habitArchive = useSelector<RootState,{habitTitle:string,habitTime:string|null,habitCreationDate:string,habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},goalId:string|null,goalTargetDate:string|null,_id:string}[]>(state=>state.habitsSlice.archivedHabitList)
    const goalArchive = useSelector<RootState,{goalTitle:string,goalCreationDate:string,goalTargetDate:string|null,goalStatus:string,habitId:string|null,_id:string}[]>(state=>state.goalSlice.archivedGoalList)
    const todoArchiveLoaded = useSelector<RootState,boolean>(state=>state.todoSlice.archivedTodoListLoaded);
    const habitArchiveLoaded = useSelector<RootState,boolean>(state=>state.habitsSlice.archivedHabitListLoaded)
    const goalArchiveLoaded = useSelector<RootState,boolean>(state=>state.goalSlice.archivedGoalListLoaded)
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    // Archive mode
    const [archiveMode,setArchiveMode] = useState('todo');
    // Sorting by query params
    const [navigate,location] = [useNavigate(),useLocation()];
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')] 
    function setQueries(sortQuery:string|null,searchQuery:string|null) {
        const sortQueryString = sortQuery ? `?sort=${sortQuery}` : ''
        const searchQueryString = searchQuery ? sortQuery ? `&search=${searchQuery}` : `?search=${searchQuery}` : ''
        navigate(`/archive${sortQueryString}${searchQueryString}`);
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
    let unfilteredList:any[] = [] ;
    if(archiveMode === 'todo') {unfilteredList = [...todoArchive]}
    if(archiveMode === 'habit') {unfilteredList = [...habitArchive]}
    if(archiveMode === 'goal') {unfilteredList = [...goalArchive]}
    const filteredList = filterList(unfilteredList,sortQuery,searchQuery);
    // Restore from archive
    const restoreItem = (item:{_id:string,isArchived:boolean}) => {
        archiveMode === 'todo' &&  todoHooks.toggleTodoArchiveStatus(item);
        archiveMode === 'goal' &&  goalHooks.toggleGoalArchiveStatus(item);
        archiveMode === 'habit' &&  habitHooks.toggleHabitArchiveStatus(item);
    }
    useEffect(() => {
        (archiveMode === 'todo' && todoArchiveLoaded) || todoHooks.loadArchivedTodoData();
        if(archiveMode === 'goal' || archiveMode === 'habit') {
            goalArchiveLoaded || goalHooks.loadArchivedGoalData();
            habitArchiveLoaded || habitHooks.loadArchivedHabitsData();
        }
    }, [archiveMode])
    return (
        <Container component="main" className={`archive ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Box className={`archive-controls${isDarkMode?'-dark':''}`}>
                <FormControl className='sort-archive select select' size='small' >
                    <InputLabel id="archive-sort-label">Sort</InputLabel>
                    <Select labelId="archive-sort-label" value={queries.sortQuery} onChange={sortQueryHandler} size='small' label="Sort">
                        <MenuItem value="">Default</MenuItem>
                        <MenuItem value="dateAsc">Creation Date Ascending</MenuItem>
                        <MenuItem value="dateDesc">Creation Date Descending</MenuItem>
                        <MenuItem value="statusPend">Status Pending</MenuItem>
                        <MenuItem value="statusComp">Status Complete</MenuItem>
                    </Select>
                </FormControl>
                <TextField className={`search-archive`} sx={{width:"calc(min(100%, 33rem))"}} variant='outlined' value={queries.searchQuery} onChange={searchQueryHandler}  size='small' label="Search"/>
                <FormControl className='archive-mode select' size='small' >
                    <InputLabel id="archive-mode-label">Mode</InputLabel>
                    <Select labelId="archive-mode-label" value={archiveMode} onChange={(e)=>{setArchiveMode(e.target.value)}} size='small' label="Sort">
                        <MenuItem value="todo">To Do</MenuItem>
                        <MenuItem value="habit">Habits</MenuItem>
                        <MenuItem value="goal">Goals</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            {loading?
            <Loading height='80vh'/>:
            <Box className="archive-list">
                {filteredList.map((archiveItem)=>{
                    return (
                        <Card variant='elevation' className={`archive-item scale-in`} key={archiveItem._id}>
                            <Button className={`restore-item`} onClick={()=>{restoreItem(archiveItem)}}>Restore</Button>
                            <Box  className={`archive-item-title`}>
                                <Typography className='archive-item-title-text'>{archiveItem[`${archiveMode}Title`]}</Typography>
                            </Box>
                        </Card>
                    )
                })}
            </Box>}
        </Container>
    )
}

export default Archive

