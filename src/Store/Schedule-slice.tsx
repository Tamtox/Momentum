import {createSlice} from '@reduxjs/toolkit';

interface ScheduleSchema {
    schedule:{
        title:string,
        weekdays:{[key:number]:boolean},
        time:string,
        _id:string
    }[]
}

const initialScheduleState:ScheduleSchema = {
    schedule:[]
}

const scheduleSlice = createSlice({
    name:'schedule',
    initialState:initialScheduleState,
    reducers:{
        addTask(state,action) {
            state.schedule.push(action.payload)
        },
        removeTask(state,action) {
            state.schedule = state.schedule.filter(item=>{
                return item._id !== action.payload
            })
        },
        setSchedule(state,action) {
            state.schedule = action.payload
        },
        clearSchedule(state) {
            state.schedule = []
        }
    }
});

export default scheduleSlice