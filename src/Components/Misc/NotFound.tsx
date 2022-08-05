//Styles
import './NotFound.scss'
// Dependencies
import {IoSadOutline} from 'react-icons/io5';
import { Container } from '@mui/material';
import {useSelector} from 'react-redux';
//Components
import {RootState} from '../../Store/Store';

function NotFound() {
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    return (
        <Container component="main" className={`not-found ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <h1>Page Not Found</h1>
            <IoSadOutline className="not-found-icon" />
        </Container>
    )
}

export default NotFound