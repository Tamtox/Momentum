// Styles
import './Goals.scss';
// Components
import Loading from '../Misc/Loading';
import { goalActions,authActions,habitsActions } from '../../Store/Store';
import {RootState} from '../../Store/Store';
import AddNewGoal from './Add-new-goal';
// Dependencies
import Cookies from "js-cookie";
import {useSelector,useDispatch} from 'react-redux';
import axios from "axios";
import React,{useState,useRef,useEffect} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Container,TextField,Button,Box,Typography,FormControl,InputLabel,Select,MenuItem,Card} from '@mui/material';

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
    const token = Cookies.get('token');
    const dispatch = useDispatch();
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
     // Toggle Goal status
    const changeGoalStatus = async (_id:string,goalStatus:string) => {
        try {
            await axios.request({
                method:'PATCH',
                url:`http://localhost:3001/goals/updateGoal`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id,goalStatus:goalStatus==="Pending"?"Complete":"Pending"}
            })
            dispatch(goalActions.changeGoalStatus(_id))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
    // Delete Goal
    const deleteGoal = async (_id:string,pairedHabitId?:string) => {
        try {
            await axios.request({
                method:'DELETE',
                url:`http://localhost:3001/goals/deleteGoal`,
                headers:{Authorization: `Bearer ${token}`},
                data:{_id:_id}
            })
            if(pairedHabitId) {
                await axios.request({
                    method:'DELETE',
                    url:`http://localhost:3001/habits/deleteHabit`,
                    data:{_id:pairedHabitId},
                    headers:{Authorization: `Bearer ${token}`}
                })
                dispatch(habitsActions.deleteHabit(pairedHabitId))
            }
            dispatch(goalActions.deleteGoal(_id))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }   
    }
     // Load goal data
    const loadGoalData = async () => {
        dispatch(authActions.setLoading(true))
        try {
            const goalListResponse = await axios.request({
                method:'GET',
                url:`http://localhost:3001/goals/getGoals`,
                headers:{Authorization: `Bearer ${token}`}
            })
            dispatch(goalActions.setGoalList(goalListResponse.data))
        } catch (error) {
            axios.isAxiosError(error) ? alert(error.response?.data || error.message) : console.log(error) ;
        }
        dispatch(authActions.setLoading(false))   
    }   
    useEffect(() => {
        if(!!token && goalList.length<1) {
            loadGoalData()
        }
    }, [])
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
                                <Icon onClick={()=>{changeGoalStatus(goalItem._id,goalItem.goalStatus)}} className={`icon-interactive change-goal-status-icon ${goalItem.goalStatus}`} icon={goalItem.goalStatus === 'Pending'?"akar-icons:circle":"akar-icons:circle-check"} />
                                <Icon onClick={()=>{setDetailedItem(goalItem);setToggleNewGoal(!toggleNewGoal)}} className={`icon-interactive detailed-goal-icon`} icon="feather:edit" />
                                <Icon onClick={()=>{deleteGoal(goalItem._id,goalItem.habitId)}} className={`icon-interactive delete-goal-icon`} icon="clarity:remove-line" />
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