import {createSlice} from '@reduxjs/toolkit';

interface HabitsSchema {
    habitList: {
        habitTitle:string,
        habitTime:string | null,
        habitCreationDate:string, /* Date format : Date.toString() */
        habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},
        goalId:string | null,
        goalTargetDate:string | null,
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
        _id:string,
    }[],
    datepickerDate: string;
}

const initialHabitsState:HabitsSchema = {
    habitList:[],
    // habitEntries:[],
    datepickerDate: new Date().toString()
};
const habitsSlice = createSlice({
    name:'habits',
    initialState:initialHabitsState, 
    reducers:{
        addHabit(state,action) {
            const newHabit = action.payload.newHabit
            newHabit.habitEntries = [...action.payload.newHabitEntries]
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
                    habitListItem.habitEntries.map(habitEntry=>{
                        if(habitEntry._id === action.payload.habitEntryId) {
                            habitEntry.habitEntryStatus = habitEntry.habitEntryStatus === 'Pending'?'Complete':'Pending'
                        }
                        return habitEntry
                    })
                }
                return habitListItem
            })
        },
        updateHabit(state,action) {
            const newHabit = action.payload.newHabit
            newHabit.habitEntries = [...action.payload.newHabitEntries]
            state.habitList = state.habitList.map(item=>{
                if(item._id === newHabit._id) {
                    item = newHabit
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
            state.habitList = action.payload.habitList.map((habitListItem:any)=>{
                if(!habitListItem.habitEntries) {
                    habitListItem.habitEntries = []
                }
                action.payload.habitEntries.forEach((habitEntry:any)=>{
                    if(habitListItem._id === habitEntry.habitId) {
                        habitListItem.habitEntries.push(habitEntry)
                    }
                })
                return habitListItem
            })
            state.datepickerDate = action.payload.date
        },
        clearHabitData(state) {
            state.habitList = [];
        }
    }
});


export default habitsSlice
