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
import { Container,TextField,Button,Box} from '@mui/material';
import { DatePicker} from '@mui/lab';

const Journal:React.FC = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const journalEntry = useSelector<RootState,{date:string|null,journalEntry:string,_id:string}>(state=>state.journalSlice);
    const journalRef = useRef<HTMLTextAreaElement>(null);
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const initialDate = journalEntry.date ? new Date(Number(journalEntry.date.split("/")[2]),Number(journalEntry.date.split("/")[1])-1,Number(journalEntry.date.split("/")[0])) : new Date();
    const [selectedDate, setSelectedDate] = useState(initialDate);
    // Load journal entry from database if it exists 
    const [entryExists, setEntryExists] = useState(false);
    const loadJournalData = async (date:string) => {
        dispatch(authActions.setLoading(true))
        try {
            const journalEntryResponse:{data:any[]} = await axios.request({
                method:'POST',
                url:`http://localhost:3001/journal/getJournal`,
                headers:{Authorization: `Bearer ${token}`},
                data:{selectedDate:date}
            })
            if(journalEntryResponse.data.length>0) {
                setEntryExists(true)
                dispatch(journalActions.setEntry(journalEntryResponse.data[0]))
            } 
            if (journalEntryResponse.data.length === 0) {
                dispatch(journalActions.setEntry({date:'',entry:'',id:''}))
            }
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))
    }
     // Select Journal Entry of different Date
    const selectJournalEntryByDate = (newDate:Date|null) => {
        if(newDate === null) {
            newDate = new Date()
        }
        setSelectedDate(newDate);
        setEntryExists(false);
        loadJournalData(newDate.toString());
    }
    // Submit new journal entry
    const updateJournalEntry = async (event:React.FormEvent) => {
        event.preventDefault();
        dispatch(authActions.setLoading(true))
        const journalInput = journalRef.current!.value
        const updatedEntry = {selectedDate:selectedDate.toString(),journalEntry:journalInput}
        try {
            await axios.request({
                method:`${entryExists?'PATCH':'POST'}`,
                url:`http://localhost:3001/journal/${entryExists?'updateJournalEntry':'createJournalEntry'}`,
                headers:{Authorization: `Bearer ${token}`},
                data:updatedEntry
            })
            dispatch(journalActions.updateEntry(journalInput))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))
    }
    // Load journal data on component mount
    useEffect(() => {
        if (token) {
            journalEntry.date === null && loadJournalData(new Date().toString())
        } else { 
            dispatch(authActions.logout())
        }
    }, [journalEntry.journalEntry])
    return (
        <Container component="section" className={`journal ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`} >
            {loading?
            <Loading height='100%'/>:
            <Box component="form" className="journal-form" onSubmit={updateJournalEntry} >
                <DatePicker 
                inputFormat="dd/MM/yyyy" desktopModeMediaQuery='@media (min-width:769px)'
                renderInput={(props) => <TextField size='small' className={`focus date-picker journal-date`}  {...props} />}
                value={selectedDate} onChange={newDate=>{selectJournalEntryByDate(newDate);}}
                />
                <TextField inputRef={journalRef} className={`focus journal-entry input`} defaultValue={journalEntry.journalEntry} placeholder="Write down what's on you mind" fullWidth multiline required autoFocus />
                <Button type="submit" variant="outlined" className={`journal-button button`}>{entryExists?'Save':'New Entry'}</Button>
            </Box>}
        </Container>
    )
}

export default Journal