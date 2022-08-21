//Styles
import './Home.scss';
//Dependencies
import React from 'react';
import { useSelector} from 'react-redux';
import type {RootState} from '../../Store/Store';
import {Container} from '@mui/material';
//Components
import Schedule from './Schedule';


const Home:React.FC = () => {
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    return(
        <Container component="main" className={`home ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Schedule/>
        </Container>
    )
}

export default Home
