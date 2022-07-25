// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
import { notificationActions } from "../Store/Store";
import type { NotificationInterface } from "../Misc/Interfaces";

const httpAddress = `http://localhost:3001`;

const useNotificationHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const loadNotifications = async (date:Date) => {
        try {
            const notificationResponse = await axios.request({
                method:'POST',
                url:`${httpAddress}/notification/loadNotifications`,
                data:{selectedDate:Date},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(notificationActions.setNotificationList(notificationResponse.data.notificationList));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    const updateNotificationStatus = async (updatedNotification:NotificationInterface) => {
        try {
            await axios.request({
                method:'PATCH',
                url:`${httpAddress}/notification/updateNotificationStatus`,
                data:{dateCompleted:updatedNotification.dateCompleted,_id:updatedNotification._id},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(notificationActions.updateNotification(updatedNotification));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    return {loadNotifications,updateNotificationStatus}
}

export default useNotificationHooks