// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { goalActions,scheduleActions } from "../Store/Store";
import type {GoalInterface} from '../Misc/Interfaces';
import {createPairedScheduleItem,determineScheduleAction} from '../Misc/Helper-functions';

import { host } from "../Misc/variables";

const useGoalHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    // Load goal data
    const loadGoalData = async (newToken?:string) => {
        dispatch(goalActions.setGoalLoading(true))
        try {
            const goalListResponse = await axios.request({
                method:'GET',
                url:`${host}/goals/getGoals`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(goalActions.setGoalList(goalListResponse.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(goalActions.setGoalLoading(false))   
        } 
    }
     // Load archived goal data
    const loadArchivedGoalData = async (newToken?:string) => {
        dispatch(goalActions.setGoalLoading(true))
        try {
            const goalListResponse = await axios.request({
                method:'GET',
                url:`${host}/goals/getArchivedGoals`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(goalActions.setArchivedGoalList(goalListResponse.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(goalActions.setGoalLoading(false))   
        }
    }
    // Toggle Goal status
    const changeGoalStatus = async (newGoal:GoalInterface) => {
        const status = newGoal.status === "Pending" ?  "Complete" : "Pending";
        const dateCompleted =  newGoal.status === "Pending" ? new Date().toISOString() : null;
        const {targetDate,_id} = newGoal;
        try {
            await axios.request({
                method:'PATCH',
                url:`${host}/goals/updateGoal`,
                headers:{Authorization: `Bearer ${token}`},
                data:{...newGoal,dateCompleted,status}
            })
            // Dispatch schedule status update
            const scheduleItemUpdate = {date:targetDate,dateCompleted,status,parentId:_id,parentType:"goal"};
            dispatch(scheduleActions.updateScheduleItemStatus(scheduleItemUpdate));
            dispatch(goalActions.changeGoalStatus({_id,dateCompleted}))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    // Add goal
    const addGoal = async (newGoal:GoalInterface) => {
        dispatch(goalActions.setGoalLoading(true)); 
        try {
            const newGoalResponse:{data:{goalId:string,scheduleId:string}} = await axios.request({
                method:'POST',
                url:`${host}/goals/addNewGoal`,
                data:{...newGoal,timezoneOffset:new Date().getTimezoneOffset()},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {goalId,scheduleId} = newGoalResponse.data;
            newGoal._id = goalId
            // Create schedule item
            if (newGoal.targetDate) {
                const {targetDate,title,alarmUsed,creationUTCOffset,_id} = newGoal;
                const scheduleItem = await createPairedScheduleItem(null,targetDate,title,'goal',_id,alarmUsed,creationUTCOffset,scheduleId);  
                dispatch(scheduleActions.addScheduleItem(scheduleItem));
            }
            dispatch(goalActions.addGoal(newGoal));    
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error);
        } finally {
            dispatch(goalActions.setGoalLoading(false));   
        }
    }
    // Update goal
    const updateGoal = async (newGoal:GoalInterface,oldGoal:GoalInterface) => {
        dispatch(goalActions.setGoalLoading(true))     
        // Determine the schedule action
        let scheduleAction:string|null = determineScheduleAction(newGoal.targetDate,oldGoal.targetDate);
        try {
            const updateGoalResponse:{data:{scheduleId:string}} = await axios.request({
                method:'PATCH',
                url:`${host}/goals/updateGoal`,
                data:{...newGoal,timezoneOffset:new Date().getTimezoneOffset()},
                headers:{Authorization: `Bearer ${token}`}
            })
            // Add,update,delete schedule item
            const {scheduleId} = updateGoalResponse.data;
            dispatch(goalActions.updateGoal(newGoal));
            // Check if schedule item needs to be added, deleted or updated  
            if (scheduleAction === "create") {
                const {targetDate,title,alarmUsed,creationUTCOffset,_id} = newGoal;
                if (targetDate) {
                    const scheduleItem = await createPairedScheduleItem(null,targetDate,title,'goal',_id,alarmUsed,creationUTCOffset,scheduleId);  
                    dispatch(scheduleActions.addScheduleItem(scheduleItem));
                }
            } else if (scheduleAction === "update") {
                dispatch(scheduleActions.updateScheduleItem({newItem:newGoal,oldItem:oldGoal}));
            } else if (scheduleAction === "delete") {
                dispatch(scheduleActions.deleteScheduleItem(newGoal));
            }
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(goalActions.setGoalLoading(false))   
        }   
    }
    // Toggle archive status
    const toggleGoalArchiveStatus = async (goalItem:GoalInterface) => {
        dispatch(goalActions.setGoalLoading(true));    
        const isArchived = goalItem.isArchived ? false : true
        try {
            const goalResponse:{data:{scheduleId:string}} = await axios.request({
                method:'PATCH',
                url:`${host}/goals/updateGoal`,
                data:{...goalItem,isArchived},
                headers:{Authorization: `Bearer ${token}`}
            })
            const {scheduleId} = goalResponse.data;
            // Set schedule item
            if(goalItem.targetDate && scheduleId) {
                const {targetDate,title,alarmUsed,creationUTCOffset,_id} = goalItem;
                const scheduleItem = await createPairedScheduleItem(null,targetDate,title,"goal",_id,alarmUsed,creationUTCOffset,scheduleId);  
                isArchived ? dispatch(scheduleActions.deleteScheduleItem({_id:goalItem._id,targetDate:goalItem.targetDate,parentType:"goal"})) : dispatch(scheduleActions.addScheduleItem(scheduleItem));
            }
            dispatch(goalActions.toggleArchiveStatus({...goalItem,isArchived:isArchived})) ;
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(goalActions.setGoalLoading(false))   
        }   
    }
    // Delete Goal
    const deleteGoal = async (goalItem:GoalInterface) => {
        dispatch(goalActions.setGoalLoading(true))     
        try {
            await axios.request({
                method:'DELETE',
                url:`${host}/goals/deleteGoal`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id:goalItem._id}
            })
            dispatch(goalActions.deleteGoal(goalItem._id));
            goalItem.targetDate && dispatch(scheduleActions.deleteScheduleItem({_id:goalItem._id,targetDate:goalItem.targetDate,parentType:"goal"}));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(goalActions.setGoalLoading(false))   
        }   
    }
    return {loadGoalData,loadArchivedGoalData,changeGoalStatus,addGoal,updateGoal,toggleGoalArchiveStatus,deleteGoal}
}

export default useGoalHooks