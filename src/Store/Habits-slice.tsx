import {createSlice} from '@reduxjs/toolkit';
import type {HabitInterface,} from '../Misc/Interfaces';

interface HabitsSchema {
    habitList: HabitInterface[],
    habitListLoaded:boolean,
    archivedHabitList: HabitInterface[],
    archivedHabitListLoaded:boolean,
    datepickerDate: string;
}

const initialHabitsState:HabitsSchema = {
    habitList:[],
    habitListLoaded:false,
    archivedHabitList:[],
    archivedHabitListLoaded:false,
    // habitEntries:[],
    datepickerDate: new Date().toString()
};
const habitsSlice = createSlice({
    name:'habits',
    initialState:initialHabitsState, 
    reducers:{
        addHabit(state,action) {
            const newHabit = action.payload.newHabit
            newHabit.entries = [...action.payload.newHabitEntries]
            state.habitList.push(newHabit)
        },
        deleteHabit(state,action) {
            state.habitList = state.habitList.filter(item=>{
                return item._id !== action.payload
            })
        },
        changeHabitStatus(state,action) {
            state.habitList = state.habitList.map(habitListItem=>{
                if(habitListItem._id === action.payload.habitId) {
                    habitListItem.entries.map(habitEntry=>{
                        if(habitEntry._id === action.payload.habitEntryId) {
                            habitEntry.habitEntryStatus = habitEntry.habitEntryStatus === 'Pending'?'Complete':'Pending'
                            habitEntry.dateCompleted = action.payload.dateCompleted
                        }
                        return habitEntry
                    })
                }
                return habitListItem
            })
        },
        updateHabit(state,action) {
            const newHabit = action.payload.newHabit;
            if(typeof(action.payload.newHabitEntries) !== 'string') {
                newHabit.habitEntries = [...action.payload.newHabitEntries];
            }
            state.habitList = state.habitList.map(item=>{
                if(item._id === newHabit._id) {
                    item = newHabit
                }
                return item
            })
        },
        populateHabit(state,action) {
            state.habitList = state.habitList.map(item=>{
                if(item._id === action.payload._id) {
                    item.entries = action.payload.newPopulatedEntries
                }
                return item
            })
        },
        updateGoalId(state,action) {
            state.habitList = state.habitList.map(item=>{
                if(item._id === action.payload._id) {
                    item.goalId = action.payload.goalId
                }
                return item
            })
        },
        toggleArchiveStatus(state,action) {
            if(action.payload.isArchived) {
                state.habitList = state.habitList.filter(item=>{
                    return item._id !== action.payload._id
                })
                state.archivedHabitList = state.archivedHabitList.concat({...action.payload})
            } else {
                const habitItem = action.payload.habitItem;
                habitItem.entries = action.payload.habitEntries
                state.archivedHabitList = state.archivedHabitList.filter(item=>{
                    return item._id !== habitItem._id
                })
                state.habitList = state.habitList.concat(habitItem)
            }
        },
        setHabits(state,action) {
            state.habitList = action.payload.habitList.map((habitListItem:any)=>{
                if(!habitListItem.entries) {
                    habitListItem.entries = []
                }
                action.payload.habitEntries.forEach((habitEntry:any)=>{
                    if(habitListItem._id === habitEntry.habitId) {
                        habitListItem.entries.push(habitEntry)
                    }
                })
                return habitListItem
            })
            state.habitListLoaded = true
            state.datepickerDate = action.payload.date
        },
        setArchiveHabits(state,action) {
            state.archivedHabitList = action.payload
            state.archivedHabitListLoaded = true
        },
        clearHabitData(state) {
            state.habitList = [];
            state.habitListLoaded = false;
            state.archivedHabitList = [];
            state.archivedHabitListLoaded = false;
        }
    }
});

export default habitsSlice