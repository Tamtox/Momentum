// Styles
import './Goals.scss';
// Dependencies
import React,{useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useLocation,useNavigate} from 'react-router-dom';
import {IoCheckmarkCircleOutline,IoEllipseOutline} from 'react-icons/io5';
import { Container,Typography,Card, Box,} from '@mui/material';
// Components
import Toolbar from '../UI/Toolbar/Toolbar';
import Loading from '../Misc/Loading';
import {RootState} from '../../Store/Store';
import useGoalHooks from '../../Hooks/userGoalHooks';
import type {GoalInterface} from '../../Misc/Interfaces';
import { sortByQueries } from '../../Misc/Helper-functions';

const Goals:React.FC = () => {
    const goalHooks = useGoalHooks();
    const goalList = useSelector<RootState,GoalInterface[]>(state=>state.goalSlice.goalList);
    const goalListLoaded = useSelector<RootState,boolean>(state=>state.goalSlice.goalListLoaded);
    const goalLoading = useSelector<RootState,boolean>(state=>state.goalSlice.goalLoading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    // Sorting by query params
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')];
    const filteredList = sortByQueries([...goalList],"goal",sortQuery,searchQuery);
    useEffect(() => {
        goalListLoaded || goalHooks.loadGoalData();
    }, [])
    return (
        <Container component="main" className={`goals ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Toolbar mode={'goal'} addNewItem={():any=>navigate(`${location.pathname}/new-goal`)}/>
            {goalLoading ? <Loading height='80vh'/>:
            <Box className="goal-list">
                {filteredList.map((goalItem:GoalInterface)=>{
                    return (
                        <Card variant='elevation' className={`goal-item scale-in`} key={goalItem._id}>
                            <Box className={`change-goal-status`} onClick={()=>{goalHooks.changeGoalStatus(goalItem)}}>
                                {goalItem.status === 'Complete' ? <IoCheckmarkCircleOutline  className={`icon-interactive ${goalItem.status}`} /> : <IoEllipseOutline className={`icon-interactive ${goalItem.status}`} />}
                            </Box>
                            <Box className={`goal-item-title`} onClick={()=>{navigate(`${location.pathname}/${goalItem._id}`)}}>
                                <Typography className={`goal-item-title-text`}>{goalItem.title}</Typography>
                            </Box>
                        </Card>
                    )
                })}
            </Box>}
        </Container>
    )
}

export default Goals
