// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { journalActions,authActions } from "../Store/Store";

const httpAddress = `http://localhost:3001`;

const useJournalHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    // Load journal entry from database if it exists 
    const loadJournalData = async (selectedDate:Date,newToken?:string) => {
        dispatch(authActions.setLoading(true))
        try {
            const journalEntryResponse:{data:any[]} = await axios.request({
                method:'POST',
                url:`${httpAddress}/journal/getJournalEntry`,
                headers:{Authorization: `Bearer ${newToken || token}`},
                data:{selectedDate:selectedDate.toISOString(),timezoneOffset:new Date().getTimezoneOffset() }
            })
            if(journalEntryResponse.data.length > 0) {
                dispatch(journalActions.setEntry(journalEntryResponse.data[0]));
            } 
            if (journalEntryResponse.data.length === 0) {
                dispatch(journalActions.setEntry({date:'',journalEntry:'',id:''}));
            }
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))
    }
    // Update journal entry if it exists ,create if not
    const updateJournalEntry = async (selectedDate:Date,newJournalEntry:string) => {
        dispatch(authActions.setLoading(true))
        try {
            const journalEntryResponse = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/journal/updateJournalEntry`,
                headers:{Authorization: `Bearer ${token}`},
                data:{selectedDate:selectedDate.toISOString(),timezoneOffset:new Date().getTimezoneOffset(),journalEntry:newJournalEntry}
            })
            Array.isArray(journalEntryResponse.data) ? dispatch(journalActions.setEntry(journalEntryResponse.data[0])) : dispatch(journalActions.updateEntry(newJournalEntry))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))
    }
    return {loadJournalData,updateJournalEntry}
}

export default useJournalHooks