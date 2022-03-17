//Styles
import './Auth.scss';
//Dependencies
import React,{ useRef,useState,} from 'react';
import {useSelector} from 'react-redux';
import useAuthHooks from '../../Hooks/useAuthHooks';
//Components
import { RootState} from '../../Store/Store';
import { Container,TextField,Button,Box,Typography} from '@mui/material';
import { LoadingButton } from '@mui/lab';

const Auth:React.FC = () => {
    const authHooks = useAuthHooks();
    // Toggle sign in/sign up
    const [login, setLogin] = useState(true);
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const [emailRef,userNameRef,passwordRef,repeatRef] = [useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null)];
    const authFormSubmit = async (event:React.FormEvent) => {
        event.preventDefault();
        // Check if necessary inputs are filled 
        const [emailInput,usernameInput,passwordInput] = [emailRef!.current!.value,userNameRef.current?.value,passwordRef!.current!.value];
        // Check if passwors match
        if(!login) {
            if(passwordInput !== repeatRef?.current?.value) {
                alert('Passwords do not match!')
                return
            }
        } 
        authHooks.signInUp(emailInput,passwordInput,login,usernameInput)
    }
    return (
        <Container component="main" className='auth page'>
            <Box className={`auth-card`}>
                <Typography component="h1" variant="h5">{login?'Sign In':'Sign Up'}</Typography>
                <Box className={`auth-form`} component="form" onSubmit={authFormSubmit} noValidate sx={{ mt: 1 }}>
                    <Box className={`auth-form-inputs`}>
                        <TextField className={`auth-input scale-in`} inputRef={emailRef} required fullWidth label="Email Address" type="email" autoComplete="email" />
                        {!login && <TextField className={`auth-input scale-in`} inputRef={userNameRef} required fullWidth label="Username" type="text"/>}
                        <TextField className={`auth-input scale-in`} inputRef={passwordRef} required fullWidth label="Password" type="password" autoComplete="current-password" />
                        {!login && <TextField className={`auth-input scale-in`} inputRef={repeatRef} required fullWidth label="Repeat Password" type="password" autoComplete="current-password" />}
                    </Box>
                    {loading?<LoadingButton className={`button auth-button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button auth-button`}>{login?'Sign In':'Sign Up'}</Button>}
                </Box>
                <Typography className={`auth-switch`} component="h6" variant="h6" onClick={()=>setLogin(!login)}>{login?"Don't have an account ?":"Use existing account"}</Typography>
            </Box>
        </Container>
    )
}

export default Auth