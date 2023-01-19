// Styles
import './Profile.scss';
//Dependencies
import React,{useState} from 'react';
import { useSelector } from 'react-redux';
import { Container,TextField,Button,Typography,Card, Box} from '@mui/material';
import { LoadingButton } from '@mui/lab';
//Components
import type {RootState} from '../../Store/Store';
import useAuthHooks from '../../Hooks/useAuthHooks';
import Loading from '../Misc/Loading';
import type { UserInterface } from '../../Misc/Interfaces';


const Profile:React.FC = () => {
    const authHooks = useAuthHooks();
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const userData = useSelector<RootState,UserInterface>(state=>state.authSlice.user);
    const [profileInputs,setProfileInputs] = useState({
        currentPass:'',
        newPass:'',
        repeatNewPass:'',
        changePassMode:false,
        changePassLabel:'Change Password',
        verificationCode:'',
        verificationMode:userData.emailConfirmationStatus === 'Pending' ? true : false,
        verificationLabel:`Verification code was sent to ${userData.email}.`,
        email:'',
        resendLetterMode:false,
        resendLetterLabel:'Resend Verification Code',
        deleteAccountMode:false,
        deleteAccountLabel:'Delete Account'
    })
    const profileInputsHandler = (input:string,inputName:string) => {
        setProfileInputs((prevState)=>({
            ...prevState,
            [inputName]:input
        }))
    }
    const modeChangeHandler = (mode:string,value?:boolean) => {
        setProfileInputs((prevState)=>({
            ...prevState,[mode]:value
        }))
    }
    // Change password control
    const changePasswordFormHandler = async (event:React.FormEvent) => {
        event.preventDefault();
        const [currentPass,newPass,repeatNewPass] = [profileInputs.currentPass,profileInputs.newPass,profileInputs.repeatNewPass];
        if(newPass.length < 6) {
            return profileInputsHandler("New password is too short",'changePassLabel')
        }
        if(newPass.toLowerCase() !== repeatNewPass.toLowerCase()) {
            return profileInputsHandler("New passwords don't match",'changePassLabel')
        }
        if(newPass.toLowerCase() === currentPass.toLowerCase()) {
            return profileInputsHandler("Old and new passwords are the same",'changePassLabel')
        }
        const passChangeResponse = await authHooks.changePassword(currentPass,newPass);
        profileInputsHandler(passChangeResponse,'changePassLabel');
        profileInputsHandler('','currentPass');
        profileInputsHandler('','newPass');
        profileInputsHandler('','repeatNewPass');
    }
    let passwordChangeForm = profileInputs.changePassMode ? (
        <form className={`password-change-form profile-card scale-in`} onSubmit={changePasswordFormHandler}>
            <Typography className={`profile-card-item`} component="h6" variant="h6">{profileInputs.changePassLabel}</Typography>
            <TextField className={`scale-in profile-card-item`} size="medium" value={profileInputs.currentPass} onChange={(e)=>{profileInputsHandler(e.target.value,'currentPass')}} required fullWidth label="Old Password" type="password" autoComplete="new-password" />
            <TextField className={`scale-in profile-card-item`} size="medium" value={profileInputs.newPass} onChange={(e)=>{profileInputsHandler(e.target.value,'newPass')}} required fullWidth label="New Password" type="password" autoComplete="new-password"/>
            <TextField className={`scale-in profile-card-item`} size="medium" value={profileInputs.repeatNewPass} onChange={(e)=>{profileInputsHandler(e.target.value,'repeatNewPass')}} required fullWidth label="Repeat New Password" type="password" autoComplete="new-password"/>
            <Box className={`profile-buttons profile-card-item`}>
                <Button type="submit" variant="outlined" onClick={()=>{modeChangeHandler('changePassMode',false)}} className={`button`}>Back</Button>
                {loading?<LoadingButton className={`button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button`}>Submit</Button>}
            </Box>
        </form>
    ) : null
    // Account verification
    const verifyAccountHandler = async (event:React.FormEvent) => {
        event.preventDefault();
        const verificationCode = profileInputs.verificationCode
        const verificationResponse = await authHooks.verifyAccount(verificationCode)
        modeChangeHandler(verificationResponse,)
    }
    let verificationForm = profileInputs.verificationMode ? (
        <form className={`verification-form profile-card scale-in`} onSubmit={verifyAccountHandler} >
            <Typography  className='verification-label profile-card-item' component="h6" variant="h6">{profileInputs.verificationLabel}</Typography>
            <TextField className={`verification-input scale-in profile-card-item`} value={profileInputs.verificationCode} onChange={(e)=>{profileInputsHandler(e.target.value,'verificationCode')}} required fullWidth label="Verification Code" type="text" />
            <Box className={`profile-buttons profile-card-item`}>
                <Button type="submit" variant="outlined" onClick={()=>{modeChangeHandler('verificationMode',false)}} className={`button`}>Back</Button>
                {loading?<LoadingButton className={`button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button`}>Verify</Button>}
            </Box>
        </form>
    ) : null
    // Resend verification code
    const sendVerificationFormHandler = async (event:React.FormEvent) => {
        event.preventDefault();
        const emailAddress = profileInputs.email
        const sendVerificationResponse = await authHooks.sendVerificationLetter(emailAddress);
        profileInputsHandler(sendVerificationResponse,'verificationLabel');
    }
    let sendVerificationLetterForm = profileInputs.resendLetterMode ? (
        <form className={`send-verification-letter-form profile-card scale-in`} onSubmit={sendVerificationFormHandler}>
            <Typography className={`profile-card-item`} component="h6" variant="h6">{profileInputs.resendLetterLabel}</Typography>
            <TextField className={`scale-in profile-card-item`} size="medium" defaultValue={userData.email} value={profileInputs.email} onChange={(e)=>{profileInputsHandler(e.target.value,'email')}} required fullWidth label="Email" type="email" autoComplete="email" />
            <Box className={`profile-buttons profile-card-item`}>
                <Button type="submit" variant="outlined" onClick={()=>{modeChangeHandler('resendLetterMode',false)}} className={`button`}>Back</Button>
                {loading?<LoadingButton className={`button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" className={`button`}>Submit</Button>}
            </Box>
        </form>
    ) : null
    // Delete account
    const deleteAccountFormHandler = async (event:React.FormEvent) => {
        event.preventDefault();
        const deleteAccountResponse = await authHooks.deleteAccount(profileInputs.currentPass);
        profileInputsHandler(deleteAccountResponse,'deleteAccountLabel');
    }
    let deleteAccountForm = profileInputs.deleteAccountMode ? (
        <form className={`delete-account-form profile-card scale-in`} onSubmit={deleteAccountFormHandler}>
            <Typography className={`profile-card-item`} component="h6" variant="h6">{profileInputs.deleteAccountLabel}</Typography>
            <TextField className={`scale-in profile-card-item`} size="medium" value={profileInputs.currentPass} onChange={(e)=>{profileInputsHandler(e.target.value,'currentPass')}} required fullWidth label="Enter your password" type="password" autoComplete="new-password"/>
            <Box className={`profile-buttons profile-card-item`}>
                <Button type="submit" variant="outlined" onClick={()=>{modeChangeHandler('deleteAccountMode',false);profileInputsHandler("",'currentPass')}} className={`button`}>Back</Button>
                {loading?<LoadingButton className={`button`} loading variant="contained"></LoadingButton>:<Button type="submit" variant="contained" color='error' className={`button`}>Delete</Button>}
            </Box>
        </form>
    ) : null
    return (
        <Container component="main" className={`profile ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`} >
            {loading ? <Loading height='100%'/> : (passwordChangeForm || verificationForm || sendVerificationLetterForm || deleteAccountForm ||  
            <Card className={`profile-card scale-in`}>
                <Typography className={`username profile-card-item`} component="h5" variant="h5">{`${userData.name}`}</Typography>
                <Typography className={`profile-card-item`} component="h6" variant="h6">{`Email : ${userData.email}`}</Typography>
                <Button variant="outlined" onClick={()=>{modeChangeHandler('changePassMode',true)}} className={`change-password profile-card-item`} >Change Password</Button>
                {userData.emailConfirmationStatus === 'Pending' && <Button variant="outlined" onClick={()=>{modeChangeHandler('verificationMode',true)}} className={`verify-account profile-card-item`} >Verify Account</Button>}
                {userData.emailConfirmationStatus === 'Pending' && <Button variant="outlined" onClick={()=>{modeChangeHandler('resendLetterMode',true)}} className={`send-verification-letter profile-card-item`} >Resend Verification Letter</Button>}
                <Button variant="outlined" color='error' onClick={()=>{modeChangeHandler('deleteAccountMode',true)}} className={`delete-account profile-card-item`} >Delete Account</Button>
            </Card>)}
        </Container>
    )
}

export default Profile