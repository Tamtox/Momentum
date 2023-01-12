// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { todoActions,scheduleActions } from "../Store/Store";
import type {TodoInterface} from '../Misc/Interfaces';
import {createPairedScheduleItem,determineScheduleAction} from './Helper-functions';

const httpAddress = `http://localhost:3001`;

const useTodoHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    // Load todo data
    const loadTodoData = async (newToken?:string) => {
        dispatch(todoActions.setTodoLoading(true))
        try {
            const todoList = await axios.request({
                method:'GET',
                url:`${httpAddress}/todo/getTodos`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(todoActions.setToDoList(todoList.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(todoActions.setTodoLoading(false))   
        }  
    }
    // Load archived todo data
    const loadArchivedTodoData = async () => {
        dispatch(todoActions.setTodoLoading(true))
        try {
            const todoList = await axios.request({
                method:'GET',
                url:`${httpAddress}/todo/getArchivedTodos`,
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(todoActions.setArchivedToDoList(todoList.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(todoActions.setTodoLoading(false))   
        }
    }
    // Toggle Todo status
    const changeTodoStatus = async (newTodo:TodoInterface) => {
        const status = newTodo.status === "Pending" ?  "Complete" : "Pending";
        const dateCompleted =  newTodo.status === "Pending" ? new Date().toISOString() : null;
        const {targetDate,_id} = newTodo;
        try {
            await axios.request({
                method:'PATCH',
                url:`${httpAddress}/todo/updateTodo`,
                headers:{Authorization: `Bearer ${token}`},
                data:{...newTodo,status,dateCompleted}
            })
            // Dispatch schedule status update
            const scheduleItemUpdate = {date:targetDate,dateCompleted,status,parentId:_id,parentType:"todo"};
            dispatch(scheduleActions.updateScheduleItemStatus(scheduleItemUpdate));
            dispatch(todoActions.changeToDoStatus({_id,dateCompleted}));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    // Add todo 
    const addTodo = async (newTodo:TodoInterface) => {
        dispatch(todoActions.setTodoLoading(true))
        try {
            const newTodoResponse:{data:{todoId:string,scheduleId:string}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/todo/addNewTodo`,
                data:{...newTodo,timezoneOffset:new Date().getTimezoneOffset()},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {todoId,scheduleId} = newTodoResponse.data;
            newTodo._id = todoId
            if (newTodo.targetDate) {
                const {targetTime,targetDate,title,alarmUsed,creationUTCOffset,_id} = newTodo;
                const scheduleItem = await createPairedScheduleItem(targetTime,targetDate,title,'todo',_id,alarmUsed,creationUTCOffset,scheduleId);  
                dispatch(scheduleActions.addScheduleItem(scheduleItem));
            }
            dispatch(todoActions.addToDo(newTodo));    
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(todoActions.setTodoLoading(false))
        }
    }
    // Update todo
    const updateTodo = async (newTodo:TodoInterface,oldTodo:TodoInterface) => {
        dispatch(todoActions.setTodoLoading(true))
        // Determine the schedule action
        let scheduleAction:string|null = determineScheduleAction(newTodo.targetDate,oldTodo.targetDate);
        try {
            const updateTodoResponse:{data:{scheduleId:string}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/todo/updateTodo`,
                data:{...newTodo,timezoneOffset:new Date().getTimezoneOffset()},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {scheduleId} = updateTodoResponse.data;
            dispatch(todoActions.updateToDo(newTodo));
            // Check if schedule item needs to be added, deleted or updated  
            if (scheduleAction === "create") {
                const {targetTime,targetDate,title,alarmUsed,creationUTCOffset,_id} = newTodo;
                if (targetDate) {
                    const scheduleItem = await createPairedScheduleItem(targetTime,targetDate,title,'todo',_id,alarmUsed,creationUTCOffset,scheduleId);  
                    dispatch(scheduleActions.addScheduleItem(scheduleItem));
                }
            } else if (scheduleAction === "update") {
                dispatch(scheduleActions.updateScheduleItem({newItem:newTodo,oldItem:oldTodo}));
            } else if (scheduleAction === "delete") {
                dispatch(scheduleActions.deleteScheduleItem(newTodo));
            }
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(todoActions.setTodoLoading(false))
        }   
    }
    // Toggle archive status
    const toggleTodoArchiveStatus = async (todoItem:TodoInterface) => {
        dispatch(todoActions.setTodoLoading(true))   
        const isArchived = todoItem.isArchived ? false : true
        try {
            const todoResponse:{data:{scheduleId:string}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/todo/updateTodo`,
                headers:{Authorization: `Bearer ${token}`},
                data:{...todoItem,isArchived}
            })
            const {scheduleId} = todoResponse.data;
            // Set schedule item
            if (todoItem.targetDate && scheduleId) {
                const {targetTime,targetDate,title,alarmUsed,creationUTCOffset,_id} = todoItem;
                const scheduleItem = await createPairedScheduleItem(targetTime,targetDate,title,'todo',_id,alarmUsed,creationUTCOffset,scheduleId);  
                isArchived ? dispatch(scheduleActions.deleteScheduleItem({_id:todoItem._id,targetDate:todoItem.targetDate,parentType:"todo"})) : dispatch(scheduleActions.addScheduleItem(scheduleItem));
            }
            dispatch(todoActions.toggleArchiveStatus({...todoItem,isArchived:isArchived}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(todoActions.setTodoLoading(false))   
        }
    }
    // Delete Todo
    const deleteToDo = async (todoItem:TodoInterface) => {
        dispatch(todoActions.setTodoLoading(true))   
        try {
            await axios.request({
                method:'DELETE',
                url:`${httpAddress}/todo/deleteTodo`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id:todoItem._id}
            })
            dispatch(todoActions.deleteToDo(todoItem._id));
            todoItem.targetDate && dispatch(scheduleActions.deleteScheduleItem({_id:todoItem._id,targetDate:todoItem.targetDate,parentType:"todo"}));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(todoActions.setTodoLoading(false))   
        }  
    }
    return {loadTodoData,loadArchivedTodoData,changeTodoStatus,addTodo,updateTodo,toggleTodoArchiveStatus,deleteToDo}
}

export default useTodoHooks