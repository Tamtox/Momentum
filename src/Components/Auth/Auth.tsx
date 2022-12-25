//Styles
import './Auth.scss';
//Dependencies
import React,{useState} from 'react';
import {useSelector} from 'react-redux';
import { Container,TextField,Button,Typography,Card,Box} from '@mui/material';
import { LoadingButton } from '@mui/lab';
//Components
import {RootState} from '../../Store/Store';
import useAuthHooks from '../../Hooks/useAuthHooks';



const Auth:React.FC = () => {
    const authHooks = useAuthHooks();
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const isDarkMode = useSelector<RootState,boolean>(state=>state.authSlice.darkMode);
    // Toggle sign in/sign up
    const [authInputs,setAuthInputs] = useState({
        email:'',
        username:'',
        password:'',
        passwordRepeat:'',
        isLogin:true,
        authLabel:'Sign In',
        authResponseLabel:'',
        passwordResetMode:false,
        passwordResetEmail:'',
        passResetLabel:'Reset Password',
    })
    const authInputsHandler = (newInput:string,input:string) => {
        setAuthInputs((prevState)=>({
            ...prevState,[input]:newInput
        }))
    }
    const passResetModeHandler = (isPassReset:boolean) => {
        setAuthInputs((prevState)=>({
            ...prevState,passwordResetMode:isPassReset
        }))
    };
    const isLoginHandler = () => {
        setAuthInputs((prevState)=>({
            ...prevState,isLogin:!authInputs.isLogin,authLabel:authInputs.isLogin === true ? 'Sign Up' : 'Sign In'
        }))
    };
    const authFormSubmit = async (event:React.FormEvent) => {
        event.preventDefault();
        // Check if passwords match
        if(!authInputs.isLogin) {
            if(authInputs.password !== authInputs.passwordRepeat) {
                return authInputsHandler("Passwords don't match!", "authResponseLabel")
            }
        } 
        const authResponse:string = await authHooks.signInUp(authInputs.email,authInputs.password,authInputs.isLogin,authInputs.username);
        setAuthInputs((prevState)=>({
            ...prevState,
            authLabel:authResponse
        }))
    }
    // Reset password
    const passResetHandler = async (event:React.FormEvent) => {
        event.preventDefault();
        const passResetResponse = await authHooks.resetPassword(authInputs.passwordResetEmail);
        setAuthInputs((prevState)=>({
            ...prevState,passResetLabel:passResetResponse
        }));
        setTimeout(()=>{
            passResetModeHandler(false)
        },10000)
    }
    let passResetForm = authInputs.passwordResetMode ? (
        <Box className={`auth-card`}>
            <Typography className='scale-in' component="h5" variant="h5">{authInputs.passResetLabel}</Typography>
            <form className={`auth-form scale-in`} onSubmit={passResetHandler}>
                <Box className={`auth-inputs`}>
                    <TextField className={`auth-input`} value={authInputs.passwordResetEmail} onChange={(event)=>{authInputsHandler(event.target.value,'passwordResetEmail')}} required fullWidth label="Enter your email" type="email" autoComplete="email" />
                </Box>
                <Box className={`auth-buttons`}>
                    <Button onClick={(event)=>{passResetModeHandler(false)}} variant="outlined" className={`button auth-button`}>Back</Button>
                    {loading?<LoadingButton className={`button auth-button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button auth-button`}>Reset</Button>}
                </Box>
            </form>
        </Box> 
    ) : null
    return (
        <Container component="main" className='auth page'>
            {passResetForm || <Box className={`auth-card${isDarkMode?"-dark":""} scale-in`}>
                <Typography component="h5" variant="h5">{authInputs.authLabel}</Typography>
                <form className={`auth-form`} onSubmit={authFormSubmit}>
                    <Box className={`auth-inputs scale-in`}>
                        <TextField className={`auth-input scale-in`} value={authInputs.email} onChange={(event)=>{authInputsHandler(event.target.value,'email')}} size="medium" required fullWidth label="Email Address" type="email" autoComplete="email" />
                        {!authInputs.isLogin && <TextField className={`auth-input scale-in`} value={authInputs.username} onChange={(event)=>{authInputsHandler(event.target.value,'username')}} size="medium" required fullWidth label="Username" type="text"/>}
                        <TextField className={`auth-input scale-in`} value={authInputs.password} onChange={(event)=>{authInputsHandler(event.target.value,'password')}} size="medium" required fullWidth label="Password" type="password" autoComplete="current-password" />
                        {!authInputs.isLogin && <TextField className={`auth-input scale-in`} value={authInputs.passwordRepeat} onChange={(event)=>{authInputsHandler(event.target.value,'passwordRepeat')}} size="medium" required fullWidth label="Repeat Password" type="password" autoComplete="current-password" />}
                    </Box>
                    <Box className={`auth-buttons`}>
                        <Button onClick={()=>{passResetModeHandler(true)}} variant="outlined" className={`button auth-button`} sx={{width:'fit-content'}}>Reset Password</Button>
                        {loading?<LoadingButton className={`button auth-button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button auth-button`}>{authInputs.isLogin?'Sign In':'Sign Up'}</Button>}
                    </Box>
                </form>
                <Card className={`auth-switch`} onClick={isLoginHandler}>{authInputs.isLogin?"Don't have an account ?":"Use existing account"}</Card>
            </Box>}
        </Container>
    )
}

export default Auth