// Styles
import './Add-new-habit.scss';
//Dependencies
import React,{ useState,useRef,useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation,useNavigate } from 'react-router-dom';
import { TextField,Button,Typography,FormControl,FormControlLabel,FormGroup,FormLabel,Card,Checkbox,Tooltip,Switch,Autocomplete,Dialog,DialogActions,DialogContent,DialogContentText } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { BsTrash,BsArchive } from 'react-icons/bs';
//Components
import { RootState } from "../../Store/Store";
import useHabitHooks from '../../Hooks/useHabitHooks';
import useGoalHooks from '../../Hooks/userGoalHooks';
import type { GoalInterface,HabitInterface } from '../../Misc/Interfaces';
import Loading from '../Misc/Loading';

const AddNewHabit:React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const habitHooks = useHabitHooks();
    const goalHooks = useGoalHooks();
    const id = location.pathname.split('/')[2];
    const habitList = useSelector<RootState,HabitInterface[]>(state=>state.habitsSlice.habitList);
    const detailedHabit = habitList.find((habititem)=> habititem._id === id);      
    // Close menu if click is on backdrop
    const backdropRef = useRef<HTMLDivElement>(null);
    const backdropClickHandler = (event:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if(event.target === backdropRef.current) {
            navigate(`/habits`)
        }   
    }
    const habitLoading = useSelector<RootState,boolean>(state=>state.habitsSlice.habitLoading);
    // Get paired goal if one exists
    const goalList = useSelector<RootState,GoalInterface[]>(state=>state.goalSlice.goalList);
    const detailedGoal = goalList.find((goalitem:GoalInterface)=> goalitem.habitId === id);
    // Habit inputs and handlers
    const habitTime = detailedHabit?.time ? detailedHabit?.time.split(':') : null ;
    const [habitInputs,setHabitInputs] = useState({
        addNewHabitHeader:"",
        habitTitle:detailedHabit?.title || '',
        selectedTime: habitTime ? new Date(new Date().setHours(Number(habitTime[0]),Number(habitTime[1]))) : null,
        habitCreationUTCOffset:detailedHabit?.creationUTCOffset || new Date().getTimezoneOffset(),
        habitAlarmUsed:detailedHabit?.alarmUsed || false,
        pairedGoal: detailedGoal ? detailedGoal : null
    })
    const habitInputsHandler = (newValue:string,input:string) => {
        setHabitInputs((prevState)=>({
            ...prevState,
            [input]:newValue
        }))
    }
    const habitAlarmSwitchHandler = () => {
        setHabitInputs((prevState)=>({
            ...prevState,
            habitAlarmUsed:!prevState.habitAlarmUsed
        }));
    }
    const habitTimePick = (newTime:Date | null) => {
        const newTimeFixed = new Date(newTime || new Date());
        setHabitInputs((prevState)=>({
            ...prevState,
            selectedTime:newTimeFixed
        }))
    }
    const pairedGoalSelect = (newPairedGoal:GoalInterface|null) => {
        if (newPairedGoal?.habitId) {
            setHabitInputs((prevState)=>({
                ...prevState,
                addNewHabitHeader:"Habit is already paired"
            }))
        } else {
            setHabitInputs((prevState)=>({
                ...prevState,
                pairedGoal:newPairedGoal,
                addNewHabitHeader:"Habit successfully paired"
            }))
        }
    }
    // Set Active weekdays
    const weekdaysArr = [1,2,3,4,5,6,0];
    const weekdaysLabels:{[key:number]:string} = {1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat',0:'Sun'};
    const [weekdays,setWeekdays] = useState<{[key:number]:boolean}>(detailedHabit?.weekdays || {1:false,2:false,3:false,4:false,5:false,6:false,0:false});
    // Update or add habit
    const updateHabit = async (event:React.FormEvent) => {
        event.preventDefault();
        let activeDays = Object.values(weekdays).every(item=>item===false)?{1:true,2:true,3:true,4:true,5:true,6:true,0:true}:weekdays;
        const newHabit:HabitInterface = {
            title: habitInputs.habitTitle ,
            time: habitInputs.selectedTime ? new Date(new Date(habitInputs.selectedTime).setSeconds(0)).toLocaleTimeString("en-GB") : (detailedHabit?.time || null),
            creationDate:detailedHabit?.creationDate || new Date().toISOString(),
            isArchived:detailedHabit?.isArchived || false,
            weekdays:activeDays,
            entries: detailedHabit?.entries || {1:null,2:null,3:null,4:null,5:null,6:null,0:null},
            goalId:habitInputs.pairedGoal?._id || null, 
            goalTargetDate:habitInputs.pairedGoal?.targetDate || null ,
            creationUTCOffset: habitInputs.habitCreationUTCOffset,
            alarmUsed:habitInputs.habitAlarmUsed,
            _id:detailedHabit?._id || ''
        }
        let newPairedGoal = null;
        let oldPairedGoal = null;
        if(habitInputs.pairedGoal) newPairedGoal = Object.assign({},habitInputs.pairedGoal);
        if(detailedGoal) oldPairedGoal = Object.assign({}, detailedGoal);
        detailedHabit ? habitHooks.updateHabit(newHabit,detailedHabit,newPairedGoal,oldPairedGoal) : habitHooks.addHabit(newHabit,newPairedGoal);
        // Return to habits
        navigate("/habits");
    }
    // Set habit state from store value
    useEffect(()=>{
        if(detailedHabit) {
            const {title,time,creationUTCOffset,alarmUsed} = detailedHabit;
            setHabitInputs((prevState)=>({
                ...prevState,
                habitTitle:title || '',
                selectedTime: time ? new Date(new Date().setHours(Number(time.split(':')[0]),Number(time.split(':')[1]))) : null,
                habitCreationUTCOffset:creationUTCOffset || new Date().getTimezoneOffset(),
                habitAlarmUsed:alarmUsed || false,
            }))
        }
    },[detailedHabit])
    // Set goal state from store value
    useEffect(()=>{
        if(detailedGoal) {
            setHabitInputs((prevState)=>({
                ...prevState,
                pairedGoal:detailedGoal ? detailedGoal : null,
            }))
        }
    },[detailedGoal])
    // Dialog control and actions 
    const [openDialog,setOpenDialog] = useState(false);
    const [dialogMode,setDialogMode] = useState("archive");
    const openDialogHandler = (newDialogMode:string,habitItem:HabitInterface,pairedGoal:GoalInterface|null) => {
        if(pairedGoal) {
            setDialogMode(newDialogMode);
            setOpenDialog(true);
        } else {
            if(newDialogMode === "archive") {
                habitHooks.toggleHabitArchiveStatus(habitItem,null)
            } else if (newDialogMode === "delete") {
                habitHooks.deleteHabit(habitItem,null)
            }
            navigate("/habits");
        }
    }
    const habitArchiveDeleteHandler = (mode:string,goalAction:boolean) => {
        if (mode === "archive") {
            if(goalAction) {
                detailedHabit && habitHooks.toggleHabitArchiveStatus(detailedHabit,null);
                habitInputs.pairedGoal && goalHooks.toggleGoalArchiveStatus(habitInputs.pairedGoal,null);
            } else {
                detailedHabit && habitHooks.toggleHabitArchiveStatus(detailedHabit,habitInputs.pairedGoal);
            }
        } else if(mode === "delete") {
            if(goalAction) {
                detailedHabit && habitHooks.deleteHabit(detailedHabit,null);
                habitInputs.pairedGoal && goalHooks.deleteGoal(habitInputs.pairedGoal,null);
            } else {
                detailedHabit && habitHooks.deleteHabit(detailedHabit,habitInputs.pairedGoal);
            }
        }
        navigate("/habits");
    }
    return (
        <div className={`opacity-transition add-new-habit-backdrop backdrop`} ref={backdropRef} onClick={(event)=>backdropClickHandler(event)}>
            <Dialog className={`add-new-habit-dialog`} open={openDialog} onClose={()=>{setOpenDialog(false)}}>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {`Selected habit has paired goal. Do you want to ${dialogMode.toLowerCase()} it as well?`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ display: 'flex',justifyContent: 'space-around' }}>
                    <Button onClick={()=>{habitArchiveDeleteHandler(dialogMode,false)}} variant="outlined">{`${dialogMode[0].toUpperCase()}${dialogMode.slice(1)} habit`}</Button>
                    <Button onClick={()=>{habitArchiveDeleteHandler(dialogMode,true)}} variant="outlined">{`${dialogMode[0].toUpperCase()}${dialogMode.slice(1)} both`}</Button>
                </DialogActions>
            </Dialog>
            {habitLoading ? <Loading height='80vh'/>:<Card component="form" onSubmit={updateHabit} className={`add-new-habit-form scale-in`}>
                {habitInputs.addNewHabitHeader.length > 0 ? <div className={`add-new-habit-header`}>
                    <Typography variant='h6' >{habitInputs.addNewHabitHeader}</Typography>
                </div> : null}
                <div className={`add-new-habit-controls`}>
                    {detailedHabit ? <Tooltip title="Archive Item">
                        <div className='archive-habit'>
                            <BsArchive className={`icon-interactive archive-habit-icon`} onClick={()=>{openDialogHandler("archive",detailedHabit,habitInputs.pairedGoal)}}/>
                        </div>
                    </Tooltip> : null}
                    <div className='add-new-habit-timepicker-wrapper'>
                        <TimePicker 
                            inputFormat="HH:mm" label="Habit Time" ampm={false} ampmInClock={false} desktopModeMediaQuery='@media (min-width:769px)'
                            renderInput={(props) => <TextField size='small' className={`focus date-picker add-new-goal-date`}  {...props} />}
                            value={habitInputs.selectedTime} onChange={(newTime:Date|null)=>{habitTimePick(newTime);}}
                        />
                    </div>
                    {detailedHabit ? <Tooltip title="Delete Item">
                        <div className='delete-habit'>
                            <BsTrash className={`icon-interactive delete-habit-icon`} onClick={()=>{openDialogHandler("delete",detailedHabit,habitInputs.pairedGoal)}}/>
                        </div>
                    </Tooltip> : null}
                </div>
                {habitInputs.selectedTime ? <div className={`add-new-habit-alarm-switches`}>
                    <FormGroup>
                        <FormControlLabel control={<Switch checked={habitInputs.habitAlarmUsed} onChange={habitAlarmSwitchHandler} />} label="Habit alarm" />
                    </FormGroup>
                </div> : null}
                <TextField value={habitInputs.habitTitle} onChange={(event)=>{habitInputsHandler(event.target.value,'habitTitle')}} label='Habit Title' className="add-new-habit-title" multiline required />
                <FormControl className="weekdays-selector" component="fieldset" variant="standard">
                    <FormLabel>
                        <Tooltip enterDelay={300} {...{ 'title':'Select active weekdays for habit. Leave unchecked to select all weekdays.','children':<Typography>Habit Active Weekdays</Typography> }}/>
                    </FormLabel>
                    <FormGroup className="weekdays-selector-checkboxes">
                        {weekdaysArr.map((weekday:number)=>{
                            return (<FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':weekdays[weekday]}} control={<Checkbox onClick={()=>{setWeekdays({...weekdays,[weekday]:!weekdays[weekday]})}}/>} label={weekdaysLabels[weekday]} key={weekday} />)
                        })}
                    </FormGroup>
                </FormControl>
                <div className={`add-new-habit-paired-goal`}>
                    <Autocomplete
                        value={habitInputs.pairedGoal} defaultValue={habitInputs.pairedGoal}
                        onChange={(event: any, newValue: GoalInterface|null) => {pairedGoalSelect(newValue)}}
                        options={goalList} getOptionLabel={(option) => option.title}
                        renderInput={(params) => <TextField {...params} label="Paired Goal" />}
                    />
                </div>
                <div className="add-new-habit-buttons">
                    <Button variant="outlined" type='button' className='button' onClick={()=>{navigate(-1)}}>Back</Button>
                    <Button variant="outlined" type='submit' className='button' >{detailedHabit ? 'Update' : 'Submit'}</Button>
                </div>
            </Card>}
        </div>
    )
}

export default AddNewHabit