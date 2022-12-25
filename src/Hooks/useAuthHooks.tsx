// Dependencies
import Cookies from "js-cookie";
import {useDispatch} from 'react-redux';
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Components
import { authActions,todoActions,journalActions,habitsActions,goalActions,scheduleActions } from "../Store/Store";
import useTodoHooks from "./useTodoHooks";
import useHabitHooks from "./useHabitHooks";
import useGoalHooks from "./userGoalHooks";
import useJournalHooks from "./useJournalHooks";

const httpAddress = `http://localhost:3001`;

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
                url:`${httpAddress}/users/getUserData`,
                headers:{Authorization: `Bearer ${newToken || token}`}
            })
            dispatch(authActions.setUsetData(userDataResponse.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        } finally {
            dispatch(authActions.setLoading(false));
        }
    }
    // Sign In / Up
    const signInUp = async (email:string,password:string,isLogin:boolean,name?:string) => {
        dispatch(authActions.setLoading(true))
        let newToken:string = '';
        let message
        try {
            const authResponse = await axios.request({
                method:'POST',
                url:`${httpAddress}/users/${isLogin?'login':'signup'}`,
                data:{email,password,name,creationDate:new Date().toString()},
            })
            dispatch(authActions.login(authResponse.data));
            message = authResponse.data.message
            newToken = authResponse.data.token
        } catch (error) {
            axios.isAxiosError(error) ? message = error.response?.data || error.message : console.log(error) ;
        } finally {
            dispatch(authActions.setLoading(false));
        }
        if(isLogin && newToken) {
            todoHooks.loadTodoData(newToken);
            goalHooks.loadGoalData(newToken);
            habitHooks.loadHabitsData(new Date(),newToken);
            journalHooks.loadJournalData(new Date(),newToken);
            getUserData(newToken);
        }
        return message
    }
    // Logout
    const logout = async () => {
        dispatch(authActions.setLoading(true))
        dispatch(todoActions.clearToDoList());
        dispatch(journalActions.clearEntry());
        dispatch(habitsActions.clearHabitData());
        dispatch(goalActions.clearGoalData());
        dispatch(scheduleActions.clearScheduleList());
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
                url:`${httpAddress}/users/verify`,
                data:{verificationCode},
                headers:{Authorization: `Bearer ${token}`}
            })
            message = verificationResponse.data.message
            dispatch(authActions.verifyAccount('Complete'));
        } catch (error) {
            axios.isAxiosError(error) ? message = error.response?.data || error.message : console.log(error) ;
        } finally {
            dispatch(authActions.setLoading(false));
        }
        return message
    }
    // Change password
    const changePassword = async (currentPass:string,newPass:string) => {
        dispatch(authActions.setLoading(true))
        let message 
        try {
            const passChangeResponse = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/users/changePassword`,
                headers:{Authorization: `Bearer ${token}`},
                data:{currentPass,newPass}
            })
            dispatch(authActions.login(passChangeResponse.data))
            message = passChangeResponse.data.message
        } catch (error) {
            axios.isAxiosError(error) ? message = error.response?.data || error.message : console.log(error) ;
        } finally {
            dispatch(authActions.setLoading(false));
        }
        return message
    }
    // Reset password
    const resetPassword = async (email:string) => {
        dispatch(authActions.setLoading(true))
        let message
        try {
            const passChangeResponse = await axios.request({
                method:'PATCH',
                url:`${httpAddress}/users/resetPassword`,
                headers:{Authorization: `Bearer ${token}`},
                data:{email}
            })
            message = passChangeResponse.data.message;
        } catch (error) {
            axios.isAxiosError(error) ? message = error.response?.data || error.message : console.log(error) ;
        } finally {
            dispatch(authActions.setLoading(false));
        }
        return message
    }
    // Send verification letter
    const sendVerificationLetter = async (email:string) => {
        dispatch(authActions.setLoading(true))
        let message
        try {
            const sendVerificationResponse = await axios.request({
                method:'POST',
                url:`${httpAddress}/users/sendVerificationLetter`,
                headers:{Authorization: `Bearer ${token}`},
                data:{email}
            })
            message = sendVerificationResponse.data.message
        } catch (error) {
            axios.isAxiosError(error) ? message = error.response?.data || error.message : console.log(error) ;
        } finally {
            dispatch(authActions.setLoading(false));
        }
        return message
    }
    // Delete account
    const deleteAccount = async (password:string) => {
        dispatch(authActions.setLoading(true))
        let message
        try {
            const accountDeleteResponse = await axios.request({
                method:'DELETE',
                url:`${httpAddress}/users/delete`,
                headers:{Authorization: `Bearer ${token}`},
                data:{password}
            })
            message = accountDeleteResponse.data.message;
            dispatch(authActions.logout());
            logout();
        } catch (error) {
            axios.isAxiosError(error) ? message = error.response?.data || error.message : console.log(error) ;
        } finally {
            dispatch(authActions.setLoading(false));
        }
        return message
    }
    return {getUserData,signInUp,logout,verifyAccount,changePassword,resetPassword,sendVerificationLetter,deleteAccount}
}

export default useAuthHooks