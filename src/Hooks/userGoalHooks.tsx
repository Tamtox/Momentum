// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { authActions,goalActions,habitsActions } from "../Store/Store";
import type {HabitInterface,GoalInterface} from '../Misc/Interfaces';

const useGoalHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
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
     // Load archived goal data
    const loadArchivedGoalData = async (newToken?:string) => {
        dispatch(authActions.setLoading(true))
        try {
            const goalListResponse = await axios.request({
                method:'GET',
                url:`http://localhost:3001/goals/getArchivedGoals`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(goalActions.setArchivedGoalList(goalListResponse.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))   
    }
    // Toggle Goal status
    const changeGoalStatus = async (_id:string,goalStatus:string) => {
        const dateCompleted = goalStatus==="Pending" ? new Date().toString() : '';
        try {
            await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/goals/updateGoal`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id,goalStatus:goalStatus==="Pending"?"Complete":"Pending",dateCompleted}
            })
            dispatch(goalActions.changeGoalStatus({_id,dateCompleted}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    // Update or add goal
    const updateGoal = async (newGoal:GoalInterface,updateGoal:boolean,newHabit:HabitInterface|null,updateHabit:boolean) => {
        dispatch(authActions.setLoading(true))   
        try {
            const newGoalResponse = await axios.request({
                method:updateGoal ? 'PATCH' : 'POST',
                url:`http://localhost:3001/goals/${updateGoal ? 'updateGoal' : 'addNewGoal'}`,
                data:newGoal,
                headers:{Authorization: `Bearer ${token}`}
            })
            if(newHabit) {
                const newHabitResponse:{data:{newHabit:{_id:string,goalId:string|null|undefined,goalTargetDate:string|null|undefined},newHabitEntries:[]}} = await axios.request({
                    method:newGoal.habitId ? 'PATCH' : 'POST',
                    url:`http://localhost:3001/habits/${newGoal.habitId ? 'updateHabit' : 'addNewHabit'}`,
                    data:{...newHabit,currentDate:new Date().toString()},
                    headers:{Authorization: `Bearer ${token}`}
                })
                // Update goal and habit ids
                const habitId = updateHabit ? newHabit._id : newHabitResponse.data.newHabit._id
                const goalId = updateGoal ? newGoal._id : newGoalResponse.data._id
                const goalTargetDate = updateGoal ? newGoal.goalTargetDate : newGoalResponse.data.goalTargetDate
                if(!newGoal.habitId) {
                    await axios.request({
                        method:'PATCH',
                        url:`http://localhost:3001/goals/updateGoal`,
                        data:{_id:goalId,habitId},
                        headers:{Authorization: `Bearer ${token}`}
                    })
                    await axios.request({
                        method:'PATCH',
                        url:`http://localhost:3001/habits/updateHabit`,
                        data:{_id:habitId,goalId,goalTargetDate},
                        headers:{Authorization: `Bearer ${token}`}
                    })
                    updateGoal ? newGoal.habitId = habitId : newGoalResponse.data.habitId = habitId
                    updateHabit ? newHabit.goalId = goalId :  newHabitResponse.data.newHabit.goalId = goalId
                    updateHabit ? newHabit.goalTargetDate = goalTargetDate  : newHabitResponse.data.newHabit.goalTargetDate = goalTargetDate
                    updateHabit ? dispatch(habitsActions.updateHabit({newHabit,newHabitEntries:newHabitResponse.data})) : dispatch(habitsActions.addHabit(newHabitResponse.data)) ;
                }
            } 
            updateGoal ? dispatch(goalActions.updateGoal(newGoal)) : dispatch(goalActions.addGoal(newGoalResponse.data)) ;
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(authActions.setLoading(false))   
    }
    // Toggle archive status
    const toggleGoalArchiveStatus = async (goalItem:GoalInterface) => {
        dispatch(authActions.setLoading(true))   
        const isArchived = goalItem.isArchived ? false : true
        try {
            await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/goals/updateGoal`,
                data:{_id:goalItem._id,isArchived},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(goalActions.toggleArchiveStatus({...goalItem,isArchived:isArchived})) ;
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(authActions.setLoading(false))   
    }
    // Delete Goal
    const deleteGoal = async (_id:string,pairedHabitId:string|null) => {
        dispatch(authActions.setLoading(true))   
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
        dispatch(authActions.setLoading(false))   
    }
    return {loadGoalData,loadArchivedGoalData,changeGoalStatus,updateGoal,toggleGoalArchiveStatus,deleteGoal}
}

export default useGoalHooks