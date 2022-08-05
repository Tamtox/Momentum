// Styles
import './Goals.scss';
// Components
import Toolbar from '../UI/Toolbar/Toolbar';
import Loading from '../Misc/Loading';
import {RootState} from '../../Store/Store';
import AddNewGoal from './Add-new-goal';
import useGoalHooks from '../../Hooks/userGoalHooks';
import type {GoalInterface} from '../../Misc/Interfaces';
// Dependencies
import {useSelector} from 'react-redux';
import React,{useState,useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {IoCheckmarkCircleOutline,IoEllipseOutline} from 'react-icons/io5';
import { Container,Typography,Card,} from '@mui/material';

function filterList(list:any[],sortQuery:string|null,searchQuery:string|null) {
    if(sortQuery) {
        if (sortQuery === 'dateAsc') { list = list.sort((itemA:GoalInterface,itemB:GoalInterface)=> new Date(itemA.creationDate).getTime() - new Date(itemB.creationDate).getTime())};
        if (sortQuery === 'dateDesc') { list = list.sort((itemA:GoalInterface,itemB:GoalInterface)=> new Date(itemB.creationDate).getTime() - new Date(itemA.creationDate).getTime())};
        if (sortQuery === 'statusPend') { list = list.filter((item:GoalInterface)=>item.status === 'Pending') };
        if (sortQuery === 'statusComp') { list = list.filter((item:GoalInterface)=>item.status === 'Complete') };
    }
    if(searchQuery) {
        list = list.filter((item:GoalInterface) => {
            if(item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item._id.includes(searchQuery.toLowerCase())) {
                return item;
            } else {
                return false;
            }
        });
    }
    return list
}

const Goals:React.FC = () => {
    const goalHooks = useGoalHooks();
    const goalList = useSelector<RootState,GoalInterface[]>(state=>state.goalSlice.goalList);
    const goalListLoaded = useSelector<RootState,boolean>(state=>state.goalSlice.goalListLoaded);
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
     // Sorting by query params
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')] ;
    const filteredList = filterList([...goalList],sortQuery,searchQuery);
    // Toggle new/detailed goal
    const [toggleNewGoal,setToggleNewGoal] = useState(false);
    // Set detailed id
    const [detailedItem,setDetailedItem] = useState<GoalInterface|undefined>();
    useEffect(() => {
        goalListLoaded || goalHooks.loadGoalData();
    }, [])
    return (
        <Container component="main" className={`goals ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Toolbar mode={'goal'} addNewItem={():any=>{setToggleNewGoal(true)}}/>
            {loading?
            <Loading height='80vh'/>:
            <div className="goal-list">
                {filteredList.map((goalItem:GoalInterface)=>{
                    return (
                        <Card variant='elevation' className={`goal-item scale-in`} key={goalItem._id}>
                            <div className={`change-goal-status`} onClick={()=>{goalHooks.changeGoalStatus(goalItem._id,goalItem.status)}}>
                                {goalItem.status === 'Complete' ? <IoCheckmarkCircleOutline  className={`icon-interactive ${goalItem.status}`} /> : <IoEllipseOutline className={`icon-interactive ${goalItem.status}`} />}
                            </div>
                            <div className={`goal-item-title`} onClick={()=>{setDetailedItem(goalItem);setToggleNewGoal(!toggleNewGoal)}}>
                                <Typography className={`goal-item-title-text`}>{goalItem.title}</Typography>
                            </div>
                        </Card>
                    )
                })}
            </div>}
            {toggleNewGoal && <AddNewGoal detailedGoal={detailedItem} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToGoals={():any=>setToggleNewGoal(false)} />}
        </Container>
    )
}

export default Goals