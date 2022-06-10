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
            state.notificationList.push(action.payload)
        },
        deleteNotification(state,action) {
            state.notificationList = state.notificationList.filter(item=>{
                return item._id !== action.payload
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