// Styles
import './Add-new-goal.scss';
// Dependencies
import React,{useState,useRef, useEffect} from 'react';
import {useSelector} from 'react-redux';
import { useLocation,useNavigate } from 'react-router-dom';
import { TextField,Button,Card,FormGroup,Switch,FormControlLabel,Tooltip,Typography,Box,InputAdornment } from '@mui/material';
import { DatePicker} from '@mui/x-date-pickers';
import {BsTrash,BsArchive} from 'react-icons/bs';
import {IoCloseCircleOutline} from 'react-icons/io5';
// Components
import { RootState } from '../../Store/Store';
import useGoalHooks from '../../Hooks/userGoalHooks';
import type {GoalInterface} from '../../Misc/Interfaces';
import Loading from '../Misc/Loading';

const AddNewGoal:React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const goalHooks = useGoalHooks();
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
    const [goalInputs,setGoalInputs] = useState({
        addNewGoalHeader: "",
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
            selectedDate:newDateFixed
        }))
    }
    const goalArchiveDeleteHandler = (goal:GoalInterface,action:string) => {
        if(action === "archive") {
            goalHooks.toggleGoalArchiveStatus(goal);
        } else {
            goalHooks.deleteGoal(goal);
        }
        navigate("/goals");
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
            creationUTCOffset: goalInputs.goalCreationUTCOffset,
            alarmUsed:goalInputs.goalAlarmUsed,
            _id: detailedGoal?._id || ''
        }
        detailedGoal ? goalHooks.updateGoal(newGoal,detailedGoal) : goalHooks.addGoal(newGoal);
        navigate("/goals");
    }
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
    return(
        <Box className={`add-new-goal-backdrop backdrop opacity-transition`} ref={backdropRef} onClick={(event)=>backdropClickHandler(event)}>
            {goalLoading ? <Loading height='80vh'/> : <Card component="form" className={`add-new-goal-form scale-in`} onSubmit={updateGoal}>
                {goalInputs.addNewGoalHeader.length > 0 ? <Box className={`add-new-goal-header`}>
                    <Typography variant='h6' >{goalInputs.addNewGoalHeader}</Typography>
                </Box> : null}
                <Box className={`add-new-goal-controls`}>
                    {detailedGoal ? <Tooltip title="Archive Item">
                        <Box className='archive-goal'>
                            <BsArchive className={`icon-interactive archive-goal-icon`} onClick={()=>{goalArchiveDeleteHandler(detailedGoal,"archive")}}/>
                        </Box>
                    </Tooltip> : null}
                    <Box className='add-new-goal-datepicker-wrapper'>
                        <DatePicker 
                            inputFormat="dd/MM/yyyy" label="Goal Target Date" desktopModeMediaQuery='@media (min-width:769px)'
                            renderInput={(props) => <TextField size='small' className={`focus date-picker`}  {...props} />}
                            value={goalInputs.selectedDate} onChange={(newDate:Date|null)=>{goalDatePick(newDate)}}
                            // endAdornment={
                            //     <InputAdornment position="end">
                            //         <Box className={`toolbar-clear-search-input-wrapper`}>
                            //             <IoCloseCircleOutline  className={`icon-interactive opacity-transition toolbar-clear-search-input-icon`}/>
                            //         </Box>
                            //     </InputAdornment>
                            // }
                            componentsProps={{
                                actionBar: {
                                    actions: (variant) => (variant === 'desktop' ? ['clear'] : ['clear']),
                                },
                            }}
                        />
                    </Box>
                    {detailedGoal ? <Tooltip title="Delete Item">
                        <Box className='delete-goal'>
                            <BsTrash className={`icon-interactive delete-goal-icon`} onClick={()=>{goalArchiveDeleteHandler(detailedGoal,"delete")}}/>
                        </Box>
                    </Tooltip> : null}
                </Box>
                {goalInputs.selectedDate ? <Box className={`add-new-goal-alarm-switches`}>
                    <FormGroup>
                        <FormControlLabel control={<Switch checked={goalInputs.goalAlarmUsed} onChange={goalAlarmSwitchHandler} />} label="Goal alarm" />
                    </FormGroup>
                </Box> : null}
                <TextField value={goalInputs.goalTitle} onChange={(event)=>{goalInputsHandler(event.target.value,'goalTitle')}} className={`add-new-goal-title focus input`} label='Goal Title' multiline required />
                <Box className={`add-new-goal-buttons`}>
                    <Button variant="outlined" className={`button`} onClick={()=>{navigate(-1)}}>Back</Button>
                    <Button variant="outlined" type='submit' className={`button`}>{detailedGoal ? 'Update' : 'Submit'}</Button>
                </Box>
            </Card>}
        </Box>
    )
}

export default AddNewGoal
