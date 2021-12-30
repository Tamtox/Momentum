//Styles
import './App.scss';
//Dependencies
import {useSelector,useDispatch} from 'react-redux';
import React,{ Suspense} from 'react';
import {Route, Routes} from 'react-router-dom';
import type {RootState} from './Store/Store';
import Cookies from 'js-cookie';
//Components
import useLoadData from './Hooks/useLoadData';
import Navbar from './Components/UI/Navbar';
import Loading from './Components/Misc/Loading';
const Auth = React.lazy(()=> import('./Components/Auth/Auth-page'));
const Todo = React.lazy(()=> import('./Components/Todo/Todo'));
const DetailedTodo = React.lazy(()=> import('./Components/Todo/Detailed-todo'));
const AddNewTodo = React.lazy(()=> import('./Components/Todo/Add-new-todo'));
const Journal = React.lazy(()=> import('./Components/Journal/Journal'));
const Schedule = React.lazy(()=> import('./Components/Schedule/Schedule'));
const Habits = React.lazy(()=> import('./Components/Habits/Habits'));

const App:React.FC = () => {
  const token = Cookies.get('token');
  const dispatch = useDispatch()
  const isLoggedIn:boolean = !!useSelector<RootState>(state=>state.authSlice.token);
  const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode)
  useLoadData(['todo'])
  return (
    <div id='app' className={`App ${isDarkMode?"bg-dark":"bg-light"}`}>
      <Navbar/>
      <Suspense fallback={<Loading/>}>
          <Routes>
            <Route path='/' element={<Todo/>} />2
            <Route path='/auth' element={isLoggedIn?<Todo/>:<Auth/>} />
            <Route path='/todo' element={isLoggedIn?<Todo/>:<Auth />} />
            <Route path='/todo/:id' element={isLoggedIn?<DetailedTodo/>:<Auth/>} />
            <Route path='/add-new-todo' element={isLoggedIn?<AddNewTodo/>:<Auth/>} />
            <Route path='/journal' element={isLoggedIn?<Journal/>:<Auth/>} />
            <Route path='/schedule' element={isLoggedIn?<Schedule/>:<Auth/>} />
            <Route path='/habits' element={isLoggedIn?<Habits/>:<Auth/>} />
          </Routes>
      </Suspense>
    </div>
  );
}

export default App;
