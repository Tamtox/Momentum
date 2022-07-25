// Styles
import './Add-new-habit.scss';
//Components
import { RootState } from "../../Store/Store";
import useHabitHooks from '../../Hooks/useHabitHooks';
import useGoalHooks from '../../Hooks/userGoalHooks';
import type {GoalInterface,HabitInterface} from '../../Misc/Interfaces';
//Dependencies
import {useSelector} from 'react-redux';
import React,{ useState,useRef } from 'react';
import { TextField,Button,Typography,FormControl,FormControlLabel,FormGroup,FormLabel,Card,Checkbox,Tooltip,Switch} from '@mui/material';
import { DatePicker,TimePicker } from '@mui/lab';
import {BsTrash,BsArchive} from 'react-icons/bs';

const AddNewHabit:React.FC<{detailedHabit:HabitInterface|undefined,setDetailedItem:()=>{},returnToHabits:()=>{}}> = (props) => {
    const habitHooks = useHabitHooks();
    const goalHooks = useGoalHooks();       
    console.log(props.detailedHabit)
     // Close menu if click is on backdrop
    const backdropRef = useRef<HTMLDivElement>(null);
    const backdropClickHandler = (event:any) => {
        if(event.target === backdropRef.current) {
            props.setDetailedItem();
            props.returnToHabits();
        }   
    }
    // Get paired goal if one exists
    const goalList = useSelector<RootState,GoalInterface[]>(state=>state.goalSlice.goalList);
    const detailedGoal = goalList.filter((item)=>item.habitId === props.detailedHabit?._id)[0];
    // Habit inputs and handlers
    const habitTime = props.detailedHabit?.time ? props.detailedHabit?.time.split(':') : null ;
    const [habitInputs,setHabitInputs] = useState({
        habitTitle:props.detailedHabit?.title || '',
        goalTitle:detailedGoal?.title || '',
        timePickerUsed:false,
        selectedTime: habitTime ? new Date(new Date().setHours(Number(habitTime[0]),Number(habitTime[1]))) : new Date(),
        datePickerUsed:false,
        selectedDate:new Date(detailedGoal?.targetDate || new Date()),
        habitCreationUTCOffset:props.detailedHabit?.creationUTCOffset || new Date().getTimezoneOffset(),
        goalCreationUTCOffset:detailedGoal?.creationUTCOffset || new Date().getTimezoneOffset(),
        habitAlarmUsed:props.detailedHabit?.alarmUsed || false,
        goalAlarmUsed:detailedGoal?.alarmUsed || false,
        goalMode:false,
    })
    const habitInputsHandler = (e:any,input:string) => {
        setHabitInputs((prevState)=>({
            ...prevState,
            [input]:e.target.value
        }))
    }
    const goalAlarmSwitchHandler = () => {
        setHabitInputs((prevState)=>({
            ...prevState,
            goalAlarmUsed:!prevState.goalAlarmUsed
        }));
    }
    const habitAlarmSwitchHandler = () => {
        setHabitInputs((prevState)=>({
            ...prevState,
            habitAlarmUsed:!prevState.habitAlarmUsed
        }));
    }
    const goalModeHandler = () => {
        setHabitInputs((prevState)=>({
            ...prevState,
            goalMode:!habitInputs.goalMode
        }))
    }
    const habitTimePick =(newTime:Date | null) => {
        const newTimeFixed = new Date(newTime || new Date());
        setHabitInputs((prevState)=>({
            ...prevState,
            timePickerUsed:true,
            selectedTime:newTimeFixed
        }))
    }
    const goalDatePick = (newDate:Date | null) => {
        const newDateFixed = new Date(newDate || new Date());
        setHabitInputs((prevState)=>({
            ...prevState,
            datePickerUsed:true,
            selectedDate:newDateFixed
        }))
    }
    // Set Active weekdays
    const weekdaysArr = [1,2,3,4,5,6,0];
    const weekdaysLabels:{[key:number]:string} = {1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat',0:'Sun'};
    const [weekdays,setWeekdays] = useState<{[key:number]:boolean}>(props.detailedHabit?.weekdays || {1:false,2:false,3:false,4:false,5:false,6:false,0:false});
    // Update or add habit
    const addOrUpdateHabit = async (event:React.FormEvent) => {
        event.preventDefault();
        let activeDays = Object.values(weekdays).every(item=>item===false)?{1:true,2:true,3:true,4:true,5:true,6:true,0:true}:weekdays;
        const newHabit:HabitInterface = {
            title: habitInputs.habitTitle ,
            time: habitInputs.timePickerUsed ? new Date(new Date(habitInputs.selectedTime).setSeconds(0)).toLocaleTimeString("en-GB") : (props.detailedHabit?.time || null),
            creationDate:props.detailedHabit?.creationDate || new Date().toISOString(),
            isArchived:props.detailedHabit?.isArchived || false,
            weekdays:activeDays,
            entries: props.detailedHabit?.entries || [],
            goalId:props.detailedHabit?.goalId || null, 
            goalTargetDate:habitInputs.datePickerUsed ? new Date(habitInputs.selectedDate.setHours(12 + new Date().getTimezoneOffset()/-60 ,0,0,0)).toISOString() : (props.detailedHabit?.goalTargetDate || null) ,
            creationUTCOffset: habitInputs.habitCreationUTCOffset,
            alarmUsed:habitInputs.habitAlarmUsed,
            _id:props.detailedHabit?._id || ''
        }
        const newGoal:GoalInterface = {
            title:habitInputs.goalTitle,
            creationDate:detailedGoal?.creationDate || new Date().toISOString(),
            targetDate:habitInputs.datePickerUsed ? new Date(habitInputs.selectedDate.setHours(12 + new Date().getTimezoneOffset()/-60 ,0,0,0)).toISOString() : (detailedGoal?.targetDate || null),
            status:detailedGoal?.status || 'Pending',
            dateCompleted: detailedGoal?.dateCompleted || '',
            isArchived: detailedGoal?.isArchived || false,
            habitId:detailedGoal?.habitId  || null ,
            creationUTCOffset: habitInputs.goalCreationUTCOffset,
            alarmUsed:habitInputs.goalAlarmUsed,
            _id: detailedGoal?._id || ''
        }
        const newGoalArgument = (detailedGoal || habitInputs.goalMode) ? newGoal : null
        habitHooks.updateHabit(newHabit,!!props.detailedHabit,newGoalArgument,!!detailedGoal)
        // Reset detailed item and return to habits
        props.setDetailedItem();
        props.returnToHabits();
    }
    return (
        <div className={`opacity-transition add-new-habit-backdrop backdrop`} ref={backdropRef} onClick={backdropClickHandler}>
            <Card component="form" onSubmit={addOrUpdateHabit} className={`add-new-habit-form scale-in`}>
                <div className={`add-new-habit-controls`}>
                    {props.detailedHabit && <Tooltip title="Archive Item">
                        <div className='archive-habit'>
                            <BsArchive className={`icon-interactive archive-habit-icon`} onClick={()=>{habitHooks.toggleHabitArchiveStatus(props.detailedHabit!);detailedGoal && goalHooks.toggleGoalArchiveStatus(detailedGoal!);props.setDetailedItem();props.returnToHabits()}}/>
                        </div>
                    </Tooltip> }
                    {props.detailedHabit?.goalId ? null : <FormGroup className={`add-new-habit-switch`}>
                        <FormControlLabel control={<Switch onChange={goalModeHandler} />} label="Add paired goal" />
                    </FormGroup>}
                    {props.detailedHabit && <Tooltip title="Delete Item">
                        <div className='delete-habit'>
                            <BsTrash className={`icon-interactive delete-habit-icon`} onClick={()=>{habitHooks.deleteHabit(props.detailedHabit!._id,props.detailedHabit!.goalId);props.setDetailedItem();props.returnToHabits()}}/>
                        </div>
                    </Tooltip> }
                </div>
                <div className='add-new-habit-datetime'>
                    {(habitInputs.goalMode || props.detailedHabit?.goalId) && <DatePicker 
                        inputFormat="dd/MM/yyyy" label="Goal Target Date" desktopModeMediaQuery='@media (min-width:769px)'
                        renderInput={(props:any) => <TextField size='small' className={`focus date-picker add-new-todo-date`}  {...props} />}
                        value={habitInputs.selectedDate} onChange={(newDate:Date|null)=>{goalDatePick(newDate);}}
                    />}
                    <TimePicker 
                        inputFormat="HH:mm" label="Habit Time" ampm={false} ampmInClock={false} desktopModeMediaQuery='@media (min-width:769px)'
                        renderInput={(props:any) => <TextField size='small' className={`focus date-picker add-new-goal-date`}  {...props} />}
                        value={habitInputs.selectedTime} onChange={(newTime:Date|null)=>{habitTimePick(newTime);}}
                    />
                </div>
                <div className={`add-new-habit-alarm-switches`}>
                    {(habitInputs.timePickerUsed || props.detailedHabit) && <FormGroup>
                        <FormControlLabel control={<Switch checked={habitInputs.habitAlarmUsed} onChange={habitAlarmSwitchHandler} />} label="Habit alarm" />
                    </FormGroup>}
                    {(habitInputs.datePickerUsed || detailedGoal) && <FormGroup>
                        <FormControlLabel control={<Switch checked={habitInputs.goalAlarmUsed} onChange={goalAlarmSwitchHandler} />} label="Goal alarm" />
                    </FormGroup>}
                </div>
                <TextField value={habitInputs.habitTitle} onChange={(event)=>{habitInputsHandler(event,'habitTitle')}} label='Habit Title' className="add-new-habit-title" multiline required />
                {(habitInputs.goalMode || props.detailedHabit?.goalId) && <TextField value={habitInputs.goalTitle} onChange={(event)=>{habitInputsHandler(event,'goalTitle')}} label='Goal Title'  className="add-new-habit-goal-title" multiline required />}
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
                <div className="add-new-habit-buttons">
                    <Button variant="outlined" type='button' className='button' onClick={()=>{props.setDetailedItem();props.returnToHabits()}}>Back</Button>
                    <Button variant="outlined" type='submit' className='button' >Submit</Button>
                </div>
            </Card>
        </div>
    )
}

export default AddNewHabit