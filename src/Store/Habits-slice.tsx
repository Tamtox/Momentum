import {createSlice} from '@reduxjs/toolkit';
import type {HabitInterface} from '../Misc/Interfaces';

interface HabitsSchema {
    habitLoading:boolean,
    habitList: HabitInterface[],
    habitListLoaded:boolean,
    archivedHabitList: HabitInterface[],
    archivedHabitListLoaded:boolean,
    datepickerDate: string;
}

const initialHabitsState:HabitsSchema = {
    habitLoading:false,
    habitList:[],
    habitListLoaded:false,
    archivedHabitList:[],
    archivedHabitListLoaded:false,
    datepickerDate: new Date(new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6)).toISOString(),
};
const habitsSlice = createSlice({
    name:'habits',
    initialState:initialHabitsState, 
    reducers:{
        setHabitLoading(state,action) {
            state.habitLoading = action.payload
        },
        addHabit(state,action) {
            // Check if current week is selected
            const newHabit:HabitInterface = action.payload;
            const selectedDate = new Date(state.datepickerDate).getTime();
            const currentWeekStart = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
            const currentWeekEnd = currentWeekStart + 86400000 * 7;
            const blankEntries:{[weekday:number]:null} = {1:null,2:null,3:null,4:null,5:null,6:null,0:null};
            if(selectedDate < currentWeekStart || selectedDate >= currentWeekEnd) newHabit.entries = blankEntries;
            state.habitList.push(newHabit);
        },
        deleteHabit(state,action) {
            state.habitList = state.habitList.filter((item:HabitInterface)=>{
                return item._id !== action.payload
            })
        },
        changeHabitStatus(state,action) {
            state.habitList = state.habitList.map((habitListItem:HabitInterface)=>{
                if(habitListItem._id === action.payload.newEntry.habitId) {
                    habitListItem.entries[action.payload.weekday]! = action.payload.newEntry;
                }
                return habitListItem;
            })
        },
        updateHabit(state,action) {
            const newHabit:HabitInterface = action.payload;
            const selectedDate = new Date(state.datepickerDate).getTime();
            const currentWeekStart = new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
            const currentWeekEnd = currentWeekStart + 86400000 * 7;
            state.habitList = state.habitList.map((item:HabitInterface)=>{
                if(item._id === newHabit._id) {
                    // Check if current week is selected
                    const oldEntries = Object.assign({},item.entries);
                    if(selectedDate < currentWeekStart || selectedDate >= currentWeekEnd) newHabit.entries = oldEntries
                    item = newHabit;
                }
                return item;
            })
        },
        populateHabit(state,action) {
            state.habitList = state.habitList.map(item=>{
                if(item._id === action.payload._id) {
                    item.entries = action.payload.populatedEntries;
                }
                return item;
            })
        },
        toggleArchiveStatus(state,action) {
            const habitItem = action.payload;
            if(habitItem.isArchived) {
                state.habitList = state.habitList.filter(item=>{
                    return item._id !== habitItem._id
                })
                state.archivedHabitList = state.archivedHabitList.concat(habitItem);
            } else {
                state.archivedHabitList = state.archivedHabitList.filter(item=>{
                    return item._id !== habitItem._id;
                })
                state.habitList = state.habitList.concat(habitItem);
                state.datepickerDate = new Date(new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6)).toISOString();
            }
        },
        setHabits(state,action) {
            state.habitList = action.payload.habitList;
            state.habitListLoaded = true;
            state.datepickerDate = action.payload.date;
        },
        setArchiveHabits(state,action) {
            state.archivedHabitList = action.payload;
            state.archivedHabitListLoaded = true;
        },
        clearHabitData(state) {
            state.habitList = [];
            state.habitListLoaded = false;
            state.archivedHabitList = [];
            state.archivedHabitListLoaded = false;
            state.datepickerDate = new Date().toISOString();
        }
    }
});

export default habitsSlice