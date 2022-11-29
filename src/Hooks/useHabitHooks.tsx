// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { goalActions,habitsActions,scheduleActions } from "../Store/Store";
import type {HabitInterface, HabitEntryInterface, GoalInterface} from '../Misc/Interfaces';
import {createPairedScheduleItem,determineScheduleAction} from './Helper-functions';

const httpAddress = `http://localhost:3001`;

const useHabitHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    // Load habits data
    const loadHabitsData = async (selectedDate:Date,newToken?:string) => {
        dispatch(habitsActions.setHabitLoading(true));
        const clientSelectedWeekStartTime = new Date(selectedDate).setHours(0,0,0,0) + 86400000 * (new Date(selectedDate).getDay()? 1 - new Date(selectedDate).getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();
        try {
            const habitsResponse:{data:{habitList:any[]}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/habits/getHabits`,
                data:{clientSelectedWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(habitsActions.setHabits({habitList:habitsResponse.data.habitList,date:new Date(selectedDate).toISOString()}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(habitsActions.setHabitLoading(false))   
    }
    // Load habits archive
    const loadArchivedHabitsData = async () => {
        dispatch(habitsActions.setHabitLoading(true))
        try {
            const habitsResponse:{data:{archivedHabitList:[]}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/habits/getArchivedHabits`,
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(habitsActions.setArchiveHabits(habitsResponse.data.archivedHabitList))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(habitsActions.setHabitLoading(false))   
    }
    // Update or add habit 
    const updateHabit = async (newHabit:HabitInterface,oldHabit:HabitInterface|undefined,newGoal:GoalInterface|null,oldGoal:GoalInterface|undefined) =>{
        dispatch(habitsActions.setHabitLoading(true));
        newGoal && dispatch(goalActions.setGoalLoading(true));
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        let goalScheduleAction:string|null = null 
        if (newGoal) goalScheduleAction = determineScheduleAction(newGoal.targetDate,oldGoal?.targetDate || null);
        try {
            const newHabitResponse:{data:{newHabit:HabitInterface,scheduleId:string,newEntries:{}}} = await axios.request({
                method:oldHabit ? 'PATCH' : 'POST',
                url:`${httpAddress}/habits/${oldHabit ? 'updateHabit' : 'addNewHabit'}`,
                data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {scheduleId:habitScheduleId,newEntries} = newHabitResponse.data;
            const habitId = oldHabit ? newHabit._id : newHabitResponse.data.newHabit._id;
            oldHabit ? newHabit.entries = newEntries : newHabit = newHabitResponse.data.newHabit;
            if(newGoal) {
                const newGoalResponse:{data:{goalId:string,scheduleId:string}}  = await axios.request({
                    method:newHabit.goalId ? 'PATCH' : 'POST',
                    url:`${httpAddress}/goals/${newHabit.goalId ?  'updateGoal' : 'addNewGoal'}`,
                    data:newGoal,
                    headers:{Authorization: `Bearer ${token}`}
                })
                const {goalId,scheduleId:goalScheduleId} = newGoalResponse.data;
                newGoal._id = goalId;
                // Add or update goal schedule item
                if (oldGoal && goalScheduleAction) {
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
                } else if (goalScheduleAction) {
                    if (newGoal.targetDate) {
                        const {targetDate,title,alarmUsed,creationUTCOffset} = newGoal;
                        const goalScheduleItem = createPairedScheduleItem(null,targetDate,title,"goal",goalId,alarmUsed,creationUTCOffset,goalScheduleId);
                        dispatch(scheduleActions.addScheduleItem(goalScheduleItem));
                    }
                }
                // Update goal and habit ids
                if(!newHabit.goalId) {
                    await axios.request({
                        method:'PATCH',
                        url:`${httpAddress}/goals/updateGoal`,
                        data:{_id:goalId,habitId},
                        headers:{Authorization: `Bearer ${token}`}
                    });
                    await axios.request({
                        method:'PATCH',
                        url:`${httpAddress}/habits/updateHabit`,
                        data:{_id:habitId,goalId},
                        headers:{Authorization: `Bearer ${token}`}
                    });
                    newGoal.habitId = habitId;
                    newHabit.goalId = goalId;
                }
                oldGoal ? dispatch(goalActions.updateGoal(newGoal)) : dispatch(goalActions.addGoal({...newGoal,_id:goalId}));
            }
            oldHabit ? dispatch(habitsActions.updateHabit({newHabit})) : dispatch(habitsActions.addHabit(newHabitResponse.data.newHabit)) ;
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(habitsActions.setHabitLoading(false));
        newGoal && dispatch(goalActions.setGoalLoading(false));   
    }
    // Delete habit
    const deleteHabit = async (habitId:string,pairedGoalId:string|null) => {
        dispatch(habitsActions.setHabitLoading(true))   
        try {
            await axios.request({
                method:'DELETE',
                url:`${httpAddress}/habits/deleteHabit`,
                data:{_id:habitId},
                headers:{Authorization: `Bearer ${token}`}
            })
            if(pairedGoalId) {
                await axios.request({
                    method:'DELETE',
                    url:`${httpAddress}/goals/deleteGoal`,
                    headers:{Authorization: `Bearer ${token}`},
                    data:{_id:pairedGoalId}
                })
                dispatch(goalActions.deleteGoal(pairedGoalId))
            }
            dispatch(habitsActions.deleteHabit(habitId))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(habitsActions.setHabitLoading(false))   
    }
    // Change habit entry status
    const changeHabitStatus = async (habitEntry:HabitEntryInterface,weekday:number) => {
        let newEntry = {...habitEntry};
        newEntry.dateCompleted = newEntry.status === "Pending" ? new Date().toISOString() : null;
        newEntry.status = newEntry.status === "Pending"?"Complete":"Pending";
        try {
            const habitResponse:{data:{_id:string}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/habits/updateHabitEntryStatus`,
                data:{...newEntry},
                headers:{Authorization: `Bearer ${token}`}
            })
            if(newEntry._id === '') {
                newEntry._id = habitResponse.data._id;
            }
            dispatch(habitsActions.changeHabitStatus({newEntry,weekday}));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
    }
    // Change habit archive status 
    const toggleHabitArchiveStatus = async (habitItem:HabitInterface) =>{
        dispatch(habitsActions.setHabitLoading(true));
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset  = new Date().getTimezoneOffset();      
        const isArchived = habitItem.isArchived ? false : true
        try {
            const habitsResponse:{data:{newEntries:HabitEntryInterface[]}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/habits/updateHabitArchiveStatus`,
                data:{...habitItem,isArchived:isArchived,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            isArchived ? dispatch(habitsActions.toggleArchiveStatus({...habitItem,isArchived:true})) : dispatch(habitsActions.toggleArchiveStatus({habitItem:{...habitItem,isArchived:false},habitEntries:habitsResponse.data.newEntries}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(habitsActions.setHabitLoading(false))   
    }
    // Populate habit with entries
    const populateHabit = async (selectedDate:Date,_id:string) =>{
        dispatch(habitsActions.setHabitLoading(true));
        const clientSelectedWeekStartTime = new Date(selectedDate).setHours(0,0,0,0) + 86400000 * (new Date(selectedDate).getDay()? 1 - new Date(selectedDate).getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();
        try {
            const habitsResponse:{data:{populatedEntries:HabitInterface}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/habits/populateHabit`,
                data:{clientSelectedWeekStartTime,clientTimezoneOffset,_id},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(habitsActions.populateHabit({populatedEntries:habitsResponse.data.populatedEntries,_id}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(habitsActions.setHabitLoading(false))   
    }
    return {loadHabitsData,loadArchivedHabitsData,deleteHabit,updateHabit,changeHabitStatus,toggleHabitArchiveStatus,populateHabit}
}

export default useHabitHooks