import {createSlice} from '@reduxjs/toolkit';

interface GoalSchema {
    goalList: {
        goalTitle:string,
        goalCreationDate:string,
        goalTargetDate:string,
        goalStatus:string,
        _id:string
    }[]
}

const initialGoalState:GoalSchema = {
    goalList: []
}

const goalSlice = createSlice({
    name:'goals',
    initialState:initialGoalState, 
    reducers:{
        addGoal(state,action) {
            state.goalList.push(action.payload.newGoal)
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
        setHabits(state,action) {
            state.goalList = action.payload.goalList
        },
        clearGoalData(state) {
            state.goalList = []
        }
    }
});

export default goalSlice