// Styles
import './Todo.scss';
// Components
import Loading from '../Misc/Loading';
import {RootState} from '../../Store/Store';
import AddNewTodo from './Add-new-todo';
import useTodoHooks from '../../Hooks/useTodoHooks';
//Dependencies
import {useSelector} from 'react-redux';
import React,{useState,useRef} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Container,TextField,Button,Box,Typography,FormControl,InputLabel,Select,MenuItem,Card,Tooltip} from '@mui/material';

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
    const [detailedItem,setDetailedItem] = useState()
    return (
        <Container component="main" className={`todo ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Box className={`todo-controls${isDarkMode?'-dark':''}`}>
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
                                <Tooltip enterDelay={500} {...{ 'title':`Status : ${todoItem.todoStatus}`,'children':<Icon onClick={()=>{todoHooks.changeTodoStatus(todoItem._id,todoItem.todoStatus)}} className={`icon-interactive change-todo-status-icon ${todoItem.todoStatus}`} icon={`akar-icons:circle${todoItem.todoStatus === 'Complete' ? '-check' : ''}`} />}}/>
                                <Tooltip enterDelay={500} {...{ 'title':`Edit`,'children':<Icon onClick={()=>{setDetailedItem(todoItem);setToggleNewTodo(!toggleNewTodo)}} className={`icon-interactive detailed-todo-icon`} icon="feather:edit" />}}/>
                                <Tooltip enterDelay={500} {...{ 'title':`Delete`,'children':<Icon onClick={()=>{todoHooks.deleteToDo(todoItem._id)}} className={`icon-interactive delete-todo-icon`} icon="clarity:remove-line" />}}/>
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

