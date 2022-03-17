// Dependencies
import { useEffect } from "react";
import Cookies from "js-cookie";
import {useSelector,useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { authActions,goalActions,habitsActions } from "../Store/Store";
import { RootState } from "../Store/Store";

const useGoalHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const goalList = useSelector<RootState,{goalTitle:string,goalCreationDate:string,goalTargetDate:string|null,goalStatus:string,habitId:string|null,_id:string}[]>(state=>state.goalSlice.goalList);
     // Load goal data
    const loadGoalData = async (newToken?:string) => {
        dispatch(authActions.setLoading(true))
        try {
            const goalListResponse = await axios.request({
                method:'GET',
                url:`http://localhost:3001/goals/getGoals`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(goalActions.setGoalList(goalListResponse.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))   
    }
    // Toggle Goal status
    const changeGoalStatus = async (_id:string,goalStatus:string) => {
        try {
            await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/goals/updateGoal`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id,goalStatus:goalStatus==="Pending"?"Complete":"Pending"}
            })
            dispatch(goalActions.changeGoalStatus(_id))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    // Delete Goal
    const deleteGoal = async (_id:string,pairedHabitId?:string) => {
        try {
            await axios.request({
                method:'DELETE',
                url:`http://localhost:3001/goals/deleteGoal`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id:_id}
            })
            if(pairedHabitId) {
                await axios.request({
                    method:'DELETE',
                    url:`http://localhost:3001/habits/deleteHabit`,
                    data:{_id:pairedHabitId},
                    headers:{Authorization: `Bearer ${token}`}
                })
                dispatch(habitsActions.deleteHabit(pairedHabitId))
            }
            dispatch(goalActions.deleteGoal(_id))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }   
    useEffect(() => {
        if (token) {
            goalList.length<1 && loadGoalData();
        } else { 
            dispatch(authActions.logout())
        }
    }, [])
    return {loadGoalData,changeGoalStatus,deleteGoal}
}

export default useGoalHooks