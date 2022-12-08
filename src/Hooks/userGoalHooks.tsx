// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { goalActions,habitsActions,scheduleActions } from "../Store/Store";
import type {GoalInterface, HabitInterface} from '../Misc/Interfaces';
import {createPairedScheduleItem, determineScheduleAction} from './Helper-functions';

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

    // Add goal
    const addGoal = async (newGoal:GoalInterface,newPairedHabit:HabitInterface|null) => {
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        try {
            const newGoalResponse:{data:{goalId:string,scheduleId:string}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/goals/addNewGoal`,
                data:{...newGoal,timezoneOffset:new Date().getTimezoneOffset()},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {goalId,scheduleId} = newGoalResponse.data;
            newGoal._id = goalId
            if (newGoal.targetDate) {
                const {targetDate,title,alarmUsed,creationUTCOffset,_id} = newGoal;
                const scheduleItem = await createPairedScheduleItem(null,targetDate,title,'goal',_id,alarmUsed,creationUTCOffset,scheduleId);  
                dispatch(scheduleActions.addScheduleItem(scheduleItem));
            }
            // Update paired habit
            if (newPairedHabit) {
                newPairedHabit.goalId = goalId
                newPairedHabit.goalTargetDate = newGoal.targetDate
                await axios.request({
                    method:'PATCH',
                    url:`${httpAddress}/habits/updateHabit`,
                    data:{...newPairedHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                    headers:{Authorization: `Bearer ${token}`}
                })
                dispatch(habitsActions.updateHabit(newPairedHabit))
            }
            dispatch(goalActions.addGoal(newGoal));    
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }

    // Update goal
    const updateGoal = async (newGoal:GoalInterface,oldGoal:GoalInterface,newPairedHabit:HabitInterface|null,oldPairedHabit:HabitInterface|null) => {
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        // Determine the schedule action
        let scheduleAction:string|null = determineScheduleAction(newGoal.targetDate,oldGoal.targetDate);
        try {
            const updateGoalResponse:{data:{scheduleId:string}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/goals/updateGoal`,
                data:{...newGoal,timezoneOffset:new Date().getTimezoneOffset()},
                headers:{Authorization: `Bearer ${token}`}
            })
            // Determine if paired habit needs to be updated
            if (newPairedHabit && (newGoal.habitId !== oldGoal.habitId || newGoal.targetDate !== oldGoal.targetDate || !oldPairedHabit)) {
                newPairedHabit.goalId = newGoal._id
                newPairedHabit.goalTargetDate = newGoal.targetDate
                await axios.request({
                    method:'PATCH',
                    url:`${httpAddress}/habits/updateHabit`,
                    data:{...newPairedHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                    headers:{Authorization: `Bearer ${token}`}
                })
                dispatch(habitsActions.updateHabit(newPairedHabit))
            }
            // Delete pairing if one existed
            if (!newPairedHabit && oldPairedHabit) {
                oldPairedHabit.goalId = null
                oldPairedHabit.goalTargetDate = null
                await axios.request({
                    method:'PATCH',
                    url:`${httpAddress}/habits/updateHabit`,
                    data:{...oldPairedHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                    headers:{Authorization: `Bearer ${token}`}
                })
                dispatch(habitsActions.updateHabit(oldPairedHabit))
            }
            const {scheduleId} = updateGoalResponse.data;
            dispatch(goalActions.updateGoal(newGoal));
            // Check if schedule item needs to be added, deleted or updated  
            if (scheduleAction === "create") {
                const {targetDate,title,alarmUsed,creationUTCOffset,_id} = newGoal;
                if (targetDate) {
                    const scheduleItem = await createPairedScheduleItem(null,targetDate,title,'goal',_id,alarmUsed,creationUTCOffset,scheduleId);  
                    dispatch(scheduleActions.addScheduleItem(scheduleItem));
                }
            } else if (scheduleAction === "update") {
                dispatch(scheduleActions.updateScheduleItem({newItem:newGoal,oldItem:oldGoal}));
            } else if (scheduleAction === "delete") {
                dispatch(scheduleActions.deleteScheduleItem(newGoal));
            }
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
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
                dispatch(habitsActions.deleteHabit(pairedHabitId));
                dispatch(scheduleActions.deleteScheduleItem({_id:pairedHabitId,parentType:"habit"}));
            }
            dispatch(goalActions.deleteGoal(_id));
            dispatch(scheduleActions.deleteScheduleItem({_id,parentType:"goal"}));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(goalActions.setGoalLoading(false))   
    }
    return {loadGoalData,loadArchivedGoalData,changeGoalStatus,addGoal,updateGoal,toggleGoalArchiveStatus,deleteGoal}
}

export default useGoalHooks