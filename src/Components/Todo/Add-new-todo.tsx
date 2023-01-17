// Styles
import './Add-new-todo.scss';
// Components
import useTodoHooks from '../../Hooks/useTodoHooks';
import type {TodoInterface} from '../../Misc/Interfaces';
import {RootState} from '../../Store/Store';
import Loading from '../Misc/Loading';
//Dependencies
import {useSelector} from 'react-redux';
import React,{useState,useRef, useEffect} from 'react';
import { TextField,Button,Card,FormControlLabel,FormGroup,Switch,Box,Typography } from '@mui/material';
import { DatePicker,TimePicker } from '@mui/x-date-pickers';
import { BsTrash,BsArchive } from 'react-icons/bs';
import { useLocation,useNavigate } from 'react-router-dom';

const AddNewTodo:React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const todoHooks = useTodoHooks();
    const todoList = useSelector<RootState,TodoInterface[]>(state=>state.todoSlice.todoList);
    const todoLoading = useSelector<RootState,boolean>(state=>state.todoSlice.todoLoading);
    const id = location.pathname.split('/')[2];
    const detailedTodo:TodoInterface | undefined = todoList.find((todoitem)=> todoitem._id === id);
    // Close menu if click is on backdrop
    const backdropRef = useRef<HTMLDivElement>(null);
    const backdropClickHandler = (event:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if(event.target === backdropRef.current) {
            navigate("/todo");
        }   
    }
    const todoTime = detailedTodo?.targetTime? detailedTodo?.targetTime.split(':') : null;
    const [todoInputs,setTodoInputs] = useState({
        todoTitle:detailedTodo?.title || '',
        todoDescription:detailedTodo?.description || '',
        selectedDate:detailedTodo?.targetDate ? new Date(detailedTodo.targetDate) : null,
        selectedTime:todoTime ? new Date(new Date().setHours(Number(todoTime[0]),Number(todoTime[1]))) : null,
        creationUTCOffset:detailedTodo?.creationUTCOffset || new Date().getTimezoneOffset(),
        alarmUsed: detailedTodo?.alarmUsed || false
    })
    const todoInputsHandler = (newValue:string,input:string) => {
        setTodoInputs((prevState)=>({
            ...prevState,
            [input]:newValue
        }));
    }
    const alarmSwitchHandler = () => {
        setTodoInputs((prevState)=>({
            ...prevState,
            alarmUsed:!prevState.alarmUsed
        }));
    }
    const datePick = (newDate: Date | null) => {
        setTodoInputs((prevState)=>({
            ...prevState,
            selectedDate:newDate,
        }));
    }
    const timePick = (newTime: Date | null) => {
        setTodoInputs((prevState)=>({
            ...prevState,
            selectedTime:newTime,
        }));
    }
    const todoArchiveDeleteHandler = (todo:TodoInterface,action:string) => {
        if(action === "archive") {
            todoHooks.toggleTodoArchiveStatus(todo);
        } else {
            todoHooks.deleteToDo(todo);
        }
        navigate("/todo");
    }
    // Submit or update Todo 
    const updateTodo = async (event:React.FormEvent) => {
        event.preventDefault();
        const newTodo:TodoInterface = {
            title:todoInputs.todoTitle,
            description:todoInputs.todoDescription,
            creationDate:detailedTodo?.creationDate || new Date().toISOString(),
            targetDate:todoInputs.selectedDate ? todoInputs.selectedDate.toISOString() : null,
            targetTime:todoInputs.selectedDate ? (todoInputs.selectedTime ? new Date(new Date(todoInputs.selectedTime).setSeconds(0)).toLocaleTimeString("en-GB") : null) : null,
            status:detailedTodo?.status || 'Pending',
            dateCompleted:detailedTodo?.dateCompleted || null,
            isArchived:detailedTodo?.isArchived || false,
            creationUTCOffset: todoInputs.creationUTCOffset,
            alarmUsed: todoInputs.alarmUsed,
            _id: detailedTodo?._id || "",
        }
        detailedTodo ? todoHooks.updateTodo(newTodo,detailedTodo) : todoHooks.addTodo(newTodo);
        navigate("/todo");
    }
    // Set todo state from store value
    useEffect(()=>{
        if (detailedTodo) {
            const {title,description,targetDate,targetTime,creationUTCOffset,alarmUsed} = detailedTodo
            setTodoInputs((prevState)=>({
                todoTitle:title || '',
                todoDescription:description || '',
                selectedDate:targetDate ? new Date(targetDate) : null,
                selectedTime:targetTime ? new Date(new Date().setHours(Number(targetTime.split(":")[0]),Number(targetTime.split(":")[1]))) : null,
                creationUTCOffset:creationUTCOffset || new Date().getTimezoneOffset(),
                alarmUsed: alarmUsed || false
            }));
        }
    },[detailedTodo])
    return(
        <Box className={`backdrop opacity-transition`} ref={backdropRef} onClick={(event)=>backdropClickHandler(event)}>
            {todoLoading ? <Loading height='80vh'/>:
            <Card component="form" className={`add-new-todo-form scale-in`} onSubmit={updateTodo}>
                <Box className={`add-new-todo-controls`}>
                    {detailedTodo ?
                        <Box className='archive-todo-wrapper'>
                            <Button className='archive-todo-button' variant='outlined' onClick={()=>{todoArchiveDeleteHandler(detailedTodo,"archive")}}>
                                <BsArchive className={`icon-interactive archive-todo-icon`}/>
                                <Typography className={`archive-todo-text`}>Archive</Typography>
                            </Button>
                        </Box> : null
                    }
                    {detailedTodo ?
                        <Box className='delete-todo-wrapper'>
                            <Button className='delete-todo-button' variant='outlined' onClick={()=>{todoArchiveDeleteHandler(detailedTodo,"delete")}}>
                                <BsTrash className={`icon-interactive delete-todo-icon`}/>
                                <Typography className={`delete-todo-text`}>Delete</Typography>
                            </Button>
                        </Box> : null
                    }
                </Box>
                <Box className={`add-new-todo-dates`}>
                    <Box className='add-new-todo-datepicker-wrapper'>
                        <DatePicker 
                            className={`focus add-new-todo-datepicker`}
                            inputFormat="dd/MM/yyyy" label="Target Date" desktopModeMediaQuery='@media (min-width:769px)' 
                            renderInput={(props) => <TextField size='small' {...props} />}
                            value={todoInputs.selectedDate} onChange={(newDate:Date|null)=>{datePick(newDate);}}
                            closeOnSelect={true}
                            componentsProps={{
                                actionBar: {actions: ['today','clear'],},
                            }}
                        />
                    </Box>
                    {todoInputs.selectedDate ? 
                        <Box className='add-new-todo-timepicker-wrapper'>
                            <TimePicker 
                                className={`focus add-new-todo-timepicker`}
                                inputFormat="HH:mm" ampm={false} ampmInClock={false} label="Target Time" desktopModeMediaQuery='@media (min-width:769px)'
                                renderInput={(props) => <TextField size='small' {...props} />}
                                value={todoInputs.selectedTime} onChange={(newTime:Date|null)=>{timePick(newTime);}}
                                closeOnSelect={true}
                                componentsProps={{
                                    actionBar: {actions: ['clear'],},
                                }}
                            />
                        </Box> : null
                    }
                </Box>
                {(todoInputs.selectedDate && todoInputs.selectedTime) ? <FormGroup className='add-new-todo-alarm-switch'>
                    <FormControlLabel control={<Switch checked={todoInputs.alarmUsed} onChange={alarmSwitchHandler} />} label="Set todo alarm" />
                </FormGroup> : null}
                <TextField value={todoInputs.todoTitle} onChange={(event)=>{todoInputsHandler(event.target.value,'todoTitle')}} className={`add-new-todo-title focus input`} label='Title' multiline required />
                <TextField value={todoInputs.todoDescription} onChange={(event)=>{todoInputsHandler(event.target.value,'todoDescription')}} label="Description (Optional) " className={`add-new-todo-description focus`} multiline />
                <Box className={`add-new-todo-buttons`}>
                    <Button variant="outlined" className={`button`} onClick={()=>{navigate(-1)}}>Back</Button>
                    <Button variant="outlined" type='submit' className={`button`}>{detailedTodo?'Update':'Submit'}</Button>
                </Box>
            </Card>}
        </Box>
    )
}

export default AddNewTodo
