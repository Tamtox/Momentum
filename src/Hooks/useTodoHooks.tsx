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
        }
        dispatch(todoActions.setTodoLoading(false))   
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
        }
        dispatch(todoActions.setTodoLoading(false))   
    }
    // Toggle Todo status
    const changeTodoStatus = async (_id:string,status:string) => {
        const dateCompleted = status === "Pending" ? new Date().toISOString() : '';
        try {
            await axios.request({
                method:'PATCH',
                url:`${httpAddress}/todo/updateTodo`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id,status:status ==="Pending" ? "Complete" : "Pending",dateCompleted}
            })
            dispatch(todoActions.changeToDoStatus({_id,dateCompleted}));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    // Add todo 
    const addTodo = async (newTodo:TodoInterface) => {
        try {
            const newTodoResponse:{data:{todoId:string,scheduleId:string}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/todo/addNewTodo`,
                data:{...newTodo,timezoneOffset:new Date().getTimezoneOffset()},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {todoId,scheduleId} = newTodoResponse.data;
            if (newTodo.targetDate) {
                const {targetTime,targetDate,title,alarmUsed,creationUTCOffset} = newTodo;
                const scheduleItem = await createPairedScheduleItem(targetTime,targetDate,title,'todo',todoId,alarmUsed,creationUTCOffset,scheduleId);  
                dispatch(scheduleActions.addScheduleItem(scheduleItem));
            }
            dispatch(todoActions.addToDo({...newTodo,_id:todoId}));    
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    // Update or add todo
    const updateTodo = async (newTodo:TodoInterface,oldTodo:TodoInterface) => {
        // Compare old and new items and send only updated fields
        // const updatedFields:TodoInterface = {...newTodo};
        // Object.keys(newTodo).forEach((key:string)=> {
        //     const key1 = key as keyof TodoInterface;
        //     if (key1 !== "_id" && (newTodo[key1] === oldTodo[key1])) {
        //         delete updatedFields[key1];
        //     }
        // })
        // Determine the schedule action
        let scheduleAction:string|null = determineScheduleAction(newTodo.targetDate,oldTodo.targetDate);
        try {
            const updateTodoResponse:{data:{scheduleId:string}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/todo/updateTodo`,
                data:{...newTodo,timezoneOffset:new Date().getTimezoneOffset(),scheduleAction},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {scheduleId} = updateTodoResponse.data;
            dispatch(todoActions.updateToDo(newTodo));
            // Check if schedule item needs to be added, deleted or updated  
            if (scheduleAction === "create") {
                const {targetTime,targetDate,title,alarmUsed,creationUTCOffset} = newTodo;
                if (targetDate) {
                    const scheduleItem = await createPairedScheduleItem(targetTime,targetDate,title,'todo',newTodo._id,alarmUsed,creationUTCOffset,scheduleId);  
                    dispatch(scheduleActions.addScheduleItem(scheduleItem));
                }
            } else if (scheduleAction === "update") {
                dispatch(scheduleActions.updateScheduleItem({newTodo,oldTodo}));
            } else if (scheduleAction === "delete") {
                dispatch(scheduleActions.deleteScheduleItem(newTodo));
            }
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    // Toggle archive status
    const toggleTodoArchiveStatus = async (todoItem:TodoInterface) => {
        dispatch(todoActions.setTodoLoading(true))   
        const isArchived = todoItem.isArchived ? false : true
        try {
            await axios.request({
                method:'PATCH',
                url:`${httpAddress}/todo/updateTodo`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id:todoItem._id,isArchived}
            })
            dispatch(todoActions.toggleArchiveStatus({...todoItem,isArchived:isArchived}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(todoActions.setTodoLoading(false))   
    }
    // Delete Todo
    const deleteToDo = async (todo:TodoInterface) => {
        dispatch(todoActions.setTodoLoading(true))   
        try {
            await axios.request({
                method:'DELETE',
                url:`${httpAddress}/todo/deleteTodo`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id:todo._id}
            })
            dispatch(todoActions.deleteToDo(todo._id));
            todo.targetDate && dispatch(scheduleActions.deleteScheduleItem({_id:todo._id,targetDate:todo.targetDate,parentType:"todo"}));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(todoActions.setTodoLoading(false))   
    }
    return {loadTodoData,loadArchivedTodoData,changeTodoStatus,addTodo,updateTodo,toggleTodoArchiveStatus,deleteToDo}
}

export default useTodoHooks