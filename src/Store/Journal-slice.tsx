import {createSlice} from '@reduxjs/toolkit';

interface JournalSchema {
    date:string,
    entry:string,
    _id:string
}

const initialJournalState:JournalSchema = {
    date:"",
    entry:"",
    _id:"",
};

const journalSlice = createSlice({
    name:'journal',
    initialState:initialJournalState,
    reducers:{
        setEntry(state,action) {
            state.date = action.payload.date
            state.entry = action.payload.entry
            state._id = action.payload._id
        },
        updateEntry(state,action) {
            state.entry = action.payload
        },
        clearEntry(state) {
            state.date = ""
            state.entry = ""
            state._id = ""
        }
    }
});

export default journalSlice