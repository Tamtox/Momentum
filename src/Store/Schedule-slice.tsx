import {createSlice} from '@reduxjs/toolkit';
import type {ScheduleInterface} from "../Misc/Interfaces";


interface ScheduleSchema {
    scheduleLoading:boolean,
    scheduleList:ScheduleInterface[],
    scheduleListLoaded:boolean
}

const initialScheduleState:ScheduleSchema = {
    scheduleLoading:false,
    scheduleList:[],
    scheduleListLoaded:false,
}

const scheduleSlice = createSlice({
    name:'schedule',
    initialState:initialScheduleState,
    reducers: {
        setScheduleLoading(state,action) {
            state.scheduleLoading = action.payload
        },
        addScheduleItem(state,action) {
            if(action.payload) {
                state.scheduleList.push(action.payload);
            }
        },
        deleteScheduleItem(state,action) {
            state.scheduleList = state.scheduleList.filter((item:ScheduleInterface)=>{
                return item.parentId !== action.payload;
            })
        },
        updateScheduleItem(state,action) {
            state.scheduleList = state.scheduleList.map((item:ScheduleInterface)=>{
                if(action.payload._id === item.parentId) {
                    item.alarmUsed = action.payload.alarmUsed
                    item.date = action.payload.targetDate
                    item.parentTitle = action.payload.title
                }
                return item
            })
        },  
        updateScheduleItemStatus(state,action) {
            state.scheduleList = state.scheduleList.map((item:ScheduleInterface)=>{
                if(action.payload._id === item.parentId) {
                    item.alarmUsed = action.payload.alarmUsed
                    item.dateCompleted = action.payload.dateCompleted
                }
                return item
            })
        },  
        setScheduleList(state,action) {
            state.scheduleList = action.payload;
            state.scheduleListLoaded = true;
        },
        clearScheduleList(state) {
            state.scheduleList = [];
            state.scheduleListLoaded = false;
        }
    }
})

export default scheduleSlice