// Dependencies
import { useEffect } from "react";
import Cookies from "js-cookie";
import {useSelector,useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { authActions } from "../Store/Store";
import { RootState } from "../Store/Store";

const useAuthHooks = () => {
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
    // Sign In / Up
    const signInUp = async (email:string,password:string,isLogin:boolean,name?:string) => {
        dispatch(authActions.setLoading(true))
        try {
            const authData = await axios.request({
                method:'POST',
                url:`http://localhost:3001/users/${isLogin?'login':'signup'}`,
                data:{email,password,name,creationDate:new Date().toString()},
            })
            dispatch(authActions.login(authData.data))
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
    return {getUserData,signInUp}
}

export default useAuthHooks