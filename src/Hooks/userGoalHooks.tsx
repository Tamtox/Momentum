// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { goalActions,habitsActions,scheduleActions } from "../Store/Store";
import type {GoalInterface,HabitInterface} from '../Misc/Interfaces';
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
    // Update or add goal
    const updateGoal = async (newGoal:GoalInterface, oldGoal:GoalInterface|undefined, newHabit:HabitInterface|null, oldHabit:HabitInterface|undefined) => {
        dispatch(goalActions.setGoalLoading(true));
        newHabit && dispatch(habitsActions.setHabitLoading(true));
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        let goalScheduleAction:string|null = determineScheduleAction(newGoal.targetDate,oldGoal?.targetDate || null);
        try {
            const newGoalResponse:{data:{goalId:string,scheduleId:string}} = await axios.request({
                method:!!oldGoal ? 'PATCH' : 'POST',
                url:`${httpAddress}/goals/${!!oldGoal ? 'updateGoal' : 'addNewGoal'}`,
                data:{...newGoal,timezoneOffset:new Date().getTimezoneOffset(),scheduleAction:goalScheduleAction},
                headers:{Authorization: `Bearer ${token}`}
            });
            const {goalId,scheduleId:goalScheduleId} = newGoalResponse.data;
            newGoal._id = goalId;
            // Add or update goal schedule item
            if (!!oldGoal) {
                // Check if goal schedule item needs to be added, deleted or updated  
                if (goalScheduleAction === "create") {
                    const {targetDate,title,alarmUsed,creationUTCOffset} = newGoal;
                    if (targetDate) {
                        const scheduleItem = await createPairedScheduleItem(null,targetDate,title,'todo',newGoal._id,alarmUsed,creationUTCOffset,goalScheduleId);  
                        dispatch(scheduleActions.addScheduleItem(scheduleItem));
                    }
                } else if (goalScheduleAction === "update") {
                    dispatch(scheduleActions.updateScheduleItem({newGoal,oldGoal}));
                } else if (goalScheduleAction === "delete") {
                    dispatch(scheduleActions.deleteScheduleItem(newGoal));
                }
            } else {
                if (newGoal.targetDate) {
                    const {targetDate,title,alarmUsed,creationUTCOffset} = newGoal;
                    const goalScheduleItem = createPairedScheduleItem(null,targetDate,title,"goal",goalId,alarmUsed,creationUTCOffset,goalScheduleId);
                    dispatch(scheduleActions.addScheduleItem(goalScheduleItem));
                }
            }
            if(newHabit) {
                const newHabitResponse:{data:{newHabit:HabitInterface,scheduleId:string,newEntries:{}}} = await axios.request({
                    method:newGoal.habitId ? 'PATCH' : 'POST',
                    url:`${httpAddress}/habits/${newGoal.habitId ? 'updateHabit' : 'addNewHabit'}`,
                    data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                    headers:{Authorization: `Bearer ${token}`}
                });
                const {scheduleId:habitScheduleId,newEntries} = newHabitResponse.data;
                const habitId = !!oldHabit ? newHabit._id : newHabitResponse.data.newHabit._id;
                !!oldHabit ? newHabit.entries = newEntries : newHabit = newHabitResponse.data.newHabit;
                // Add or update habit schedule item
                // Update goal and habit ids
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
                        data:{_id:habitId,goalId},
                        headers:{Authorization: `Bearer ${token}`}
                    })
                    newGoal.habitId = habitId;
                    newHabit.goalId = goalId;
                }
                !!oldHabit ? dispatch(habitsActions.updateHabit({newHabit})) : dispatch(habitsActions.addHabit(newHabitResponse.data.newHabit)) ;
            } 
            !!oldGoal ? dispatch(goalActions.updateGoal(newGoal)) : dispatch(goalActions.addGoal({...newGoal,_id:goalId}));
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
    return {loadGoalData,loadArchivedGoalData,changeGoalStatus,updateGoal,toggleGoalArchiveStatus,deleteGoal}
}

export default useGoalHooks