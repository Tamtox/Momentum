// Dependencies
import { useEffect } from "react";
import Cookies from "js-cookie";
import {useSelector,useDispatch} from 'react-redux';
import axios from "axios";
// Components
import { authActions } from "../Store/Store";
import { RootState } from "../Store/Store";
import useTodoHooks from "./useTodoHooks";
import useHabitHooks from "./useHabitHooks";
import useGoalHooks from "./userGoalHooks";

const useAuthHooks = () => {
    const token = Cookies.get('token');
    const todoHooks = useTodoHooks();
    const goalHooks = useGoalHooks();
    const habitHooks = useHabitHooks();
    const dispatch = useDispatch();
    const userData = useSelector<RootState,{email:string,name:string,emailConfirmationStatus:string,}>(state=>state.authSlice.user);
    // Load user data
    const getUserData = async (newToken?:string) => {
        dispatch(authActions.setLoading(true))
        try {
            const userDataResponse = await axios.request({
                method:'GET',
                url:`http://localhost:3001/users/getUserData`,
                headers:{Authorization: `Bearer ${newToken || token}`}
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
        let newToken:string = '';
        try {
            const authResponse:{data:{token:string}} = await axios.request({
                method:'POST',
                url:`http://localhost:3001/users/${isLogin?'login':'signup'}`,
                data:{email,password,name,creationDate:new Date().toString()},
            })
            dispatch(authActions.login(authResponse.data))
            newToken = authResponse.data.token
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        if(isLogin && newToken) {
            todoHooks.loadTodoData(newToken);
            goalHooks.loadGoalData(newToken);
            habitHooks.loadHabitsData(new Date(),newToken);
            getUserData(newToken);
        }
        dispatch(authActions.setLoading(false))
    }
    const changePassword = async (currentPass:string,newPass:string) => {
        dispatch(authActions.setLoading(true))
        try {
            const passChangeResponse = await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/users/changePassword`,
                headers:{Authorization: `Bearer ${token}`},
                data:{currentPass,newPass}
            })
            dispatch(authActions.login(passChangeResponse.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))
    }
    const sendVerificationLetter = async (email:string) => {
        dispatch(authActions.setLoading(true))
        try {
            await axios.request({
                method:'POST',
                url:`http://localhost:3001/users/sendVerificationLetter`,
                headers:{Authorization: `Bearer ${token}`},
                data:{email}
            })
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))
    }
    const deleteAccount = async () => {
        dispatch(authActions.setLoading(true))
        try {
            await axios.request({
                method:'DELETE',
                url:`http://localhost:3001/users/delete`,
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(authActions.logout())
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
    return {getUserData,signInUp,changePassword,sendVerificationLetter,deleteAccount}
}

export default useAuthHooks