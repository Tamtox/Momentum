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
    return (
        <Container className={`profile ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Typography></Typography>
        </Container>
    )
}

export default Profile