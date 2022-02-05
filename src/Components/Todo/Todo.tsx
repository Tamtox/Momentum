// Styles
import './Todo.scss';
// Components
import Loading from '../Misc/Loading';
import { todoActions,authActions } from '../../Store/Store';
import {RootState} from '../../Store/Store';
import AddNewTodo from './Add-new-todo';
//Dependencies
import Cookies from "js-cookie";
import {useSelector,useDispatch} from 'react-redux';
import axios from "axios";
import React,{useState,useRef,useEffect} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import { Icon } from '@iconify/react';
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
    const dispatch = useDispatch();
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
    const [detailedItem,setDetailedItem] = useState()
     // Toggle Todo status
    const changeTodoStatus = async (_id:string,todoStatus:string) => {
        try {
            await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/todo/updateTodo`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id,todoStatus:todoStatus==="Pending"?"Complete":"Pending"}
            })
            dispatch(todoActions.changeToDoStatus(_id))
        } catch (error) {
            if (axios.isAxiosError(error)) {
                error.response !== undefined ? alert(error.response!.data) : alert(error.message)
            } else {
                console.log(error);
            }
        }   
    }
    // Delete Todo
    const deleteToDo = async (_id:string) => {
        try {
            await axios.request({
                method:'DELETE',
                url:`http://localhost:3001/todo/deleteTodo`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id:_id}
            })
            dispatch(todoActions.deleteToDo(_id))
        } catch (error) {
            if (axios.isAxiosError(error)) {
                error.response !== undefined ? alert(error.response!.data) : alert(error.message)
            } else {
                console.log(error);
            }
        }   
    }
     // Load todo data
    const loadTodoData = async () => {
        dispatch(authActions.setLoading(true))
        try {
            const todoList = await axios.request({
                method:'GET',
                url:`http://localhost:3001/todo/getTodos`,
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(todoActions.setToDoList(todoList.data))
        } catch (error) {
            if (axios.isAxiosError(error)) {
                error.response !== undefined ? alert(error.response!.data) : alert(error.message)
            } else {
                console.log(error);
            }
        }
        dispatch(authActions.setLoading(false))   
    }
    useEffect(() => {
        if(!!token && todoList.length<1) {
            loadTodoData()
        }
    }, [])
    return (
        <Container component="main" className={`todo ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Box className='todo-controls'>
                <FormControl className='sort-todo select' size='small'>
                    <InputLabel id="todo-sort-label">Sort</InputLabel>
                    <Select labelId="todo-sort-label" inputRef={sortRef} value={sortQueryOption} onChange={(event)=>{setSortQueryOption(event.target.value);setQueries(event.target.value)}} size='small' label="Sort">
                        <MenuItem value="">Default</MenuItem>
                        <MenuItem value="dateAsc">Date Ascending</MenuItem>
                        <MenuItem value="dateDesc">Date Descending</MenuItem>
                        <MenuItem value="statusPend">Status Pending</MenuItem>
                        <MenuItem value="statusComp">Status Complete</MenuItem>
                        
                    </Select>
                </FormControl>
                <TextField variant='outlined' inputRef={searchRef} onChange={()=>{setQueries()}} fullWidth size='small' label="Search"/>
                <Button variant="outlined"  className={`add-new-todo`} onClick={()=>{setToggleNewTodo(!toggleNewTodo)}}>New To Do</Button>
            </Box>
            {loading?
            <Loading height='100%'/>:
            <Box className="todo-list">
                {sortedList.map((todoItem)=>{
                    return (
                        <Card variant='elevation' className={`todo-item scale-in`} key={todoItem._id}>
                            <Box className='todo-item-icons'>
                                <Icon onClick={()=>{changeTodoStatus(todoItem._id,todoItem.todoStatus)}} className={`change-todo-status-icon ${todoItem.todoStatus}`} icon={todoItem.todoStatus === 'Pending'?"akar-icons:circle":"akar-icons:circle-check"} />
                                <Icon onClick={()=>{setDetailedItem(todoItem);setToggleNewTodo(!toggleNewTodo)}} className={`detailed-todo-icon`} icon="feather:edit" />
                                <Icon onClick={()=>{deleteToDo(todoItem._id)}} className={`delete-todo-icon`} icon="clarity:remove-line" />
                            </Box>
                            <Typography className={`todo-item-title`}>{todoItem.todoTitle}</Typography>
                        </Card>
                    )
                })}
            </Box>}
            {toggleNewTodo && <AddNewTodo detailedItem={detailedItem} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToTodo={():any=>setToggleNewTodo(false)} />}
        </Container>
    )
}

export default Todo

