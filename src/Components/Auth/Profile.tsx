// Styles
import './Profile.scss';
//Components
import React from 'react';
import { authActions} from '../../Store/Store';
import type {RootState} from '../../Store/Store';
//Dependencies
import { Container,TextField,Button,Box,Typography,FormControl,InputLabel,Select,MenuItem,Card} from '@mui/material';
import { useSelector } from 'react-redux';


const Profile:React.FC = () => {
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const userData = useSelector<RootState,{email:string,name:string}>(state=>state.authSlice.user)
    return (
        <Container className={`profile ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`} >
            <Card className={`profile-card`}>
                <Typography component="h6" variant="h6">{`Email : ${userData.email}`}</Typography>
                <Typography component="h6" variant="h6">{`Username : ${userData.name}`}</Typography>
            </Card>
        </Container>
    )
}

export default Profile