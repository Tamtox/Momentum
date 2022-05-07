//Styles
import './Auth.scss';
//Dependencies
import React,{useState,} from 'react';
import {useSelector} from 'react-redux';
import useAuthHooks from '../../Hooks/useAuthHooks';
//Components
import { RootState} from '../../Store/Store';
import { Container,TextField,Button,Typography} from '@mui/material';
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
        authLabel:'Sign In',
        authResponseLabel:'',
        passwordResetMode:false,
        passwordResetEmail:'',
        passResetLabel:'Reset Password',
    })
    const authInputsHandler = (e:any,input:string) => {
        setAuthInputs((prevState)=>({
            ...prevState,[input]:e.target.value
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
                return alert('Passwords do not match!')
            }
        } 
        const authResponse = await authHooks.signInUp(authInputs.email,authInputs.password,authInputs.isLogin,authInputs.username);
        setAuthInputs((prevState)=>({
            ...prevState,authLabel:authResponse
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
        <div className={`auth-card`}>
            <Typography className='scale-in' component="h5" variant="h5">{authInputs.passResetLabel}</Typography>
            <form className={`auth-form scale-in`} onSubmit={passResetHandler}>
                <div className={`auth-inputs`}>
                    <TextField className={`auth-input`} value={authInputs.passwordResetEmail} onChange={(event)=>{authInputsHandler(event,'passwordResetEmail')}} required fullWidth label="Enter your email" type="email" autoComplete="email" />
                </div>
                <div className={`auth-buttons`}>
                    <Button onClick={(event)=>{authInputsHandler(event,'passwordResetMode')}} variant="outlined" className={`button auth-button`}>Back</Button>
                    {loading?<LoadingButton className={`button auth-button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button auth-button`}>Reset</Button>}
                </div>
            </form>
        </div> 
    ) : null
    return (
        <Container component="main" className='auth page'>
            {passResetForm || <div className={`auth-card scale-in`}>
                <Typography component="h5" variant="h5">{authInputs.authLabel}</Typography>
                <form className={`auth-form`} onSubmit={authFormSubmit}>
                    <div className={`auth-inputs scale-in`}>
                        <TextField className={`auth-input`} value={authInputs.email} onChange={(event)=>{authInputsHandler(event,'email')}} required fullWidth label="Email Address" type="email" autoComplete="email" />
                        {!authInputs.isLogin && <TextField className={`auth-input`} value={authInputs.username} onChange={(event)=>{authInputsHandler(event,'username')}} required fullWidth label="Username" type="text"/>}
                        <TextField className={`auth-input`} value={authInputs.password} onChange={(event)=>{authInputsHandler(event,'password')}} required fullWidth label="Password" type="password" autoComplete="current-password" />
                        {!authInputs.isLogin && <TextField className={`auth-input`} value={authInputs.passwordRepeat} onChange={(event)=>{authInputsHandler(event,'passwordRepeat')}} required fullWidth label="Repeat Password" type="password" autoComplete="current-password" />}
                    </div>
                    <div className={`auth-buttons`}>
                        <Button onClick={()=>{passResetModeHandler(true)}} variant="outlined" className={`button auth-button`} sx={{width:'fit-content'}}>Reset Password</Button>
                        {loading?<LoadingButton className={`button auth-button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button auth-button`}>{authInputs.isLogin?'Sign In':'Sign Up'}</Button>}
                    </div>
                </form>
                <Typography className={`auth-switch`} component="h6" variant="h6" onClick={isLoginHandler}>{authInputs.isLogin?"Don't have an account ?":"Use existing account"}</Typography>
            </div>}
        </Container>
    )
}

export default Auth