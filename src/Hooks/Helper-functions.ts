import { HabitEntryInterface, HabitInterface, ScheduleInterface } from "../Misc/Interfaces";

const getDate = (clientDayStartTime:number,timezoneOffset:number) => {
    const utcDayStartMidDay:number = new Date(clientDayStartTime).setHours(12,0,0,0) + timezoneOffset * - 60000;
    const clientDayStart:Date = new Date(clientDayStartTime);
    const clientNextDayStart:Date = new Date(clientDayStartTime + 86400000);
    return {utcDayStartMidDay,clientDayStart,clientNextDayStart};
}

const getWeekDates = (weekStartTime:number,timezoneOffset:number) => {
    const utcWeekStartMidDay:number = new Date(weekStartTime + timezoneOffset * -60000).setHours(12,0,0,0);
    const utcNextWeekStartMidDay:number = new Date(weekStartTime + timezoneOffset * -60000).setHours(12,0,0,0) + 86400000 * 7;
    const clientWeekStart:Date = new Date(weekStartTime);
    const clientNextWeekStart:Date = new Date(weekStartTime + 86400000 * 7);
    return {utcWeekStartMidDay,utcNextWeekStartMidDay,clientWeekStart,clientNextWeekStart};
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

const determineScheduleAction = (dateNew:string|null, dateOld:string|null):string|null => {
    let scheduleAction = null;
    if (dateNew && !dateOld) {
        scheduleAction = "create";
    } else if (!dateNew && dateOld) {
        scheduleAction = "delete";
    } else if (dateNew && dateOld) {
        scheduleAction = "update";
    }
    return scheduleAction;
}

// Habit Entries generation algorithm | null if no entry , true if placeholder until status change , entry if it exists
const createHabitEntries = (habitItem:HabitInterface,startTime:number,endTime:number,populateBeforeCreationDate:boolean,existingHabitEntries:HabitEntryInterface[]|null) => {
    const timezoneOffset = new Date().getTimezoneOffset();
    const newHabitEntries:{[weekday:number]:HabitEntryInterface|null|boolean} = {1:null,2:null,3:null,4:null,5:null,6:null,0:null};
    const habitId = habitItem._id;
    for (let currentTime = startTime; currentTime < endTime; currentTime += 86400000) {
        const date = new Date(new Date(currentTime).setHours(12,0,0,0) + timezoneOffset * - 60000).toISOString();
        const weekday = new Date(date).getDay();
        const weekStartTime = new Date(date).setHours(0,0,0,0) + 86400000 * (weekday? 1 - weekday : -6);
        let dateCompleted:string|null = null;
        let status = 'Pending';
        // Stop creating entries if selected date is before habit creation week's start
        const habitCreationTime = new Date(habitItem.creationDate).getTime() + habitItem.creationUTCOffset * -60000;
        const habitCreationWeekday = new Date(habitCreationTime).getDay();
        const habitCreationDatesWeekStart = new Date(habitCreationTime).setHours(12,0,0,0) + 86400000 * (habitCreationWeekday ? 1 - habitCreationWeekday : -6);
        if(habitCreationDatesWeekStart > weekStartTime + 86400000 * 7 - 1 && !populateBeforeCreationDate) break;
        // Stop creating entries if target paired goals date has been reached
        if(habitItem.goalTargetDate && new Date(date).getTime() > new Date(habitItem.goalTargetDate).getTime()) break;
        // Check if existing entry status is complete
        if(existingHabitEntries) {
            existingHabitEntries.forEach((entry:HabitEntryInterface)=>{
                if (new Date(entry.date).getDay() === weekday ) {
                    status = entry.status;
                    dateCompleted = entry.dateCompleted;
                }
            })
        }
        if(habitItem.weekdays[weekday]) {
            newHabitEntries[weekday] = true;
            if (populateBeforeCreationDate) {
                const newHabitEntry:HabitEntryInterface = {date,habitId,status,dateCompleted,_id:""};
                newHabitEntries[weekday] = newHabitEntry;
            }
            if (existingHabitEntries && status === "Complete") {
                const newHabitEntry:HabitEntryInterface = {date,habitId,status,dateCompleted,_id:""};
                newHabitEntries[weekday] = newHabitEntry;
            }
        }
    }
    return newHabitEntries;
}

export {getWeekDates,createPairedScheduleItem,determineScheduleAction,createHabitEntries};