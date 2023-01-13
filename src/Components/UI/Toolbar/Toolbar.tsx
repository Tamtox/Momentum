// Styles
import './Toolbar.scss';
// Components
import {RootState} from '../../../Store/Store';
//Dependencies
import {useSelector} from 'react-redux';
import React,{useState} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import {IoCloseCircleOutline} from 'react-icons/io5';
import {MdOutlineAdd,MdSearch} from 'react-icons/md';
import { InputLabel,Select,MenuItem,OutlinedInput,InputAdornment,FormControl,Button, Box, Typography} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';


const Toolbar:React.FC<{mode:string,addNewItem:()=>{}}> = (props) => {
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const isCompact = useMediaQuery('(max-width:769px)');
    // Sorting by query params
    const [navigate,location] = [useNavigate(),useLocation()];
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')]; 
    function setQueries(sortQuery:string|null,searchQuery:string|null) {
        const sortQueryString = sortQuery ? `?sort=${sortQuery}` : '';
        const searchQueryString = searchQuery ? sortQuery ? `&search=${searchQuery}` : `?search=${searchQuery}` : '';
        navigate(`/${props.mode}${(props.mode === 'goal' || props.mode === 'habit') ? 's' : ''}${sortQueryString}${searchQueryString}`);
    }
    const [queries,setNewQueries] = useState({sortQuery:sortQuery || '',searchQuery:searchQuery || ''});
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
    // Mode selection for small screen
    const [toolbarInputs,setToolbarInputs] = useState({
        searchMode:false,
    });
    const modeHandler = (name:string,value:boolean) => {
        setToolbarInputs((prevState)=>({
            ...prevState,
            [name]:value
        }))
    }
    let sortItems = (!toolbarInputs.searchMode || !isCompact) ? (
        <Box className={`toolbar-sort-wrapper`}>
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
        </Box>
    ) : null;
    let searchItems = (
        <Box className={`toolbar-search-wrapper`}>
            <FormControl className={`toolbar-search`} sx={{width:"calc(min(100%, 33rem))"}} size='small' variant="outlined">
                <InputLabel>Search</InputLabel>
                <OutlinedInput value={queries.searchQuery} onChange={(event)=>{searchQueryHandler(event.target.value)}} label="Search" 
                    endAdornment={
                        <InputAdornment position="end">
                            {queries.searchQuery.length ? <Box className={`toolbar-clear-search-input-wrapper`}>
                                <IoCloseCircleOutline onClick={()=>{searchQueryHandler('')}} className={`icon-interactive opacity-transition toolbar-clear-search-input-icon`}/>
                            </Box> : null}
                        </InputAdornment>
                    }
                />
            </FormControl>
        </Box>
    )
    let searchItemsCompact = (
        <Box className={`toolbar-search-compact-wrapper scale-in`}>
            {toolbarInputs.searchMode ? null :
            <Button onClick={()=>{modeHandler("searchMode",true)}} variant='outlined'><MdSearch className={`toolbar-search-compact-icon opacity-transition`}/></Button>}
            {toolbarInputs.searchMode ? <FormControl className={`toolbar-search-compact`} sx={{width:"calc(min(100%, 33rem))"}} size='small' variant="outlined">
                <InputLabel>Search</InputLabel>
                <OutlinedInput value={queries.searchQuery} onChange={(event)=>{searchQueryHandler(event.target.value)}} label="Search" 
                    endAdornment={
                        <InputAdornment position="end">
                            {queries.searchQuery.length ? <Box className={`toolbar-clear-search-input-wrapper`}>
                                <IoCloseCircleOutline onClick={()=>{searchQueryHandler('')}} className={`icon-interactive opacity-transition toolbar-clear-search-input-icon`}/>
                            </Box> : null}
                        </InputAdornment>
                    }
                />
            </FormControl> : null}
            {toolbarInputs.searchMode ? <Button className={`toolbar-search-compact-return`} onClick={()=>{modeHandler("searchMode",false)}} variant='outlined'>Back</Button> : null}
        </Box>
    )
    let addNewItem = (!toolbarInputs.searchMode || !isCompact) ? (
        <Box className={`toolbar-add-new-item-wrapper`}>
            <Button variant="outlined" onClick={props.addNewItem} className={`toolbar-add-new-item-button`} >
                <MdOutlineAdd  className={`toolbar-add-new-item-button-icon opacity-transition`}/>
                <Typography className={`toolbar-add-new-item-button-text opacity-transition`}>{`New ${props.mode}`}</Typography>
            </Button>
        </Box>
    ) : null;
    return (
        <Box className={`toolbar${isDarkMode?'-dark':''} scale-in`}>
            {sortItems}
            {isCompact ? searchItemsCompact : searchItems}
            {addNewItem}
        </Box>
    )
}

export default Toolbar