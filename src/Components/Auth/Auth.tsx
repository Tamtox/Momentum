//Styles
import './Auth.scss';
//Dependencies
import React,{useState,} from 'react';
import {useSelector} from 'react-redux';
import useAuthHooks from '../../Hooks/useAuthHooks';
//Components
import { authActions, RootState} from '../../Store/Store';
import { Container,TextField,Button,Box,Typography} from '@mui/material';
import { LoadingButton } from '@mui/lab';

const Auth:React.FC = () => {
    const authHooks = useAuthHooks();
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    // Toggle sign in/sign up
    const [authInputs,setAuthInputs] = useState({
        email:'',
        username:'',
        password:'',
        passwordRepeat:'',
        isLogin:true,
        passwordResetMode:false,
        passwordResetEmail:''
    })
    const authInputsHandler = (e:any,input:string) => {
        const inputs = ['email','username','password','passwordRepeat','passwordResetEmail'];
        if(inputs.includes(input)) {
            setAuthInputs((prevState)=>({
                ...prevState,
                [input]:e.target.value
            }))
        } else {
            setAuthInputs((prevState)=>({
                ...prevState,
                [input]:!authInputs[input === 'isLogin' ? 'isLogin' : 'passwordResetMode']
            }))
        }
    }
    const authFormSubmit = async (event:React.FormEvent) => {
        event.preventDefault();
        // Check if passwords match
        if(!authInputs.isLogin) {
            if(authInputs.password !== authInputs.passwordRepeat) {
                alert('Passwords do not match!')
                return
            }
        } 
        authHooks.signInUp(authInputs.email,authInputs.password,authInputs.isLogin,authInputs.username)
    }
    // Reset password
    const passResetHandler = async (event:React.FormEvent) => {
        event.preventDefault();
        authHooks.resetPassword(authInputs.passwordResetEmail);
        setAuthInputs((prevState)=>({
            ...prevState,passwordResetMode:false
        }));
    }
    let passResetForm = authInputs.passwordResetMode ? (
        <Box className={`auth-card`}>
            <Typography className='scale-in' component="h5" variant="h5">Reset password</Typography>
            <Box className={`auth-form scale-in`} component="form" onSubmit={passResetHandler}>
                <Box className={`auth-inputs`}>
                    <TextField className={`auth-input`} value={authInputs.passwordResetEmail} onChange={(event)=>{authInputsHandler(event,'passwordResetEmail')}} required fullWidth label="Enter your email" type="email" autoComplete="email" />
                </Box>
                <Box className={`auth-buttons`}>
                    <Button onClick={(event)=>{authInputsHandler(event,'passwordResetMode')}} variant="outlined" className={`button auth-button`}>Back</Button>
                    {loading?<LoadingButton className={`button auth-button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button auth-button`}>Reset</Button>}
                </Box>
            </Box>
        </Box> 
    ) : null
    return (
        <Container component="main" className='auth page'>
            {passResetForm || <Box className={`auth-card scale-in`}>
                <Typography component="h5" variant="h5">{authInputs.isLogin?'Sign In':'Sign Up'}</Typography>
                <Box className={`auth-form`} component="form" onSubmit={authFormSubmit}>
                    <Box className={`auth-inputs scale-in`}>
                        <TextField className={`auth-input`} value={authInputs.email} onChange={(event)=>{authInputsHandler(event,'email')}} required fullWidth label="Email Address" type="email" autoComplete="email" />
                        {!authInputs.isLogin && <TextField className={`auth-input`} value={authInputs.username} onChange={(event)=>{authInputsHandler(event,'username')}} required fullWidth label="Username" type="text"/>}
                        <TextField className={`auth-input`} value={authInputs.password} onChange={(event)=>{authInputsHandler(event,'password')}} required fullWidth label="Password" type="password" autoComplete="current-password" />
                        {!authInputs.isLogin && <TextField className={`auth-input`} value={authInputs.passwordRepeat} onChange={(event)=>{authInputsHandler(event,'passwordRepeat')}} required fullWidth label="Repeat Password" type="password" autoComplete="current-password" />}
                    </Box>
                    <Box className={`auth-buttons`}>
                        <Button onClick={(event)=>{authInputsHandler(event,'passwordResetMode')}} variant="outlined" className={`button auth-button`} sx={{width:'fit-content'}}>Reset Password</Button>
                        {loading?<LoadingButton className={`button auth-button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button auth-button`}>{authInputs.isLogin?'Sign In':'Sign Up'}</Button>}
                    </Box>
                </Box>
                <Typography className={`auth-switch`} component="h6" variant="h6" onClick={(event:any)=>{authInputsHandler(event,'isLogin')}}>{authInputs.isLogin?"Don't have an account ?":"Use existing account"}</Typography>
            </Box>}
        </Container>
    )
}

export default Auth