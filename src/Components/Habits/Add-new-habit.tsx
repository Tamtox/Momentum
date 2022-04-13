// Styles
import './Add-new-habit.scss';
//Components
import { RootState } from "../../Store/Store";
import useHabitHooks from '../../Hooks/useHabitHooks';
//Dependencies
import {useSelector} from 'react-redux';
import React,{ useState } from 'react';
import { TextField,Button,Box,Typography,FormControl,FormControlLabel,FormGroup,FormLabel,Card,Checkbox,Tooltip,Switch} from '@mui/material';
import { DatePicker,TimePicker } from '@mui/lab';
import {BsTrash} from 'react-icons/bs';

const AddNewHabit:React.FC<{detailedHabit:{ habitTitle:string,habitTime:string,habitCreationDate:string,habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},goalTargetDate:string|null,goalId:string|null,_id:string}|undefined,setDetailedItem:()=>{},returnToHabits:()=>{}}> = (props) => {
    const habitHooks = useHabitHooks();
    // Get paired goal if one exists
    const goalList = useSelector<RootState,{goalTitle:string,goalCreationDate:string,goalTargetDate:string|null,goalStatus:string,habitId:string|null,_id:string}[]>(state=>state.goalSlice.goalList);
    const detailedGoal = goalList.filter((item)=>item.habitId === props.detailedHabit?._id)[0];
    const [habitInputs,setHabitInputs] = useState({
        habitTitle:props.detailedHabit?.habitTitle || '',
        goalTitle:detailedGoal?.goalTitle || '',
        timePickerUsed:false,
        selectedTime: props.detailedHabit?.habitTime ? new Date(new Date().setHours(Number(props.detailedHabit.habitTime?.split(':')[0]),Number(props.detailedHabit.habitTime?.split(':')[1]),0)) : new Date(),
        datePickerUsed:false,
        selectedDate:new Date(detailedGoal?.goalTargetDate || new Date()),
        goalMode:false,
    })
    const habitInputsHandler = (e:any,input:string) => {
        setHabitInputs((prevState)=>({
            ...prevState,
            [input]:e.target.value
        }))
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
    const [weekdays,setWeekdays] = useState<{[key:number]:boolean}>(props.detailedHabit?.habitWeekdays || {1:false,2:false,3:false,4:false,5:false,6:false,0:false});
    // Update or add habit
    const updateHabit = async (event:React.FormEvent) => {
        event.preventDefault();
        let activeDays = Object.values(weekdays).every(item=>item===false)?{1:true,2:true,3:true,4:true,5:true,6:true,0:true}:weekdays;
        const newHabit:{habitTitle:string,habitTime:string|null,habitCreationDate:string,habitWeekdays:{[key:number]:boolean},goalId:string | null, goalTargetDate:string|null, _id:string | null,} = {
            habitTitle: habitInputs.habitTitle ,
            habitTime: habitInputs.timePickerUsed ? `${new Date(habitInputs.selectedTime).getHours()}:${new Date(habitInputs.selectedTime).getMinutes() ? new Date(habitInputs.selectedTime).getMinutes() : '00'}` : (props.detailedHabit?.habitTime || null),
            habitCreationDate:props.detailedHabit?.habitCreationDate || new Date().toString(),
            habitWeekdays:activeDays,
            goalId:props.detailedHabit?.goalId || null, 
            goalTargetDate:habitInputs.datePickerUsed ? habitInputs.selectedDate.toString() : (props.detailedHabit?.goalTargetDate || null) ,
            _id:props.detailedHabit?._id || null
        }
        const newGoal:{goalTitle:string,goalCreationDate:string,goalTargetDate:string|null,goalStatus:string,habitId:string|null,_id:string | undefined} = {
            goalTitle:habitInputs.goalTitle,
            goalCreationDate:detailedGoal?.goalCreationDate || new Date().toString(),
            goalTargetDate:habitInputs.datePickerUsed ? habitInputs.selectedDate.toString() : (detailedGoal?.goalTargetDate || null),
            goalStatus:detailedGoal?.goalStatus || 'Pending',
            habitId:detailedGoal?.habitId  || null ,
            _id: detailedGoal?._id 
        }
        const newGoalArgument = (detailedGoal || habitInputs.goalMode) ? newGoal : null
        habitHooks.updateHabit(newHabit,!!props.detailedHabit,newGoalArgument,!!detailedGoal)
        // Reset detailed item and return to habits
        props.setDetailedItem();
        props.returnToHabits();
    }
    return (
        <Box className={`opacity-transition add-new-habit-backdrop backdrop`}>
            <Card component="form" onSubmit={updateHabit} className={`add-new-habit-form scale-in`}>
                <Box className={`add-new-habit-controls`}>
                    {!!props.detailedHabit?.goalId || <FormGroup className={`add-new-habit-switch`}>
                        <FormControlLabel control={<Switch onChange={goalModeHandler} />} label="Add paired goal" />
                    </FormGroup>}
                    { props.detailedHabit && <BsTrash className={`icon-interactive delete-habit`} onClick={()=>{habitHooks.deleteHabit(props.detailedHabit!._id,props.detailedHabit!.goalId);props.setDetailedItem();props.returnToHabits()}}/>}
                </Box>
                <Box className='add-new-habit-datetime'>
                    {(habitInputs.goalMode || props.detailedHabit?.goalId) && <DatePicker 
                        inputFormat="dd/MM/yyyy" label="Goal Target Date" desktopModeMediaQuery='@media (min-width:769px)'
                        renderInput={(props) => <TextField size='small' className={`focus date-picker add-new-todo-date`}  {...props} />}
                        value={habitInputs.selectedDate} onChange={newDate=>{goalDatePick(newDate);}}
                    />}
                    <TimePicker 
                        inputFormat="HH:mm" label="Habit Time" ampm={false} ampmInClock={false} desktopModeMediaQuery='@media (min-width:769px)'
                        renderInput={(props) => <TextField size='small' className={`focus date-picker add-new-goal-date`}  {...props} />}
                        value={habitInputs.selectedTime} onChange={newTime=>{habitTimePick(newTime);}}
                    />
                </Box>
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
                <Box className="add-new-habit-buttons">
                    <Button variant="outlined" type='button' className='button' onClick={()=>{props.setDetailedItem();props.returnToHabits()}}>Back</Button>
                    <Button variant="outlined" type='submit' className='button' >Submit</Button>
                </Box>
            </Card>
        </Box>
    )
}

export default AddNewHabit