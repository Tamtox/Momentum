// Dependencies
import { useEffect } from "react";
import Cookies from "js-cookie";
import {useSelector,useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { goalActions,habitsActions,authActions } from "../Store/Store";
import { RootState } from "../Store/Store";

const useHabitHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const habitList = useSelector<RootState,{habitTitle:string,habitTime:string|null,habitCreationDate:string,habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},goalId:string|null,goalTargetDate:string|null,_id:string}[]>(state=>state.habitsSlice.habitList);
    // Load habits data
    const loadHabitsData = async (date:Date) => {
        dispatch(authActions.setLoading(true))
        try {
            const habitsResponse:{data:{habitList:any[],habitEntries:any[]}} = await axios.request({
                method:'POST',
                url:`http://localhost:3001/habits/getHabits`,
                data:{selectedDate:date.toString()},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(habitsActions.setHabits({habitList:habitsResponse.data.habitList,habitEntries:habitsResponse.data.habitEntries,date:date.toString()}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))   
    }
    // Delete habit
    const deleteHabit = async (habitId:string,pairedGoalId?:string) => {
        try {
            await axios.request({
                method:'DELETE',
                url:`http://localhost:3001/habits/deleteHabit`,
                data:{_id:habitId},
                headers:{Authorization: `Bearer ${token}`}
            })
            if(pairedGoalId) {
                await axios.request({
                    method:'DELETE',
                    url:`http://localhost:3001/goals/deleteGoal`,
                    headers:{Authorization: `Bearer ${token}`},
                    data:{_id:pairedGoalId}
                })
                dispatch(goalActions.deleteGoal(pairedGoalId))
            }
            dispatch(habitsActions.deleteHabit(habitId))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
    }
    // Change habit status
    const changeHabitStatus = async (habitId:string,habitEntryId:string,habitEntryStatus:string) => {
        try {
            await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/habits/updateHabitEntryStatus`,
                data:{_id:habitEntryId,habitEntryStatus:habitEntryStatus==="Pending"?"Complete":"Pending"},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(habitsActions.changeHabitStatus({habitEntryId,habitId}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
    }
    useEffect(() => {
        if (token) {
            habitList.length<1 && loadHabitsData(new Date());
        } else { 
            dispatch(authActions.logout())
        }
    }, [])
    return {loadHabitsData,deleteHabit,changeHabitStatus}
}

export default useHabitHooks