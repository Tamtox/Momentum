// Styles
import './Add-new-goal.scss';
// Components
import { goalActions,RootState } from '../../Store/Store';
//Dependencies
import {useDispatch,useSelector} from 'react-redux';
import React,{useEffect, useRef,useState} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { TextField,Button,Box,Card,FormGroup,Switch,FormControlLabel,FormControl,FormLabel,Tooltip,Checkbox,Typography} from '@mui/material';
import { DateTimePicker,TimePicker } from '@mui/lab';

const AddNewGoal:React.FC<{detailedGoal:{goalTitle:string,goalCreationDate:string,goalTargetDate:string|null,goalStatus:string,habitId:string|null,_id:string}|undefined,setDetailedItem:()=>{},returnToGoals:()=>{}}> = (props) => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const habitList = useSelector<RootState,{habitTitle:string,habitTime:string|null,habitCreationDate:string,habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},goalId:string|null,_id:string}[]>(state=>state.habitsSlice.habitList);
    const detailedHabit = habitList.filter((item)=>item._id === props.detailedGoal?._id)[0]
    const [newGoalTitileRef,newHabitTitleRef] = [useRef<HTMLInputElement>(null),useRef<HTMLTextAreaElement>(null)];
    // Switch to habit mode
    const [habitMode,setHabitMode] = useState(false)
    // Habit Time Pick
    const [timePickerUsed,setTimePickerUsed] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date());
    function habitTimePick(newTime:Date | null) {
        if(!!!newTime) {
            newTime=new Date()
        }
        setSelectedTime(newTime);
        setTimePickerUsed(true)
    }
     // Goal Date Pick 
    const [datePickerUsed,setDatePickerUsed] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    function datePick(newDate:Date | null) {
        if(!!!newDate) {
            newDate=new Date()
        }
        console.log(newDate)
        setSelectedDate(newDate);
        setDatePickerUsed(true)
    }
    // Set habit active weekdays
    const [checkBoxes,setCheckboxes] = useState<{[key:number]:boolean}>(detailedHabit?.habitWeekdays || {1:false,2:false,3:false,4:false,5:false,6:false,0:false});
    // Submit or update goal 
    const updateGoal = async (event:React.FormEvent) => {
        event.preventDefault();
        const [goalTitle,habitTitle] = [newGoalTitileRef.current!.value,newHabitTitleRef.current!.value];
        let activeDays = Object.values(checkBoxes).every(item=>item===false)?{1:true,2:true,3:true,4:true,5:true,6:true,0:true}:checkBoxes;
        const newGoal:{goalTitle:string,goalCreationDate:string,goalTargetDate:string|null,goalStatus:string,habitId:string|null,_id:string | undefined} = {
            goalTitle:goalTitle,
            goalCreationDate:props.detailedGoal?.goalCreationDate || new Date().toString(),
            goalTargetDate:datePickerUsed ? selectedDate.toString() : (props.detailedGoal?.goalTargetDate || null),
            goalStatus:props.detailedGoal?.goalStatus || 'Pending',
            habitId:props.detailedGoal?.habitId  || null ,
            _id: props.detailedGoal?._id
        }
        const newHabit:{habitTitle:string,habitTime:string|null,habitCreationDate:string,habitWeekdays:{[key:number]:boolean},goalId:string | null, _id:string | null,} = {
            habitTitle:habitTitle,
            habitTime: timePickerUsed? selectedTime.toString() : (detailedHabit?.habitTime || null),
            habitCreationDate:detailedHabit?.habitCreationDate || new Date().toString(),
            habitWeekdays:activeDays,
            goalId:detailedHabit?.goalId || null, 
            _id:detailedHabit?._id || null
        }
        try {
            const newGoalResponse = await axios.request({
                method:props.detailedGoal ? 'PATCH' : 'POST',
                url:`http://localhost:3001/goals/${props.detailedGoal ? 'updateGoal' : 'addNewGoal'}`,
                data:newGoal,
                headers:{Authorization: `Bearer ${token}`}
            })
            const newHabitResponse = await axios.request({
                method:props.detailedGoal?.habitId ? 'PATCH' : 'POST',
                url:`http://localhost:3001/goals/${props.detailedGoal?.habitId ? 'updateHabit' : 'addNewHabit'}`,
                data:newHabit,
                headers:{Authorization: `Bearer ${token}`}
            })
            props.detailedGoal ? dispatch(goalActions.updateGoal(newGoal)) : dispatch(goalActions.addGoal(newGoalResponse.data)) ;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.message)
            } else {
                console.log(error);
            }
        }   
        // Reset detailed item and return to goal list
        props.setDetailedItem();
        props.returnToGoals();
    }
    return(
        <Box className={`add-new-goal-backdrop backdrop${isDarkMode?'-dark':''} opacity-transition`}>
            <Card component="form" className={`add-new-goal-form scale-in`} onSubmit={updateGoal}>
                {props.detailedGoal || <FormGroup>
                    <FormControlLabel control={<Switch onChange={()=>setHabitMode(!habitMode)} />} label="Add Paired Habit" />
                </FormGroup>}
                <DateTimePicker 
                    inputFormat="DD/MM/YYYY HH:mm" label="Goal Target Date" ampm={false} ampmInClock={false} desktopModeMediaQuery='@media (min-width:769px)'
                    renderInput={(props) => <TextField size='small' className={`focus date-picker`}  {...props} />}
                    value={selectedDate} onChange={newDate=>{datePick(newDate);}}
                />
                <TextField inputRef={newGoalTitileRef} className={`add-new-goal-title focus input`} label='Goal Title' defaultValue={props.detailedGoal?.goalTitle || ''} multiline required />
                {(habitMode || props.detailedGoal?.habitId) && <TimePicker 
                    inputFormat="HH:mm" label="Habit Time" ampm={false} ampmInClock={false} desktopModeMediaQuery='@media (min-width:769px)'
                    renderInput={(props) => <TextField size='small' className={`focus date-picker`}  {...props} />}
                    value={selectedTime} onChange={newTime=>{habitTimePick(newTime);}}
                />}
                {(habitMode || props.detailedGoal?.habitId) && <TextField inputRef={newHabitTitleRef} className={`add-new-goal-habit-title focus input`} label='Habit Title' defaultValue={props.detailedGoal?.habitId || ''} multiline required />}
                {(habitMode || props.detailedGoal?.habitId) && <FormControl className="weekdays-selector" component="fieldset" variant="standard">
                    <FormLabel>
                        <Tooltip enterDelay={500} {...{ 'title':'Select active weekdays for habit. Leave unchecked to select all weekdays.','children':<Typography>Habit Active Weekdays</Typography> }}/>
                    </FormLabel>
                    <FormGroup className="weekdays-selector-checkboxes">
                        <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[1]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,1:!checkBoxes[1]})}/>} label="Mon" />
                        <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[2]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,2:!checkBoxes[2]})}/>} label="Tue" />
                        <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[3]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,3:!checkBoxes[3]})}/>} label="Wed" />
                        <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[4]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,4:!checkBoxes[4]})}/>} label="Thu" />
                        <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[5]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,5:!checkBoxes[5]})}/>} label="Fri" />
                        <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[6]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,6:!checkBoxes[6]})}/>} label="Sat" />
                        <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[0]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,0:!checkBoxes[0]})}/>} label="Sun" />
                    </FormGroup>
                </FormControl>}
                <Box className={`add-new-goal-buttons`}>
                    <Button variant="outlined" className={`button`} onClick={()=>{props.setDetailedItem();props.returnToGoals()}}>Back</Button>
                    <Button variant="outlined" type='submit' className={`button`}>{props.detailedGoal ? 'Update' : 'Submit'}</Button>
                </Box>
            </Card>
        </Box>
    )
}

export default AddNewGoal