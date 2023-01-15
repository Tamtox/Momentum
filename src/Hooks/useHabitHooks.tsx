// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { habitsActions,scheduleActions } from "../Store/Store";
import type { HabitInterface, HabitEntryInterface,ScheduleInterface } from '../Misc/Interfaces';
import {getWeekDates,createHabitEntries} from '../Misc/Helper-functions';

import { host } from "../Misc/variables";

const useHabitHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    // Load habits data
    const loadHabitsData = async (selectedDate:Date,newToken?:string) => {
        dispatch(habitsActions.setHabitLoading(true));
        const clientSelectedWeekStartTime = new Date(selectedDate).setHours(0,0,0,0) + 86400000 * (new Date(selectedDate).getDay()? 1 - new Date(selectedDate).getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();
        try {
            const habitsResponse:{data:{habitList:HabitInterface[],habitEntries:HabitEntryInterface[]}} = await axios.request({
                method:'POST',
                url:`${host}/habits/getHabits`,
                data:{clientSelectedWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            const {habitList,habitEntries} = habitsResponse.data;
            // Create/attach habit entries to habits
            let habitEntriesCopy:HabitEntryInterface[] = [...habitEntries];
            const {utcWeekStartMidDay,utcNextWeekStartMidDay} = getWeekDates(clientSelectedWeekStartTime,clientTimezoneOffset);
            const habitListWithEntries = habitList.map((habitItem:HabitInterface) => {
                // Find entries of current habit
                const currentHabitEntries:HabitEntryInterface[] = [];
                const otherHabitEntries:HabitEntryInterface[] = [];
                habitEntriesCopy.forEach((entry:HabitEntryInterface) => {
                    if(entry.habitId === habitItem._id) {
                        currentHabitEntries.push(entry);
                    } else {
                        otherHabitEntries.push(entry);
                    }
                });
                habitEntriesCopy = otherHabitEntries;
                const populateBeforeCreation = currentHabitEntries.length ? true : false
                const {newHabitEntries} = createHabitEntries(habitItem,utcWeekStartMidDay,utcNextWeekStartMidDay,populateBeforeCreation,currentHabitEntries);
                habitItem.entries = newHabitEntries;
                return habitItem
            })
            dispatch(habitsActions.setHabits({habitList:habitListWithEntries,date:new Date(selectedDate).toISOString()}));
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
                url:`${host}/habits/getArchivedHabits`,
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
    const addHabit = async (newHabit:HabitInterface) => {
        dispatch(habitsActions.setHabitLoading(true)); 
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        try {
            const newHabitResponse:{data:{habitId:string}} = await axios.request({
                method:'POST',
                url:`${host}/habits/addNewHabit`,
                data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {habitId} = newHabitResponse.data;
            newHabit._id = habitId;
            // Generate new blank entries for new habit
            const {utcWeekStartMidDay,utcNextWeekStartMidDay} = getWeekDates(clientCurrentWeekStartTime,clientTimezoneOffset);
            const {newHabitEntries,newScheduleEntries} = createHabitEntries(newHabit,utcWeekStartMidDay,utcNextWeekStartMidDay,false,null);
            newHabit.entries = newHabitEntries
            // Add schedule items
            for (let entry of newScheduleEntries) {
                dispatch(scheduleActions.addScheduleItem(entry));
            }
            dispatch(habitsActions.addHabit(newHabit));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(habitsActions.setHabitLoading(false)); 
        }
    }
    // Update habit 
    const updateHabit = async (newHabit:HabitInterface,oldHabit:HabitInterface) =>{
        dispatch(habitsActions.setHabitLoading(true)); 
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        try {
            const newHabitResponse:{data:{habitEntries:HabitEntryInterface[],scheduleEntries:ScheduleInterface[]}} = await axios.request({
                method:'PATCH',
                url:`${host}/habits/updateHabit`,
                data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {habitEntries} = newHabitResponse.data;
            // Attach updated entries
            if(habitEntries) {
                const {utcWeekStartMidDay,utcNextWeekStartMidDay} = getWeekDates(clientCurrentWeekStartTime,clientTimezoneOffset);
                const {newHabitEntries,newScheduleEntries} = createHabitEntries(newHabit,utcWeekStartMidDay,utcNextWeekStartMidDay,false,habitEntries);
                newHabit.entries = newHabitEntries;
                // Update schedule entries
                dispatch(scheduleActions.deleteScheduleItem({_id:newHabit._id,parentType:'habit'}))
                for (let entry of newScheduleEntries) {
                    dispatch(scheduleActions.addScheduleItem(entry));
                }
            }
            dispatch(habitsActions.updateHabit(newHabit))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(habitsActions.setHabitLoading(false)); 
        }   
    }
    // Delete habit
    const deleteHabit = async (habit:HabitInterface) => {
        dispatch(habitsActions.setHabitLoading(true))   
        try {
            await axios.request({
                method:'DELETE',
                url:`${host}/habits/deleteHabit`,
                data:{_id:habit._id},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(habitsActions.deleteHabit(habit._id))
            dispatch(scheduleActions.deleteScheduleItem({_id:habit._id,parentType:'habit'}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(habitsActions.setHabitLoading(false))   
        } 
    }
    // Change habit entry status
    const changeHabitStatus = async (habitEntry:HabitEntryInterface,weekday:number) => {
        let newEntry = {...habitEntry};
        newEntry.dateCompleted = newEntry.status === "Pending" ? new Date().toISOString() : null;
        newEntry.status = newEntry.status === "Pending"?"Complete":"Pending";
        try {
            const habitResponse:{data:{_id:string}} = await axios.request({
                method:'PATCH',
                url:`${host}/habits/updateHabitEntryStatus`,
                data:{...newEntry},
                headers:{Authorization: `Bearer ${token}`}
            })
            if (newEntry._id === '') {
                newEntry._id = habitResponse.data._id;
            }
            // Dispatch schedule status update
            const {date,habitId,dateCompleted,status,_id} = newEntry;
            const scheduleItemUpdate = {date,dateCompleted,status,parentId:habitId,parentType:"habit",_id};
            dispatch(scheduleActions.updateScheduleItemStatus(scheduleItemUpdate));
            dispatch(habitsActions.changeHabitStatus({newEntry,weekday}));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
    }
    // Change habit archive status 
    const toggleHabitArchiveStatus = async (habit:HabitInterface) => {
        dispatch(habitsActions.setHabitLoading(true));
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset  = new Date().getTimezoneOffset();      
        const isArchived = habit.isArchived ? false : true;
        try {
            const habitsResponse:{data:{existingEntries:HabitEntryInterface[]}} = await axios.request({
                method:'PATCH',
                url:`${host}/habits/updateHabitArchiveStatus`,
                data:{...habit,isArchived,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            // Update entries when habit is unarchived
            const {existingEntries} = habitsResponse.data;
            if (isArchived){
                dispatch(scheduleActions.deleteScheduleItem({parentType:"habit",_id:habit._id}));
                dispatch(habitsActions.toggleArchiveStatus({...habit,isArchived}));
            } else {
                const {utcWeekStartMidDay,utcNextWeekStartMidDay} = getWeekDates(clientCurrentWeekStartTime,clientTimezoneOffset);
                const {newHabitEntries,newScheduleEntries} = createHabitEntries(habit,utcWeekStartMidDay,utcNextWeekStartMidDay,false,existingEntries);
                dispatch(habitsActions.toggleArchiveStatus({...habit,isArchived,entries:newHabitEntries}))
            }
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(habitsActions.setHabitLoading(false))   
        } 
    }
    // Populate habit with entries
    const populateHabit = async (selectedDate:Date,habit:HabitInterface) =>{
        dispatch(habitsActions.setHabitLoading(true));
        const clientSelectedWeekStartTime = new Date(selectedDate).setHours(0,0,0,0) + 86400000 * (new Date(selectedDate).getDay()? 1 - new Date(selectedDate).getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();
        try {
            const habitsResponse:{data:{habitEntries:HabitEntryInterface[]}} = await axios.request({
                method:'PATCH',
                url:`${host}/habits/populateHabit`,
                data:{clientSelectedWeekStartTime,clientTimezoneOffset,_id:habit._id},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {habitEntries} = habitsResponse.data;
            const {utcWeekStartMidDay,utcNextWeekStartMidDay} = getWeekDates(clientSelectedWeekStartTime,clientTimezoneOffset);
            const {newHabitEntries,newScheduleEntries} = createHabitEntries(habit,utcWeekStartMidDay,utcNextWeekStartMidDay,true,habitEntries);
            // Add schedule entries
            for (let entry of newScheduleEntries) {
                dispatch(scheduleActions.addScheduleItem(entry));
            }
            dispatch(habitsActions.populateHabit({populatedEntries:newHabitEntries,_id:habit._id}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(habitsActions.setHabitLoading(false))   
        }  
    }
    return {loadHabitsData,loadArchivedHabitsData,deleteHabit,addHabit,updateHabit,changeHabitStatus,toggleHabitArchiveStatus,populateHabit}
}

export default useHabitHooks
