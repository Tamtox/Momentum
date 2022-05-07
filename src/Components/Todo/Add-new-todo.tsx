// Styles
import './Add-new-todo.scss';
// Components
import useTodoHooks from '../../Hooks/useTodoHooks';
import type {TodoInterface} from '../../Misc/Interfaces';
//Dependencies
import React,{useState} from 'react';
import { TextField,Button,Card,Tooltip} from '@mui/material';
import { DateTimePicker } from '@mui/lab';
import {BsTrash,BsArchive} from 'react-icons/bs';

const AddNewTodo:React.FC<{detailedTodo:TodoInterface|undefined,toggleNewTodo:boolean,setDetailedItem:()=>{},returnToTodo:()=>{}}> = (props) => {
    const todoHooks = useTodoHooks();
    const [todoInputs,setTodoInputs] = useState({
        todoTitle:props.detailedTodo?.todoTitle || '',
        todoDescription:props.detailedTodo?.todoDescription || '',
        datePickerUsed:false,
        selectedDate:new Date(props.detailedTodo?.todoTargetDate || new Date())
    })
    const todoInputsHandler = (e:any,input:string) => {
        setTodoInputs((prevState)=>({
            ...prevState,
            [input]:e.target.value
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
        const newTodo:{todoTitle:string,todoDescription:string,todoCreationDate:string,todoTargetDate:string|null,todoStatus:string,_id:string|undefined} = {
            todoTitle:todoInputs.todoTitle,
            todoDescription:todoInputs.todoDescription,
            todoCreationDate:props.detailedTodo?.todoCreationDate || new Date().toString(),
            todoTargetDate:todoInputs.datePickerUsed ? todoInputs.selectedDate.toString() : (props.detailedTodo?.todoTargetDate || null),
            todoStatus:props.detailedTodo?.todoStatus || 'Pending',
            _id: props.detailedTodo?._id || undefined
        }
        todoHooks.updateTodo(newTodo,!!props.detailedTodo)
        // Reset detailed item and return to todo list
        props.setDetailedItem();
        props.returnToTodo();
    }
    return(
        <div className={`backdrop opacity-transition`}>
            <Card component="form" className={`add-new-todo-form scale-in`} onSubmit={updateTodo}>
                <div className={`add-new-todo-controls`}>
                    {props.detailedTodo && <Tooltip title="Archive Item">
                        <div>
                            <BsArchive className={`icon-interactive archive-todo`} onClick={()=>{todoHooks.toggleTodoArchiveStatus(props.detailedTodo!);props.setDetailedItem();props.returnToTodo()}}/>
                        </div>
                    </Tooltip>}
                    <DateTimePicker 
                    inputFormat="dd/MM/yyyy HH:mm" label="Target Date" ampm={false} ampmInClock={false} desktopModeMediaQuery='@media (min-width:769px)'
                    renderInput={(props) => <TextField size='small' className={`focus date-picker add-new-todo-date`}  {...props} />}
                    value={todoInputs.selectedDate} onChange={newDate=>{datePick(newDate);}}
                    />
                    {props.detailedTodo && <Tooltip title="Delete Item">
                        <div>
                            <BsTrash className={`icon-interactive delete-todo`} onClick={()=>{todoHooks.deleteToDo(props.detailedTodo!._id);props.setDetailedItem();props.returnToTodo()}}/>
                        </div>
                    </Tooltip>}
                </div>
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