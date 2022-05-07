interface TodoInterface {
    todoTitle:string,
    todoDescription:string,
    todoCreationDate:string,
    todoTargetDate:string | null,
    todoStatus:string,
    dateCompleted:string,
    isArchived:boolean,
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
    _id:string
}

interface HabitEntryInterface {
    weekStart:string,  /* Date format : "day/month/year" */
    weekEnd:string, /* Date format : "day/month/year" */
    habitId:string,
    year:string, /* Date format : .getFullYear() */
    month:string, /* Date format : .getMonth() + 1 */
    date:string, /* Date format : .getDate() */
    weekday:string,
    habitEntryStatus:string,
    dateCompleted:string,
    _id:string,
}

interface HabitInterface {
    habitTitle:string,
    habitTime:string | null,
    habitCreationDate:string, /* Date format : Date.toString() */
    habitWeekdays:{[key:number|string]:boolean},
    goalId:string | null,
    goalTargetDate:string | null,
    habitEntries:HabitEntryInterface[]
    isArchived:boolean,
    _id:string,
}


export type {TodoInterface,GoalInterface,HabitEntryInterface,HabitInterface}