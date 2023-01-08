import {createSlice} from '@reduxjs/toolkit';
import type { UserInterface } from '../Misc/Interfaces';
import Cookies from 'js-cookie';
import { ActionTypes } from '@mui/base';

const initialToken = Cookies.get('token');
const initialDarkMode = Cookies.get('darkMode')

interface AuthSchema {
    token:string|undefined,
    user:UserInterface,
    loading:boolean,
    authLoading:boolean,
    darkMode:boolean,
    sidebarFull:boolean,
    sidebarVisible:boolean
}

const initialAuthState:AuthSchema = {
    token:initialToken,
    user:{
        name:'',
        email:'',
        password:'',
        creationDate:'', 
        lastLogin:'',
        lastOnline:'',
        utcOffset:0,
        emailConfirmationStatus:'',
        verificationCode:''
    },
    loading:false,
    authLoading:false,
    darkMode:initialDarkMode === undefined?false:initialDarkMode === "true"?true:false,
    sidebarFull:true,
    sidebarVisible:true
} 
const authSlice = createSlice({
    name:'auth',
    initialState:initialAuthState,
    reducers:{
        login(state,action) {
            state.token = action.payload.token;
            state.user.email = action.payload.email;
            state.user.name = action.payload.name;
            state.user.emailConfirmationStatus = action.payload.emailConfirmationStatus;
            Cookies.set('token',action.payload.token,{expires:7,sameSite:"Strict",secure:true,path:'/'});
        },
        logout(state) {
            state.token = undefined;
            state.user = {
                name:'',
                email:'',
                password:'',
                creationDate:'', 
                lastLogin:'',
                lastOnline:'',
                utcOffset:0,
                emailConfirmationStatus:'',
                verificationCode:''
            }
            Cookies.remove('token');
            Cookies.remove('darkMode');
        },
        setUsetData(state,action) {
            state.user.email = action.payload.email;
            state.user.name = action.payload.name;
            state.user.emailConfirmationStatus = action.payload.emailConfirmationStatus;
        },
        verifyAccount(state,action) {
            state.user.emailConfirmationStatus = action.payload;
        },
        setLoading(state,action) {
            state.loading = action.payload
        },
        setAuthLoading(state,action) {
            state.authLoading = action.payload
        },
        setDarkMode(state) {
            state.darkMode = !state.darkMode
            Cookies.set('darkMode',`${state.darkMode}`,{sameSite:"Strict",secure:true,path:'/'});
        },
        toggleSidebarSize(state,action) {
            state.sidebarFull = action.payload 
        },
        toggleSidebarVisibility(state,action) {
            state.sidebarVisible = action.payload
        }
    }
})

export default authSlice