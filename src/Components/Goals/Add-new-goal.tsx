// Styles
import './Add-new-habit.scss';
//Dependencies
import Cookies from 'js-cookie';
import axios from 'axios';
import {useDispatch,useSelector} from 'react-redux';
import React,{ useRef,useState } from 'react';
// import { habitsActions,RootState } from "../../Store/Store";
// import { TextField,Button,Box,Typography,FormControl,FormControlLabel,FormGroup,FormLabel,Card,Checkbox,Tooltip,Switch,Fab} from '@mui/material';
// import { DateTimePicker } from '@mui/lab';

// const AddNewHabit:React.FC<{detailedHabit:{weekdays:{},title:string,goalTitle:string,creationDate:string,goalTargetDate:string,_id:string}|undefined,setDetailedItem:()=>{},returnToHabits:()=>{}}> = (props) => {
//     const dispatch = useDispatch();
//     const token = Cookies.get('token');
//     const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
//     const [habitNameRef,goalNameRef] = [useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null)];
//     // Switch to goal mode
//     const [goalMode,setGoalMode] = useState(false)
//     // Goal Date Pick 
//     const [datePickerUsed,setDatePickerUsed] = useState(false);
//     const [selectedDate, setSelectedDate] = useState(new Date());
//     function datePick(newDate:Date | null) {
//         if(!!!newDate) {
//             newDate=new Date()
//         }
//         setSelectedDate(newDate);
//         setDatePickerUsed(true)
//     }
//     // Set Active weekdays
//     const [checkBoxes,setCheckboxes] = useState<{[key:number]:boolean}>(props.detailedHabit?.weekdays ?? {1:false,2:false,3:false,4:false,5:false,6:false,0:false});
//     // Add new habit
//     const addNewHabit = async (event:React.FormEvent) => {
//         event.preventDefault();
//         const [habitName,goalName] = [habitNameRef.current!.value,goalNameRef.current?.value];
//         let activeDays = Object.values(checkBoxes).every(item=>item===false)?{1:true,2:true,3:true,4:true,5:true,6:true,0:true}:checkBoxes;
//         const newHabit = {
//             weekdays:activeDays,
//             title:habitName,
//             goalTitle:goalName ?? "",
//             goalTargetDate: datePickerUsed?selectedDate:'',
//             creationDate: new Date().toString(),
//         }
//         const editedHabit = {
//             weekdays:activeDays,
//             title:habitName,
//             goalTitle:goalName ?? "",
//             goalTargetDate: datePickerUsed?selectedDate:'',
//             creationDate: new Date().toString(),
//         }
//         const newGoal = {
//             title: goalName,
//             habitTitle:habitName,
//             status:'Pending',
//             targetDate:datePickerUsed?selectedDate:'',
//             creationDate: new Date().toString(),
//         }
//         try {
//             const newTodoItem = await axios.request({
//                 method:props.detailedHabit === undefined?'POST':'PATCH',
//                 url:`http://localhost:3001/todo/${props.detailedItem === undefined?'addNewHabit':'updateHabit'}`,
//                 data:props.detailedHabit === undefined? newHabit:editedHabit,
//                 headers:{Authorization: `Bearer ${token}`}
//             })
//             if(props.detailedHabit === undefined) {
//                 dispatch(habitsActions.addToDo(newTodoItem.data))
//             }
//             else{
//                 dispatch(habitsActions.editToDo(editedHabit))
//             }
//         } catch (error) {
//             if (axios.isAxiosError(error)) {
//                 alert(error.message)
//             } else {
//                 console.log(error);
//             }
//         }   
//         // Reset detailed item and return to habits
//         props.setDetailedItem();
//         props.returnToHabits();
//     }
//     return (
//         <Box className={`opacity-transition add-new-habit-backdrop backdrop${isDarkMode?'-dark':''}`}>
//             <Card component="form" onSubmit={addNewHabit} className={`add-new-habit-form scale-in`}>
//                 <FormGroup>
//                     <FormControlLabel control={<Switch onChange={()=>setGoalMode(!goalMode)} />} label="Set goal" />
//                 </FormGroup>
//                 {goalMode && <DateTimePicker 
//                 inputFormat="DD/MM/YYYY HH:mm" label="Goal Target Date" ampm={false} ampmInClock={false} desktopModeMediaQuery='@media (min-width:769px)'
//                 renderInput={(props) => <TextField size='small' className={`focus date-picker add-new-todo-date`}  {...props} />}
//                 value={selectedDate} onChange={newDate=>{datePick(newDate);}}
//                 />}
//                 {goalMode && <TextField label='Goal Name' inputRef={goalNameRef} className="add-new-habit-goal" multiline required />}
//                 <TextField label='Habit Name' inputRef={habitNameRef} className="add-new-habit-taskname" multiline required />
//                 <FormControl className="weekdays-selector" component="fieldset" variant="standard">
//                     <FormLabel><Tooltip {...{ 'title':'Select active weekdays for habit. Leave unchecked to select all weekdays.','children':<Typography>Active Weekdays</Typography> }}/></FormLabel>
//                     <FormGroup className="weekdays-selector-checkboxes">
//                         <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[1]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,1:!checkBoxes[1]})}/>} label="Mon" />
//                         <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[2]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,2:!checkBoxes[2]})}/>} label="Tue" />
//                         <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[3]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,3:!checkBoxes[3]})}/>} label="Wed" />
//                         <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[4]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,4:!checkBoxes[4]})}/>} label="Thu" />
//                         <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[5]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,5:!checkBoxes[5]})}/>} label="Fri" />
//                         <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[6]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,6:!checkBoxes[6]})}/>} label="Sat" />
//                         <FormControlLabel className={`weekdays-selector-checkbox`} {...{'checked':checkBoxes[0]}} control={<Checkbox onClick={()=>setCheckboxes({...checkBoxes,0:!checkBoxes[0]})}/>} label="Sun" />
//                     </FormGroup>
//                 </FormControl>
//                 <Box className="add-new-habit-buttons">
//                     <Button variant="outlined" type='button' className='button' onClick={props.returnToHabits}>Go Back</Button>
//                     <Button variant="outlined" type='submit' className='button' >Submit</Button>
//                 </Box>
//             </Card>
//         </Box>
//     )
// }


// export default AddNewHabit