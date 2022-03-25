// Styles
import './Todo.scss';
// Components
import Loading from '../Misc/Loading';
import {RootState} from '../../Store/Store';
import AddNewTodo from './Add-new-todo';
import useTodoHooks from '../../Hooks/useTodoHooks';
import useAuthHooks from '../../Hooks/useAuthHooks';
//Dependencies
import {useSelector} from 'react-redux';
import Cookies from 'js-cookie';
import React,{useState,useRef,useEffect} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import {FiEdit} from 'react-icons/fi';
import {IoCheckmarkCircleOutline,IoCloseCircleOutline,IoEllipseOutline} from 'react-icons/io5';
import { Container,TextField,Button,Box,Typography,FormControl,InputLabel,Select,MenuItem,Card} from '@mui/material';

// Sorting algorithm
function sortList(list:any[],sortQuery:string|null,searchQuery:string|null) {
    if(sortQuery === 'dateAsc') {
        list = list.sort((itemA,itemB)=> new Date(itemA.todoCreationDate).getTime() - new Date(itemB.todoCreationDate).getTime())
    } else if(sortQuery === 'dateDesc') {
        list = list.sort((itemA,itemB)=> new Date(itemB.todoCreationDate).getTime() - new Date(itemA.todoCreationDate).getTime())
    } else if(sortQuery === 'statusPend') {
        list = list.filter(item=>item.todoStatus === 'Pending')
    } else if(sortQuery === 'statusComp') {
        list = list.filter(item=>item.todoStatus === 'Complete')
    }
    if(!!searchQuery) {
        list = list.filter(item=>item.todoTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list
}


const Todo:React.FC = () => {
    const token = Cookies.get('token');
    const AuthHooks = useAuthHooks();
    const todoHooks = useTodoHooks();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const todoList = useSelector<RootState,{todoTitle:string,todoDescription:string,todoCreationDate:string,todoTargetDate:string|null,todoStatus:string,_id:string}[]>(state=>state.todoSlice.todoList);
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
     // Sorting by query params
    const [sortRef,searchRef] = [useRef<HTMLSelectElement>(null),useRef<HTMLInputElement>(null)] 
    const [navigate,location] = [useNavigate(),useLocation()];
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')] 
    const sortedList = sortList([...todoList],sortQuery,searchQuery);
    const [sortQueryOption,setSortQueryOption] = useState('');
    function setQueries(newSortQuery?:string) {
        const [sortInput,searchInput] = [newSortQuery,searchRef.current!.value];
        if(!!sortInput) {
            if(!!searchInput) {
                navigate(`/todo?sort=${sortInput}&search=${searchInput}`);
            } 
            else if(!!searchInput === false) {
                navigate(`/todo?sort=${sortInput}`);
            }
        } 
        else if(!!sortInput === false) {
            if(!!searchInput) {
                navigate(`/todo?search=${searchInput}`);
            } else {
                navigate(`/todo`)
            }
        }
    }
    // Toggle new/detailed todo
    const [toggleNewTodo,setToggleNewTodo] = useState(false);
    // Set detailed id
    const [detailedItem,setDetailedItem] = useState();
    useEffect(() => {
        if (token) {
            todoList.length<1 && todoHooks.loadTodoData();
        } else { 
            AuthHooks.logout();
        }
    }, [])
    return (
        <Container component="main" className={`todo ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Box className={`todo-controls${isDarkMode?'-dark':''}`}>
                <FormControl className='sort-todo select' size='small' >
                    <InputLabel id="todo-sort-label">Sort</InputLabel>
                    <Select labelId="todo-sort-label" inputRef={sortRef} value={sortQueryOption} onChange={(event)=>{setSortQueryOption(event.target.value);setQueries(event.target.value)}} size='small' label="Sort">
                        <MenuItem value="">Default</MenuItem>
                        <MenuItem value="dateAsc">Creation Date Ascending</MenuItem>
                        <MenuItem value="dateDesc">Creation Date Descending</MenuItem>
                        <MenuItem value="statusPend">Status Pending</MenuItem>
                        <MenuItem value="statusComp">Status Complete</MenuItem>
                    </Select>
                </FormControl>
                <TextField className={`search-todo`} sx={{width:"calc(min(100%, 33rem))"}} variant='outlined' inputRef={searchRef} onChange={()=>{setQueries()}}  size='small' label="Search"/>
                <Button variant="outlined"  className={`add-new-todo`} onClick={()=>{setToggleNewTodo(!toggleNewTodo)}}>New To Do</Button>
            </Box>
            {loading?
            <Loading height='80vh'/>:
            <Box className="todo-list">
                {sortedList.map((todoItem)=>{
                    return (
                        <Card variant='elevation' className={`todo-item scale-in`} key={todoItem._id}>
                            <Box className='todo-item-icons'>
                                {todoItem.todoStatus === 'Complete' ? <IoCheckmarkCircleOutline onClick={()=>{todoHooks.changeTodoStatus(todoItem._id,todoItem.todoStatus)}} className={`icon-interactive change-todo-status-icon ${todoItem.todoStatus}`} /> : <IoEllipseOutline onClick={()=>{todoHooks.changeTodoStatus(todoItem._id,todoItem.todoStatus)}} className={`icon-interactive change-todo-status-icon ${todoItem.todoStatus}`}/>}
                                <FiEdit onClick={()=>{setDetailedItem(todoItem);setToggleNewTodo(!toggleNewTodo)}} className={`icon-interactive detailed-todo-icon`}/>
                                <IoCloseCircleOutline onClick={()=>{todoHooks.deleteToDo(todoItem._id)}} className={`icon-interactive delete-todo-icon`}/>
                            </Box>
                            <Typography className={`todo-item-title`}>{todoItem.todoTitle}</Typography>
                        </Card>
                    )
                })}
            </Box>}
            {toggleNewTodo && <AddNewTodo detailedTodo={detailedItem} toggleNewTodo={toggleNewTodo} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToTodo={():any=>setToggleNewTodo(false)} />}
        </Container>
    )
}

export default Todo

