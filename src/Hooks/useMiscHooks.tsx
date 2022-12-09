// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { authActions,goalActions,habitsActions,todoActions } from "../Store/Store";

const httpAddress = `http://localhost:3001`;

const useMiscHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
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
            dispatch(habitsActions.setHabits({habitList:habitsResponse.data.habitList,date:new Date(clientSelectedWeekStartTime).toISOString()}))
            // Preload todo data
            const todoList = await axios.request({
                method:'GET',
                url:`${httpAddress}/todo/getTodos`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(todoActions.setToDoList(todoList.data));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false));   
    }
    return {preloadData}
}

export default useMiscHooks