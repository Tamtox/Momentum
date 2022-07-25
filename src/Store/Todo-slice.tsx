import {createSlice} from '@reduxjs/toolkit';
import type {TodoInterface} from '../Misc/Interfaces';

interface TodoSchema {
    todoList:TodoInterface[],
    todoListLoaded:boolean,
    archivedTodoList:TodoInterface[],
    archivedTodoListLoaded:boolean,
}

const initialTodoState:TodoSchema = {
    todoList:[],
    archivedTodoList:[],
    todoListLoaded : false,
    archivedTodoListLoaded : false,
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
                if(item._id === action.payload._id) {
                    item.status = item.status === 'Pending'?'Complete':'Pending';
                    item.dateCompleted = action.payload.dateCompleted
                }
                return item
            })
        },
        setToDoList(state,action) {
            state.todoList = action.payload
            state.todoListLoaded = true
        },
        setArchivedToDoList(state,action) {
            state.archivedTodoList = action.payload
            state.archivedTodoListLoaded = true
        },
        updateToDo(state,action) {
            state.todoList = state.todoList.map(item=>{
                if(item._id === action.payload._id) {
                    item = action.payload
                }
                return item
            })
        },
        toggleArchiveStatus(state,action) {
            if(action.payload.isArchived) {
                state.todoList = state.todoList.filter(item=>{
                    return item._id !== action.payload._id
                })
                state.archivedTodoList = state.archivedTodoList.concat({...action.payload})
            } else {
                state.archivedTodoList = state.archivedTodoList.filter(item=>{
                    return item._id !== action.payload._id
                })
                state.todoList = state.todoList.concat({...action.payload})
            }
        },
        clearToDoList(state) {
            state.todoList = [];
            state.todoListLoaded = false;
            state.archivedTodoList = [];
            state.archivedTodoListLoaded = false;
        }
    }
});

export default todoSlice
