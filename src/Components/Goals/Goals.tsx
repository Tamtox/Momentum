// Styles
import './Goals.scss';
// Components
import Loading from '../Misc/Loading';
import {RootState} from '../../Store/Store';
import AddNewGoal from './Add-new-goal';
import useGoalHooks from '../../Hooks/userGoalHooks';
// Dependencies
import {useSelector} from 'react-redux';
import React,{useState,useRef} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Container,TextField,Button,Box,Typography,FormControl,InputLabel,Select,MenuItem,Card,Tooltip} from '@mui/material';

// Sorting algorithm
function sortList(list:any[],sortQuery:string|null,searchQuery:string|null) {
    if(sortQuery === 'dateAsc') {
        list = list.sort((itemA,itemB)=> new Date(itemA.goalCreationDate).getTime() - new Date(itemB.goalCreationDate).getTime())
    } else if(sortQuery === 'dateDesc') {
        list = list.sort((itemA,itemB)=> new Date(itemB.goalCreationDate).getTime() - new Date(itemA.goalCreationDate).getTime())
    } else if(sortQuery === 'statusPend') {
        list = list.filter(item=>item.goalStatus === 'Pending')
    } else if(sortQuery === 'statusComp') {
        list = list.filter(item=>item.goalStatus === 'Complete')
    }
    if(!!searchQuery) {
        list = list.filter(item=>item.goalTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list
}

const Goals:React.FC = () => {
    const goalHooks = useGoalHooks();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const goalList = useSelector<RootState,{goalTitle:string,goalCreationDate:string,goalTargetDate:string|null,goalStatus:string,habitId:string|null,_id:string}[]>(state=>state.goalSlice.goalList);
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
     // Sorting by query params
    const [sortRef,searchRef] = [useRef<HTMLSelectElement>(null),useRef<HTMLInputElement>(null)] 
    const [navigate,location] = [useNavigate(),useLocation()];
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')] 
    const sortedList = sortList([...goalList],sortQuery,searchQuery);
    const [sortQueryOption,setSortQueryOption] = useState('');
    function setQueries(newSortQuery?:string) {
        const [sortInput,searchInput] = [newSortQuery,searchRef.current!.value];
        if(!!sortInput) {
            if(!!searchInput) {
                navigate(`/goals?sort=${sortInput}&search=${searchInput}`);
            } 
            else if(!!searchInput === false) {
                navigate(`/goals?sort=${sortInput}`);
            }
        } 
        else if(!!sortInput === false) {
            if(!!searchInput) {
                navigate(`/goals?search=${searchInput}`);
            } else {
                navigate(`/goals`)
            }
        }
    }
    // Toggle new/detailed goal
    const [toggleNewGoal,setToggleNewGoal] = useState(false);
    // Set detailed id
    const [detailedItem,setDetailedItem] = useState()
    return (
        <Container component="main" className={`goals ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Box className={`goal-controls${isDarkMode?'-dark':''}`}>
                <FormControl className='sort-goals select' size='small'>
                    <InputLabel id="goal-sort-label">Sort</InputLabel>
                    <Select labelId="goal-sort-label" inputRef={sortRef} value={sortQueryOption} onChange={(event)=>{setSortQueryOption(event.target.value);setQueries(event.target.value)}} size='small' label="Sort">
                        <MenuItem value="">Default</MenuItem>
                        <MenuItem value="dateAsc">Date Ascending</MenuItem>
                        <MenuItem value="dateDesc">Date Descending</MenuItem>
                        <MenuItem value="statusPend">Status Pending</MenuItem>
                        <MenuItem value="statusComp">Status Complete</MenuItem>
                    </Select>
                </FormControl>
                <TextField  className={`search-goals`} sx={{width:"calc(min(100%, 33rem))"}} inputRef={searchRef} onChange={()=>{setQueries()}} fullWidth size='small' label="Search"/>
                <Button variant="outlined"  className={`add-new-goal`} onClick={()=>{setToggleNewGoal(!toggleNewGoal)}}>New Goal</Button>
            </Box>
            {loading?
            <Loading height='80vh'/>:
            <Box className="goal-list">
                {sortedList.map((goalItem)=>{
                    return (
                        <Card variant='elevation' className={`goal-item scale-in`} key={goalItem._id}>
                            <Box className='goal-item-icons'>
                                <Tooltip enterDelay={500} {...{ 'title':`Status: ${goalItem.goalStatus}`,'children':<Icon onClick={()=>{goalHooks.changeGoalStatus(goalItem._id,goalItem.goalStatus)}} className={`icon-interactive change-goal-status-icon ${goalItem.goalStatus}`} icon={`akar-icons:circle${goalItem.goalStatus === 'Complete' ? '-check' : ''}`} />}}/>
                                <Tooltip enterDelay={500} {...{ 'title':`Edit`,'children':<Icon onClick={()=>{setDetailedItem(goalItem);setToggleNewGoal(!toggleNewGoal)}} className={`icon-interactive detailed-goal-icon`} icon="feather:edit" />}}/>
                                <Tooltip enterDelay={500} {...{ 'title':`Delete`,'children':<Icon onClick={()=>{goalHooks.deleteGoal(goalItem._id,goalItem.habitId)}} className={`icon-interactive delete-goal-icon`} icon="clarity:remove-line" />}}/>
                            </Box>
                            <Typography className={`goal-item-title`}>{goalItem.goalTitle}</Typography>
                        </Card>
                    )
                })}
            </Box>}
            {toggleNewGoal && <AddNewGoal detailedGoal={detailedItem} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToGoals={():any=>setToggleNewGoal(false)} />}
        </Container>
    )
}

export default Goals