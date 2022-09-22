// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { goalActions,habitsActions,scheduleActions } from "../Store/Store";
import type {GoalInterface} from '../Misc/Interfaces';
import {createPairedScheduleItem} from './Helper-functions';

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
    const addGoal = async (newGoal:GoalInterface) => {
        dispatch(goalActions.setGoalLoading(true)); 
        try {
            const newGoalResponse:{data:{goalId:string,scheduleId:string}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/goals/addNewGoal`,
                data:{...newGoal},
                headers:{Authorization: `Bearer ${token}`}
            });
            const {goalId,scheduleId} = newGoalResponse.data;
            newGoal._id = goalId;
            if (newGoal.targetDate) {
                const {targetDate,title,alarmUsed,creationUTCOffset} = newGoal;
                const scheduleItem = createPairedScheduleItem(null,targetDate,title,'goal',goalId,alarmUsed,creationUTCOffset,scheduleId);       
                dispatch(scheduleActions.addScheduleItem(scheduleItem));
            }
            dispatch(goalActions.addGoal({...newGoal,_id:goalId}));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(goalActions.setGoalLoading(false));
        return newGoal;
    }
    // Update goal
    const updateGoal = async (newGoal:GoalInterface) => {
        dispatch(goalActions.setGoalLoading(true)); 
        try {
            await axios.request({
                method:'PATCH',
                url:`${httpAddress}/goals/updateGoal`,
                data:{...newGoal},
                headers:{Authorization: `Bearer ${token}`}
            });
            dispatch(goalActions.updateGoal(newGoal));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(goalActions.setGoalLoading(false));
    }
    // // Update or add goal
    // const updateGoal = async (newGoal:GoalInterface,updateGoal:boolean,newHabit:HabitInterface|null,updateHabit:boolean) => {
    //     dispatch(goalActions.setGoalLoading(true));
    //     newHabit && dispatch(habitsActions.setHabitLoading(true));
    //     const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
    //     const clientTimezoneOffset = new Date().getTimezoneOffset();   
    //     try {
    //         const newGoalResponse:{data:{goalId:string,scheduleId:string}} = await axios.request({
    //             method:updateGoal ? 'PATCH' : 'POST',
    //             url:`${httpAddress}/goals/${updateGoal ? 'updateGoal' : 'addNewGoal'}`,
    //             data:{...newGoal,timezoneOffset:new Date().getTimezoneOffset()},
    //             headers:{Authorization: `Bearer ${token}`}
    //         });
    //         const {goalId,scheduleId:goalScheduleId} = newGoalResponse.data;
    //         updateGoal ? dispatch(goalActions.updateGoal(newGoal)) : dispatch(goalActions.addGoal({...newGoal,_id:goalId}));
    //         if(newHabit) {
    //             const newHabitResponse:{data:{newHabit:HabitInterface,scheduleId:string,newEntries:{}}} = await axios.request({
    //                 method:newGoal.habitId ? 'PATCH' : 'POST',
    //                 url:`${httpAddress}/habits/${newGoal.habitId ? 'updateHabit' : 'addNewHabit'}`,
    //                 data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
    //                 headers:{Authorization: `Bearer ${token}`}
    //             });
    //             const {scheduleId:habitScheduleId,newEntries} = newHabitResponse.data;
    //             // Update goal and habit ids
    //             const habitId = updateHabit ? newHabit._id : newHabitResponse.data.newHabit._id
    //             const goalTargetDate = newGoal.targetDate
    //             if(!newGoal.habitId) {
    //                 await axios.request({
    //                     method:'PATCH',
    //                     url:`${httpAddress}/goals/updateGoal`,
    //                     data:{_id:goalId,habitId},
    //                     headers:{Authorization: `Bearer ${token}`}
    //                 })
    //                 await axios.request({
    //                     method:'PATCH',
    //                     url:`${httpAddress}/habits/updateHabit`,
    //                     data:{_id:habitId,goalId,goalTargetDate},
    //                     headers:{Authorization: `Bearer ${token}`}
    //                 })
    //                 newGoal.habitId = habitId
    //                 updateHabit ? newHabit.goalId = goalId :  newHabitResponse.data.newHabit.goalId = goalId
    //                 updateHabit ? newHabit.goalTargetDate = goalTargetDate  : newHabitResponse.data.newHabit.goalTargetDate = goalTargetDate
    //             }
    //             updateHabit ? dispatch(habitsActions.updateHabit({newHabit,newEntries:newHabitResponse.data.newEntries})) : dispatch(habitsActions.addHabit(newHabitResponse.data.newHabit)) ;
    //         } 
    //     } catch (error) {
    //         axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
    //     }   
    //     dispatch(goalActions.setGoalLoading(false));
    //     newHabit && dispatch(habitsActions.setHabitLoading(false));   
    // }
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
    return {loadGoalData,loadArchivedGoalData,changeGoalStatus,addGoal,updateGoal,toggleGoalArchiveStatus,deleteGoal}
}

export default useGoalHooks