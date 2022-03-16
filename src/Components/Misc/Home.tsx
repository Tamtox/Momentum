//Styles
import './Home.scss';
//Dependencies
import React,{useRef} from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Container,Box,Typography,TextField,Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {useSelector,useDispatch} from 'react-redux';
//Components
import { authActions } from '../../Store/Store';
import type {RootState} from '../../Store/Store';


const Home:React.FC = () => {
    const token = Cookies.get('token');
    const dispatch = useDispatch();
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const verificationRef = useRef<HTMLInputElement>(null);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const userData = useSelector<RootState,{email:string,name:string,emailConfirmationStatus:string,}>(state=>state.authSlice.user);
    const verifyAccount = async (event:React.FormEvent) => {
        event.preventDefault();
        const verificationCode = verificationRef.current?.value;
        dispatch(authActions.setLoading(true))
        try {
            const verificationResponse= await axios.request({
                method:'POST',
                url:`http://localhost:3001/users/verify`,
                data:{verificationCode},
                headers:{Authorization: `Bearer ${token}`}
            })
            console.log(verificationResponse)
            dispatch(authActions.verifyAccount('Complete'));
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))
    }
    return(
        <Container component="main" className={`home ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            {userData.emailConfirmationStatus === 'Pending' && 
            <Box className={`verification-form`} component="form" onSubmit={verifyAccount} noValidate >
                <Typography className='verification-label'>{`Verification code was sent to ${userData.email}. Use it to verify your account. `}</Typography>
                <TextField className={`verification-input scale-in`} inputRef={verificationRef} required fullWidth label="Verification Code" type="text" />
                {loading?<LoadingButton className={`button verification-button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button verification-button`}>Send</Button>}
            </Box>}
        </Container>
    )
}

export default Home
