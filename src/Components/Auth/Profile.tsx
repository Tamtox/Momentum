// Styles
import './Profile.scss';
//Components
import React,{useRef,useState} from 'react';
import type {RootState} from '../../Store/Store';
import useAuthHooks from '../../Hooks/useAuthHooks';
//Dependencies
import { Container,TextField,Button,Box,Typography,Card} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';


const Profile:React.FC = () => {
    const authHooks = useAuthHooks();
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const userData = useSelector<RootState,{email:string,name:string}>(state=>state.authSlice.user);
    // Change password control
    const [currentPassRef,newPassRef,repeatPassRef] = [useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null)];
    const [changePassMode,setChangePassMode] = useState(false);
    const changePasswordFormHandler = async (event:React.FormEvent) => {
        event.preventDefault();
        const [currentPass,newPass,repeatNewPass] = [currentPassRef.current!.value,newPassRef.current!.value,repeatPassRef.current!.value];
        if(newPass.toLowerCase() !== repeatNewPass.toLowerCase()) {
            alert('Passwords do not match!')
            return
        }
        authHooks.changePassword(currentPass,newPass);
        setChangePassMode(false)
    }
    let passwordChangeForm = changePassMode ? (
        <Box className={`password-change-form profile-card scale-in`} component="form" onSubmit={changePasswordFormHandler} noValidate sx={{ mt: 1 }}>
            <Typography className={`profile-card-item`} component="h6" variant="h6">Change Password</Typography>
            <TextField className={`scale-in`} size="medium" inputRef={currentPassRef} required fullWidth label="Old Password" type="password" autoComplete="current-password" />
            <TextField className={`scale-in`} size="medium" inputRef={newPassRef} required fullWidth label="New Password" type="password" />
            <TextField className={`scale-in`} size="medium" inputRef={repeatPassRef} required fullWidth label="Repeat New Password" type="password"/>
            <Box className={`profile-buttons profile-card-item`}>
                <Button type="submit" variant="outlined" onClick={()=>{setChangePassMode(false)}} className={`button`}>Back</Button>
                {loading?<LoadingButton className={`button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button`}>Submit</Button>}
            </Box>
        </Box>
    ) : null
    // Resend verification code
    const emailAddressRef = useRef<HTMLInputElement>(null);
    const [verificationLetterMode,setVerificationLetterMode] = useState(false);
    const sendVerificationFormHandler = async (event:React.FormEvent) => {
        event.preventDefault();
        const emailAddress = emailAddressRef.current!.value;
        authHooks.sendVerificationLetter(emailAddress);
        setVerificationLetterMode(false)
    }
    let sendVerificationLetterForm = verificationLetterMode ? (
        <Box className={`send-verification-letter-form profile-card scale-in`} component="form" onSubmit={sendVerificationFormHandler} noValidate sx={{ mt: 1 }}>
            <Typography className={`profile-card-item`} component="h6" variant="h6">Resend Verification Code</Typography>
            <TextField className={`scale-in`} size="medium" defaultValue={userData.email} inputRef={emailAddressRef} required fullWidth label="Email" type="email" autoComplete="email" />
            <Box className={`profile-buttons profile-card-item`}>
                <Button type="submit" variant="outlined" onClick={()=>{setVerificationLetterMode(false)}} className={`button`}>Back</Button>
                {loading?<LoadingButton className={`button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button`}>Submit</Button>}
            </Box>
        </Box>
    ) : null
    // Delete account
    const userEmailRef = useRef<HTMLInputElement>(null);
    const [deleteAccountMode,setDeleteAccountMode] = useState(false);
    const deleteAccpuntFormHandler = async (event:React.FormEvent) => {
        event.preventDefault();
        const userEmail = userEmailRef.current!.value;
        if(userEmail !== userData.email) {
            alert('Email does not match.')
            return
        }
        authHooks.deleteAccount();
        setDeleteAccountMode(false)
    }
    let deleteAccountForm = deleteAccountMode ? (
        <Box className={`delete-account-form profile-card scale-in`} component="form" onSubmit={deleteAccpuntFormHandler} noValidate sx={{ mt: 1 }}>
            <Typography className={`profile-card-item`} component="h6" variant="h6">Delete Account</Typography>
            <TextField className={`scale-in`} size="medium" inputRef={userEmailRef} required     fullWidth label="Enter your email" type="email" autoComplete="email" />
            <Box className={`profile-buttons profile-card-item`}>
                <Button type="submit" variant="outlined" onClick={()=>{setDeleteAccountMode(false)}} className={`button`}>Back</Button>
                {loading?<LoadingButton className={`button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button`}>Submit</Button>}
            </Box>
        </Box>
    ) : null
    return (
        <Container className={`profile ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`} >
            {passwordChangeForm || sendVerificationLetterForm || deleteAccountForm || 
            <Card className={`profile-card scale-in`}>
                <Typography className={`username profile-card-item`} component="h5" variant="h5">{`${userData.name}`}</Typography>
                <Typography className={`profile-card-item`} component="h6" variant="h6">{`Email : ${userData.email}`}</Typography>
                <Box className={`profile-buttons profile-card-item`}>
                    <Button variant="outlined" onClick={()=>{setChangePassMode(true)}} className={`change-password`} >Change Password</Button>
                    <Button variant="outlined" onClick={()=>{setVerificationLetterMode(true)}} className={`send-verification-letter`} >Send Letter</Button>
                    <Button variant="outlined" color='error' onClick={()=>{setDeleteAccountMode(true)}} className={`delete-account`} >Delete Account</Button>
                </Box>
            </Card>}
        </Container>
    )
}

export default Profile