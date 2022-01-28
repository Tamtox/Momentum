import {createSlice} from '@reduxjs/toolkit';

interface JournalSchema {
    date:string|null,
    journalEntry:string,
    _id:string
}

const initialJournalState:JournalSchema = {
    date:null,
    journalEntry:"",
    _id:"",
};

const journalSlice = createSlice({
    name:'journal',
    initialState:initialJournalState,
    reducers:{
        setEntry(state,action) {
            state.date = action.payload.date
            state.journalEntry = action.payload.journalEntry
            state._id = action.payload._id
        },
        updateEntry(state,action) {
            state.journalEntry = action.payload
        },
        clearEntry(state) {
            state.date = ""
            state.journalEntry = ""
            state._id = ""
        }
    }
});

export default journalSlice