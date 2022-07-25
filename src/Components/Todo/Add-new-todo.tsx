// Styles
import './Add-new-todo.scss';
// Components
import useTodoHooks from '../../Hooks/useTodoHooks';
import type {TodoInterface} from '../../Misc/Interfaces';
//Dependencies
import React,{useState,useRef} from 'react';
import { TextField,Button,Card,Tooltip,FormControlLabel,FormGroup,Switch} from '@mui/material';
import { DateTimePicker } from '@mui/lab';
import {BsTrash,BsArchive} from 'react-icons/bs';

const AddNewTodo:React.FC<{detailedTodo:TodoInterface|undefined,toggleNewTodo:boolean,setDetailedItem:()=>{},returnToTodo:()=>{}}> = (props) => {
    const todoHooks = useTodoHooks();
    console.log(props.detailedTodo);
    // Close menu if click is on backdrop
    const backdropRef = useRef<HTMLDivElement>(null);
    const backdropClickHandler = (event:any) => {
        if(event.target === backdropRef.current) {
            props.setDetailedItem();
            props.returnToTodo();
        }   
    }
    const [todoInputs,setTodoInputs] = useState({
        todoTitle:props.detailedTodo?.title || '',
        todoDescription:props.detailedTodo?.description || '',
        datePickerUsed:false,
        selectedDate:new Date(props.detailedTodo?.targetDate || new Date()),
        creationUTCOffset:props.detailedTodo?.creationUTCOffset || new Date().getTimezoneOffset(),
        alarmUsed: props.detailedTodo?.alarmUsed || false
    })
    const todoInputsHandler = (e:any,input:string) => {
        setTodoInputs((prevState)=>({
            ...prevState,
            [input]:e.target.value
        }));
    }
    const alarmSwitchHandler = () => {
        setTodoInputs((prevState)=>({
            ...prevState,
            alarmUsed:!prevState.alarmUsed
        }));
    }
    const datePick = (newDate: Date | null) => {
        const newDateFixed = new Date(newDate || new Date())
        setTodoInputs((prevState)=>({
            ...prevState,
            selectedDate:newDateFixed,
            datePickerUsed:true
        }));
    }
     // Submit or update Todo 
    const updateTodo = async (event:React.FormEvent) => {
        event.preventDefault();
        const newTodo:TodoInterface = {
            title:todoInputs.todoTitle,
            description:todoInputs.todoDescription,
            creationDate:props.detailedTodo?.creationDate || new Date().toISOString(),
            targetDate:todoInputs.datePickerUsed ? todoInputs.selectedDate.toISOString() : (props.detailedTodo?.targetDate || null),
            status:props.detailedTodo?.status || 'Pending',
            dateCompleted:props.detailedTodo?.dateCompleted || null,
            isArchived:props.detailedTodo?.isArchived || false,
            creationUTCOffset: todoInputs.creationUTCOffset,
            alarmUsed: todoInputs.alarmUsed,
            _id: props.detailedTodo?._id || "",
        }
        todoHooks.updateTodo(newTodo,!!props.detailedTodo);
        // Reset detailed item and return to todo list
        props.setDetailedItem();
        props.returnToTodo();
    }
    return(
        <div className={`backdrop opacity-transition`} ref={backdropRef} onClick={backdropClickHandler}>
            <Card component="form" className={`add-new-todo-form scale-in`} onSubmit={updateTodo}>
                <div className={`add-new-todo-controls`}>
                    {props.detailedTodo && <Tooltip title="Archive Item">
                        <div>
                            <BsArchive className={`icon-interactive archive-todo`} onClick={()=>{todoHooks.toggleTodoArchiveStatus(props.detailedTodo!);props.setDetailedItem();props.returnToTodo()}}/>
                        </div>
                    </Tooltip>}
                    <DateTimePicker 
                    inputFormat="dd/MM/yyyy HH:mm" label="Target Date/Time" ampm={false} ampmInClock={false} desktopModeMediaQuery='@media (min-width:769px)'
                    renderInput={(props:any) => <TextField size='small' className={`focus date-picker add-new-todo-date`}  {...props} />}
                    value={todoInputs.selectedDate} onChange={(newDate:Date|null)=>{datePick(newDate);}}
                    />
                    {props.detailedTodo && <Tooltip title="Delete Item">
                        <div>
                            <BsTrash className={`icon-interactive delete-todo`} onClick={()=>{todoHooks.deleteToDo(props.detailedTodo!._id);props.setDetailedItem();props.returnToTodo()}}/>
                        </div>
                    </Tooltip>}
                </div>
                {(todoInputs.datePickerUsed || props.detailedTodo) && <FormGroup className='add-new-todo-alarm-switch'>
                    <FormControlLabel control={<Switch checked={todoInputs.alarmUsed} onChange={alarmSwitchHandler} />} label="Set todo alarm" />
                </FormGroup>}
                <TextField value={todoInputs.todoTitle} onChange={(event)=>{todoInputsHandler(event,'todoTitle')}} className={`add-new-todo-title focus input`} label='Title' multiline required />
                <TextField value={todoInputs.todoDescription} onChange={(event)=>{todoInputsHandler(event,'todoDescription')}} label="Description (Optional) " className={`add-new-todo-description focus`} multiline />
                <div className={`add-new-todo-buttons`}>
                    <Button variant="outlined" className={`button`} onClick={()=>{props.setDetailedItem();props.returnToTodo()}}>Back</Button>
                    <Button variant="outlined" type='submit' className={`button`}>{props.detailedTodo?'Update':'Submit'}</Button>
                </div>
            </Card>
        </div>
    )
}

export default AddNewTodo