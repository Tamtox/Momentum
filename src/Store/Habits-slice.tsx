import {createSlice} from '@reduxjs/toolkit';

interface HabitsSchema {
    habitList: {
        title:string,
        weekdays:{[key:number]:boolean},
        creationDate:string,
        targetDate:string,
        _id:string
    }[],
    habitEntries: {
        title:string,
        date:string,
        status:string,
        _id:string
    }[]
}

const initialHabitsState:HabitsSchema = {
    habitList:[],
    habitEntries:[]
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
                    item.status = item.status === 'Pending'?'Complete':'Pending'
                }
                return item
            })
        },
        setHabits(state,action) {
            state.habitList = action.payload
            state.habitEntries = action.payload
        },
        clearHabitData(state) {
            state.habitEntries = []
            state.habitList = []
        }
    }
});


export default habitsSlice
