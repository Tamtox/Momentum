// Styles
import './Add-new-todo.scss';
// Components
import { todoActions,RootState } from '../../Store/Store';
//Dependencies
import {useDispatch,useSelector} from 'react-redux';
import React,{useRef,useState} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { TextField,Button,Box,Card} from '@mui/material';
import { DateTimePicker } from '@mui/lab';

const AddNewTodo:React.FC<{detailedItem:{todoTitle:string,todoDescription:string,todoCreationDate:string,todoTargetDate:string|null,todoStatus:string,_id:string}|undefined,setDetailedItem:()=>{},returnToTodo:()=>{}}> = (props) => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode)
    const [newTodoTitileRef,newTodoDescriptionRef] = [useRef<HTMLInputElement>(null),useRef<HTMLTextAreaElement>(null)];
    // Date Pick 
    const [datePickerUsed,setDatePickerUsed] = useState(false);
    const [selectedDate, setSelectedDate] = useState(props.detailedItem?.todoTargetDate ? new Date(props.detailedItem.todoTargetDate) : new Date());
    const datePick = (newDate: Date | null) => {
        if(!!!newDate) {
            newDate=new Date()
        }
        setSelectedDate(newDate);
        setDatePickerUsed(true)
    }
     // Submit or update Todo 
    const updateTodo = async (event:React.FormEvent) => {
        event.preventDefault();
        const [titleInput,descriptionInput] = [newTodoTitileRef.current!.value,newTodoDescriptionRef.current!.value];
        const newTodo:{todoTitle:string,todoDescription:string,todoCreationDate:string,todoTargetDate:string|null,todoStatus:string,_id:string|undefined} = {
            todoTitle:titleInput,
            todoDescription:descriptionInput,
            todoCreationDate:props.detailedItem?.todoCreationDate || new Date().toString(),
            todoTargetDate:datePickerUsed ? selectedDate.toString() : (props.detailedItem?.todoTargetDate || null),
            todoStatus:props.detailedItem?.todoStatus || 'Pending',
            _id: props.detailedItem?._id || undefined
        }
        try {
            const newTodoResponse = await axios.request({
                method:props.detailedItem ? 'PATCH' : 'POST',
                url:`http://localhost:3001/todo/${props.detailedItem ? 'updateTodo' : 'addNewTodo'}`,
                data:newTodo,
                headers:{Authorization: `Bearer ${token}`}
            })
            props.detailedItem ? dispatch(todoActions.updateToDo(newTodo)) : dispatch(todoActions.addToDo(newTodoResponse.data))
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.message)
            } else {
                console.log(error);
            }
        }   
        // Reset detailed item and return to todo list
        props.setDetailedItem();
        props.returnToTodo();
    }
    return(
        <Box className={`add-new-todo-backdrop backdrop${isDarkMode?'-dark':''} opacity-transition`}>
            <Card component="form" className={`add-new-todo-form scale-in`} onSubmit={updateTodo}>
                <DateTimePicker 
                inputFormat="DD/MM/YYYY HH:mm" label="Target Date" ampm={false} ampmInClock={false} desktopModeMediaQuery='@media (min-width:769px)'
                renderInput={(props) => <TextField size='small' className={`focus date-picker add-new-todo-date`}  {...props} />}
                value={selectedDate} onChange={newDate=>{datePick(newDate);}}
                />
                <TextField inputRef={newTodoTitileRef} className={`add-new-todo-title focus input`} label='Title' defaultValue={props.detailedItem?.todoTitle || ''} multiline required />
                <TextField inputRef={newTodoDescriptionRef} label="Description (Optional) " className={`add-new-todo-description focus`} defaultValue={props.detailedItem?.todoDescription || ''} multiline />
                <Box className={`add-new-todo-buttons`}>
                    <Button variant="outlined" className={`button`} onClick={()=>{props.setDetailedItem();props.returnToTodo()}}>Back</Button>
                    <Button variant="outlined" type='submit' className={`button`}>{props.detailedItem?'Update':'Submit'}</Button>
                </Box>
            </Card>
        </Box>
    )
}

export default AddNewTodo