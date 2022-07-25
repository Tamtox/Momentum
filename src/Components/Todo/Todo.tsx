// Styles
import './Todo.scss';
// Components
import Loading from '../Misc/Loading';
import {RootState} from '../../Store/Store';
import AddNewTodo from './Add-new-todo';
import useTodoHooks from '../../Hooks/useTodoHooks';
import type {TodoInterface} from '../../Misc/Interfaces';
//Dependencies
import {useSelector} from 'react-redux';
import React,{useState,useEffect} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import {IoCheckmarkCircleOutline,IoEllipseOutline,IoCloseCircleOutline} from 'react-icons/io5';
import { Container,Button,Typography,FormControl,InputLabel,Select,MenuItem,Card,OutlinedInput,InputAdornment} from '@mui/material';

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

const Todo:React.FC = () => {
    const todoHooks = useTodoHooks();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const todoList = useSelector<RootState,TodoInterface[]>(state=>state.todoSlice.todoList);
    const todoListLoaded = useSelector<RootState,boolean>(state=>state.todoSlice.todoListLoaded);
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
    const filteredList = filterList([...todoList],sortQuery,searchQuery);
    // Toggle new/detailed todo
    const [toggleNewTodo,setToggleNewTodo] = useState(false);
    // Set detailed id
    const [detailedItem,setDetailedItem] = useState<TodoInterface|undefined>();
    useEffect(() => {
        todoListLoaded || todoHooks.loadTodoData();
    }, [])
    return (
        <Container component="main" className={`todo ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <div className={`todo-controls${isDarkMode?'-dark':''} scale-in`}>
                <FormControl className='sort-todo select' size='small' >
                    <InputLabel id="todo-sort-label">Sort</InputLabel>
                    <Select labelId="todo-sort-label" value={queries.sortQuery} onChange={sortQueryHandler} size='small' label="Sort">
                        <MenuItem value="">All Todo Items</MenuItem>
                        <MenuItem value="dateAsc">Creation Date Ascending</MenuItem>
                        <MenuItem value="dateDesc">Creation Date Descending</MenuItem>
                        <MenuItem value="statusPend">Status Pending</MenuItem>
                        <MenuItem value="statusComp">Status Complete</MenuItem>
                    </Select>
                </FormControl>
                <FormControl className={`search-todo`} sx={{width:"calc(min(100%, 33rem))"}} size='small' variant="outlined">
                    <InputLabel>Search</InputLabel>
                    <OutlinedInput value={queries.searchQuery} onChange={(e)=>{searchQueryHandler(e.target.value)}} label="Search" 
                        endAdornment={<InputAdornment position="end">{!!queries.searchQuery.length && <IoCloseCircleOutline onClick={()=>{searchQueryHandler('')}} className={`icon-interactive opacity-transition clear-input`}/>}</InputAdornment>}
                    />
                </FormControl>
                <Button variant="outlined"  className={`add-new-todo`} onClick={()=>{setToggleNewTodo(!toggleNewTodo)}}>New To Do</Button>
            </div>
            {loading?
            <Loading height='80vh'/>:
            <div className="todo-list">
                {filteredList.map((todoItem:TodoInterface)=>{
                    return (
                        <Card variant='elevation' className={`todo-item scale-in`} key={todoItem._id}>
                            <div className={`change-todo-status`} onClick={()=>{todoHooks.changeTodoStatus(todoItem._id,todoItem.status)}}>
                                {todoItem.status === 'Complete' ? <IoCheckmarkCircleOutline className={`icon-interactive ${todoItem.status}`} /> : <IoEllipseOutline className={`icon-interactive ${todoItem.status}`}/>}
                            </div>
                            <div  className={`todo-item-title`} onClick={()=>{setDetailedItem(todoItem);setToggleNewTodo(!toggleNewTodo)}}>
                                <Typography className='todo-item-title-text'>{todoItem.title}</Typography>
                            </div>
                        </Card>
                    )
                })}
            </div>}
            {toggleNewTodo && <AddNewTodo detailedTodo={detailedItem} toggleNewTodo={toggleNewTodo} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToTodo={():any=>setToggleNewTodo(false)} />}
        </Container>
    )
}

export default Todo

