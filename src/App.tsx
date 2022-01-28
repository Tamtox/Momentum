//Styles
import './App.scss';
//Dependencies
import {useSelector,useDispatch} from 'react-redux';
import React,{ Suspense} from 'react';
import {Route, Routes} from 'react-router-dom';
import type {RootState} from './Store/Store';
import Cookies from 'js-cookie';
import { CssBaseline,ThemeProvider,createTheme,Container,Box } from '@mui/material';
//Components
import useLoadData from './Hooks/useLoadData';
import Navbar from './Components/UI/Navbar';
import Loading from './Components/Misc/Loading';
const Auth = React.lazy(()=> import('./Components/Auth/Auth'));
const Profile = React.lazy(()=> import('./Components/Auth/Profile'));
const Todo = React.lazy(()=> import('./Components/Todo/Todo'));
const Journal = React.lazy(()=> import('./Components/Journal/Journal'));
const Habits = React.lazy(()=> import('./Components/Habits/Habits'));

const App:React.FC = () => {
  const token = Cookies.get('token');
  const dispatch = useDispatch()
  const isLoggedIn:boolean = !!useSelector<RootState>(state=>state.authSlice.token);
  const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode)
  // useLoadData(['todo'])
  // Light/ Dare themes
  const theme =  createTheme({
    palette:{
        mode: isDarkMode ? 'dark' : 'light',
        // primary:{
        //     light: "#757ce8",
        //     main: "#3f50b5",
        //     dark: "#002884",
        //     contrastText: "#fff",
        // },
        // secondary: {
        //     light: "#ff7961",
        //     main: "#f44336",
        //     dark: "#ba000d",
        //     contrastText: "#000"
        // }
    }
})
  return (
    <ThemeProvider theme={theme}>
      <Box id='app' className={`App ${isDarkMode?"bg-dark":"bg-light"}`} sx={{color: 'text.primary',display:'flex',justifyContent:'center',alignItems:'center'}}>
        <CssBaseline/>
        <Navbar/>
        <Suspense fallback={<Loading/>}>
            <Routes>
              <Route path='/' element={<Profile/>} />
              <Route path='/auth' element={isLoggedIn?<Todo/>:<Auth/>} />
              <Route path='/profile' element={isLoggedIn?<Profile/>:<Auth/>} />
              <Route path='/todo' element={isLoggedIn?<Todo/>:<Auth />} />
              <Route path='/journal' element={isLoggedIn?<Journal/>:<Auth/>} />
              <Route path='/habits' element={isLoggedIn?<Habits/>:<Auth/>} />
            </Routes>
        </Suspense>
      </Box>
    </ThemeProvider>
  );
}

export default App;
