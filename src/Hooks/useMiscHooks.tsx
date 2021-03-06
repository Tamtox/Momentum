// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { authActions,goalActions,habitsActions,todoActions,journalActions } from "../Store/Store";

const httpAddress = `http://localhost:3001`;

const useMiscHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const preloadData = async (newToken?:string) => {
        dispatch(authActions.setLoading(true))
        try {
            // Preload user data
            const userDataResponse = await axios.request({
                method:'GET',
                url:`${httpAddress}/users/getUserData`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(authActions.setUsetData(userDataResponse.data))
            // Preload goal data
            const goalListResponse = await axios.request({
                method:'GET',
                url:`${httpAddress}/goals/getGoals`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(goalActions.setGoalList(goalListResponse.data))
            // Preload habit data
            const habitsResponse:{data:{habitList:any[],habitEntries:any[]}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/habits/getHabits`,
                data:{selectedTime:new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6),timezoneOffset:new Date().getTimezoneOffset()},
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(habitsActions.setHabits({habitList:habitsResponse.data.habitList,habitEntries:habitsResponse.data.habitEntries,date:new Date().toString()}))
            // Preload todo data
            const todoList = await axios.request({
                method:'GET',
                url:`${httpAddress}/todo/getTodos`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(todoActions.setToDoList(todoList.data))
            //Preload Journal Data
            const journalEntryResponse:{data:any[]} = await axios.request({
                method:'POST',
                url:`${httpAddress}/journal/getJournalEntry`,
                headers:{Authorization: `Bearer ${token}`},
                data:{selectedDate:new Date().toISOString(),timezoneOffset:new Date().getTimezoneOffset()}
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