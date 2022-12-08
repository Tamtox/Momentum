// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { goalActions,habitsActions,scheduleActions } from "../Store/Store";
import type { HabitInterface, HabitEntryInterface, GoalInterface } from '../Misc/Interfaces';
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
        } finally {
            dispatch(habitsActions.setHabitLoading(false))   
        } 
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
        } finally {
            dispatch(habitsActions.setHabitLoading(false))   
        }
    }
    // Add habit
    const addHabit = async (newHabit:HabitInterface,newPairedGoal:GoalInterface|null) => {
        dispatch(habitsActions.setHabitLoading(true)); 
        newPairedGoal && dispatch(goalActions.setGoalLoading(true));
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        try {
            const newHabitResponse:{data:{habitId:string,scheduleEntries:string,habitEntries:{}}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/habits/addNewHabit`,
                data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {habitId,scheduleEntries,habitEntries} = newHabitResponse.data;
            newHabit._id = habitId;
            newHabit.entries = habitEntries;
            // Update paired goal
            if(newPairedGoal) {
                newPairedGoal.habitId = habitId;
                await axios.request({
                    method:'PATCH',
                    url:`${httpAddress}/goals/updateGoal`,
                    data:{...newPairedGoal,timezoneOffset:new Date().getTimezoneOffset()},
                    headers:{Authorization: `Bearer ${token}`}
                })
                dispatch(goalActions.updateGoal(newPairedGoal))
            }
            dispatch(habitsActions.addHabit(newHabit));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(habitsActions.setHabitLoading(false)); 
            newPairedGoal && dispatch(goalActions.setGoalLoading(false));
        }
    }
    // Update habit 
    const updateHabit = async (newHabit:HabitInterface,oldHabit:HabitInterface,newPairedGoal:GoalInterface|null,oldPairedGoal:GoalInterface|null) =>{
        dispatch(habitsActions.setHabitLoading(true)); 
        newPairedGoal && dispatch(goalActions.setGoalLoading(true));
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        try {
            // Add or update habit and habit schedule
            const newHabitResponse:{data:{habitEntries:{}}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/habits/updateHabit`,
                data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {habitEntries} = newHabitResponse.data;
            if(habitEntries) newHabit.entries = habitEntries
            // Determine if paired goal needs to be updated
            if (newPairedGoal && (newHabit.goalId !== oldHabit.goalId || !oldPairedGoal)) {
                newPairedGoal.habitId = newHabit._id
                await axios.request({
                    method:'PATCH',
                    url:`${httpAddress}/goals/updateGoal`,
                    data:{...newPairedGoal,timezoneOffset:new Date().getTimezoneOffset()},
                    headers:{Authorization: `Bearer ${token}`}
                })
                dispatch(habitsActions.updateHabit(newPairedGoal))
            }
            // Delete pairing if one existed
            if (!newPairedGoal && oldPairedGoal) {
                oldPairedGoal.habitId = null
                await axios.request({
                    method:'PATCH',
                    url:`${httpAddress}/goals/updateGoal`,
                    data:{...oldPairedGoal,timezoneOffset:new Date().getTimezoneOffset()},
                    headers:{Authorization: `Bearer ${token}`}
                })
                dispatch(habitsActions.updateHabit(oldPairedGoal))
            }
            dispatch(habitsActions.updateHabit(newHabit))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(habitsActions.setHabitLoading(false)); 
            newPairedGoal && dispatch(goalActions.setGoalLoading(false));
        }   
    }
    // Delete habit
    const deleteHabit = async (habitId:string,pairedGoal:GoalInterface|null) => {
        dispatch(habitsActions.setHabitLoading(true))   
        try {
            await axios.request({
                method:'DELETE',
                url:`${httpAddress}/habits/deleteHabit`,
                data:{_id:habitId},
                headers:{Authorization: `Bearer ${token}`}
            })
            // Unpair deleted habit from goal
            if(pairedGoal) {
                const pairedGoalCopy = Object.assign({},pairedGoal);
                pairedGoalCopy.habitId = null;
                await axios.request({
                    method:'PATCH',
                    url:`${httpAddress}/goals/updateGoal`,
                    data:{...pairedGoalCopy,timezoneOffset:new Date().getTimezoneOffset()},
                    headers:{Authorization: `Bearer ${token}`}
                })
                dispatch(goalActions.updateGoal(pairedGoalCopy))
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
            if (newEntry._id === '') {
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
    return {loadHabitsData,loadArchivedHabitsData,deleteHabit,addHabit,updateHabit,changeHabitStatus,toggleHabitArchiveStatus,populateHabit}
}

export default useHabitHooks