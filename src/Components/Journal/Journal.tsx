// Styles
import './Journal.scss';
// Components
import Loading from '../Misc/Loading';
import { RootState } from '../../Store/Store';
import useJournalHooks from '../../Hooks/useJournalHooks';
//Dependencies
import {useSelector} from 'react-redux';
import React,{ useState,useEffect} from 'react';
import { Container,TextField,Button,Typography} from '@mui/material';
import { DatePicker} from '@mui/lab';
import {CgArrowRight,CgArrowLeft} from 'react-icons/cg';

const Journal:React.FC = () => {
    const journalHooks = useJournalHooks();
    const journalEntry = useSelector<RootState,{date:string|null,journalEntry:string,_id:string}>(state=>state.journalSlice);
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const initialDate = journalEntry.date ? new Date(journalEntry.date) : new Date();
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [journalInput,setJournalInput] = useState('');
    const journalInputHandler = (e:any,loadEntry:boolean) => {
        loadEntry ? setJournalInput(e) : setJournalInput(e.target.value)
    }
     // Select Journal Entry of different Date
    const selectJournalEntryByDate = (newDate:Date|null) => {
        newDate = newDate || new Date ();
        setSelectedDate(newDate);
        journalHooks.loadJournalData(newDate);
    }
    // Submit journal entry
    const journalUpdateHandler = async (event:React.FormEvent) => {
        event.preventDefault();
        journalHooks.updateJournalEntry(selectedDate,journalInput);
    }
    // Update journal entry value 
    useEffect(() => {
        journalInputHandler(journalEntry.journalEntry,true)
    }, [journalEntry.journalEntry])
    return (
        <Container component="section" className={`journal ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`} >
            {loading ?<Loading height='100%'/>:
            <form className="journal-form scale-in" onSubmit={journalUpdateHandler} >
                <div className={`journal-date`}>
                    <Button variant='outlined' className={`button journal-date-button`} onClick={()=>{selectJournalEntryByDate(new Date(selectedDate.getTime() - 86400000))}}>
                        <CgArrowLeft className='journal-date-icon icon-interactive nav-icon' />
                        <Typography className='journal-date-button-text'>Previous Day</Typography>
                    </Button>
                    <DatePicker 
                    inputFormat="dd/MM/yyyy" desktopModeMediaQuery='@media (min-width:769px)'
                    renderInput={(props:any) => <TextField size='small' className={`focus date-picker journal-date-picker`}  {...props} />}
                    value={selectedDate} onChange={(newDate:Date|null)=>{selectJournalEntryByDate(newDate)}}
                    />
                    <Button variant='outlined' className={`button journal-date-button`} onClick={()=>{selectJournalEntryByDate(new Date(selectedDate.getTime() + 86400000))}}>
                        <Typography className='journal-date-button-text'>Next Day</Typography>
                        <CgArrowRight className='journal-date-icon icon-interactive nav-icon' />
                    </Button>
                </div>
                <TextField value={journalInput} onChange={(event)=>{journalInputHandler(event,false)}} className={`focus journal-entry input`} placeholder="Write down what is on you mind." fullWidth multiline required autoFocus />
                <Button type="submit" variant="contained" className={`journal-button button`}>{journalEntry.journalEntry ?'Update':'New Entry'}</Button>
            </form>}
        </Container>
    )
}

export default Journal