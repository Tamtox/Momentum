import { ScheduleInterface } from "../Misc/Interfaces";
const getDate = (clientDayStartTime:number,timezoneOffset:number) => {
    const utcDayStartMidDay:number = new Date(clientDayStartTime).setHours(12,0,0,0) + timezoneOffset * - 60000;
    const clientDayStart:Date = new Date(clientDayStartTime);
    const clientNextDayStart:Date = new Date(clientDayStartTime + 86400000);
    return {utcDayStartMidDay,clientDayStart,clientNextDayStart};
}

const createPairedScheduleItem = async (time:string|null,targetDate:string,parentTitle:string,parentType:string,parentId:string,alarmUsed:boolean,creationUTCOffset:number,scheduleId:string) => {
    const {utcDayStartMidDay} = getDate(new Date(targetDate).getTime(),creationUTCOffset);
    let scheduleItem:ScheduleInterface = {
        date:new Date(utcDayStartMidDay).toISOString(),
        time:time,
        parentId:parentId,
        parentTitle:parentTitle,
        parentType:parentType,
        status:"Pending",
        dateCompleted:null,
        alarmUsed:alarmUsed,
        utcOffset:`${creationUTCOffset}`,
        isArchived:false,
        _id:scheduleId
    }
    return scheduleItem;
};

export {createPairedScheduleItem};