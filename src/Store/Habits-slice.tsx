import {createSlice} from '@reduxjs/toolkit';

interface HabitsSchema {
    habitList: {
        habitTitle:string,
        habitTime:string | null,
        habitCreationDate:string, /* Date format : Date.toString() */
        habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},
        goalId:string | null,
        goalTargetDate:string | null,
        _id:string,
    }[],
    habitEntries: {
        weekStart:string,  /* Date format : "day/month/year" */
        weekEnd:string, /* Date format : "day/month/year" */
        habitId:string,
        year:string, /* Date format : .getFullYear() */
        month:string, /* Date format : .getMonth() + 1 */
        date:string, /* Date format : .getDate() */
        weekday:string,
        habitEntryStatus:string
        _id:string,
    }[],
}

const initialHabitsState:HabitsSchema = {
    habitList:[],
    habitEntries:[],
};
const habitsSlice = createSlice({
    name:'habits',
    initialState:initialHabitsState, 
    reducers:{
        addHabit(state,action) {
            state.habitList.push(action.payload.newHabit)
            state.habitEntries.push(action.payload.newHabitEntries)
        },
        deleteHabit(state,action) {
            state.habitList = state.habitList.filter(item=>{
                return item._id !== action.payload
            })
            state.habitEntries = state.habitEntries.filter(item=>{
                return item.habitId !== action.payload
            })
        },
        changeHabitStatus(state,action) {
            state.habitEntries = state.habitEntries.map(item=>{
                if(item._id === action.payload) {
                    item.habitEntryStatus = item.habitEntryStatus === 'Pending'?'Complete':'Pending'
                }
                return item
            })
        },
        updateHabit(state,action) {
            state.habitList = state.habitList.map(item=>{
                if(item._id === action.payload._id) {
                    item = action.payload
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
        setHabits(state,action) {
            state.habitList = action.payload.habitList
            state.habitEntries = action.payload.habitEntries
        },
        clearHabitData(state) {
            state.habitList = []
            state.habitEntries = []
        }
    }
});


export default habitsSlice
