// Styles
import './Todo.scss';
// Components
import Toolbar from '../UI/Toolbar/Toolbar';
import Loading from '../Misc/Loading';
import {RootState} from '../../Store/Store';
import useTodoHooks from '../../Hooks/useTodoHooks';
import type {TodoInterface} from '../../Misc/Interfaces';
//Dependencies
import {useSelector} from 'react-redux';
import React,{useEffect} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {IoCheckmarkCircleOutline,IoEllipseOutline} from 'react-icons/io5';
import { Container,Typography,Card, Box} from '@mui/material';
import { sortByQueries } from '../../Misc/Helper-functions';

const Todo:React.FC = () => {
    const todoHooks = useTodoHooks();
    const todoList = useSelector<RootState,TodoInterface[]>(state=>state.todoSlice.todoList);
    const todoListLoaded = useSelector<RootState,boolean>(state=>state.todoSlice.todoListLoaded);
    const todoLoading = useSelector<RootState,boolean>(state=>state.todoSlice.todoLoading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    // Sorting by query params
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')]; 
    const filteredList = sortByQueries([...todoList],"todo",sortQuery,searchQuery);
    useEffect(() => {
        todoListLoaded || todoHooks.loadTodoData();
    }, [])
    return (
        <Container component="main" className={`todo ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Toolbar mode={'todo'} addNewItem={():any=>navigate(`${location.pathname}/new-todo`)}/>
            {todoLoading ? <Loading height='80vh'/>:
            <Box className="todo-list">
                {filteredList.map((todoItem:TodoInterface)=>{
                    return (
                        <Card variant='elevation' className={`todo-item scale-in`} key={todoItem._id}>
                            <Box className={`change-todo-status`} onClick={()=>{todoHooks.changeTodoStatus(todoItem)}}>
                                {todoItem.status === 'Complete' ? <IoCheckmarkCircleOutline className={`icon-interactive ${todoItem.status}`} /> : <IoEllipseOutline className={`icon-interactive ${todoItem.status}`}/>}
                            </Box>
                            <Box  className={`todo-item-title`} onClick={()=>{navigate(`${location.pathname}/${todoItem._id}`)}}>
                                <Typography className='todo-item-title-text'>{todoItem.title}</Typography>
                            </Box>
                        </Card>
                    )
                })}
            </Box>}
        </Container>
    )
}

export default Todo