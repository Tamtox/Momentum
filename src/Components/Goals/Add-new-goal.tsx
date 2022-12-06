// Styles
import './Add-new-goal.scss';
// Dependencies
import React,{useState,useRef} from 'react';
import {useSelector} from 'react-redux';
import { useLocation,useNavigate } from 'react-router-dom';
import { TextField,Button,Card,FormGroup,Switch,FormControlLabel,Tooltip} from '@mui/material';
import { DatePicker} from '@mui/x-date-pickers';
import {BsTrash,BsArchive} from 'react-icons/bs';
// Components
import { RootState } from '../../Store/Store';
import useGoalHooks from '../../Hooks/userGoalHooks';
import useHabitHooks from '../../Hooks/useHabitHooks';
import type {GoalInterface,HabitInterface} from '../../Misc/Interfaces';

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
    const goalList = useSelector<RootState,GoalInterface[]>(state=>state.goalSlice.goalList);
    const id = location.pathname.split('/')[2];
    const detailedGoal = goalList.find((goalitem)=> goalitem._id === id);
    // Get paired habit if one exists
    const habitList = useSelector<RootState,HabitInterface[]>(state=>state.habitsSlice.habitList);
    const detailedHabit = habitList.filter((item)=>item.goalId === detailedGoal?._id)[0];
    const [goalInputs,setGoalInputs] = useState({
        goalTitle:detailedGoal?.title || '',
        selectedDate:detailedGoal?.targetDate ? new Date(detailedGoal.targetDate) : null,
        goalCreationUTCOffset:detailedGoal?.creationUTCOffset || new Date().getTimezoneOffset(),
        goalAlarmUsed:detailedGoal?.alarmUsed || false,
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
            datePickerUsed:true,
            selectedDate:newDateFixed
        }))
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
            habitId:detailedGoal?.habitId  || null ,
            creationUTCOffset: goalInputs.goalCreationUTCOffset,
            alarmUsed:goalInputs.goalAlarmUsed,
            _id: detailedGoal?._id || ''
        }
        detailedGoal ? goalHooks.updateGoal(newGoal,detailedGoal) : goalHooks.addGoal(newGoal);
        // Return to goal list
        navigate("/goals");
    }
    return(
        <div className={`add-new-goal-backdrop backdrop opacity-transition`} ref={backdropRef} onClick={(event)=>backdropClickHandler(event)}>
            <Card component="form" className={`add-new-goal-form scale-in`} onSubmit={updateGoal}>
                <div className={`add-new-goal-controls`}>
                    {detailedGoal && <Tooltip title="Archive Item">
                        <div className='archive-goal'>
                            <BsArchive className={`icon-interactive archive-goal-icon`} onClick={()=>{goalHooks.toggleGoalArchiveStatus(detailedGoal!);detailedHabit && habitHooks.toggleHabitArchiveStatus(detailedHabit!);navigate("/goals")}}/>
                        </div>
                    </Tooltip>}
                    <div className='add-new-goal-datepicker-wrapper'>
                        <DatePicker 
                            inputFormat="dd/MM/yyyy" label="Goal Target Date" desktopModeMediaQuery='@media (min-width:769px)'
                            renderInput={(props) => <TextField size='small' className={`focus date-picker`}  {...props} />}
                            value={goalInputs.selectedDate} onChange={(newDate:Date|null)=>{goalDatePick(newDate);}}
                        />
                    </div>
                    {detailedGoal && <Tooltip title="Delete Item">
                        <div className='delete-goal'>
                            <BsTrash className={`icon-interactive delete-goal-icon`} onClick={()=>{goalHooks.deleteGoal(detailedGoal!._id,detailedGoal!.habitId);navigate("/goals")}}/>
                        </div>
                    </Tooltip>}
                </div>
                <div className={`add-new-goal-alarm-switches`}>
                    {(goalInputs.selectedDate) && <FormGroup>
                        <FormControlLabel control={<Switch checked={goalInputs.goalAlarmUsed} onChange={goalAlarmSwitchHandler} />} label="Goal alarm" />
                    </FormGroup>}
                </div>
                <TextField value={goalInputs.goalTitle} onChange={(event)=>{goalInputsHandler(event.target.value,'goalTitle')}} className={`add-new-goal-title focus input`} label='Goal Title' multiline required />
                <div className={`add-new-goal-buttons`}>
                    <Button variant="outlined" className={`button`} onClick={()=>{navigate(-1)}}>Back</Button>
                    <Button variant="outlined" type='submit' className={`button`}>{detailedGoal ? 'Update' : 'Submit'}</Button>
                </div>
            </Card>
        </div>
    )
}

export default AddNewGoal