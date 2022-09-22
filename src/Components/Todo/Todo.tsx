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
import { Container,Typography,Card} from '@mui/material';

const filterList = (list:TodoInterface[],sortQuery:string|null,searchQuery:string|null) => {
    if(sortQuery) {
        if (sortQuery === 'dateAsc') { list = list.sort((itemA,itemB)=> new Date(itemA.creationDate).getTime() - new Date(itemB.creationDate).getTime()) };
        if (sortQuery === 'dateDesc') { list = list.sort((itemA,itemB)=> new Date(itemB.creationDate).getTime() - new Date(itemA.creationDate).getTime()) };
        if (sortQuery === 'statusPend') { list = list.filter(item=>item.status === 'Pending') };
        if (sortQuery === 'statusComp') { list = list.filter(item=>item.status === 'Complete') };
    }
    if(searchQuery) {
        list = list.filter((item)=>{
            if(item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item._id.includes(searchQuery.toLowerCase())) {
                return item;
            } else {
                return false;
            }
        });
    }
    return list
}

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
    const filteredList = filterList([...todoList],sortQuery,searchQuery);
    useEffect(() => {
        todoListLoaded || todoHooks.loadTodoData();
    }, [])
    return (
        <Container component="main" className={`todo ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Toolbar mode={'todo'} addNewItem={():any=>navigate(`${location.pathname}/new-todo`)}/>
            {todoLoading ? <Loading height='80vh'/>:
            <div className="todo-list">
                {filteredList.map((todoItem:TodoInterface)=>{
                    return (
                        <Card variant='elevation' className={`todo-item scale-in`} key={todoItem._id}>
                            <div className={`change-todo-status`} onClick={()=>{todoHooks.changeTodoStatus(todoItem._id,todoItem.status)}}>
                                {todoItem.status === 'Complete' ? <IoCheckmarkCircleOutline className={`icon-interactive ${todoItem.status}`} /> : <IoEllipseOutline className={`icon-interactive ${todoItem.status}`}/>}
                            </div>
                            <div  className={`todo-item-title`} onClick={()=>{navigate(`${location.pathname}/${todoItem._id}`)}}>
                                <Typography className='todo-item-title-text'>{todoItem.title}</Typography>
                            </div>
                        </Card>
                    )
                })}
            </div>}
        </Container>
    )
}

export default Todo
