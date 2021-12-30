//Styles
import './Schedule-item.scss';
//Dependencies
import React from 'react';
import { Icon } from '@iconify/react';

const ScheduleItem:React.FC<{title:string,time:string,delete:()=>{}} >= (props) =>  {
    
    return (
        <div className='scheduleItem fade-in'>
            <p className='scheduleItemTitle'>{props.title}</p>
            <p className='scheduleItemTime'>{props.time}</p>
            <div className='deleteScheduleItem'>
                <Icon className='deleteScheduleItemIcon hoverFilter' onClick={props.delete} icon="clarity:trash-line" />
            </div>
        </div>
    )
}

export default ScheduleItem