import './Schedule.scss';
// Components
import ScheduleItem from './Schedule-item';
import Loading from '../Misc/Loading';
import type {RootState} from '../../Store/Store';
import AddNewScheduleItem from './Add-new-schedule-item';
//Dependencies
import {useSelector,useDispatch} from 'react-redux';
import { useState,useEffect} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import React from "react";

// Sort and filter array based on time and active weekdays
function sortAndFilter(arr:any[],weekday:string) {
    return arr.sort((item1,item2)=> {
        return +item1.time.replace(':','') - +item2.time.replace(':','')
    }).filter(item=>{
        return item.weekdays[weekday] === true
    })
}

const Schedule:React.FC = () => {
    const token = Cookies.get('token');
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode)
    const dispatch = useDispatch();
    const [loading,setLoading] = useState(false);
    const schedule:object = useSelector<RootState,object>(state=>state.scheduleSlice.schedule);
    const [weekday,setWeekDay] = useState(new Date().getDay()+'')
    // Toggle Add new Schedule task form
    const [toggleAddNew, setToggleAddNew] = useState(false);
    // Fetch schedule data from server
    function fetchScheduleData():any {
        console.log(123)
    }
    // Delete schedule task
    function deleteScheduleTask(taskname:string):any {
        console.log(taskname)
    }
    // Sort tasks by time and filter by active weekdays
    const scheduleArr = schedule ===null?[null]:sortAndFilter(Object.values(schedule),weekday);
    return (
        <section className='schedule page'>
            <div className='schedule-controls'>
                <select onChange={(event)=>setWeekDay(event.target.value+'')} className={`select-day hover box-shadow border-radius button${isDarkMode?'-dark':''}`} defaultValue={weekday}>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                </select>
                <button onClick={()=>setToggleAddNew(!toggleAddNew)} className={`add-new-schedule-entry hover button${isDarkMode?'-dark':''}`}>New Task</button>
            </div>
            {loading?<Loading/>:
                <div className='schedule-list'>
                    {scheduleArr.map((item,index)=>{
                        if(item === null) {
                            return null
                        }
                        return (
                            <ScheduleItem key={index} title={item.title} time={item.time} delete={()=>deleteScheduleTask(item.title)} />
                        )
                    })}
                    <div className='hidden'>123</div>
                </div>}
            {toggleAddNew && <AddNewScheduleItem token={token} returnToSchedule={():any=>setToggleAddNew(false)}/>}
        </section>
    )
}

export default Schedule