// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { authActions,goalActions,habitsActions,todoActions } from "../Store/Store";
import useHabitHooks from "./useHabitHooks";
import useTodoHooks from "./useTodoHooks";
import useGoalHooks from "./userGoalHooks";

import { host } from "../Misc/variables";

const useMiscHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const clientSelectedWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
    const todoHooks = useTodoHooks();
    const habitHooks = useHabitHooks();
    const goalHooks = useGoalHooks();
    const preloadData = async (newToken?:string) => {
        dispatch(authActions.setLoading(true));
        dispatch(todoActions.setTodoLoading(true)); 
        dispatch(goalActions.setGoalLoading(true)); 
        dispatch(habitsActions.setHabitLoading(true)); 
        try {
            // Preload user data
            const userDataResponse = await axios.request({
                method:'GET',
                url:`${host}/users/getUserData`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(authActions.setUsetData(userDataResponse.data))
            // Preload goal data
            goalHooks.loadGoalData();
            // Preload habit data
            habitHooks.loadHabitsData(new Date(clientSelectedWeekStartTime));
            // Preload todo data
            todoHooks.loadTodoData();
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(authActions.setLoading(false));
            dispatch(todoActions.setTodoLoading(false)); 
            dispatch(goalActions.setGoalLoading(false)); 
            dispatch(habitsActions.setHabitLoading(false)); 
        }
    }
    return {preloadData}
}

export default useMiscHooks