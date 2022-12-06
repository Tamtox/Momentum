// Styles
import './Toolbar.scss';
// Components
import {RootState} from '../../../Store/Store';
//Dependencies
import {useSelector} from 'react-redux';
import React,{useState} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import {IoCloseCircleOutline} from 'react-icons/io5';
import { InputLabel,Select,MenuItem,OutlinedInput,InputAdornment,FormControl,Button} from '@mui/material';


const Toolbar:React.FC<{mode:string,addNewItem:()=>{}}> = (props) => {
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    // Sorting by query params
    const [navigate,location] = [useNavigate(),useLocation()];
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')]; 
    function setQueries(sortQuery:string|null,searchQuery:string|null) {
        const sortQueryString = sortQuery ? `?sort=${sortQuery}` : '';
        const searchQueryString = searchQuery ? sortQuery ? `&search=${searchQuery}` : `?search=${searchQuery}` : '';
        navigate(`/${props.mode}${(props.mode === 'goal' || props.mode === 'habit') && 's'}${sortQueryString}${searchQueryString}`);
    }
    const [queries,setNewQueries] = useState({sortQuery:sortQuery || '',searchQuery:searchQuery || ''}) ;
    const sortQueryHandler = (newSortQuery:string) => {
        setNewQueries((prevState)=>({
            ...prevState,
            sortQuery:newSortQuery
        }))
        setQueries(newSortQuery,queries.searchQuery);
    }
    const searchQueryHandler = (searchString:string) => {
        setNewQueries((prevState)=>({
            ...prevState,
            searchQuery:searchString
        }))
        setQueries(queries.sortQuery,searchString);
    }
    return (
        <div className={`toolbar${isDarkMode?'-dark':''} scale-in`}>
            <FormControl className='toolbar-sort select' size='small' >
                <InputLabel id="toolbar-sort-label">Sort</InputLabel>
                <Select labelId="toolbar-sort-label" value={queries.sortQuery} onChange={(event)=>{sortQueryHandler(event.target.value)}} size='small' label="Sort">
                    <MenuItem value="">All Items</MenuItem>
                    <MenuItem value="dateAsc">Creation Date Ascending</MenuItem>
                    <MenuItem value="dateDesc">Creation Date Descending</MenuItem>
                    {props.mode === 'habit' ? <MenuItem value="noEntries">No Entries</MenuItem> : <MenuItem value="statusPend">Status Pending</MenuItem>}
                    {props.mode === 'habit' ? <MenuItem value="hasEntries">Entries</MenuItem> :<MenuItem value="statusComp">Status Complete</MenuItem>}
                </Select>
            </FormControl>
            <FormControl className={`toolbar-search`} sx={{width:"calc(min(100%, 33rem))"}} size='small' variant="outlined">
                <InputLabel>Search</InputLabel>
                <OutlinedInput value={queries.searchQuery} onChange={(e)=>{searchQueryHandler(e.target.value)}} label="Search" 
                    endAdornment={<InputAdornment position="end">{!!queries.searchQuery.length && <IoCloseCircleOutline onClick={()=>{searchQueryHandler('')}} className={`icon-interactive opacity-transition clear-input`}/>}</InputAdornment>}
                />
            </FormControl>
            <Button variant="outlined" onClick={props.addNewItem}  className={`toolbar-add-new-item`} >{`New ${props.mode}`}</Button>
        </div>
    )
}

export default Toolbar