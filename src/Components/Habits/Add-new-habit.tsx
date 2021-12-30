// Styles
import './Add-new-habit.scss';
//Dependencies
import axios from 'axios';
import {useDispatch} from 'react-redux';
import React,{ useRef,useState } from 'react';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";
import { habitsActions } from "../../Store/Store";

const AddNewHabit:React.FC<{token:string|undefined,selectedDate:string,returnToHabits:()=>{}}> = (props) => {
    const dispatch = useDispatch();
    // Set Active weekdays
    const [checkBoxes,setCheckboxes] = useState<{[key:number]:boolean}>({1:false,2:false,3:false,4:false,5:false,6:false,0:false});
    // Add new task to schedule
    const taskNameRef = useRef<HTMLInputElement>(null);
    function addNewHabit(event:React.FormEvent) {
        event.preventDefault();
        const taskNameInput = taskNameRef.current!.value;
        let activeDays = Object.values(checkBoxes).every(item=>item===false)?{1:true,2:true,3:true,4:true,5:true,6:true,0:true}:checkBoxes;
        const newHabit = {weekdays:activeDays,title:taskNameInput}
        props.returnToHabits();
    }
    return (
        <div className='opacity-transition add-new-habit-backdrop'>
            <form onSubmit={addNewHabit} className='add-new-habit-form scale-in'>
                <input type="text" ref={taskNameRef} className="add-new-habit-taskname focus" placeholder='Habit Name' required/>
                <div className="weekdays-selector">
                    <button className={`${checkBoxes[1]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,1:!checkBoxes[1]})}>Mon</button>
                    <button className={`${checkBoxes[2]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,2:!checkBoxes[2]})}>Tue</button>
                    <button className={`${checkBoxes[3]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,3:!checkBoxes[3]})}>Wed</button>
                    <button className={`${checkBoxes[4]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,4:!checkBoxes[4]})}>Thu</button>
                    <button className={`${checkBoxes[5]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,5:!checkBoxes[5]})}>Fri</button>
                    <button className={`${checkBoxes[6]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,6:!checkBoxes[6]})}>Sat</button>
                    <button className={`${checkBoxes[0]&&'selector-on'}`} type='button' onClick={()=>setCheckboxes({...checkBoxes,0:!checkBoxes[0]})}>Sun</button>
                </div>
                <div className="add-new-habit-buttons">
                    <button type='button' className='return-to-habits button hover' onClick={props.returnToHabits}>Go Back</button>
                    <button type='submit' className='submit-habit button hover' >Submit</button>
                </div>
            </form>
        </div>
    )
}


export default AddNewHabit