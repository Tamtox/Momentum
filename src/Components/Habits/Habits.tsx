//Styles
import './Habits.scss';
//Dependencies
import {useSelector,useDispatch} from 'react-redux';
import React,{ useState} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";
//Components
import Loading from '../Misc/Loading';
import AddNewHabit from './Add-new-habit';
import HabitsItem from './Habits-item';
import { habitsActions } from '../../Store/Store';
import type {RootState} from '../../Store/Store';

const Habits:React.FC = () => {
    const token = Cookies.get('token');
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const dispatch = useDispatch();
    const habitList = useSelector<RootState,{title:string,weekdays:{[key:number]:boolean},creationDate:string,targetDate:string,_id:string}[]>(state=>state.habitsSlice.habitList);
    const habitEntries = useSelector<RootState,{title:string,date:string,status:string,_id:string}[]>(state=>state.habitsSlice.habitEntries);
    // States: date,toggle new habit, loader
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [toggleNewHabit,setToggleNewHabit] = useState(false);
    // Toggle habits list or habits completion
    const [isHabitsList,setIsHabitsList] = useState(false)
    // Load habits data
    async function loadHabitsData(date:Date) {
    }
    // Load selected date's data
    function loadSelectedData(date:Date) {
        setSelectedDate(date)
        loadHabitsData(date)
    }
    // Delete habit
    function deleteHabit(habitName:string) {
    }
    // Change habit status
    function changeHabitStatus(date:Date,habitName:string,status:string):any {
    }
    return (
        <section className="habits page">
            <div className="habits-controls">
                <Flatpickr 
                    className={`habits-date-selection hover date-picker${isDarkMode?'-dark':''}`} 
                    options={{dateFormat:'d-m-Y ',enableTime:false,disableMobile:true,maxDate:new Date()}}  
                    value={selectedDate} onChange={date => {loadSelectedData(date[0])}}
                />
                <select className={`habits-view-selection select${isDarkMode?'-dark':''} hover `} name="">
                    <option value="">Sort By</option>
                </select>
                <button className={`add-new-habit hover button${isDarkMode?'-dark':''}`} onClick={()=>setToggleNewHabit(!toggleNewHabit)}>New Habit</button>
            </div>
            {loading?<Loading/>:
            <div className='habits-list'>
                {isHabitsList?
                habitEntries.map((item:any,index)=>{
                    return <HabitsItem key={index} title={item.title} status={item.status} changeStatus={()=>changeHabitStatus(selectedDate,item.title,item.status)} />
                }):
                habitList.map((item:any,index)=>{
                    let activeWeekdays = `${item.weekdays[1]?'Mon,':''}${item.weekdays[2]?'Tue,':''}${item.weekdays[3]?'Wed,':''}${item.weekdays[4]?'Thu,':''}${item.weekdays[5]?'Fri,':''}${item.weekdays[6]?'Sat,':''}${item.weekdays[0]?'Sun,':''}`;
                    return <HabitsItem key={index} title={item.title} weekdays={activeWeekdays} deleteHabit={():any=>deleteHabit(item.title)} />
                })
                }
                <div className='hidden'>123</div>
                <div className='hidden'>123</div>
            </div>
            } 
            {toggleNewHabit && <AddNewHabit token={token} selectedDate={selectedDate.toString()} returnToHabits={():any=>setToggleNewHabit(false)} />}
        </section>
    )
}

export default Habits