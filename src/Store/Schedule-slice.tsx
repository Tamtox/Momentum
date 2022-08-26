import {createSlice} from '@reduxjs/toolkit';
import type {ScheduleInterface} from "../Misc/Interfaces";


interface ScheduleSchema {
    scheduleLoading:boolean,
    scheduleList:ScheduleInterface[],
    scheduleListLoaded:boolean,
    scheduleDate:string
}

const initialScheduleState:ScheduleSchema = {
    scheduleLoading:false,
    scheduleList:[],
    scheduleListLoaded:false,
    scheduleDate: new Date().toISOString(),
}

const scheduleSlice = createSlice({
    name:'schedule',
    initialState:initialScheduleState,
    reducers: {
        setScheduleLoading(state,action) {
            state.scheduleLoading = action.payload
        },
        addScheduleItem(state,action) {
            if(new Date(action.payload.date).toLocaleDateString() === new Date(state.scheduleDate).toLocaleDateString()) {
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
                    item.date = action.payload.date
                    item.time = action.payload.time
                    item.parentTitle = action.payload.title
                    item.isArchived = action.payload.isArchived
                }
                return item;
            })
        },  
        updateScheduleItemStatus(state,action) {
            state.scheduleList = state.scheduleList.map((item:ScheduleInterface)=>{
                if(action.payload._id === item.parentId) {
                    item.dateCompleted = action.payload.dateCompleted
                }
                return item;
            })
        },  
        setScheduleList(state,action) {
            state.scheduleList = action.payload;
            state.scheduleListLoaded = true;
        },
        clearScheduleList(state) {
            state.scheduleDate = new Date().toISOString();
            state.scheduleList = [];
            state.scheduleListLoaded = false;
        }
    }
})

export default scheduleSlice