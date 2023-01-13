// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { journalActions } from "../Store/Store";
import type { JournalEntryInterface } from "../Misc/Interfaces";

import { host } from "../Misc/variables";

const useJournalHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    // Load journal entry from database if it exists 
    const loadJournalData = async (selectedDate:Date,newToken?:string) => {
        dispatch(journalActions.setJournalLoading(true));
        const clientSelectedDayStartTime = new Date(selectedDate).setHours(0,0,0,0);
        const clientTimezoneOffset = new Date().getTimezoneOffset();
        try {
            const journalEntryResponse:{data:any[]} = await axios.request({
                method:'POST',
                url:`${host}/journal/getJournalEntry`,
                headers:{Authorization: `Bearer ${newToken || token}`},
                data:{clientSelectedDayStartTime,clientTimezoneOffset}
            })
            if (journalEntryResponse.data.length > 0) {
                dispatch(journalActions.setEntry(journalEntryResponse.data[0]));
            } else if (journalEntryResponse.data.length === 0) {
                dispatch(journalActions.setEntry({date:selectedDate.toISOString(),journalEntry:'',id:''}));
            }
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(journalActions.setJournalLoading(false));
        }
    }
    // Update journal entry if it exists ,create if not
    const updateJournalEntry = async (newJournalEntry:JournalEntryInterface) => {
        dispatch(journalActions.setJournalLoading(true));
        const clientSelectedDayStartTime = new Date(newJournalEntry.date).setHours(0,0,0,0);
        const clientTimezoneOffset = new Date().getTimezoneOffset();
        try {
            const journalEntryResponse:{data:{journalId:string}} = await axios.request({
                method:'PATCH',
                url:`${host}/journal/updateJournalEntry`,
                headers:{Authorization: `Bearer ${token}`},
                data:{...newJournalEntry,clientSelectedDayStartTime,clientTimezoneOffset}
            })
            const {journalId} = journalEntryResponse.data
            if(journalId) newJournalEntry._id = journalId ;
            journalId ? dispatch(journalActions.setEntry(newJournalEntry)) : dispatch(journalActions.updateEntry(newJournalEntry))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(journalActions.setJournalLoading(false));
        }
    }
    return {loadJournalData,updateJournalEntry}
}

export default useJournalHooks