//Styles
import './Auth-page.scss';
//Dependencies
import { useSelector } from 'react-redux';
import React,{ useRef,useState,} from 'react';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import { authActions } from '../../Store/Store';
//Components
import LoadingHorizontal from '../Misc/Loading-horizontal';
import { RootState } from '../../Store/Store';

function Auth() {
    const dispatch = useDispatch();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    // Toggle sign in/sign up
    const [login, setLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [emailRef,userNameRef,passwordRef,repeatRef] = [useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null)];
    const authFormSubmit = async (event:React.FormEvent) => {
        event.preventDefault();
        // Check if necessary inputs are filled 
        const [emailInput,passwordInput] = [emailRef!.current!.value,passwordRef!.current!.value];
        // Check if passwors match
        if(!login) {
            if(passwordInput !== repeatRef?.current?.value) {
                alert('Passwords do not match!')
                return
            }
        } 
        setLoading(true);
        try {
            const authData = await axios.request({
                method:'POST',
                url:`http://localhost:3001/users/${login?'login':'signup'}`,
                data:{email:emailInput,password:passwordInput,name:userNameRef?.current?.value,creationDate:new Date().toString()},
            })
            dispatch(authActions.login(authData.data))
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(`${error.response!.status} ${error.response!.data}`);
            } else {
                console.log(error);
            }
        }
        setLoading(false);
    }
    return (
        <section className='auth page'>
            <div className={`auth-card box-shadow scale-in nav-${isDarkMode?'dark':'light'}`}>
                <h2 className='auth-title'>{login?'Sign In':'Sign Up'}</h2>
                <form action="" className={`auth-form ${login?'login':'signup'}`} onSubmit={authFormSubmit}>
                    <input type="email" className='authInput focus box-shadow scale-in'  ref={emailRef} placeholder='Email' required/>
                    {!login&& <input type="text" className='authInput focus box-shadow scale-in'  ref={userNameRef} placeholder='Username' required/>}
                    <input type="password" className='authInput focus box-shadow scale-in'  ref={passwordRef} placeholder='Password' required/>
                    {!login&& <input type="password"  className='authInput focus box-shadow scale-in'  ref={repeatRef} placeholder='Repeat Password' required/>}
                    {loading?<LoadingHorizontal />:<button className='auth-button hover button'>{login?'Sign In':'Sign Up'}</button>}
                </form>
                <button  className='auth-switch hover-filter' onClick={()=>setLogin(!login)}>{login?"Don't have an account?":'Use existing account'}</button>
            </div>
        </section>
    )
}

export default Auth