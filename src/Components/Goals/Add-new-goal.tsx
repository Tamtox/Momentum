// Styles
import './Add-new-goal.scss';
// Dependencies
import React,{useState,useRef, useEffect} from 'react';
import {useSelector} from 'react-redux';
import { useLocation,useNavigate } from 'react-router-dom';
import { TextField,Button,Card,FormGroup,Switch,FormControlLabel,Tooltip,Typography,Autocomplete,Dialog,DialogActions,DialogContent,DialogContentText } from '@mui/material';
import { DatePicker} from '@mui/x-date-pickers';
import {BsTrash,BsArchive} from 'react-icons/bs';
// Components
import { RootState } from '../../Store/Store';
import useGoalHooks from '../../Hooks/userGoalHooks';
import useHabitHooks from '../../Hooks/useHabitHooks';
import type {GoalInterface,HabitInterface} from '../../Misc/Interfaces';
import Loading from '../Misc/Loading';

const AddNewGoal:React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const goalHooks = useGoalHooks();
    const habitHooks = useHabitHooks();
    // Close menu if click is on backdrop
    const backdropRef = useRef<HTMLDivElement>(null);
    const backdropClickHandler = (event:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if(event.target === backdropRef.current) {
            navigate("/goals");
        } 
    }
    const goalLoading = useSelector<RootState,boolean>(state=>state.goalSlice.goalLoading);
    const goalList = useSelector<RootState,GoalInterface[]>(state=>state.goalSlice.goalList);
    const id = location.pathname.split('/')[2];
    const detailedGoal = goalList.find((goalitem:GoalInterface)=>goalitem._id === id);
    // Get paired habit if one exists
    const habitList = useSelector<RootState,HabitInterface[]>(state=>state.habitsSlice.habitList);
    const detailedHabit = habitList.find((habititem:HabitInterface)=>habititem.goalId === id);
    const [goalInputs,setGoalInputs] = useState({
        addNewGoalHeader: "",
        goalTitle:detailedGoal?.title || '',
        selectedDate:detailedGoal?.targetDate ? new Date(detailedGoal.targetDate) : null,
        goalCreationUTCOffset:detailedGoal?.creationUTCOffset || new Date().getTimezoneOffset(),
        goalAlarmUsed:detailedGoal?.alarmUsed || false,
        pairedHabit:detailedHabit ? detailedHabit : null
    })
    const goalInputsHandler = (newValue:string,input:string) => {
        setGoalInputs((prevState)=>({
            ...prevState,
            [input]:newValue
        }))
    }
    const goalAlarmSwitchHandler = () => {
        setGoalInputs((prevState)=>({
            ...prevState,
            goalAlarmUsed:!prevState.goalAlarmUsed
        }));
    }
    const goalDatePick = (newDate:Date | null) => {
        const newDateFixed = new Date(newDate || new Date());
        setGoalInputs((prevState)=>({
            ...prevState,
            selectedDate:newDateFixed
        }))
    }
    const pairedHabitSelect = (newPairedHabit:HabitInterface|null) => {
        if (newPairedHabit?.goalId) {
            setGoalInputs((prevState)=>({
                ...prevState,
                addNewGoalHeader:"Habit is already paired"
            }))
        } else {
            setGoalInputs((prevState)=>({
                ...prevState,
                pairedHabit:newPairedHabit,
                addNewGoalHeader:"Habit successfully paired"
            }))
        }
    }
    // Submit or update goal 
    const updateGoal = async (event:React.FormEvent) => {
        event.preventDefault();
        const newGoal:GoalInterface = {
            title:goalInputs.goalTitle,
            creationDate:detailedGoal?.creationDate || new Date().toISOString(),
            targetDate:goalInputs.selectedDate ? new Date(goalInputs.selectedDate.setHours(12 + new Date().getTimezoneOffset()/-60 ,0,0,0)).toISOString() : (detailedGoal?.targetDate || null),
            status:detailedGoal?.status || 'Pending',
            dateCompleted:detailedGoal?.dateCompleted || '',
            isArchived:detailedGoal?.isArchived || false,
            habitId:goalInputs.pairedHabit?._id || null ,
            creationUTCOffset: goalInputs.goalCreationUTCOffset,
            alarmUsed:goalInputs.goalAlarmUsed,
            _id: detailedGoal?._id || ''
        }
        let pairedHabit = null;
        let oldPairedHabit = null;
        if (goalInputs.pairedHabit) pairedHabit = Object.assign({},goalInputs.pairedHabit);
        if (detailedHabit) oldPairedHabit = Object.assign({},detailedHabit);
        detailedGoal ? goalHooks.updateGoal(newGoal,detailedGoal,pairedHabit,oldPairedHabit) : goalHooks.addGoal(newGoal,pairedHabit);
        navigate("/goals");
    }
    // Dialog control and actions 
    const [openDialog,setOpenDialog] = useState(false);
    const [dialogMode,setDialogMode] = useState("archive");
    const openDialogHandler = (newDialogMode:string,goalItem:GoalInterface,pairedHabit:HabitInterface|null) => {
        if(pairedHabit) {
            setDialogMode(newDialogMode);
            setOpenDialog(true);
        } else {
            if(newDialogMode === "archive") {
                goalHooks.toggleGoalArchiveStatus(goalItem,null);
            } else if (newDialogMode === "delete") {
                goalHooks.deleteGoal(goalItem,null);
            }
            navigate("/goals");
        }
    }
    const goalArchiveDeleteHandler = (mode:string,habitAction:boolean) => {
        if (mode === "archive") {
            if(habitAction) {
                detailedGoal && goalHooks.toggleGoalArchiveStatus(detailedGoal,null);
                goalInputs.pairedHabit && habitHooks.toggleHabitArchiveStatus(goalInputs.pairedHabit,null);
            } else {
                detailedGoal && goalHooks.toggleGoalArchiveStatus(detailedGoal,goalInputs.pairedHabit);
            }
        } else if(mode === "delete") {
            if(habitAction) {
                detailedGoal && goalHooks.deleteGoal(detailedGoal,null);
                goalInputs.pairedHabit && habitHooks.deleteHabit(goalInputs.pairedHabit,null)
            } else {
                detailedGoal && goalHooks.deleteGoal(detailedGoal,goalInputs.pairedHabit);
            }
        }
        navigate("/goals");
    }
    // Paired habit archive/deletion modal
    let modal = (
        <Dialog className={`add-new-goal-dialog`} open={openDialog} onClose={()=>{setOpenDialog(false)}}>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {`Selected goal has paired habit. Do you want to ${dialogMode.toLowerCase()} it as well?`}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ display: 'flex',justifyContent: 'space-around' }}>
                <Button onClick={()=>{goalArchiveDeleteHandler(dialogMode,false)}} variant="outlined">{`${dialogMode[0].toUpperCase()}${dialogMode.slice(1)} goal`}</Button>
                <Button onClick={()=>{goalArchiveDeleteHandler(dialogMode,true)}} variant="outlined">{`${dialogMode[0].toUpperCase()}${dialogMode.slice(1)} both`}</Button>
            </DialogActions>
        </Dialog>
    )
    // Set goal state from store value
    useEffect(()=>{
        if(detailedGoal) {
            const {title,targetDate,creationUTCOffset,alarmUsed} = detailedGoal;
            setGoalInputs((prevState)=>({
                ...prevState,
                goalTitle:title || '',
                selectedDate:targetDate ? new Date(targetDate) : null,
                goalCreationUTCOffset:creationUTCOffset || new Date().getTimezoneOffset(),
                goalAlarmUsed:alarmUsed || false,
            }))
        }
    },[detailedGoal])
    // Set habit state from store value
    useEffect(()=>{
        if(detailedHabit) {
            setGoalInputs((prevState)=>({
                ...prevState,
                pairedHabit:detailedHabit ? detailedHabit : null
            }))
        }
    },[detailedHabit])
    return(
        <div className={`add-new-goal-backdrop backdrop opacity-transition`} ref={backdropRef} onClick={(event)=>backdropClickHandler(event)}>
            modal
            {goalLoading ? <Loading height='80vh'/> : <Card component="form" className={`add-new-goal-form scale-in`} onSubmit={updateGoal}>
                {goalInputs.addNewGoalHeader.length > 0 ? <div className={`add-new-goal-header`}>
                    <Typography variant='h6' >{goalInputs.addNewGoalHeader}</Typography>
                </div> : null}
                <div className={`add-new-goal-controls`}>
                    {detailedGoal ? <Tooltip title="Archive Item">
                        <div className='archive-goal'>
                            <BsArchive className={`icon-interactive archive-goal-icon`} onClick={()=>{openDialogHandler("archive",detailedGoal,goalInputs.pairedHabit)}}/>
                        </div>
                    </Tooltip> : null}
                    <div className='add-new-goal-datepicker-wrapper'>
                        <DatePicker 
                            inputFormat="dd/MM/yyyy" label="Goal Target Date" desktopModeMediaQuery='@media (min-width:769px)'
                            renderInput={(props) => <TextField size='small' className={`focus date-picker`}  {...props} />}
                            value={goalInputs.selectedDate} onChange={(newDate:Date|null)=>{goalDatePick(newDate)}}
                            componentsProps={{actionBar: { actions: ['clear'],},}}
                        />
                    </div>
                    {detailedGoal ? <Tooltip title="Delete Item">
                        <div className='delete-goal'>
                            <BsTrash className={`icon-interactive delete-goal-icon`} onClick={()=>{openDialogHandler("delete",detailedGoal,goalInputs.pairedHabit);}}/>
                        </div>
                    </Tooltip> : null}
                </div>
                {goalInputs.selectedDate ? <div className={`add-new-goal-alarm-switches`}>
                    <FormGroup>
                        <FormControlLabel control={<Switch checked={goalInputs.goalAlarmUsed} onChange={goalAlarmSwitchHandler} />} label="Goal alarm" />
                    </FormGroup>
                </div> : null}
                <TextField value={goalInputs.goalTitle} onChange={(event)=>{goalInputsHandler(event.target.value,'goalTitle')}} className={`add-new-goal-title focus input`} label='Goal Title' multiline required />
                <div className={`add-new-goal-paired-habit`}>
                    <Autocomplete
                        value={goalInputs.pairedHabit} defaultValue={goalInputs.pairedHabit}
                        onChange={(event: any, newValue: HabitInterface|null) => {pairedHabitSelect(newValue)}}
                        options={habitList} getOptionLabel={(option) => option.title}
                        renderInput={(params) => <TextField {...params} label="Paired Habit" />}
                    />
                </div>
                <div className={`add-new-goal-buttons`}>
                    <Button variant="outlined" className={`button`} onClick={()=>{navigate(-1)}}>Back</Button>
                    <Button variant="outlined" type='submit' className={`button`}>{detailedGoal ? 'Update' : 'Submit'}</Button>
                </div>
            </Card>}
        </div>
    )
}

export default AddNewGoal
