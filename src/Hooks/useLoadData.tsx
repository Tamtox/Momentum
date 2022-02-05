// Dependencies
import { useEffect } from "react";
import Cookies from "js-cookie";
import {useSelector,useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { todoActions,habitsActions,scheduleActions,journalActions,authActions } from "../Store/Store";
import { RootState } from "../Store/Store";

const useLoadData = (loadComponentData:string[]) => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const todoList = useSelector<RootState,{todoTitle:string,todoDescription:string,todoCreationDate:string,todoTargetDate:string|null,todoStatus:string,_id:string}[]>(state=>state.todoSlice.todoList);
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
                error.response !== undefined?alert(error.response!.data):alert(error.message)
            } else {
                console.log(error);
            }
        }
        dispatch(authActions.setLoading(false))   
    }
    // Load habit data
    const loadHabitData = async () => {
        dispatch(authActions.setLoading(true))
            try{
            } catch (error) {
            if (axios.isAxiosError(error)) {
                error.response !== undefined?alert(error.response!.data):alert(error.message)
            } else {
                console.log(error);
            }
        }
    }
    // Load schedule data
    const loadScheduleData = async () => {
        dispatch(authActions.setLoading(true))
            try{
            } catch (error) {
            if (axios.isAxiosError(error)) {
                error.response !== undefined?alert(error.response!.data):alert(error.message)
            } else {
                console.log(error);
            }
        }   
    }
    useEffect(() => {
        if(!!token) {
            if(todoList.length<1 && loadComponentData.includes('todo')) {
                loadTodoData()
            }
        }
    }, [])
}

export default useLoadData