// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
import { scheduleActions } from "../Store/Store";
import type { HabitInterface, ScheduleInterface } from "../Misc/Interfaces";
import {getDate,createHabitEntries} from './Helper-functions';

const httpAddress = `http://localhost:3001`;

const useScheduleHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const loadScheduleItems = async (date:Date,habitList:HabitInterface[]) => {
        dispatch(scheduleActions.setScheduleLoading(true));
        const clientSelectedDayStartTime = new Date(date).setHours(0,0,0,0);
        const clientTimezoneOffset = new Date().getTimezoneOffset();
        try {
            const scheduleResponse:{data:{scheduleList:ScheduleInterface[]}} = await axios.request({
                method:'POST',
                url:`${httpAddress}/schedule/getSchedule`,
                data:{clientSelectedDayStartTime,clientTimezoneOffset},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {scheduleList} = scheduleResponse.data;
            const habitScheduleList = scheduleList.filter((scheduleItem:ScheduleInterface)=>scheduleItem.parentType === "habit");
            const {utcDayStartMidDay,utcNextDayMidDay} = getDate(clientSelectedDayStartTime,clientTimezoneOffset);
            const newHabitScheduleList:ScheduleInterface[] = [];
            habitList.forEach((habitItem:HabitInterface)=> {
                // const {newScheduleEntries} = createHabitEntries(habitItem,utcDayStartMidDay,utcNextDayMidDay,false,);
            })
            dispatch(scheduleActions.setScheduleList({scheduleList,date:date.toISOString()}));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        dispatch(scheduleActions.setScheduleLoading(false));
    }
    const updateScheduleItemStatus = async (updatedScheduleItem:ScheduleInterface) => {
        try {
            await axios.request({
                method:'PATCH',
                url:`${httpAddress}/schedule/updateScheduleItemStatus`,
                data:{dateCompleted:updatedScheduleItem.dateCompleted,_id:updatedScheduleItem._id},
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(scheduleActions.updateScheduleItem(updatedScheduleItem));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    return {loadScheduleItems,updateScheduleItemStatus}
}

export default useScheduleHooks