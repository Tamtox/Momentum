// Styles
import './Todo.scss';
// Components
import Loading from '../Misc/Loading';
import {RootState} from '../../Store/Store';
import AddNewTodo from './Add-new-todo';
import useTodoHooks from '../../Hooks/useTodoHooks';
//Dependencies
import {useSelector} from 'react-redux';
import React,{useState,useEffect} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import {IoCheckmarkCircleOutline,IoEllipseOutline} from 'react-icons/io5';
import { Container,TextField,Button,Box,Typography,FormControl,InputLabel,Select,MenuItem,Card} from '@mui/material';

const filterList = (list:any[],sortQuery:string|null,searchQuery:string|null) => {
    if(sortQuery) {
        if (sortQuery === 'dateAsc') { list = list.sort((itemA,itemB)=> new Date(itemA.todoCreationDate).getTime() - new Date(itemB.todoCreationDate).getTime()) };
        if (sortQuery === 'dateDesc') { list = list.sort((itemA,itemB)=> new Date(itemB.todoCreationDate).getTime() - new Date(itemA.todoCreationDate).getTime()) };
        if (sortQuery === 'statusPend') { list = list.filter(item=>item.todoStatus === 'Pending') };
        if (sortQuery === 'statusComp') { list = list.filter(item=>item.todoStatus === 'Complete') };
        if (sortQuery === 'isArchived') { list = list.filter(item=>item.isArchived === true) };
    }
    if(searchQuery) {
        list = list.filter(item=>item.todoTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list
}

const Todo:React.FC = () => {
    const todoHooks = useTodoHooks();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const archiveLoaded = useSelector<RootState,boolean>(state=>state.todoSlice.archiveLoaded);
    const todoList = useSelector<RootState,{todoTitle:string,todoDescription:string,todoCreationDate:string,todoTargetDate:string|null,todoStatus:string,_id:string}[]>(state=>state.todoSlice.todoList);
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    // Sorting by query params
    const [navigate,location] = [useNavigate(),useLocation()];
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')] 
    function setQueries(sortQuery:string|null,searchQuery:string|null) {
        const sortQueryString = sortQuery ? `?sort=${sortQuery}` : ''
        const searchQueryString = searchQuery ? sortQuery ? `&search=${searchQuery}` : `?search=${searchQuery}` : ''
        navigate(`/todo${sortQueryString}${searchQueryString}`);
    }
    const [queries,setNewQueries] = useState({sortQuery:searchQuery || '',searchQuery:searchQuery || ''}) ;
    const sortQueryHandler = (e:any) => {
        if(e.target.value === 'isArchived') {
            !archiveLoaded && todoHooks.loadArchivedTodoData();
        }
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
    const filteredList = filterList([...todoList],sortQuery,searchQuery);
    // Toggle new/detailed todo
    const [toggleNewTodo,setToggleNewTodo] = useState(false);
    // Set detailed id
    const [detailedItem,setDetailedItem] = useState();
    useEffect(() => {
        todoList.length<1 && todoHooks.loadTodoData();
        sortQuery === 'isArchived' && !archiveLoaded && todoHooks.loadArchivedTodoData()
    }, [])
    return (
        <Container component="main" className={`todo ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Box className={`todo-controls${isDarkMode?'-dark':''}`}>
                <FormControl className='sort-todo select' size='small' >
                    <InputLabel id="todo-sort-label">Sort</InputLabel>
                    <Select labelId="todo-sort-label" value={queries.sortQuery} onChange={sortQueryHandler} size='small' label="Sort">
                        <MenuItem value="">Default</MenuItem>
                        <MenuItem value="dateAsc">Creation Date Ascending</MenuItem>
                        <MenuItem value="dateDesc">Creation Date Descending</MenuItem>
                        <MenuItem value="statusPend">Status Pending</MenuItem>
                        <MenuItem value="statusComp">Status Complete</MenuItem>
                        <MenuItem value="isArchived">Archived Items</MenuItem>
                    </Select>
                </FormControl>
                <TextField className={`search-todo`} sx={{width:"calc(min(100%, 33rem))"}} variant='outlined' value={queries.searchQuery} onChange={searchQueryHandler}  size='small' label="Search"/>
                <Button variant="outlined"  className={`add-new-todo`} onClick={()=>{setToggleNewTodo(!toggleNewTodo)}}>New To Do</Button>
            </Box>
            {loading?
            <Loading height='80vh'/>:
            <Box className="todo-list">
                {filteredList.map((todoItem)=>{
                    return (
                        <Card variant='elevation' className={`todo-item scale-in`} key={todoItem._id}>
                            <Box className={`change-todo-status`} onClick={()=>{todoHooks.changeTodoStatus(todoItem._id,todoItem.todoStatus)}}>
                                {todoItem.todoStatus === 'Complete' ? <IoCheckmarkCircleOutline className={`icon-interactive ${todoItem.todoStatus}`} /> : <IoEllipseOutline className={`icon-interactive ${todoItem.todoStatus}`}/>}
                            </Box>
                            <Box  className={`todo-item-title`} onClick={()=>{setDetailedItem(todoItem);setToggleNewTodo(!toggleNewTodo)}}>
                                <Typography className='todo-item-title-text'>{todoItem.todoTitle}</Typography>
                            </Box>
                        </Card>
                    )
                })}
            </Box>}
            {toggleNewTodo && <AddNewTodo detailedTodo={detailedItem} toggleNewTodo={toggleNewTodo} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToTodo={():any=>setToggleNewTodo(false)} />}
        </Container>
    )
}

export default Todo

