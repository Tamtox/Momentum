// Styles
import './Add-new-habit.scss';
//Dependencies
import Cookies from 'js-cookie';
import axios from 'axios';
import {useDispatch,useSelector} from 'react-redux';
import React,{ useRef,useState } from 'react';
import { authActions,goalActions, habitsActions,RootState } from "../../Store/Store";
import { TextField,Button,Box,Typography,FormControl,FormControlLabel,FormGroup,FormLabel,Card,Checkbox,Tooltip,Switch} from '@mui/material';
import { DatePicker,TimePicker } from '@mui/lab';

const AddNewHabit:React.FC<{detailedHabit:{ habitTitle:string,habitTime:string,habitCreationDate:string,habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},goalTargetDate:string|null,goalId:string|null,_id:string}|undefined,setDetailedItem:()=>{},returnToHabits:()=>{}}> = (props) => {
    const dispatch = useDispatch();
    const token = Cookies.get('token');
    // Get paired goal if one exists
    const goalList = useSelector<RootState,{goalTitle:string,goalCreationDate:string,goalTargetDate:string|null,goalStatus:string,habitId:string|null,_id:string}[]>(state=>state.goalSlice.goalList);
    const detailedGoal = goalList.filter((item)=>item.habitId === props.detailedHabit?._id)[0];
    const [newHabitTitleRef,newGoalTitleRef] = [useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null)];
    // Switch to goal mode
    const [goalMode,setGoalMode] = useState(false)
    // Habit time Pick
    const [timePickerUsed,setTimePickerUsed] = useState(false);
    const [selectedTime, setSelectedTime] = useState(props.detailedHabit?.habitTime ? new Date(new Date().setHours(Number(props.detailedHabit.habitTime?.split(':')[0]),Number(props.detailedHabit.habitTime?.split(':')[1]),0)) : new Date());
    function habitTimePick(newTime:Date | null) {
        if(!!!newTime) {
            newTime=new Date()
        }
        setSelectedTime(newTime);
        setTimePickerUsed(true)
    }
    // Goal Date Pick 
    const [datePickerUsed,setDatePickerUsed] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date(detailedGoal?.goalTargetDate || new Date()));
    function datePick(newDate:Date | null) {
        if(!!!newDate) {
            newDate=new Date()
        }
        setSelectedDate(newDate);
        setDatePickerUsed(true)
    }
    // Set Active weekdays
    const [checkBoxes,setCheckboxes] = useState<{[key:number]:boolean}>(props.detailedHabit?.habitWeekdays ?? {1:false,2:false,3:false,4:false,5:false,6:false,0:false});
    // Add new habit
    const updateHabit = async (event:React.FormEvent) => {
        event.preventDefault();
        dispatch(authActions.setLoading(true))
        const [goalTitle,habitTitle] = [newGoalTitleRef.current?.value,newHabitTitleRef.current!.value];
        let activeDays = Object.values(checkBoxes).every(item=>item===false)?{1:true,2:true,3:true,4:true,5:true,6:true,0:true}:checkBoxes;
        const newHabit:{habitTitle:string,habitTime:string|null,habitCreationDate:string,habitWeekdays:{[key:number]:boolean},goalId:string | null, goalTargetDate:string|null, _id:string | null,} = {
            habitTitle: habitTitle ,
            habitTime: timePickerUsed ? `${new Date(selectedTime).getHours()}:${new Date(selectedTime).getMinutes() ? new Date(selectedTime).getMinutes() : '00'}` : (props.detailedHabit?.habitTime || null),
            habitCreationDate:props.detailedHabit?.habitCreationDate || new Date().toString(),
            habitWeekdays:activeDays,
            goalId:props.detailedHabit?.goalId || null, 
            goalTargetDate:datePickerUsed ? selectedDate.toString() : (props.detailedHabit?.goalTargetDate || null) ,
            _id:props.detailedHabit?._id || null
        }
        const newGoal:{goalTitle:string,goalCreationDate:string,goalTargetDate:string|null,goalStatus:string,habitId:string|null,_id:string | undefined} = {
            goalTitle:goalTitle || '',
            goalCreationDate:detailedGoal?.goalCreationDate || new Date().toString(),
            goalTargetDate:datePickerUsed ? selectedDate.toString() : (detailedGoal?.goalTargetDate || null),
            goalStatus:detailedGoal?.goalStatus || 'Pending',
            habitId:detailedGoal?.habitId  || null ,
            _id: detailedGoal?._id
        }
        try {
            const newHabitResponse:{data:{newHabit:{_id:string,goalId:string|null|undefined,goalTargetDate:string|null|undefined},newHabitEntries:[]}} = await axios.request({
                method:props.detailedHabit ? 'PATCH' : 'POST',
                url:`http://localhost:3001/habits/${props.detailedHabit ? 'updateHabit' : 'addNewHabit'}`,
                data:{...newHabit,currentDate:new Date()},
                headers:{Authorization: `Bearer ${token}`}
            })
            if(props.detailedHabit?.goalId || goalMode) {
                const newGoalResponse = await axios.request({
                    method:props.detailedHabit?.goalId ? 'PATCH' : 'POST',
                    url:`http://localhost:3001/goals/${props.detailedHabit?.goalId ?  'updateGoal' : 'addNewGoal'}`,
                    data:newGoal,
                    headers:{Authorization: `Bearer ${token}`}
                })
                // Update goal and habit ids
                await axios.request({
                    method:'PATCH',
                    url:`http://localhost:3001/goals/updateGoal`,
                    data:{_id:newGoalResponse.data._id,habitId:newHabitResponse.data.newHabit._id},
                    headers:{Authorization: `Bearer ${token}`}
                })
                await axios.request({
                    method:'PATCH',
                    url:`http://localhost:3001/habits/updateHabit`,
                    data:{_id:newHabitResponse.data.newHabit._id,goalId:newGoalResponse.data._id,goalTargetDate:newGoalResponse.data.goalTargetDate},
                    headers:{Authorization: `Bearer ${token}`}
                })
                newGoalResponse.data.habitId = newHabitResponse.data.newHabit._id
                newHabitResponse.data.newHabit.goalId = newGoalResponse.data._id
                newHabitResponse.data.newHabit.goalTargetDate = newGoalResponse.data.goalTargetDate
                detailedGoal ? dispatch(goalActions.updateGoal(newGoal)) : dispatch(goalActions.addGoal(newGoalResponse.data)) ;
                props.detailedHabit ? dispatch(habitsActions.updateHabit({newHabit,newHabitEntries:newHabitResponse.data})) : dispatch(habitsActions.addHabit(newHabitResponse.data)) ;
            }
            props.detailedHabit ? dispatch(habitsActions.updateHabit(newHabit)) : dispatch(habitsActions.addHabit(newHabitResponse.data)) ;
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
        // Reset detailed item and return to habits
        props.setDetailedItem();
        props.returnToHabits();
        dispatch(authActions.setLoading(false))
    }
    return (
        <Box className={`opacity-transition add-new-habit-backdrop backdrop`}>
            <Card component="form" onSubmit={updateHabit} className={`add-new-habit-form scale-in`}>
                {!!props.detailedHabit?.goalId || <FormGroup>
                    <FormControlLabel control={<Switch onChange={()=>setGoalMode(!goalMode)} />} label="Add paired goal" />
                </FormGroup>}
                <TimePicker 
                    inputFormat="HH:mm" label="Habit Time" ampm={false} ampmInClock={false} desktopModeMediaQuery='@media (min-width:769px)'
                    renderInput={(props) => <TextField size='small' className={`focus date-picker add-new-goal-date`}  {...props} />}
                    value={selectedTime} onChange={newTime=>{habitTimePick(newTime);}}
                />
                <TextField label='Habit Title' inputRef={newHabitTitleRef} defaultValue={props.detailedHabit?.habitTitle} className="add-new-habit-title" multiline required />
                <FormControl className="weekdays-selector" component="fieldset" variant="standard">
                    <FormLabel>
                        <Tooltip enterDelay={300} {...{ 'title':'Select active weekdays for habit. Leave unchecked to select all weekdays.','children':<Typography>Habit Active Weekdays</Typography> }}/>
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
                </FormControl>
                {(goalMode || props.detailedHabit?.goalId) && <DatePicker 
                    inputFormat="dd/MM/yyyy" label="Goal Target Date" desktopModeMediaQuery='@media (min-width:769px)'
                    renderInput={(props) => <TextField size='small' className={`focus date-picker add-new-todo-date`}  {...props} />}
                    value={selectedDate} onChange={newDate=>{datePick(newDate);}}
                />}
                {(goalMode || props.detailedHabit?.goalId) && <TextField label='Goal Title' inputRef={newGoalTitleRef} className="add-new-habit-goal-title" multiline required />}
                <Box className="add-new-habit-buttons">
                    <Button variant="outlined" type='button' className='button' onClick={props.returnToHabits}>Go Back</Button>
                    <Button variant="outlined" type='submit' className='button' >Submit</Button>
                </Box>
            </Card>
        </Box>
    )
}


export default AddNewHabit