import {createSlice} from '@reduxjs/toolkit';

interface JournalSchema {
    journalLoading:boolean,
    journalDate:string,
    journalEntry:string,
    _id:string
}

const initialJournalState:JournalSchema = {
    journalLoading:false,
    journalDate: new Date().toISOString(),
    journalEntry:"",
    _id:"",
};

const journalSlice = createSlice({
    name:'journal',
    initialState:initialJournalState,
    reducers:{
        setJournalLoading(state,action) {
            state.journalLoading = action.payload;
        },
        setEntry(state,action) {
            state.journalDate = action.payload.date;
            state.journalEntry = action.payload.journalEntry;
            state._id = action.payload._id;
        },
        updateEntry(state,action) {
            state.journalEntry = action.payload;
        },
        clearEntry(state) {
            state.journalDate = new Date().toISOString();
            state.journalEntry = "";
            state._id = "";
        }
    }
});

export default journalSlice