// Styles
import './Add-new-goal.scss';
// Components
import { RootState } from '../../Store/Store';
import useGoalHooks from '../../Hooks/userGoalHooks';
import useHabitHooks from '../../Hooks/useHabitHooks';
import type {GoalInterface,HabitInterface} from '../../Misc/Interfaces';
//Dependencies
import {useSelector} from 'react-redux';
import React,{useState} from 'react';
import { TextField,Button,Card,FormGroup,Switch,FormControlLabel,FormControl,FormLabel,Tooltip,Checkbox,Typography} from '@mui/material';
import { DatePicker,TimePicker } from '@mui/lab';
import {BsTrash,BsArchive} from 'react-icons/bs';

const AddNewGoal:React.FC<{detailedGoal:GoalInterface|undefined,setDetailedItem:()=>{},returnToGoals:()=>{}}> = (props) => {
    const goalHooks = useGoalHooks();
    const habitHooks = useHabitHooks();
    // Get paired habit if one exists
    const habitList = useSelector<RootState,HabitInterface[]>(state=>state.habitsSlice.habitList);
    const detailedHabit = habitList.filter((item)=>item.goalId === props.detailedGoal?._id)[0];
    const [goalInputs,setGoalInputs] = useState({
        goalTitle:props.detailedGoal?.goalTitle || '',
        habitTitle:detailedHabit?.habitTitle || '',
        timePickerUsed:false,
        selectedTime: detailedHabit?.habitTime ? new Date(new Date().setHours(Number(detailedHabit.habitTime?.split(':')[0]),Number(detailedHabit.habitTime?.split(':')[1]),0)) : new Date(),
        datePickerUsed:false,
        selectedDate:new Date(props.detailedGoal?.goalTargetDate || new Date()),
        habitMode:false,
    })
    const goalInputsHandler = (e:any,input:string) => {
        setGoalInputs((prevState)=>({
            ...prevState,
            [input]:e.target.value
        }))
    }
    const habitModeHandler = () => {
        setGoalInputs((prevState)=>({
            ...prevState,
            habitMode:!goalInputs.habitMode
        }))
    }
    const habitTimePick =(newTime:Date | null) => {
        const newTimeFixed = new Date(newTime || new Date());
        setGoalInputs((prevState)=>({
            ...prevState,
            timePickerUsed:true,
            selectedTime:newTimeFixed
        }))
    }
    const goalDatePick = (newDate:Date | null) => {
        const newDateFixed = new Date(newDate || new Date());
        setGoalInputs((prevState)=>({
            ...prevState,
            datePickerUsed:true,
            selectedDate:newDateFixed
        }))
    }
    // Set habit active weekdays
    const weekdays = [1,2,3,4,5,6,0];
    const weekdaysLabels:{[key:number]:string} = {1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat',0:'Sun'};
    const [checkBoxes,setCheckboxes] = useState<{[key:number]:boolean}>(detailedHabit?.habitWeekdays || {1:false,2:false,3:false,4:false,5:false,6:false,0:false});
    // Submit or update goal 
    const updateGoal = async (event:React.FormEvent) => {
        event.preventDefault();
        let activeDays = Object.values(checkBoxes).every(item=>item===false)?{1:true,2:true,3:true,4:true,5:true,6:true,0:true}:checkBoxes;
        const newGoal:GoalInterface = {
            goalTitle:goalInputs.goalTitle,
            goalCreationDate:props.detailedGoal?.goalCreationDate || new Date().toString(),
            goalTargetDate:goalInputs.datePickerUsed ? goalInputs.selectedDate.toString() : (props.detailedGoal?.goalTargetDate || null),
            goalStatus:props.detailedGoal?.goalStatus || 'Pending',
            dateCompleted:props.detailedGoal?.dateCompleted || '',
            isArchived:props.detailedGoal?.isArchived || false,
            habitId:props.detailedGoal?.habitId  || null ,
            _id: props.detailedGoal?._id || ''
        }
        const newHabit:HabitInterface = {
            habitTitle: goalInputs.habitTitle || '' ,
            habitTime: goalInputs.timePickerUsed ? `${new Date(goalInputs.selectedTime).getHours()}:${new Date(goalInputs.selectedTime).getMinutes() ? new Date(goalInputs.selectedTime).getMinutes() : '00'}` : (detailedHabit?.habitTime || null),
            habitCreationDate:detailedHabit?.habitCreationDate || new Date().toString(),
            habitWeekdays:activeDays,
            habitEntries:detailedHabit?.habitEntries || [],
            isArchived:detailedHabit?.isArchived || false,
            goalId:detailedHabit?.goalId || null, 
            goalTargetDate:goalInputs.datePickerUsed ? goalInputs.selectedDate.toString() : (detailedHabit?.goalTargetDate || null) ,
            _id:detailedHabit?._id || ''
        }
        const newHabitArgument = (detailedHabit || goalInputs.habitMode) ? newHabit : null
        goalHooks.updateGoal(newGoal,!!props.detailedGoal,newHabitArgument,!!detailedHabit)
        // Reset detailed item and return to goal list
        props.setDetailedItem();
        props.returnToGoals();
    }
    return(
        <div className={`add-new-goal-backdrop backdrop opacity-transition`}>
            <Card component="form" className={`add-new-goal-form scale-in`} onSubmit={updateGoal}>
                <div className={`add-new-goal-controls`}>
                    {props.detailedGoal && <Tooltip title="Archive Item">
                        <div className='archive-goal'>
                            <BsArchive className={`icon-interactive archive-goal-icon`} onClick={()=>{goalHooks.toggleGoalArchiveStatus(props.detailedGoal!);detailedHabit && habitHooks.toggleHabitArchiveStatus(detailedHabit!);props.setDetailedItem();props.returnToGoals()}}/>
                        </div>
                    </Tooltip>}
                    {props.detailedGoal?.habitId ? null : <FormGroup className='add-new-goal-switch'>
                        <FormControlLabel control={<Switch onChange={habitModeHandler} />} label="Add Paired Habit" />
                    </FormGroup>}
                    {props.detailedGoal && <Tooltip title="Delete Item">
                        <div className='delete-goal'>
                            <BsTrash className={`icon-interactive delete-goal-icon`} onClick={()=>{goalHooks.deleteGoal(props.detailedGoal!._id,props.detailedGoal!.habitId);props.setDetailedItem();props.returnToGoals()}}/>
                        </div>
                    </Tooltip>}
                </div>
                <div className='add-new-goal-datetime'>
                    <DatePicker 
                        inputFormat="dd/MM/yyyy" label="Goal Target Date" desktopModeMediaQuery='@media (min-width:769px)'
                        renderInput={(props) => <TextField size='small' className={`focus date-picker`}  {...props} />}
                        value={goalInputs.selectedDate} onChange={newDate=>{goalDatePick(newDate);}}
                    />
                    {(goalInputs.habitMode || props.detailedGoal?.habitId) && <TimePicker 
                        inputFormat="HH:mm" label="Habit Time" ampm={false} ampmInClock={false} desktopModeMediaQuery='@media (min-width:769px)'
                        renderInput={(props) => <TextField size='small' className={`focus date-picker`}  {...props} />}
                        value={goalInputs.selectedTime} onChange={newTime=>{habitTimePick(newTime);}}
                    />}
                </div>
                <TextField value={goalInputs.goalTitle} onChange={(e)=>{goalInputsHandler(e,'goalTitle')}} className={`add-new-goal-title focus input`} label='Goal Title' multiline required />
                {(goalInputs.habitMode || props.detailedGoal?.habitId) && <TextField value={goalInputs.habitTitle} onChange={(e)=>{goalInputsHandler(e,'habitTitle')}} className={`add-new-goal-habit-title focus input`} label='Habit Title' multiline required />}
                {(goalInputs.habitMode || props.detailedGoal?.habitId) && 
                <FormControl className="weekdays-selector" component="fieldset" variant="standard">
                    <FormLabel>
                        <Tooltip enterDelay={300} {...{ 'title':'Select active weekdays for habit. Leave unchecked to select all weekdays.','children':<Typography>Habit Active Weekdays</Typography> }}/>
                    </FormLabel>
                    <FormGroup className="weekdays-selector-checkboxes">
                        {weekdays.map((weekday:number)=>{
                            return (<FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[weekday]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,[weekday]:!checkBoxes[weekday]})}/>} label={weekdaysLabels[weekday]} key={weekday} />)
                        })}
                    </FormGroup>
                </FormControl>}
                <div className={`add-new-goal-buttons`}>
                    <Button variant="outlined" className={`button`} onClick={()=>{props.setDetailedItem();props.returnToGoals()}}>Back</Button>
                    <Button variant="outlined" type='submit' className={`button`}>{props.detailedGoal ? 'Update' : 'Submit'}</Button>
                </div>
            </Card>
        </div>
    )
}

export default AddNewGoal