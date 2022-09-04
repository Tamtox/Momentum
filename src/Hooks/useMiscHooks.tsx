// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { authActions,scheduleActions,goalActions,habitsActions,todoActions,journalActions } from "../Store/Store";

const httpAddress = `http://localhost:3001`;

const useMiscHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const clientSelectedDayStartTime = new Date().setHours(0,0,0,0);
    const clientSelectedWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
    const clientTimezoneOffset = new Date().getTimezoneOffset();
    const preloadData = async (newToken?:string) => {
        dispatch(authActions.setLoading(true));
        try {
            // Preload user data
            const userDataResponse = await axios.request({
                method:'GET',
                url:`${httpAddress}/users/getUserData`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(authActions.setUsetData(userDataResponse.data))
            // Preload schedule
            const scheduleResponse = await axios.request({
                method:'POST',
                url:`${httpAddress}/schedule/getSchedule`,
                data:{clientSelectedDayStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(scheduleActions.setScheduleList({scheduleList:scheduleResponse.data.scheduleList,date:new Date().toISOString()}));
            // Preload goal data
            const goalListResponse = await axios.request({
                method:'GET',
                url:`${httpAddress}/goals/getGoals`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(goalActions.setGoalList(goalListResponse.data))
            // Preload habit data
            const habitsResponse:{data:{habitList:any[]}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/habits/getHabits`,
                data:{clientSelectedWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(habitsActions.setHabits({habitList:habitsResponse.data.habitList,date:new Date().toISOString()}))
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
                data:{clientSelectedDayStartTime,clientTimezoneOffset}
            })
            if(journalEntryResponse.data.length > 0) {
                dispatch(journalActions.setEntry(journalEntryResponse.data[0]))
            } else if (journalEntryResponse.data.length === 0) {
                dispatch(journalActions.setEntry({date:new Date().toISOString(),entry:'',id:''}));
            }
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false));   
    }
    return {preloadData}
}

export default useMiscHooks