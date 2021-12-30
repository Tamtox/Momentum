import {createSlice} from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialToken = Cookies.get('token');
const initialUserId = Cookies.get('userId');
const initialDarkMode = Cookies.get('darkMode')

interface AuthSchema {
    token:string|undefined,
    userId:string|undefined,
    user:{
        email:string|null
    },
    loading:boolean,
    darkMode:boolean|undefined
}

const initialAuthState:AuthSchema = {
    token:initialToken,
    userId:initialUserId,
    user:{
        email:null
    },
    loading:false,
    darkMode:initialDarkMode === undefined?false:initialDarkMode === "true"?true:false
} 
const authSlice = createSlice({
    name:'auth',
    initialState:initialAuthState,
    reducers:{
        login(state,action) {
            state.token = action.payload.token;
            state.userId = action.payload.userId
            Cookies.set('token',action.payload.token,{expires:7,sameSite:"Strict",secure:true,path:'/'});
            Cookies.set('userId',action.payload.userId,{expires:7,sameSite:"Strict",secure:true,path:'/'});
        },
        logout(state) {
            state.token = undefined;
            state.userId = undefined;
            state.user = {email:null}
            Cookies.remove('token');
            Cookies.remove('userId');
            Cookies.remove('darkMode');
        },
        setLoading(state,action) {
            state.loading = action.payload
        },
        setDarkMode(state) {
            state.darkMode = !state.darkMode
            Cookies.set('darkMode',`${state.darkMode}`,{sameSite:"Strict",secure:true,path:'/'});
        },
    }
})

export default authSlice