//Styles
import './App.scss';
//Dependencies
import {useSelector} from 'react-redux';
import React,{Suspense,useEffect} from 'react';
import {Route, Routes} from 'react-router-dom';
import {RootState} from './Store/Store';
import { CssBaseline,ThemeProvider,createTheme,Box } from '@mui/material';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { authActions } from './Store/Store';
//Components
import Navbar from './Components/UI/Navbar';
import Loading from './Components/Misc/Loading';
import useMiscHooks from './Hooks/useMiscHooks';

// const Home = React.lazy(()=> import('./Components/Misc/Home'));
const Auth = React.lazy(()=> import('./Components/Auth/Auth'));
const Profile = React.lazy(()=> import('./Components/Auth/Profile'));
const Todo = React.lazy(()=> import('./Components/Todo/Todo'));
const Journal = React.lazy(()=> import('./Components/Journal/Journal'));
const Habits = React.lazy(()=> import('./Components/Habits/Habits'));
const Goals = React.lazy(()=> import('./Components/Goals/Goals'));
const Archive = React.lazy(()=> import('./Components/Misc/Archive'));

const App:React.FC = () => {
  const miscHooks = useMiscHooks();
  const token = Cookies.get('token');
  const dispatch = useDispatch();
  const isLoggedIn:boolean = !!useSelector<RootState>(state=>state.authSlice.token);
  const verificationStatus = useSelector<RootState,string>(state=>state.authSlice.user.emailConfirmationStatus);
  const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
  // MUI Styles Ovveride
  const theme =  createTheme({
    components: { 
      MuiContainer: {
        styleOverrides: {
          root:{
            paddingLeft:'5px',
            paddingRight:'5px',
          }
        }
      },
      MuiTypography: {
        styleOverrides: {
          root:{
            lineHeight: "1",
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root:{
            boxShadow: "0px 1px 3px black",
            lineHeight: "1",
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root:{
            fontSize: '1rem',
            width:'calc(min(100%, 100%))',
            height:'36px',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: '1rem',
            width:'calc(min(100%, 150px))',
            height:'40px',
            lineHeight: "1",
            textTransform: 'none',
          },
        },
      },
    },
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
  useEffect(()=>{
    if (token) {
      miscHooks.preloadData();
    } else { 
        dispatch(authActions.logout())
    }
  },[])
  return (
    <ThemeProvider theme={theme}>
      <Box className={`app`} sx={{color:'text.primary',display:'flex',justifyContent:'center',alignItems:'center'}}>
        <CssBaseline/>
        <Navbar />
        <Suspense fallback={<Loading height='100vh'/>}>
            <Routes>
              <Route path='/' element={isLoggedIn ? (verificationStatus === "Complete" ? <Todo/> : <Profile/>) : <Auth/>} />
              <Route path='/auth' element={isLoggedIn ? (verificationStatus === "Complete" ? <Todo/> : <Profile/>) : <Auth/>} />
              <Route path='/profile' element={isLoggedIn ? <Profile/> : <Auth/>} />
              <Route path='/todo' element={isLoggedIn ? (verificationStatus === "Complete" ? <Todo/> : <Profile/>) : <Auth />} />
              <Route path='/journal' element={isLoggedIn ? (verificationStatus === "Complete" ? <Journal/> : <Profile/>) : <Auth/>} />
              <Route path='/habits' element={isLoggedIn ? (verificationStatus === "Complete" ? <Habits/> : <Profile/>) : <Auth/>} />
              <Route path='/goals' element={isLoggedIn ? (verificationStatus === "Complete" ? <Goals/> : <Profile/>) : <Auth/>} />
              <Route path='/archive' element={isLoggedIn ? (verificationStatus === "Complete" ? <Archive/> : <Profile/>) : <Auth/>} />
            </Routes>
        </Suspense>
      </Box>
    </ThemeProvider>
  );
}

export default App;
