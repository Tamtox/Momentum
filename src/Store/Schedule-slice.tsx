import {createSlice} from '@reduxjs/toolkit';
import type {ScheduleInterface} from "../Misc/Interfaces";

// Generates month with locale date strings in en-Gb format as keys 
const generateMonth = (date:Date = new Date()):{[date:string]:ScheduleInterface[]} => {
    const monthStart:Date = new Date(date.getFullYear(),date.getMonth(),date.getDate() - (date.getDate()  - 1),0,0,0,0);
    const monthEnd:Date = new Date(new Date(date.getFullYear(),date.getMonth() + 1,1,0,0,0,0).getTime() - 1);
    const month:{[date:string]:ScheduleInterface[]} = {};
    for (let i = monthStart.getDate(); i < monthEnd.getDate() + 1; i++) {
        const monthDate:Date = new Date(date.getFullYear(),date.getMonth(),i,0,0,0,0);
        month[monthDate.toLocaleDateString('en-Gb')] = [];
    }
    return month
}

interface ScheduleSchema {
    scheduleLoading:boolean,
    scheduleList:{[date:string]:ScheduleInterface[]}, // toLocaleDateString('en-Gb')
    scheduleListLoaded:boolean,
    scheduleDate:string
}

const initialScheduleState:ScheduleSchema = {
    scheduleLoading:false,
    scheduleList:generateMonth(),
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
            if (state.scheduleList[date]) {
                state.scheduleList[date].push(action.payload);
            }
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
                if (state.scheduleList[date]) {
                    state.scheduleList[date] = state.scheduleList[date].filter((item:ScheduleInterface)=>{
                        return item.parentId !== action.payload._id;
                    })
                }
            }
        },
        updateScheduleItem(state,action) {
            const newDate = new Date(action.payload.newItem.targetDate).toLocaleDateString('en-Gb');
            const oldDate = new Date(action.payload.oldItem.targetDate).toLocaleDateString('en-Gb');
            const scheduleItem:ScheduleInterface = {date:'',time:'',parentTitle:'',alarmUsed:false,isArchived:false,parentId:'',parentType:'',status:'',dateCompleted:'',utcOffset:0,_id:''};
            if (state.scheduleList[oldDate]) {
                state.scheduleList[oldDate] = state.scheduleList[oldDate].filter((item:ScheduleInterface)=>{
                    if (item.parentId === action.payload.oldItem._id) {
                        Object.assign(scheduleItem, item)
                    }
                    return item.parentId !== action.payload.oldItem._id;
                })
            }
            if (state.scheduleList[newDate]) {
                scheduleItem.date = action.payload.newItem.targetDate
                scheduleItem.time = action.payload.newItem.time
                scheduleItem.parentTitle = action.payload.newItem.title
                scheduleItem.alarmUsed = action.payload.newItem.alarmUsed
                scheduleItem.isArchived = action.payload.newItem.isArchived
                state.scheduleList[newDate].push(scheduleItem)
            }
        },  
        updateScheduleItemStatus(state,action) {
            const date = new Date(action.payload.date).toLocaleDateString('en-Gb');
            if (state.scheduleList[date]) {
                state.scheduleList[date] = state.scheduleList[date].map((item:ScheduleInterface)=>{
                    if (action.payload.parentId === item.parentId) {
                        item.dateCompleted = action.payload.dateCompleted;
                        item.status = action.payload.dateCompleted ? "Complete" : "Pending";
                        if(action.payload.parentType === "habit") {
                            item._id = action.payload._id 
                        }
                    }
                    return item;
                })
            }
        },  
        setScheduleList(state,action) {
            const date:Date = new Date(action.payload.date);
            state.scheduleList = generateMonth(date);
            state.scheduleList[date.toLocaleDateString('en-Gb')] = action.payload.scheduleList;
            state.scheduleListLoaded = true;
            state.scheduleDate = action.payload.date
        },
        clearScheduleList(state) {
            state.scheduleDate = new Date().toISOString();
            state.scheduleList = generateMonth(new Date());
            state.scheduleListLoaded = false;
        }
    }
})

export default scheduleSlice