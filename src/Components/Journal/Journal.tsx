// Styles
import './Journal.scss';
// Components
import Loading from '../Misc/Loading';
import { RootState } from '../../Store/Store';
import type { JournalEntryInterface } from '../../Misc/Interfaces';
import useJournalHooks from '../../Hooks/useJournalHooks';
//Dependencies
import {useSelector} from 'react-redux';
import React,{ useState,useEffect} from 'react';
import { Container,TextField,Button,Typography} from '@mui/material';
import { DatePicker} from '@mui/x-date-pickers';
import {CgArrowRight,CgArrowLeft} from 'react-icons/cg';

const Journal:React.FC = () => {
    const journalHooks = useJournalHooks();
    const journalEntry = useSelector<RootState,JournalEntryInterface|null>(state=>state.journalSlice.journalEntry);
    const journalLoading = useSelector<RootState,boolean>(state=>state.journalSlice.journalLoading);
    const journalLoaded = useSelector<RootState,boolean>(state=>state.journalSlice.journalLoaded);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const [journalInputs,setJournalInputs] = useState({
        journalEntry:journalEntry ? journalEntry.journalEntry : "",
        date:journalEntry ? new Date(journalEntry.date) : new Date(),
    });
    const journalInputsHandler = (newInput:string,input:string) => {
        setJournalInputs((prevState)=>({
            ...prevState,
            [input]:newInput
        }))
    }
    // Select Journal Entry of different Date
    const selectJournalEntryByDate = async (newDate:Date|null) => {
        const newDateCopy = new Date(newDate || new Date());
        setJournalInputs((prevState)=>({
            ...prevState,
            date:newDateCopy
        }))
        journalHooks.loadJournalData(newDateCopy);
    }
    // Submit journal entry
    const journalUpdateHandler = async (event:React.FormEvent) => {
        event.preventDefault();
        const newJournalEntry:JournalEntryInterface = {
            journalEntry:journalInputs.journalEntry,
            date:new Date(journalInputs.date.setHours(12 + new Date().getTimezoneOffset()/-60 ,0,0,0)).toISOString(),
            dateCreated: journalEntry ? journalEntry.dateCreated : new Date().toISOString(),
            dateEdited: new Date().toISOString(),
            _id: journalEntry ? journalEntry._id : ""
        }
        journalHooks.updateJournalEntry(newJournalEntry);
    }
    // Update journal entry value 
    useEffect(() => {
        const entry = journalEntry? journalEntry?.journalEntry : "";
        journalInputsHandler(entry,'journalEntry');
    }, [journalEntry])
    // Load journal data on start
    useEffect(()=>{
        !journalLoaded && selectJournalEntryByDate(new Date());
    },[])
    return (
        <Container component="section" className={`journal ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`} >
            {journalLoading ? <Loading height='100%'/>: <form className="journal-form scale-in" onSubmit={journalUpdateHandler}>
                <div className={`journal-date`}>
                    <Button variant='outlined' className={`button journal-date-button`} onClick={()=>{selectJournalEntryByDate(new Date(journalInputs.date.getTime() - 86400000))}}>
                        <CgArrowLeft className='journal-date-icon icon-interactive nav-icon' />
                        <Typography className='journal-date-button-text'>Prev Day</Typography>
                    </Button>
                    <div className='journal-datepicker-wrapper'>
                        <DatePicker 
                            inputFormat="dd/MM/yyyy" desktopModeMediaQuery='@media (min-width:769px)'
                            renderInput={(props) => <TextField size='small' className={`focus date-picker journal-date-picker`}  {...props} />}
                            value={journalInputs.date} onChange={(newDate:Date|null)=>{selectJournalEntryByDate(newDate)}}
                        />
                    </div>
                    <Button variant='outlined' className={`button journal-date-button`} onClick={()=>{selectJournalEntryByDate(new Date(journalInputs.date.getTime() + 86400000))}}>
                        <Typography className='journal-date-button-text'>Next Day</Typography>
                        <CgArrowRight className='journal-date-icon icon-interactive nav-icon' />
                    </Button>
                </div>
                <TextField value={journalInputs.journalEntry} onChange={(event)=>{journalInputsHandler(event.target.value,'journalEntry')}} className={`focus journal-entry input`} placeholder="Write down what is on you mind." fullWidth multiline required autoFocus />
                <Button type="submit" variant="contained" className={`journal-button button`}>{journalEntry?._id ?'Update':'New Entry'}</Button>
            </form>}
        </Container>
    )
}

export default Journal