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
    const journalEntry = useSelector<RootState,{date:string|null,journalEntry:string,_id:string}>(state=>state.journalSlice);
    const journalRef = useRef<HTMLTextAreaElement>(null);
    const dispatch = useDispatch();
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const [selectedDate, setSelectedDate] = useState(new Date());
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
                dispatch(journalActions.setEntry({date:selectedDate.toString(),entry:'',id:''}))
            }
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
        if(!!token && journalEntry.date === null) {
            loadJournalData(new Date().toString())
        }
    }, [journalEntry.journalEntry])
    return (
        <Container component="section" className='journal page' sx={{color: 'text.primary',display:'flex',justifyContent:'center',alignItems:'center'}}>
            {loading?
            <Loading/>:
            <Box component="form" className="journal-form" onSubmit={updateJournalEntry} >
                <DatePicker 
                inputFormat="DD/MM/YYYY" desktopModeMediaQuery='@media (min-width:769px)'
                renderInput={(props) => <TextField size='small' className={`focus date-picker journal-date`}  {...props} />}
                value={selectedDate} onChange={newDate=>{selectJournalEntryByDate(newDate);}}
                />
                <TextField inputRef={journalRef} className={`focus journal-entry input`} defaultValue={journalEntry.journalEntry} placeholder="Write down what's on you mind" fullWidth multiline required />
                <Button type="submit" variant="outlined" className={`journal-button button`}>{entryExists?'Save':'New Entry'}</Button>
            </Box>}
        </Container>
    )
}

export default Journal