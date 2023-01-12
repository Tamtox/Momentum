interface UserInterface {
    name:string,
    email:string,
    password:string,
    creationDate:string, /* Date format : .toIsoString() */
    lastLogin:string, /* Date format : .toIsoString() */
    lastOnline:string, /* Date format : .toIsoString() */
    utcOffset:number, 
    emailConfirmationStatus:string,
    verificationCode:string
}   

interface JournalEntryInterface {
    journalEntry:string,
    date:string, /* Date format : Date.toISOString() */
    dateCreated:string, /* Date format : Date.toISOString() */
    dateEdited:string, /* Date format : Date.toISOString() */
    _id:string
}

interface TodoInterface {
    title:string,
    description:string,
    creationDate:string, /* Date format : .toIsoString() */
    targetDate:string | null, /* Date format : .toIsoString() */
    targetTime:string | null, /* Date format : .toLocaleTimeString() */
    status:string,
    dateCompleted:string | null, /* Date format : .toIsoString() */
    isArchived:boolean,
    creationUTCOffset:number,
    alarmUsed:boolean,
    _id:string
}

interface GoalInterface {
    title:string,
    creationDate:string, /* Date format : .toIsoString() */
    targetDate:string | null, /* Date format : .toIsoString() */
    status:string,
    dateCompleted:string | null, /* Date format : .toIsoString() */
    isArchived:boolean,
    creationUTCOffset:number,
    alarmUsed:boolean,
    _id:string
}

interface HabitEntryInterface {
    date:string /* Date format : .toIsoString() */
    status:string,
    dateCompleted:string | null /* Date format : .toIsoString() */
    habitId:string,
    _id:string,
}

interface HabitInterface {
    title:string,
    time:string | null, /* Date format : .toLocaleTimeString() */
    creationDate:string, /* Date format : .toIsoString() */
    weekdays:{[weekday:number]:boolean},
    targetDate:string | null, /* Date format : .toIsoString() */
    isArchived:boolean,
    creationUTCOffset:number,
    alarmUsed:boolean,
    _id:string,
    entries:{[weekday:number]:HabitEntryInterface|null},
}

interface ScheduleInterface {
    date:string /* Date format : .toLocaleString() */
    time:string|null,
    parentId:string, 
    parentTitle:string,
    parentType:string,
    status:string,
    dateCompleted:string | null,
    alarmUsed:boolean,
    utcOffset:number,
    isArchived:boolean,
    _id:string
}


export type {UserInterface,JournalEntryInterface,TodoInterface,GoalInterface,HabitEntryInterface,HabitInterface,ScheduleInterface}