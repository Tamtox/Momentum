import {createSlice} from '@reduxjs/toolkit';
import type {GoalInterface} from '../Misc/Interfaces';

interface GoalSchema {
    goalList: GoalInterface[],
    goalListLoaded:boolean,
    archivedGoalList: GoalInterface[],
    archivedGoalListLoaded:boolean,
}

const initialGoalState:GoalSchema = {
    goalList: [],
    goalListLoaded:false,
    archivedGoalList:[],
    archivedGoalListLoaded:false,
}

const goalSlice = createSlice({
    name:'goals',
    initialState:initialGoalState, 
    reducers:{
        addGoal(state,action) {
            state.goalList.push(action.payload)
        },
        deleteGoal(state,action) {
            state.goalList = state.goalList.filter(item=>{
                return item._id !== action.payload
            })
        },
        changeGoalStatus(state,action) {
            state.goalList = state.goalList.map(item=>{
                if(item._id === action.payload) {
                    item.goalStatus = item.goalStatus === 'Pending'?'Complete':'Pending'
                }
                return item
            })
        },
        updateGoal(state,action) {
            if(action.payload.isArchived) {
                state.archivedGoalList.push(action.payload)
                state.goalList = state.goalList.filter(item=>{
                    return item._id !== action.payload._id
                })
            } else {
                state.goalList = state.goalList.map(item=>{
                    if(item._id === action.payload._id) {
                        item = action.payload
                    }
                    return item
                })
            }
        },
        updateHabitId(state,action) {
            state.goalList = state.goalList.map(item=>{
                if(item._id === action.payload._id) {
                    item.habitId = action.payload.habitId
                }
                return item
            })
        },
        toggleArchiveStatus(state,action) {
            if(action.payload.isArchived) {
                state.goalList = state.goalList.filter(item=>{
                    return item._id !== action.payload._id
                })
                state.archivedGoalList = state.archivedGoalList.concat({...action.payload})
            } else {
                state.archivedGoalList = state.archivedGoalList.filter(item=>{
                    return item._id !== action.payload._id
                })
                state.goalList = state.goalList.concat({...action.payload})
            }
        },
        setGoalList(state,action) {
            state.goalList = action.payload
            state.goalListLoaded = true
        },
        setArchivedGoalList(state,action) {
            state.archivedGoalList = action.payload
            state.archivedGoalListLoaded = true
        },
        clearGoalData(state) {
            state.goalList = [];
            state.goalListLoaded = false;
            state.archivedGoalList = [];
            state.archivedGoalListLoaded = false;
        }
    }
});

export default goalSlice