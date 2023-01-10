import { HabitEntryInterface, HabitInterface, ScheduleInterface, TodoInterface, } from "../Misc/Interfaces";


// Get day start and end of selected day
const getDate = (clientDayStartTime:number,timezoneOffset:number) => {
    const utcDayStartMidDay:number = new Date(clientDayStartTime).setHours(12,0,0,0) + timezoneOffset * - 60000; 
    const utcNextDayMidDay:number = (new Date(clientDayStartTime).setHours(12,0,0,0) + timezoneOffset * - 60000) + 86400000;
    const clientDayStart:Date = new Date(clientDayStartTime);
    const clientNextDayStart:Date = new Date(clientDayStartTime + 86400000);
    return {utcDayStartMidDay,utcNextDayMidDay,clientDayStart,clientNextDayStart};
}

// Get week start and end
const getWeekDates = (clientWeekStartTime:number,timezoneOffset:number) => {
    const utcWeekStartMidDay = new Date(clientWeekStartTime).setHours(12,0,0,0) + timezoneOffset * -60000;
    const utcNextWeekStartMidDay = (new Date(clientWeekStartTime).setHours(12,0,0,0) + timezoneOffset * -60000) + 86400000 * 7;
    const clientWeekStart = new Date(clientWeekStartTime);
    const clientNextWeekStart = new Date(clientWeekStartTime + 86400000 * 7);
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
        utcOffset:creationUTCOffset,
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
    const newHabitEntries:{[weekday:number]:HabitEntryInterface|null} = {1:null,2:null,3:null,4:null,5:null,6:null,0:null};
    const newScheduleEntries:ScheduleInterface[] = [];
    const habitId = habitItem._id;
    for (let currentTime = startTime; currentTime < endTime; currentTime += 86400000) {
        const date = new Date(new Date(currentTime).setHours(12,0,0,0) + timezoneOffset * - 60000).toISOString();
        const weekday = new Date(date).getDay();
        const weekStartTime = new Date(date).setHours(0,0,0,0) + 86400000 * (weekday? 1 - weekday : -6);
        let dateCompleted:string|null = null;
        let status = 'Pending';
        let entryId = "";
        // Stop creating entries if selected date is before habit creation week's start
        const habitCreationTime = new Date(habitItem.creationDate).getTime() + habitItem.creationUTCOffset * -60000;
        const habitCreationWeekday = new Date(habitCreationTime).getDay();
        const habitCreationDatesWeekStart = new Date(habitCreationTime).setHours(12,0,0,0) + 86400000 * (habitCreationWeekday ? 1 - habitCreationWeekday : -6);
        if(habitCreationDatesWeekStart > weekStartTime + 86400000 * 7 - 1 && !populateBeforeCreationDate) break;
        // Stop creating entries if target date has been reached
        if(habitItem.targetDate && new Date(date).getTime() > new Date(habitItem.targetDate).getTime()) break;
        // Check if existing entry status is complete
        if(existingHabitEntries) {
            existingHabitEntries.forEach((entry:HabitEntryInterface)=>{
                if (new Date(entry.date).getDay() === weekday ) {
                    status = entry.status;
                    dateCompleted = entry.dateCompleted;
                    entryId = entry._id;
                }
            })
        }
        if(habitItem.weekdays[weekday]) {
            const newHabitEntry:HabitEntryInterface = {date,habitId,status,dateCompleted,_id:entryId};
            newHabitEntries[weekday] = newHabitEntry;
            const {time,title,_id,alarmUsed,creationUTCOffset,isArchived} = habitItem;
            const newScheduleEntry:ScheduleInterface = {date,time,parentId:_id,parentTitle:title,parentType:"habit",alarmUsed,utcOffset:creationUTCOffset,dateCompleted,status,isArchived,_id:entryId};
            newScheduleEntries.push(newScheduleEntry);
        }
    }
    return {newHabitEntries,newScheduleEntries};
}

// Generate new schedule items for habits
const generateHabitSchedule = (habitList:HabitInterface[],startTime:number,endTime:number,existingSchedule:ScheduleInterface[]) => {
    const timezoneOffset = new Date().getTimezoneOffset();
    const newScheduleItems:ScheduleInterface[] = [];
    for (let currentTime = startTime; currentTime < endTime; currentTime += 86400000) {
        const date = new Date(new Date(currentTime).setHours(12,0,0,0) + timezoneOffset * - 60000);
        habitList.forEach((habitItem:HabitInterface) => {
            // Check if habit has existing schedule entry for selected date
            const habitExists:ScheduleInterface|undefined = existingSchedule.find((item:ScheduleInterface) => item.parentId === habitItem._id);
            // Check if habit weekday is active
            const isWeekday = habitItem.weekdays[new Date(date).getDay()];
            // Check if schedule entry is after habit's creation date
            const habitCreationTime = new Date(habitItem.creationDate).getTime() + habitItem.creationUTCOffset * -60000;
            const habitCreationWeekday = new Date(habitCreationTime).getDay();
            const habitCreationDatesWeekStart = new Date(habitCreationTime).setHours(12,0,0,0) + 86400000 * (habitCreationWeekday ? 1 - habitCreationWeekday : -6);
            const afterCreationDate:boolean = new Date(date).getTime() > habitCreationDatesWeekStart;
            // Check if habit's target date is reached
            const targetDateReached:boolean = habitItem.targetDate ? new Date(date).getTime() > new Date(habitItem.targetDate).getTime() : false;
            if(!habitExists && isWeekday && afterCreationDate && !targetDateReached && !habitItem.isArchived) {
                const newScheduleItem:ScheduleInterface = {
                    date:date.toISOString(),
                    time:habitItem.time,
                    parentId:habitItem._id,
                    parentTitle:habitItem.title,
                    parentType:'habit',
                    status:"Pending",
                    dateCompleted:null,
                    alarmUsed:habitItem.alarmUsed,
                    utcOffset:habitItem.creationUTCOffset,
                    isArchived:false,
                    _id:""
                }
                newScheduleItems.push(newScheduleItem);
            }
        })
    }
    return newScheduleItems;
}

// Alarms generation
const generateAlarmTimes = (habitList:HabitInterface[],startDate:number,endDate:number) => {

}

// Compare todo items to determine if update is necessary
const compareTodo = (newTodo:TodoInterface,oldTodo:TodoInterface):boolean => {
    const keys:string[] = Object.keys(newTodo);
    let result = true;
    for(let key of keys) {
        if(newTodo[key as keyof TodoInterface] !== oldTodo[key as keyof TodoInterface]) {
            result = false;
            break;
        }
    }
    return result;
}

// Compare habit items to determine if update is necessary
const compareHabits = (newHabit:TodoInterface,oldHabit:TodoInterface):boolean => {
    const keys = Object.keys(newHabit);
    let result = true;
    return result
}

// Compare goal items to determine if update is necessary
const compareGoals = (newGoal:TodoInterface,oldGoal:TodoInterface):boolean => {
    const keys = Object.keys(newGoal);
    let result = true;
    return result
}

export {getWeekDates,getDate,createPairedScheduleItem,determineScheduleAction,createHabitEntries,generateHabitSchedule};
