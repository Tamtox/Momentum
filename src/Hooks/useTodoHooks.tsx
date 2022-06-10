// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { todoActions,authActions } from "../Store/Store";
import type {TodoInterface} from '../Misc/Interfaces';

const httpAddress = `http://localhost:3001`;

const useTodoHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    // Load todo data
    const loadTodoData = async (newToken?:string) => {
        dispatch(authActions.setLoading(true))
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
        dispatch(authActions.setLoading(false))   
    }
    // Load archived todo data
    const loadArchivedTodoData = async () => {
        dispatch(authActions.setLoading(true))
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
        dispatch(authActions.setLoading(false))   
    }
    // Toggle Todo status
    const changeTodoStatus = async (_id:string,todoStatus:string) => {
        const dateCompleted = todoStatus==="Pending" ? new Date().toISOString() : '';
        try {
            await axios.request({
                method:'PATCH',
                url:`${httpAddress}/todo/updateTodo`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id,todoStatus:todoStatus==="Pending" ? "Complete" : "Pending",dateCompleted}
            })
            dispatch(todoActions.changeToDoStatus({_id,dateCompleted}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    // Update or add todo
    const updateTodo = async (newTodo:TodoInterface,update:boolean) => {
        try {
            const newTodoResponse = await axios.request({
                method:update ? 'PATCH' : 'POST',
                url:`${httpAddress}/todo/${update ? 'updateTodo' : 'addNewTodo'}`,
                data:{...newTodo,timezoneOffset:new Date().getTimezoneOffset()},
                headers:{Authorization: `Bearer ${token}`}
            })
            update ? dispatch(todoActions.updateToDo(newTodo)) : dispatch(todoActions.addToDo(newTodoResponse.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    // Toggle archive status
    const toggleTodoArchiveStatus = async (todoItem:TodoInterface) => {
        dispatch(authActions.setLoading(true))   
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
        dispatch(authActions.setLoading(false))   
    }
    // Delete Todo
    const deleteToDo = async (_id:string) => {
        dispatch(authActions.setLoading(true))   
        try {
            await axios.request({
                method:'DELETE',
                url:`${httpAddress}/todo/deleteTodo`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id:_id}
            })
            dispatch(todoActions.deleteToDo(_id))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(authActions.setLoading(false))   
    }
    return {loadTodoData,loadArchivedTodoData,changeTodoStatus,updateTodo,toggleTodoArchiveStatus,deleteToDo}
}

export default useTodoHooks