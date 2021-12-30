//Styles
import './Habits-item.scss';
//Dependencies
import React from 'react';
import { Icon } from '@iconify/react';

const HabitsItem:React.FC<{title:string,weekdays?:string,status?:string,deleteHabit?:()=>{},changeStatus?:()=>{}} >= (props) =>  {
    return (
        <React.Fragment>
            {props.weekdays === undefined?
            <div className='habits-item fade-in border-radius'>
                <p className='habits-item-title'>{props.title}</p>
                <Icon className={`${props.status === 'Pending'?'habits-item-pending-icon':'habits-item-complete-icon'} hover-filter`} onClick={props.changeStatus} icon={`${props.status === 'Pending'?"akar-icons:circle":"akar-icons:circle-check"}`}/>
            </div>:
            <div className='habits-list-item fade-in border-radius'>
                <p className='habits-list-item-title'>{props.title}</p>
                <p className='habits-list-item-weekdays'>{props.weekdays[props.weekdays.length-1]===','?props.weekdays.slice(0,-1):props.weekdays}</p>
                <Icon className='delete-habit-icon hover-filter' onClick={props.deleteHabit} icon="clarity:trash-line" />
            </div>
            }
        </React.Fragment>
    )
}

export default HabitsItem