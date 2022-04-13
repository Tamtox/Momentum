// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Components
import { authActions,todoActions,journalActions,habitsActions,goalActions } from "../Store/Store";
import useTodoHooks from "./useTodoHooks";
import useHabitHooks from "./useHabitHooks";
import useGoalHooks from "./userGoalHooks";
import useJournalHooks from "./useJournalHooks";

const useAuthHooks = () => {
    const token = Cookies.get('token');
    const navigate = useNavigate();
    const todoHooks = useTodoHooks();
    const goalHooks = useGoalHooks();
    const habitHooks = useHabitHooks();
    const journalHooks = useJournalHooks();
    const dispatch = useDispatch();
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
        let message
        try {
            const authResponse:{data:{token:string}} = await axios.request({
                method:'POST',
                url:`http://localhost:3001/users/${isLogin?'login':'signup'}`,
                data:{email,password,name,creationDate:new Date().toString()},
            })
            dispatch(authActions.login(authResponse.data))
            newToken = authResponse.data.token
        } catch (error) {
            if(axios.isAxiosError(error)) {
                message = error.response?.data || error.message
            } else { 
                console.log(error) ;
            }
        }
        if(isLogin && newToken) {
            todoHooks.loadTodoData(newToken);
            goalHooks.loadGoalData(newToken);
            habitHooks.loadHabitsData(new Date(),newToken);
            journalHooks.loadJournalData(new Date().toString(),newToken);
            getUserData(newToken);
        }
        dispatch(authActions.setLoading(false))
        return message
    }
    // Logout
    const logout = async() => {
        dispatch(authActions.setLoading(true))
        dispatch(todoActions.clearToDoList());
        dispatch(journalActions.clearEntry());
        dispatch(habitsActions.clearHabitData());
        dispatch(goalActions.clearGoalData());
        dispatch(authActions.logout());
        navigate('/auth');
        dispatch(authActions.setLoading(false))
    }
    // Verify account
    const verifyAccount = async (verificationCode:string) => {
        dispatch(authActions.setLoading(true))
        let message
        try {
            const verificationResponse = await axios.request({
                method:'POST',
                url:`http://localhost:3001/users/verify`,
                data:{verificationCode},
                headers:{Authorization: `Bearer ${token}`}
            })
            message = verificationResponse.data.message
            dispatch(authActions.verifyAccount('Complete'));
        } catch (error) {
            if(axios.isAxiosError(error)) {
                message = error.response?.data || error.message
            } else { 
                console.log(error) ;
            }
        }
        dispatch(authActions.setLoading(false))
        return message
    }
    // Change password
    const changePassword = async (currentPass:string,newPass:string) => {
        dispatch(authActions.setLoading(true))
        let message 
        try {
            const passChangeResponse = await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/users/changePassword`,
                headers:{Authorization: `Bearer ${token}`},
                data:{currentPass,newPass}
            })
            dispatch(authActions.login(passChangeResponse.data))
            message = passChangeResponse.data.message
        } catch (error) {
            if(axios.isAxiosError(error)) {
                message = error.response?.data || error.message
            } else { 
                console.log(error) ;
            }
        }
        dispatch(authActions.setLoading(false))
        return message
    }
    // Reset password
    const resetPassword = async (email:string) => {
        dispatch(authActions.setLoading(true))
        let message
        try {
            const passChangeResponse = await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/users/resetPassword`,
                headers:{Authorization: `Bearer ${token}`},
                data:{email}
            })
            message = passChangeResponse.data.message;
        } catch (error) {
            if(axios.isAxiosError(error)) {
                message = error.response?.data || error.message
            } else { 
                console.log(error) ;
            }
        }
        dispatch(authActions.setLoading(false));
        return message
    }
    // Send verification letter
    const sendVerificationLetter = async (email:string) => {
        dispatch(authActions.setLoading(true))
        let message
        try {
            const sendVerificationResponse = await axios.request({
                method:'POST',
                url:`http://localhost:3001/users/sendVerificationLetter`,
                headers:{Authorization: `Bearer ${token}`},
                data:{email}
            })
            message = sendVerificationResponse.data.message
        } catch (error) {
            if(axios.isAxiosError(error)) {
                message = error.response?.data || error.message
            } else { 
                console.log(error) ;
            }
        }
        dispatch(authActions.setLoading(false))
        return message
    }
    // Delete account
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
        logout()
        dispatch(authActions.setLoading(false))
    }
    return {getUserData,signInUp,logout,verifyAccount,changePassword,resetPassword,sendVerificationLetter,deleteAccount}
}

export default useAuthHooks