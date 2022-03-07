//Styles

//Dependencies
import React from "react";
import { Container } from "@mui/material";
import {useSelector,useDispatch} from 'react-redux';
import { authActions } from '../../Store/Store';
import type {RootState} from '../../Store/Store';


const Home:React.FC = () => {
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    return(
        <Container component="main" className={`habits ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            This is the title page
        </Container>
    )
}

export default Home
