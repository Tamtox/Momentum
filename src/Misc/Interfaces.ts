interface UserInterface {
    name:string,
    email:string,
    password:string,
    creationDate:string, /* Date format : new Date */
    lastLogin:string,
    lastOnline:string,
    utcOffset:string,
    emailConfirmationStatus:string,
    verificationCode:string
}   
interface TodoInterface {
    todoTitle:string,
    todoDescription:string,
    todoCreationDate:string,
    todoTargetDate:string | null,
    todoStatus:string,
    dateCompleted:string | null,
    isArchived:boolean,
    creationUTCOffset:string
    _id:string
}

interface GoalInterface {
    goalTitle:string,
    goalCreationDate:string,
    goalTargetDate:string | null,
    goalStatus:string,
    dateCompleted:string,
    habitId:string | null,
    isArchived:boolean,
    creationUTCOffset:string
    _id:string
}

interface HabitEntryInterface {
    date:number /* Date format : .toLocaleString() */
    habitEntryStatus:string,
    dateCompleted:number | null /* Date format : .toIsoString() */
    habitId:string,
    _id:string,
}

interface HabitInterface {
    habitTitle:string,
    habitTime:string | null, /* Date format : .toLocaleTimeString() */
    habitCreationDate:number, /* Date format : .toISOString() */
    habitWeekdays:{[key:number|string]:boolean},
    goalId:string | null,
    goalTargetDate:number | null,
    habitEntries:HabitEntryInterface[]
    isArchived:boolean,
    creationUTCOffset:number
    _id:string,
}

interface NotificationInterface {
    date:string /* Date format : .toIsoString() */
    time:string | null,
    notificationParentId:string, 
    notificationParentTitle:string,
    notificationRead:boolean,
    dateRead:string | null, /* Date format : Date.toString() */
    alarmUsed:boolean,
    utcOffset:string
    _id:string
}


export type {UserInterface,TodoInterface,GoalInterface,HabitEntryInterface,HabitInterface,NotificationInterface}