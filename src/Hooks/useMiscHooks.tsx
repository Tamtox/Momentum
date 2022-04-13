// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { authActions,goalActions,habitsActions,todoActions,journalActions } from "../Store/Store";

const useMiscHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const preloadData = async (newToken?:string) => {
        dispatch(authActions.setLoading(true))
        try {
            // Preload user data
            const userDataResponse = await axios.request({
                method:'GET',
                url:`http://localhost:3001/users/getUserData`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(authActions.setUsetData(userDataResponse.data))
            // Preload goal data
            const goalListResponse = await axios.request({
                method:'GET',
                url:`http://localhost:3001/goals/getGoals`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(goalActions.setGoalList(goalListResponse.data))
            // Preload habit data
            const habitsResponse:{data:{habitList:any[],habitEntries:any[]}} = await axios.request({
                method:'POST',
                url:`http://localhost:3001/habits/getHabits`,
                data:{selectedDate:new Date()},
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(habitsActions.setHabits({habitList:habitsResponse.data.habitList,habitEntries:habitsResponse.data.habitEntries,date:new Date().toString()}))
            // Preload todo data
            const todoList = await axios.request({
                method:'GET',
                url:`http://localhost:3001/todo/getTodos`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            console.log(todoList.data)
            dispatch(todoActions.setToDoList(todoList.data))
            //Preload Journal Data
            const journalEntryResponse:{data:any[]} = await axios.request({
                method:'POST',
                url:`http://localhost:3001/journal/getJournalEntry`,
                headers:{Authorization: `Bearer ${token}`},
                data:{selectedDate:new Date().toString()}
            })
            if(journalEntryResponse.data.length>0) {
                dispatch(journalActions.setEntry(journalEntryResponse.data[0]))
            } 
            if (journalEntryResponse.data.length === 0) {
                dispatch(journalActions.setEntry({date:'',entry:'',id:''}))
            }
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))   
    }
    return {preloadData}
}

export default useMiscHooks