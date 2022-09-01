// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { goalActions,habitsActions } from "../Store/Store";
import type {HabitInterface,GoalInterface} from '../Misc/Interfaces';

const httpAddress = `http://localhost:3001`;

const useGoalHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
     // Load goal data
    const loadGoalData = async (newToken?:string) => {
        dispatch(goalActions.setGoalLoading(true))
        try {
            const goalListResponse = await axios.request({
                method:'GET',
                url:`${httpAddress}/goals/getGoals`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(goalActions.setGoalList(goalListResponse.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(goalActions.setGoalLoading(false))   
    }
     // Load archived goal data
    const loadArchivedGoalData = async (newToken?:string) => {
        dispatch(goalActions.setGoalLoading(true))
        try {
            const goalListResponse = await axios.request({
                method:'GET',
                url:`${httpAddress}/goals/getArchivedGoals`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(goalActions.setArchivedGoalList(goalListResponse.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(goalActions.setGoalLoading(false))   
    }
    // Toggle Goal status
    const changeGoalStatus = async (_id:string,status:string) => {
        const dateCompleted = status ==="Pending" ? new Date().toISOString() : '';
        try {
            await axios.request({
                method:'PATCH',
                url:`${httpAddress}/goals/updateGoal`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id,status:status ==="Pending"?"Complete":"Pending",dateCompleted,timezoneOffset:new Date().getTimezoneOffset()}
            })
            dispatch(goalActions.changeGoalStatus({_id,dateCompleted}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    // Update or add goal
    const updateGoal = async (newGoal:GoalInterface,updateGoal:boolean,newHabit:HabitInterface|null,updateHabit:boolean) => {
        dispatch(goalActions.setGoalLoading(true));
        newHabit && dispatch(habitsActions.setHabitLoading(true));
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        try {
            const newGoalResponse = await axios.request({
                method:updateGoal ? 'PATCH' : 'POST',
                url:`${httpAddress}/goals/${updateGoal ? 'updateGoal' : 'addNewGoal'}`,
                data:{...newGoal,timezoneOffset:new Date().getTimezoneOffset()},
                headers:{Authorization: `Bearer ${token}`}
            })
            if(newHabit) {
                const newHabitResponse:{data:{newHabit:{_id:string,goalId:string|null|undefined,goalTargetDate:string|null|undefined},newHabitEntries:[]}} = await axios.request({
                    method:newGoal.habitId ? 'PATCH' : 'POST',
                    url:`${httpAddress}/habits/${newGoal.habitId ? 'updateHabit' : 'addNewHabit'}`,
                    data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                    headers:{Authorization: `Bearer ${token}`}
                })
                // Update goal and habit ids
                const habitId = updateHabit ? newHabit._id : newHabitResponse.data.newHabit._id
                const goalId = updateGoal ? newGoal._id : newGoalResponse.data._id
                const goalTargetDate = updateGoal ? newGoal.targetDate : newGoalResponse.data.goalTargetDate
                if(!newGoal.habitId) {
                    await axios.request({
                        method:'PATCH',
                        url:`${httpAddress}/goals/updateGoal`,
                        data:{_id:goalId,habitId},
                        headers:{Authorization: `Bearer ${token}`}
                    })
                    await axios.request({
                        method:'PATCH',
                        url:`${httpAddress}/habits/updateHabit`,
                        data:{_id:habitId,goalId,goalTargetDate},
                        headers:{Authorization: `Bearer ${token}`}
                    })
                    updateGoal ? newGoal.habitId = habitId : newGoalResponse.data.habitId = habitId
                    updateHabit ? newHabit.goalId = goalId :  newHabitResponse.data.newHabit.goalId = goalId
                    updateHabit ? newHabit.goalTargetDate = goalTargetDate  : newHabitResponse.data.newHabit.goalTargetDate = goalTargetDate
                }
                updateHabit ? dispatch(habitsActions.updateHabit({newHabit,newHabitEntries:newHabitResponse.data})) : dispatch(habitsActions.addHabit(newHabitResponse.data.newHabit)) ;
            } 
            updateGoal ? dispatch(goalActions.updateGoal(newGoal)) : dispatch(goalActions.addGoal(newGoalResponse.data)) ;
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(goalActions.setGoalLoading(false));
        newHabit && dispatch(habitsActions.setHabitLoading(false));   
    }
    // Toggle archive status
    const toggleGoalArchiveStatus = async (goalItem:GoalInterface) => {
        dispatch(goalActions.setGoalLoading(true))   
        const isArchived = goalItem.isArchived ? false : true
        try {
            await axios.request({
                method:'PATCH',
                url:`${httpAddress}/goals/updateGoal`,
                data:{_id:goalItem._id,isArchived},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(goalActions.toggleArchiveStatus({...goalItem,isArchived:isArchived})) ;
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(goalActions.setGoalLoading(false))   
    }
    // Delete Goal
    const deleteGoal = async (_id:string,pairedHabitId:string|null) => {
        dispatch(goalActions.setGoalLoading(true))   
        try {
            await axios.request({
                method:'DELETE',
                url:`${httpAddress}/goals/deleteGoal`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id:_id}
            })
            if(pairedHabitId) {
                await axios.request({
                    method:'DELETE',
                    url:`${httpAddress}/habits/deleteHabit`,
                    data:{_id:pairedHabitId},
                    headers:{Authorization: `Bearer ${token}`}
                })
                dispatch(habitsActions.deleteHabit(pairedHabitId))
            }
            dispatch(goalActions.deleteGoal(_id))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(goalActions.setGoalLoading(false))   
    }
    return {loadGoalData,loadArchivedGoalData,changeGoalStatus,updateGoal,toggleGoalArchiveStatus,deleteGoal}
}

export default useGoalHooks