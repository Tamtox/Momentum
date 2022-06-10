//Styles
import './Home.scss';
//Dependencies
import React,{useState} from "react";
import { Container,Box,Typography,TextField,Button } from "@mui/material";
import {useSelector} from 'react-redux';
//Components
import type {RootState} from '../../Store/Store';
import Loading from './Loading';


const Home:React.FC = () => {
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const userData = useSelector<RootState,{email:string,name:string,emailConfirmationStatus:string,}>(state=>state.authSlice.user);
    
    return(
        <Container component="main" className={`home ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
        </Container>
    )
}

export default Home
