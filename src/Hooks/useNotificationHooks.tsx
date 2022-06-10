// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import axios from "axios";

const httpAddress = `http://localhost:3001`;

const useNotificationHooks = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const loadNotifications = async (date:string) => {
        try {
            const newTodoResponse = await axios.request({
                method:'POST',
                url:`${httpAddress}/notification/loadNot`,
                data:{selectedDate:Date},
                headers:{Authorization: `Bearer ${token}`}
            })
            // dispatch();
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    return {loadNotifications}
}