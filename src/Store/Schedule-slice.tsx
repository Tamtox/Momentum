import {createSlice} from '@reduxjs/toolkit';
import type {ScheduleInterface} from "../Misc/Interfaces";

const currentDate = new Date().getDate() - 1;
const monthStart = new Date().setHours(0,0,0,0) - currentDate * 86400000;

interface ScheduleSchema {
    scheduleLoading:boolean,
    scheduleList:{[date:string]:ScheduleInterface[]}, // toLocaleDateString('en-Gb')
    scheduleListLoaded:boolean,
    scheduleDate:string
}

const initialScheduleState:ScheduleSchema = {
    scheduleLoading:false,
    scheduleList:{},
    scheduleListLoaded:false,
    scheduleDate: new Date().toISOString(),
}

const scheduleSlice = createSlice({
    name:'schedule',
    initialState:initialScheduleState,
    reducers: {
        setScheduleLoading(state,action) {
            state.scheduleLoading = action.payload;
        },
        addScheduleItem(state,action) {
            const date = new Date(action.payload.date).toLocaleDateString('en-Gb');
            if (!state.scheduleList[date]) {
                state.scheduleList[date] = [];
            }
            state.scheduleList[date].push(action.payload);
        },
        deleteScheduleItem(state,action) {
            if (action.payload.parentType === 'habit') {
                const dates = Object.keys(state.scheduleList);
                dates.forEach((date:string) => {
                    state.scheduleList[date] = state.scheduleList[date].filter((item:ScheduleInterface)=>{
                        return item.parentId !== action.payload._id;
                    })
                });
            } else {
                const date = new Date(action.payload.targetDate).toLocaleDateString('en-Gb');
                state.scheduleList[date] = state.scheduleList[date].filter((item:ScheduleInterface)=>{
                    return item.parentId !== action.payload._id;
                })
            }
        },
        updateScheduleItem(state,action) {
            const date = new Date(action.payload.targetDate).toLocaleDateString('en-Gb');
            if (!state.scheduleList[date]) {
                state.scheduleList[date] = [];
            }
            state.scheduleList[date] = state.scheduleList[date].map((item:ScheduleInterface)=>{
                if (action.payload._id === item.parentId) {
                    item.date = action.payload.targetDate
                    item.time = action.payload.time
                    item.parentTitle = action.payload.title
                    item.alarmUsed = action.payload.alarmUsed
                    item.isArchived = action.payload.isArchived
                }
                return item;
            })
        },  
        updateScheduleItemStatus(state,action) {
            const date = new Date(action.payload.date).toLocaleDateString('en-Gb');
            state.scheduleList[date] = state.scheduleList[date].map((item:ScheduleInterface)=>{
                if (action.payload._id === item.parentId) {
                    item.dateCompleted = action.payload.dateCompleted;
                    item.status = action.payload.dateCompleted ? "Complete" : "Pending";
                }
                return item;
            })
        },  
        setScheduleList(state,action) {
            const date = new Date(action.payload.date).toLocaleDateString('en-Gb');
            state.scheduleList[date] = action.payload.scheduleList;
            state.scheduleListLoaded = true;
            state.scheduleDate = action.payload.date
        },
        clearScheduleList(state) {
            state.scheduleDate = new Date().toISOString();
            state.scheduleList = {};
            state.scheduleListLoaded = false;
        }
    }
})

export default scheduleSlice