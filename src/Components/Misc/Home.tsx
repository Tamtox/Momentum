//Styles
import './Home.scss';
//Dependencies
import React,{useRef} from "react";
import { Container,Box,Typography,TextField,Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {useSelector} from 'react-redux';
//Components
import type {RootState} from '../../Store/Store';
import Loading from './Loading';
import useAuthHooks from '../../Hooks/useAuthHooks';


const Home:React.FC = () => {
    const authHooks = useAuthHooks();
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const verificationRef = useRef<HTMLInputElement>(null);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const userData = useSelector<RootState,{email:string,name:string,emailConfirmationStatus:string,}>(state=>state.authSlice.user);
    const verifyAccountHandler = async (event:React.FormEvent) => {
        event.preventDefault();
        const verificationCode = verificationRef.current!.value;
        authHooks.verifyAccount(verificationCode)
    }
    return(
        <Container component="main" className={`home ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            {loading ? <Loading height='100%'/> :
            <>
                Home
                {userData.emailConfirmationStatus === 'Pending' && 
                <Box className={`verification-form`} component="form" onSubmit={verifyAccountHandler} >
                    <Typography className='verification-label'>{`Verification code was sent to ${userData.email}. Use it to verify your account. `}</Typography>
                    <TextField className={`verification-input scale-in`} inputRef={verificationRef} required fullWidth label="Verification Code" type="text" />
                    {loading?<LoadingButton className={`button verification-button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button verification-button`}>Send</Button>}
                </Box>} 
            </>}
        </Container>
    )
}

export default Home
