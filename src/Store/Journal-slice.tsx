import {createSlice} from '@reduxjs/toolkit';
import type {JournalEntryInterface} from "../Misc/Interfaces"

interface JournalSchema {
    journalLoading:boolean,
    journalEntry:JournalEntryInterface|null
    journalLoaded:boolean
}

const initialJournalState:JournalSchema = {
    journalLoading:false,
    journalEntry:null,
    journalLoaded:false,
};

const journalSlice = createSlice({
    name:'journal',
    initialState:initialJournalState,
    reducers:{
        setJournalLoading(state,action) {
            state.journalLoading = action.payload;
        },
        setEntry(state,action) {
            state.journalEntry = action.payload;
            state.journalLoaded = true
        },
        updateEntry(state,action) {
            state.journalEntry = action.payload;
        },
        clearEntry(state) {
            state.journalEntry = null;
            state.journalLoaded = false
        }
    }
});

export default journalSlice