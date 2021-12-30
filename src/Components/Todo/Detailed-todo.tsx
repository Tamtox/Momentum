// Styles
import './Detailed-todo.scss';
// Components
import type {RootState} from '../../Store/Store';
//Dependencies
import {useSelector,useDispatch} from 'react-redux';
import React,{ useRef,useState} from 'react';
import {useNavigate,useParams} from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";
import { todoActions } from '../../Store/Store';

const DetailedTodo:React.FC = () => {
    const params = useParams();
    const navigate = useNavigate();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode)
    const filteredTodoList = useSelector<RootState,{title:string,description:string,creationDate:string,targetDate:string,status:string,_id:string}[]>(state=>state.todoSlice.todoList).filter(item=>item._id === params.id);
    const detailedItem = filteredTodoList[0] === undefined? {title:"",description:"",creationDate:new Date().toString(),targetDate:new Date().toString(),status:"Pending",_id:""}:filteredTodoList[0];
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const [titleRef,descriptionRef] = [useRef<HTMLInputElement>(null),useRef<HTMLTextAreaElement>(null)];
    // Date Pick 
    const [datePickerUsed,setDatePickerUsed] = useState(false);
    const [selectedDate, setSelectedDate] = useState(detailedItem.targetDate === ""? new Date() : new Date(detailedItem.targetDate));
    function datePick(date:Date) {
        setSelectedDate(date);
        setDatePickerUsed(true);
    }
    // Edit Todo 
    async function editTodo(event:React.FormEvent) {
        event.preventDefault();
        const [titleInput,descriptionInput] = [titleRef.current!.value,descriptionRef.current!.value];
        const editedTodo : {title:string,description:string,creationDate:string,targetDate:string,status:string,_id:string|undefined} = {
            title:titleInput,
            description:descriptionInput,
            creationDate:detailedItem.creationDate,
            targetDate:datePickerUsed?selectedDate.toString():detailedItem.targetDate===""?"":detailedItem.targetDate,
            status:detailedItem.status,
            _id:params.id
        }
        try {
            await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/todo`,
                data:editedTodo,
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(todoActions.editToDo(editedTodo))
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.message)
            } else {
                console.log(error);
            }
        }   
        // Return to todo page after submission
        navigate('/todo');
    }
    return (
        <React.Fragment>
            <section className='detailed-todo'>
                <form action="" className={`detailed-todo-form scale-in item${isDarkMode?'-dark':''} box-shadow${isDarkMode?'-dark':''} border-radius`} onSubmit={editTodo} >
                    <Flatpickr
                        className={`hover${isDarkMode?'-dark':''} date-picker${isDarkMode?'-dark':''} detailed-date-picker`}
                        options={{dateFormat:'d-m-Y  H:i',enableTime:true,time_24hr:true,disableMobile:true}}
                        value={selectedDate}
                        onChange={date => {datePick(date[0]);}}
                    />
                    <input ref={titleRef} type="text" className={`detailed-title focus border-radius input${isDarkMode?'-dark':''}`} placeholder='Title' defaultValue={detailedItem.title} required />
                    <textarea ref={descriptionRef}  placeholder="Description(optional)" className={`detailed-description focus border-radius input${isDarkMode?'-dark':''}`} cols={1} rows={1} defaultValue={detailedItem.description}></textarea>
                    <div className={`detailed-buttons`}>
                        <button className={`hover${isDarkMode?'-dark':''} button${isDarkMode?'-dark':''}`} onClick={()=>{navigate('/todo');}}>Back</button>
                        <button className={`hover${isDarkMode?'-dark':''} button${isDarkMode?'-dark':''}`}>Save</button>
                    </div>
                    <p className={`detailed-creation-date ${isDarkMode&&'color-white'}`}>{`Created: ${new Date(detailedItem.creationDate).toUTCString()}`}</p>
                </form>
            </section>
        </React.Fragment>
    )
}

export default DetailedTodo