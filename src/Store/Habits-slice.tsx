import {createSlice} from '@reduxjs/toolkit';
import type {HabitEntryInterface, HabitInterface,} from '../Misc/Interfaces';

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
    // habitEntries:[],
    datepickerDate: new Date().toISOString()
};
const habitsSlice = createSlice({
    name:'habits',
    initialState:initialHabitsState, 
    reducers:{
        setHabitLoading(state,action) {
            state.habitLoading = action.payload
        },
        addHabit(state,action) {
            state.habitList.push(action.payload);
        },
        deleteHabit(state,action) {
            state.habitList = state.habitList.filter((item:HabitInterface)=>{
                return item._id !== action.payload
            })
        },
        changeHabitStatus(state,action) {
            state.habitList = state.habitList.map((habitListItem:HabitInterface)=>{
                if(habitListItem._id === action.payload.habitId) {
                    habitListItem.entries[action.payload.weekday].status = action.payload.dateCompleted ? "Complete" : "Pending";
                    habitListItem.entries[action.payload.weekday].dateCompleted = action.payload.dateCompleted;
                }
                return habitListItem;
            })
        },
        updateHabit(state,action) {
            const newHabit = action.payload.newHabit;
            if(typeof(action.payload.newHabitEntries) !== 'string') {
                newHabit.entries = [...action.payload.newHabitEntries];
            }
            state.habitList = state.habitList.map((item:HabitInterface)=>{
                if(item._id === newHabit._id) {
                    item = newHabit;
                }
                return item;
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
                habitItem.entries = action.payload.habitEntries;
                state.archivedHabitList = state.archivedHabitList.filter(item=>{
                    return item._id !== habitItem._id;
                })
                state.habitList = state.habitList.concat(habitItem);
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