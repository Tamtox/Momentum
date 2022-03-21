import {createSlice} from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialToken = Cookies.get('token');
const initialDarkMode = Cookies.get('darkMode')

interface AuthSchema {
    token:string|undefined,
    user:{
        email:string,
        name:string,
        emailConfirmationStatus:string,
    },
    loading:boolean,
    darkMode:boolean|undefined,
    sidebarFull:boolean,
    sidebarVisible:boolean
}

const initialAuthState:AuthSchema = {
    token:initialToken,
    user:{
        email:'',
        name:'',
        emailConfirmationStatus:'',
    },
    loading:false,
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
            state.user = {email:'',name:'',emailConfirmationStatus:''}
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
        setDarkMode(state) {
            state.darkMode = !state.darkMode
            Cookies.set('darkMode',`${state.darkMode}`,{sameSite:"Strict",secure:true,path:'/'});
        },
        toggleSidebarSize(state) {
            state.sidebarFull = !state.sidebarFull 
        },
        toggleSidebarVisibility(state,action) {
            state.sidebarVisible = action.payload || !state.sidebarVisible
        }
    }
})

export default authSlice