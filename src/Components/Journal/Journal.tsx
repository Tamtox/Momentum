// Styles
import './Journal.scss';
// Components
import Loading from '../Misc/Loading';
import { journalActions,authActions } from '../../Store/Store';
import { RootState } from '../../Store/Store';
//Dependencies
import {useSelector,useDispatch} from 'react-redux';
import React,{ useRef,useState,useEffect} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";

const Journal:React.FC = () => {
    const token = Cookies.get('token');
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const journalEntry = useSelector<RootState,{date:string,entry:string,_id:string}>(state=>state.journalSlice)
    const journalRef = useRef<HTMLTextAreaElement>(null);
    const dispatch = useDispatch();
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const [selectedDate, setSelectedDate] = useState(new Date());
    let x = 123
    // Load journal entry from database if it exists or create one if not
    async function loadJournalData(date:string){
        dispatch(authActions.setLoading(true))
        try {
            const journalEntry:{data:any[]} = await axios.request({
                method:'POST',
                url:`http://localhost:3001/journal/getJournal`,
                headers:{Authorization: `Bearer ${token}`},
                data:{selectedDate:date}
            })
            dispatch(journalActions.setEntry(journalEntry.data[0]))
        } catch (error) {
            if (axios.isAxiosError(error)) {
                error.response !== undefined?alert(error.response!.data):alert(error.message)
            } else {
                console.log(error);
            }
        }
        dispatch(authActions.setLoading(false))
    }
     // Select Journal Entry of different Date
    function selectJournalEntryByDate(newDate:Date) {
        setSelectedDate(newDate);
        loadJournalData(newDate.toString());
    }
    // Submit new journal entry
    async function updateJournalEntry(event:React.FormEvent) {
        event.preventDefault();
        dispatch(authActions.setLoading(true))
        const journalInput = journalRef.current!.value
        const updatedEntry = {selectedDate:selectedDate.toString(),entry:journalInput}
        try {
            await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/journal/updateJournalEntry`,
                headers:{Authorization: `Bearer ${token}`},
                data:updatedEntry
            })
            dispatch(journalActions.updateEntry(journalInput))
        } catch (error) {
            if (axios.isAxiosError(error)) {    
                error.response !== undefined?alert(error.response!.data):alert(error.message)
            } else {
                console.log(error);
            }
        }
        dispatch(authActions.setLoading(false))
    }
    // Load journal data on component mount
    useEffect(() => {
        if(journalEntry.date === "") {
            loadJournalData(new Date().toString())
        }
    }, [loadJournalData])
    return (
        <section className="journal page">
            <div className={`journal-card box-shadow${isDarkMode?'-dark':''} item${isDarkMode?'-dark':''} border-radius`}>
                <Flatpickr className={`hover${isDarkMode?'-dark':''} focus date-picker${isDarkMode?'-dark':''} journal-date`} options={{ dateFormat:'d-m-Y ',enableTime:false,disableMobile:true,maxDate:new Date() }} value={selectedDate} onChange={date => {selectJournalEntryByDate(date[0]);}}/>
                <form className="journal-form" onSubmit={updateJournalEntry} >
                    {loading?<Loading/>:<textarea ref={journalRef} className={`focus journal-entry input${isDarkMode?'-dark':''}`} cols={1} rows={1} required >{journalEntry.entry}</textarea>}
                    <button className={`button${isDarkMode?'-dark':''} hover${isDarkMode?'-dark':''}`}>Save</button>
                </form>
            </div>
        </section>
    )
}

export default Journal