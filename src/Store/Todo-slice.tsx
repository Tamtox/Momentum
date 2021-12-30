import {createSlice} from '@reduxjs/toolkit';

interface TodoSchema {
    todoList:{
        title:string,
        description:string,
        creationDate:string,
        targetDate:string,
        status:string,
        _id:string
    }[]
}

const initialTodoState:TodoSchema = {
    todoList:[]
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
                    item.status = item.status === 'Pending'?'Complete':'Pending'
                }
                return item
            })
        },
        setToDoList(state,action) {
            state.todoList = action.payload
        },
        editToDo(state,action) {
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
