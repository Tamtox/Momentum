// Styles
import './Add-new-schedule-item.scss';
//Dependencies
import axios from 'axios';
import {useDispatch,useSelector} from 'react-redux';
import React,{ useRef,useState } from 'react';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";
import { scheduleActions,RootState } from "../../Store/Store";

const AddNewScheduleItem:React.FC<{token:string|undefined,returnToSchedule:()=>{}}> = (props) => {
    const dispatch = useDispatch();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode)
    const [selectedDate, setSelectedDate] = useState(new Date());
    // Set Active weekdays
    const [checkBoxes,setCheckboxes] = useState<{[key:number]:boolean}>({1:false,2:false,3:false,4:false,5:false,6:false,0:false});
    // Add new task to schedule
    const taskNameRef = useRef<HTMLInputElement>(null);
    function addNewScheduleEntry(event:React.FormEvent) {
        event.preventDefault();
        const [taskNameInput,timeInput] = [taskNameRef.current!.value,selectedDate.toLocaleTimeString().slice(0,-3)];
        let activeDays = Object.values(checkBoxes).every(item=>item===false)?{1:true,2:true,3:true,4:true,5:true,6:true,0:true}:checkBoxes;
        const newScheduleTask = {weekdays:activeDays,time:timeInput,title:taskNameInput}
        props.returnToSchedule();
    }
    return (
        <div className={`opacity-transition add-new-schedule-item-backdrop `}>
            <form onSubmit={addNewScheduleEntry} className={`add-new-schedule-item-form ${isDarkMode?'bg-dark':'bg-light'} scale-in`}>
                <Flatpickr
                    className={`add-new-schedule-item-time hover date-picker${isDarkMode?'-dark':''}`}
                    options={{ dateFormat:'H:i',enableTime:true,time_24hr:true,noCalendar:true,disableMobile:true }}
                    value={selectedDate}
                    onChange={date => {setSelectedDate(date[0]);}}
                />
                <input type="text" ref={taskNameRef} className={`add-new-schedule-item-taskname focus input${isDarkMode?'-dark':''}`} placeholder='Task Name' required/>
                <div className={`weekdays-selector${isDarkMode?'-dark':''}`}>
                    <button className={`${checkBoxes[1]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,1:!checkBoxes[1]})}>Mon</button>
                    <button className={`${checkBoxes[2]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,2:!checkBoxes[2]})}>Tue</button>
                    <button className={`${checkBoxes[3]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,3:!checkBoxes[3]})}>Wed</button>
                    <button className={`${checkBoxes[4]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,4:!checkBoxes[4]})}>Thu</button>
                    <button className={`${checkBoxes[5]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,5:!checkBoxes[5]})}>Fri</button>
                    <button className={`${checkBoxes[6]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,6:!checkBoxes[6]})}>Sat</button>
                    <button className={`${checkBoxes[0]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,0:!checkBoxes[0]})}>Sun</button>
                </div>
                <div className="add-new-schedule-item-buttons">
                    <button type='button' className={`return-to-schedule button${isDarkMode?'-dark':''} hover`} onClick={props.returnToSchedule}>Go Back</button>
                    <button type='submit' className={`submit-schedule-task button${isDarkMode?'-dark':''} hover`} >Submit</button>
                </div>
            </form>
        </div>
    )
}


export default AddNewScheduleItem