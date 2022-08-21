import {configureStore} from '@reduxjs/toolkit';
import authSlice from './Auth-slice';
import todoSlice from './Todo-slice';
import habitsSlice from './Habits-slice';
import journalSlice from './Journal-slice';
import goalSlice from './Goal-slice';
import scheduleSlice from './Schedule-slice';

const store = configureStore({
    reducer: {
        authSlice:authSlice.reducer,
        todoSlice:todoSlice.reducer,
        habitsSlice:habitsSlice.reducer,
        journalSlice:journalSlice.reducer,
        goalSlice:goalSlice.reducer,
        scheduleSlice:scheduleSlice.reducer
    }
});

export const authActions = authSlice.actions
export const todoActions = todoSlice.actions
export const habitsActions = habitsSlice.actions
export const journalActions = journalSlice.actions
export const goalActions = goalSlice.actions
export const scheduleActions = scheduleSlice.actions
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store