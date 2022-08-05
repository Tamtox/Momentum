import {createSlice} from '@reduxjs/toolkit';
import type {NotificationInterface} from "../Misc/Interfaces";


interface NotificationSchema {
    notificationList:NotificationInterface[],
    notificationListLoaded:boolean
}

const initialNotificationState:NotificationSchema = {
    notificationList:[],
    notificationListLoaded:false,
}

const notificationSlice = createSlice({
    name:'notification',
    initialState:initialNotificationState,
    reducers: {
        addNotification(state,action) {
            if(action.payload) {
                state.notificationList.push(action.payload);
            }
        },
        deleteNotification(state,action) {
            state.notificationList = state.notificationList.filter((item:NotificationInterface)=>{
                return item.notificationParentId !== action.payload;
            })
        },
        updateNotification(state,action) {
            state.notificationList = state.notificationList.map((item:NotificationInterface)=>{
                if(action.payload._id === item.notificationParentId) {
                    item.alarmUsed = action.payload.alarmUsed
                    item.date = action.payload.targetDate
                    item.notificationParentTitle = action.payload.title
                }
                return item
            })
        },  
        updateNotificationStatus(state,action) {
            state.notificationList = state.notificationList.map((item:NotificationInterface)=>{
                if(action.payload._id === item.notificationParentId) {
                    item.alarmUsed = action.payload.alarmUsed
                    item.dateCompleted = action.payload.dateCompleted
                }
                return item
            })
        },  
        setNotificationList(state,action) {
            state.notificationList = action.payload;
            state.notificationListLoaded = true;
        },
        clearNotificationList(state) {
            state.notificationList = [];
            state.notificationListLoaded = false;
        }
    }
})

export default notificationSlice