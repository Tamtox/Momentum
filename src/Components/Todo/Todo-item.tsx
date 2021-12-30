// Styles
import './Todo-item.scss';
// Components
import { todoActions,RootState } from '../../Store/Store';
//Dependencies
import {useDispatch,useSelector} from 'react-redux';
import React from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Icon } from '@iconify/react';



const TodoItem:React.FC<{title:string,description:string,creationDate:string,targetDate:string,status:string,_id:string}> = (props) => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode)
    // Toggle Todo status
    const changeTodoStatus = async () => {
        try {
            await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/todo/updateTodo`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id:props._id,status:props.status==="Pending"?"Complete":"Pending"}
            })
            dispatch(todoActions.changeToDoStatus(props._id))
        } catch (error) {
            if (axios.isAxiosError(error)) {
                error.response !== undefined?alert(error.response!.data):alert(error.message)
            } else {
                console.log(error);
            }
        }   
    }
    // Delete Todo
    const deleteToDo = async () => {
        try {
            await axios.request({
                method:'DELETE',
                url:`http://localhost:3001/todo/deleteTodo`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id:props._id}
            })
            dispatch(todoActions.deleteToDo(props._id))
        } catch (error) {
            if (axios.isAxiosError(error)) {
                error.response !== undefined?alert(error.response!.data):alert(error.message)
            } else {
                console.log(error);
            }
        }   
    }
    return (
        <div className={`todo-item box-shadow${isDarkMode?'-dark':''} item${isDarkMode?'-dark':''} scale-in`}>
            <h2 className={`todo-item-title ${isDarkMode&&'color-white'}`}>{props.title}</h2>
            <div className='todo-item-icons'>
                <Icon onClick={changeTodoStatus} className={`change-todo-status-icon hover-filter${isDarkMode?'-dark':''} ${props.status}`} icon={props.status === 'Pending'?"akar-icons:circle":"akar-icons:circle-check"} />
                <Link to={`/todo/${props._id}`} className='link-detailed-todo'><Icon className={`detailed-todo-icon hover-filter${isDarkMode?'-dark':''}`} icon="feather:edit" /></Link>
                <Icon onClick={deleteToDo} className={`delete-todo-icon hover-filter${isDarkMode?'-dark':''}`} icon="clarity:remove-line" />
            </div>
        </div>
    )
}

export default TodoItem