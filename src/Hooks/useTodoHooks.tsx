// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { todoActions,authActions } from "../Store/Store";

const useTodoHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    // Load todo data
    const loadTodoData = async (newToken?:string) => {
        dispatch(authActions.setLoading(true))
        try {
            const todoList = await axios.request({
                method:'GET',
                url:`http://localhost:3001/todo/getTodos`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(todoActions.setToDoList(todoList.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))   
    }
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
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    // Update or add todo
    const updateTodo = async (newTodo:{},update:boolean) => {
        try {
            const newTodoResponse = await axios.request({
                method:update ? 'PATCH' : 'POST',
                url:`http://localhost:3001/todo/${update ? 'updateTodo' : 'addNewTodo'}`,
                data:newTodo,
                headers:{Authorization: `Bearer ${token}`}
            })
            update ? dispatch(todoActions.updateToDo(newTodo)) : dispatch(todoActions.addToDo(newTodoResponse.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
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
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    return {loadTodoData,changeTodoStatus,updateTodo,deleteToDo}
}

export default useTodoHooks