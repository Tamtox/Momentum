// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { goalActions,habitsActions,authActions } from "../Store/Store";
import type {HabitInterface,GoalInterface} from '../Misc/Interfaces';

const useHabitHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    // Load habits data
    const loadHabitsData = async (date:Date,newToken?:string) => {
        dispatch(authActions.setLoading(true))
        try {
            const habitsResponse:{data:{habitList:any[],habitEntries:any[]}} = await axios.request({
                method:'POST',
                url:`http://localhost:3001/habits/getHabits`,
                data:{selectedDate:date.toString()},
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(habitsActions.setHabits({habitList:habitsResponse.data.habitList,habitEntries:habitsResponse.data.habitEntries,date:date.toString()}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))   
    }
    // Load habits archive
    const loadArchivedHabitsData = async () => {
        dispatch(authActions.setLoading(true))
        try {
            const habitsResponse:{data:{archivedHabitList:[]}} = await axios.request({
                method:'POST',
                url:`http://localhost:3001/habits/getArchivedHabits`,
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(habitsActions.setArchiveHabits(habitsResponse.data.archivedHabitList))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))   
    }
    // Update or add habit 
    const updateHabit = async (newHabit:HabitInterface,updateHabit:boolean,newGoal:GoalInterface|null,updateGoal:boolean) =>{
    dispatch(authActions.setLoading(true))   
    try {
        const newHabitResponse:{data:{newHabit:{_id:string,goalId:string|null|undefined,goalTargetDate:string|null|undefined},newHabitEntries:[]}} = await axios.request({
            method:updateHabit ? 'PATCH' : 'POST',
            url:`http://localhost:3001/habits/${updateHabit ? 'updateHabit' : 'addNewHabit'}`,
            data:{...newHabit,currentDate:new Date().toString()},
            headers:{Authorization: `Bearer ${token}`}
        })
        if(newGoal) {
            const newGoalResponse = await axios.request({
                method:newHabit.goalId ? 'PATCH' : 'POST',
                url:`http://localhost:3001/goals/${newHabit.goalId ?  'updateGoal' : 'addNewGoal'}`,
                data:newGoal,
                headers:{Authorization: `Bearer ${token}`}
            })
            // Update goal and habit ids
            const habitId = updateHabit ? newHabit._id : newHabitResponse.data.newHabit._id
            const goalId = updateGoal ? newGoal._id : newGoalResponse.data._id
            const goalTargetDate = updateGoal ? newGoal.goalTargetDate : newGoalResponse.data.goalTargetDate
            if(!newHabit.goalId) {
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
            }
            updateGoal ? dispatch(goalActions.updateGoal(newGoal)) : dispatch(goalActions.addGoal(newGoalResponse.data)) ;
        }
        updateHabit ? dispatch(habitsActions.updateHabit({newHabit,newHabitEntries:newHabitResponse.data})) : dispatch(habitsActions.addHabit(newHabitResponse.data)) ;
    } catch (error) {
        axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
    }   
    dispatch(authActions.setLoading(false))   
}
    // Delete habit
    const deleteHabit = async (habitId:string,pairedGoalId:string|null) => {
        dispatch(authActions.setLoading(true))   
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
        dispatch(authActions.setLoading(false))   
    }
    // Change habit entry status
    const changeHabitStatus = async (habitId:string,habitEntryId:string,habitEntryStatus:string) => {
        const dateCompleted = habitEntryStatus==="Pending" ? new Date().toString() : '';
        try {
            await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/habits/updateHabitEntryStatus`,
                data:{_id:habitEntryId,habitEntryStatus:habitEntryStatus==="Pending"?"Complete":"Pending",dateCompleted},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(habitsActions.changeHabitStatus({habitEntryId,habitId,dateCompleted}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
    }
    // Change habit archive status 
    const toggleHabitArchiveStatus = async (habitItem:HabitInterface) =>{
        dispatch(authActions.setLoading(true))   
        const isArchived = habitItem.isArchived ? false : true
        try {
            const habitsResponse:{data:{habitEntries:any[]}} = await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/habits/updateHabitArchiveStatus`,
                data:{...habitItem,isArchived:isArchived,currentDate:new Date().toString()},
                headers:{Authorization: `Bearer ${token}`}
            })
            console.log(habitsResponse.data)
            isArchived ? dispatch(habitsActions.toggleArchiveStatus({...habitItem,isArchived:true})) : dispatch(habitsActions.toggleArchiveStatus({habitItem:{...habitItem,isArchived:false},habitEntries:habitsResponse.data.habitEntries}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))   
    }
    return {loadHabitsData,loadArchivedHabitsData,deleteHabit,updateHabit,changeHabitStatus,toggleHabitArchiveStatus}
}

export default useHabitHooks