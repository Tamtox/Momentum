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
interface TodoInterface {
    title:string,
    description:string,
    creationDate:string, /* Date format : .toIsoString() */
    targetDate:string | null, /* Date format : .toIsoString() */
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
    dateCompleted:string, /* Date format : .toIsoString() */
    habitId:string | null,
    isArchived:boolean,
    creationUTCOffset:number,
    alarmUsed:boolean,
    _id:string
}

interface HabitEntryInterface {
    date:string /* Date format : .toIsoString() */
    habitEntryStatus:string,
    dateCompleted:string | null /* Date format : .toIsoString() */
    habitId:string,
    _id:string,
}

interface HabitInterface {
    title:string,
    time:string | null, /* Date format : .toLocaleTimeString() */
    creationDate:string, /* Date format : .toIsoString() */
    weekdays:{[key:number|string]:boolean},
    goalId:string | null,
    goalTargetDate:string | null, /* Date format : .toIsoString() */
    entries:HabitEntryInterface[]
    isArchived:boolean,
    creationUTCOffset:number,
    alarmUsed:boolean,
    _id:string,
}

interface NotificationInterface {
    date:string /* Date format : .toIsoString() */
    notificationParentId:string, 
    notificationParentTitle:string,
    dateCompleted:string | null, /* Date format : .toIsoString() */
    alarmUsed:boolean,
    utcOffset:string
    _id:string
}


export type {UserInterface,TodoInterface,GoalInterface,HabitEntryInterface,HabitInterface,NotificationInterface}