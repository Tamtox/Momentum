import {createSlice} from '@reduxjs/toolkit';

interface HabitsSchema {
    habitList: {
        habitTitle:string,
        habitTime:string | null,
        habitCreationDate:string,
        habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},
        goalId:string | null, 
        _id:string,
    }[],
    habitEntries: {
        habitTitle:string,
        habitTime:string | null,
        habitStatus:string,
        habitId:string,
        date:string,
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
            if(action.payload.newHabitEntry) {
                state.habitEntries.push(action.payload.newHabitEntry)
            }
        },
        deleteHabit(state,action) {
            state.habitList = state.habitList.filter(item=>{
                return item._id !== action.payload
            })
        },
        changeHabitStatus(state,action) {
            state.habitEntries = state.habitEntries.map(item=>{
                if(item._id === action.payload) {
                    item.habitStatus = item.habitStatus === 'Pending'?'Complete':'Pending'
                }
                return item
            })
        },
        setHabits(state,action) {
            state.habitList = action.payload.habitList
            state.habitEntries = action.payload.habitEntries
        },
        clearHabitData(state) {
            state.habitEntries = []
            state.habitList = []
        }
    }
});


export default habitsSlice
