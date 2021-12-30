// Styles
import './Add-new-todo.scss';
// Components
import { todoActions,RootState } from '../../Store/Store';
//Dependencies
import {useDispatch,useSelector} from 'react-redux';
import React,{useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";

const AddNewTodo:React.FC = () => {
    const token = Cookies.get('token');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode)
    const [newTodoTitileRef,newTodoDescriptionRef] = [useRef<HTMLInputElement>(null),useRef<HTMLTextAreaElement>(null)];
    // Date Pick 
    const [datePickerUsed,setDatePickerUsed] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    function datePick(date:Date) {
        setSelectedDate(date);
        setDatePickerUsed(true)
    }
    // Submit New Todo
    const submitNewTodo = async (event:React.FormEvent) => {
        event.preventDefault();
        const [newTodoTitle,newTodoDescription] = [newTodoTitileRef.current!.value,newTodoDescriptionRef.current!.value];
        const newTodo:{title:string,description:string,creationDate:string,targetDate:string,status:string} = {
            title:newTodoTitle,
            description:newTodoDescription,
            creationDate:new Date().toString(),
            targetDate:datePickerUsed?selectedDate.toString():"",
            status:'Pending'
        }
        try {
            const newTodoItem = await axios.request({
                method:'POST',
                url:`http://localhost:3001/todo/addNewTodo`,
                data:newTodo,
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(todoActions.addToDo(newTodoItem.data))
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.message)
            } else {
                console.log(error);
            }
        }
        navigate('/todo');
    }
    return(
        <section className="add-new-todo">
            <div className={`scale-in add-new-todo-card item${isDarkMode?'-dark':''} border-radius box-shadow${isDarkMode?'-dark':''}`}>
                <form  className="add-new-todo-form" onSubmit={submitNewTodo}>
                    <Flatpickr
                        className={`hover${isDarkMode?'-dark':''} date-picker${isDarkMode?'-dark':''} add-new-todo-date`}
                        options={{ minDate:new Date(),dateFormat:'d-m-Y  H:i',enableTime:true,time_24hr:true,disableMobile:true }}
                        value={selectedDate}
                        onChange={date => {datePick(date[0]);}}
                    />
                    <input ref={newTodoTitileRef} type="text" className={`add-new-todo-title focus input${isDarkMode?'-dark':''}`} placeholder='Title' required />
                    <textarea ref={newTodoDescriptionRef} placeholder="Description(optional)" className={`add-new-todo-description focus input${isDarkMode?'-dark':''}`} cols={1} rows={1}></textarea>
                    <div className={`add-new-todo-buttons`}>
                        <button className={`hover${isDarkMode?'-dark':''} button${isDarkMode?'-dark':''}`} onClick={()=>{navigate('/todo');}}>Back</button>
                        <button className={`hover${isDarkMode?'-dark':''} button${isDarkMode?'-dark':''}`}>Submit</button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default AddNewTodo