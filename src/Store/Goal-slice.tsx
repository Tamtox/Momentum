import {createSlice} from '@reduxjs/toolkit';
import type {GoalInterface} from '../Misc/Interfaces';

interface GoalSchema {
    goalLoading:boolean,
    goalList: GoalInterface[],
    goalListLoaded:boolean,
    archivedGoalList: GoalInterface[],
    archivedGoalListLoaded:boolean,
}

const initialGoalState:GoalSchema = {
    goalLoading:false,
    goalList: [],
    goalListLoaded:false,
    archivedGoalList:[],
    archivedGoalListLoaded:false,
}

const goalSlice = createSlice({
    name:'goals',
    initialState:initialGoalState, 
    reducers:{
        setGoalLoading(state,action) {
            state.goalLoading = action.payload
        },
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
                if(item._id === action.payload._id) {
                    item.status = item.status === 'Pending'?'Complete':'Pending'
                    item.dateCompleted = action.payload.dateCompleted
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