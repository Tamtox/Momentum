// Dependencies
import { useEffect } from "react";
import Cookies from "js-cookie";
import {useSelector,useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { authActions } from "../Store/Store";
import { RootState } from "../Store/Store";

const useLoadData = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const userData = useSelector<RootState,{email:string,name:string,emailConfirmationStatus:string,}>(state=>state.authSlice.user);
    // Load user data
    const getUserData = async () => {
        dispatch(authActions.setLoading(true))
        try {
            const userDataResponse = await axios.request({
                method:'GET',
                url:`http://localhost:3001/users/getUserData`,
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(authActions.setUsetData(userDataResponse.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))
    }
    useEffect(() => {
        if (token) {
            !userData.email && getUserData();
        } else { 
            dispatch(authActions.logout())
        }
    }, [])
}

export default useLoadData