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
    todoListLoaded:boolean,
    archivedTodoList:{
        todoTitle:string,
        todoDescription:string,
        todoCreationDate:string,
        todoTargetDate:string | null,
        todoStatus:string,
        isArchived:boolean,
        _id:string
    }[],
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
                if(item._id === action.payload) {
                    item.todoStatus = item.todoStatus === 'Pending'?'Complete':'Pending'
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
