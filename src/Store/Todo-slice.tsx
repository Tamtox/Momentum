import {createSlice} from '@reduxjs/toolkit';

interface TodoSchema {
    todoList:{
        todoTitle:string,
        todoDescription:string,
        todoCreationDate:string,
        todoTargetDate:string | null,
        todoStatus:string,
        isArchived:boolean,
        _id:string
    }[],
    archiveLoaded:boolean
}

const initialTodoState:TodoSchema = {
    todoList:[],
    archiveLoaded:false
}
const todoSlice = createSlice({
    name:'todo',
    initialState:initialTodoState,
    reducers:{
        addToDo(state,action) {
            state.todoList.push(action.payload)
        },
        deleteToDo(state,action) {
            state.todoList = state.todoList.filter(item=>{
                return item._id !== action.payload
            })
        },
        changeToDoStatus(state,action) {
            state.todoList = state.todoList.map(item=>{
                if(item._id === action.payload) {
                    item.todoStatus = item.todoStatus === 'Pending'?'Complete':'Pending'
                }
                return item
            })
        },
        setToDoList(state,action) {
            state.todoList = action.payload
        },
        setArchivedToDoList(state,action) {
            state.todoList = state.todoList.concat(action.payload)
            if(action.payload.length > 0) {
                state.archiveLoaded = true
            }
        },
        updateToDo(state,action) {
            state.todoList = state.todoList.map(item=>{
                if(item._id === action.payload._id) {
                    item = action.payload
                }
                return item
            })
        },
        clearToDoList(state) {
            state.todoList = []
        }
    }
});

export default todoSlice
