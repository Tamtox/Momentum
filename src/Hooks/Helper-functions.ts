import { ScheduleInterface } from "../Misc/Interfaces";
const getDate = (clientDayStartTime:number,timezoneOffset:number) => {
    const utcDayStartMidDay:number = new Date(clientDayStartTime + timezoneOffset * - 60000).setHours(12,0,0,0);
    const clientDayStart:Date = new Date(clientDayStartTime);
    const clientNextDayStart:Date = new Date(clientDayStartTime + 86400000);
    return {utcDayStartMidDay,clientDayStart,clientNextDayStart};
}

const createPairedScheduleItem = async (time:string|null,targetDate:string,parentTitle:string,parentType:string,parentId:string,alarmUsed:boolean,creationUTCOffset:number,_id:string) => {
    const {utcDayStartMidDay} = getDate(new Date(targetDate).getTime(),creationUTCOffset);
    let scheduleItem:ScheduleInterface = {
        date:new Date(utcDayStartMidDay),
        time:time,
        parentId:parentId,
        parentTitle:parentTitle,
        parentType:parentType,
        status:"Pending",
        dateCompleted:null,
        alarmUsed:alarmUsed,
        utcOffset:`${creationUTCOffset}`,
        isArchived:false,
        _id:_id
    }
    return scheduleItem;
};

export {createPairedScheduleItem};