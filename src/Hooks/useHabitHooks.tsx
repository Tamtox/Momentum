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
    // Add habit
    const addHabit = async (newHabit:HabitInterface) => {
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        try {
            const newHabitResponse:{data:{newHabit:HabitInterface,scheduleId:string,newEntries:{}}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/habits/addNewHabit`,
                data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {scheduleId:habitScheduleId,newEntries} = newHabitResponse.data;
            const habitId = newHabitResponse.data.newHabit._id;
            newHabit = newHabitResponse.data.newHabit;
            dispatch(habitsActions.addHabit(newHabitResponse.data.newHabit));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }  
    }
    // Update habit 
    const updateHabit = async (newHabit:HabitInterface,oldHabit:HabitInterface,) =>{
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        try {
            // Add or update habit and habit schedule
            const newHabitResponse:{data:{newHabit:HabitInterface,scheduleId:string,newEntries:{}}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/habits/updateHabit`,
                data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {newEntries} = newHabitResponse.data;
            newHabit.entries = newEntries
            dispatch(habitsActions.updateHabit(newHabit))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
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