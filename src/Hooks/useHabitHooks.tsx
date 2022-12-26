// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { habitsActions,scheduleActions } from "../Store/Store";
import type { HabitInterface, HabitEntryInterface,ScheduleInterface } from '../Misc/Interfaces';
import {getWeekDates,createPairedScheduleItem,determineScheduleAction,createHabitEntries} from './Helper-functions';

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
            const habitsResponse:{data:{habitList:HabitInterface[],habitEntries:HabitEntryInterface[]}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/habits/getHabits`,
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
                const newEntries = createHabitEntries(habitItem,utcWeekStartMidDay,utcNextWeekStartMidDay,populateBeforeCreation,currentHabitEntries);
                habitItem.entries = newEntries;
                return habitItem
            })
            dispatch(habitsActions.setHabits({habitList:habitListWithEntries,date:new Date(selectedDate).toISOString()}))
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
    const addHabit = async (newHabit:HabitInterface) => {
        dispatch(habitsActions.setHabitLoading(true)); 
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        try {
            const newHabitResponse:{data:{habitId:string,scheduleEntries:ScheduleInterface[]}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/habits/addNewHabit`,
                data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {habitId,scheduleEntries} = newHabitResponse.data;
            newHabit._id = habitId;
            // Generate new blank entries for new habit
            const {utcWeekStartMidDay,utcNextWeekStartMidDay} = getWeekDates(clientCurrentWeekStartTime,clientTimezoneOffset);
            newHabit.entries = createHabitEntries(newHabit,utcWeekStartMidDay,utcNextWeekStartMidDay,false,null);
            // Add schedule items
            for (let entry of scheduleEntries) {
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
                url:`${httpAddress}/habits/updateHabit`,
                data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {habitEntries,scheduleEntries} = newHabitResponse.data;
            // Attach updated entries
            if(habitEntries) {
                const {utcWeekStartMidDay,utcNextWeekStartMidDay} = getWeekDates(clientCurrentWeekStartTime,clientTimezoneOffset);
                newHabit.entries = createHabitEntries(newHabit,utcWeekStartMidDay,utcNextWeekStartMidDay,false,habitEntries);
            }
            // Update schedule entries
            if(scheduleEntries) {
                console.log(scheduleEntries)
                // // Add schedule items
                // for (let entry of scheduleEntries) {
                //     dispatch(scheduleActions.addScheduleItem(entry));
                // }
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
                url:`${httpAddress}/habits/deleteHabit`,
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
    const toggleHabitArchiveStatus = async (habit:HabitInterface) => {
        dispatch(habitsActions.setHabitLoading(true));
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset  = new Date().getTimezoneOffset();      
        const isArchived = habit.isArchived ? false : true;
        try {
            const habitsResponse:{data:{existingEntries:HabitEntryInterface[]}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/habits/updateHabitArchiveStatus`,
                data:{...habit,isArchived,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            // Update entries when habit is unarchived
            const {existingEntries} = habitsResponse.data;
            if (isArchived){
                dispatch(habitsActions.toggleArchiveStatus({...habit,isArchived}))
            } else {
                const {utcWeekStartMidDay,utcNextWeekStartMidDay} = getWeekDates(clientCurrentWeekStartTime,clientTimezoneOffset);
                const newEntries = createHabitEntries(habit,utcWeekStartMidDay,utcNextWeekStartMidDay,false,existingEntries);
                dispatch(habitsActions.toggleArchiveStatus({...habit,isArchived,entries:newEntries}))
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
        const {utcWeekStartMidDay,utcNextWeekStartMidDay} = getWeekDates(clientSelectedWeekStartTime,clientTimezoneOffset);
        const newEntries:{[weekday:number]:HabitEntryInterface|null} = createHabitEntries(habit,utcWeekStartMidDay,utcNextWeekStartMidDay,true,null);
        try {
            const habitsResponse:{data:{populatedEntriesIds:{[weekday:number]:string|null},scheduleEntries:ScheduleInterface[]}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/habits/populateHabit`,
                data:{clientSelectedWeekStartTime,clientTimezoneOffset,_id:habit._id},
                headers:{Authorization: `Bearer ${token}`}
            })
            // Attach ids to populated entries
            const {populatedEntriesIds,scheduleEntries} = habitsResponse.data;
            [1,2,3,4,5,6,0].forEach((weekday:number) => {
                if (newEntries[weekday] && populatedEntriesIds[weekday]) {
                    newEntries[weekday]!._id = populatedEntriesIds[weekday] || "";
                }
            })
            // Add schedule items
            for (let entry of scheduleEntries) {
                dispatch(scheduleActions.addScheduleItem(entry));
            }
            dispatch(habitsActions.populateHabit({populatedEntries:newEntries,_id:habit._id}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(habitsActions.setHabitLoading(false))   
        }  
    }
    return {loadHabitsData,loadArchivedHabitsData,deleteHabit,addHabit,updateHabit,changeHabitStatus,toggleHabitArchiveStatus,populateHabit}
}

export default useHabitHooks
