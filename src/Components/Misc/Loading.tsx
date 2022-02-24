import './Loading.scss';
import React from 'react';
import { useSelector } from 'react-redux';
import type {RootState} from '../../Store/Store';

const Loading:React.FC<{height:string}> = (props) => {
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    return (
        <div style={{height:props.height}} className='loading'>
            <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
    )
}

export default Loading