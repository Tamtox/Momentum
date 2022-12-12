// Dependencies
import Cookies from "js-cookie";
import {useDispatch, useSelector} from 'react-redux';
import axios from "axios";
// Components
import { goalActions,habitsActions,RootState,scheduleActions } from "../Store/Store";
import type { HabitInterface, HabitEntryInterface, GoalInterface } from '../Misc/Interfaces';
import {getWeekDates,createPairedScheduleItem,determineScheduleAction,createHabitEntries} from './Helper-functions';
import habitsSlice from "../Store/Habits-slice";

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
    const addHabit = async (newHabit:HabitInterface,newPairedGoal:GoalInterface|null) => {
        dispatch(habitsActions.setHabitLoading(true)); 
        newPairedGoal && dispatch(goalActions.setGoalLoading(true));
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();   
        try {
            const newHabitResponse:{data:{habitId:string,scheduleEntries:string}} = await axios.request({
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
            const newHabitResponse:{data:{habitEntries:HabitEntryInterface[]}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/habits/updateHabit`,
                data:{...newHabit,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {habitEntries} = newHabitResponse.data;
            if(habitEntries) {
                const {utcWeekStartMidDay,utcNextWeekStartMidDay} = getWeekDates(clientCurrentWeekStartTime,clientTimezoneOffset);
                newHabit.entries = createHabitEntries(newHabit,utcWeekStartMidDay,utcNextWeekStartMidDay,false,habitEntries);
            }
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
    const toggleHabitArchiveStatus = async (habitItem:HabitInterface) => {
        dispatch(habitsActions.setHabitLoading(true));
        const clientCurrentWeekStartTime = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
        const clientTimezoneOffset  = new Date().getTimezoneOffset();      
        const isArchived = habitItem.isArchived ? false : true;
        try {
            const habitsResponse:{data:{existingEntries:HabitEntryInterface[]}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/habits/updateHabitArchiveStatus`,
                data:{...habitItem,isArchived,clientCurrentWeekStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {existingEntries} = habitsResponse.data;
            if (isArchived){
                dispatch(habitsActions.toggleArchiveStatus({...habitItem,isArchived}))
            } else {
                const {utcWeekStartMidDay,utcNextWeekStartMidDay} = getWeekDates(clientCurrentWeekStartTime,clientTimezoneOffset);
                const newEntries = createHabitEntries(habitItem,utcWeekStartMidDay,utcNextWeekStartMidDay,false,existingEntries);
                dispatch(habitsActions.toggleArchiveStatus({...habitItem,isArchived,entries:newEntries}))
            }
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(habitsActions.setHabitLoading(false))   
        } 
    }
    // Populate habit with entries
    const populateHabit = async (selectedDate:Date,habitItem:HabitInterface) =>{
        dispatch(habitsActions.setHabitLoading(true));
        const clientSelectedWeekStartTime = new Date(selectedDate).setHours(0,0,0,0) + 86400000 * (new Date(selectedDate).getDay()? 1 - new Date(selectedDate).getDay() : -6);
        const clientTimezoneOffset = new Date().getTimezoneOffset();
        const {utcWeekStartMidDay,utcNextWeekStartMidDay} = getWeekDates(clientSelectedWeekStartTime,clientTimezoneOffset);
        const newEntries:{[weekday:number]:HabitEntryInterface|null} = createHabitEntries(habitItem,utcWeekStartMidDay,utcNextWeekStartMidDay,true,null);
        try {
            const habitsResponse:{data:{populatedEntriesIds:string[]}} = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/habits/populateHabit`,
                data:{clientSelectedWeekStartTime,clientTimezoneOffset,_id:habitItem._id},
                headers:{Authorization: `Bearer ${token}`}
            })
            // Attach ids to populated entries
            const {populatedEntriesIds} = habitsResponse.data;
            [1,2,3,4,5,6,0].forEach((weekday:number) => {
                if (newEntries[weekday]) {
                    newEntries[weekday]!._id = populatedEntriesIds[weekday];
                }
            })
            dispatch(habitsActions.populateHabit({populatedEntries:newEntries,_id:habitItem._id}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(habitsActions.setHabitLoading(false))   
        }  
    }
    return {loadHabitsData,loadArchivedHabitsData,deleteHabit,addHabit,updateHabit,changeHabitStatus,toggleHabitArchiveStatus,populateHabit}
}

export default useHabitHooks