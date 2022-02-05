import './Loading.scss';
import React from 'react';
const Loading:React.FC<{height:string}> = (props) => {
    return (
        <div style={{height:props.height}} className='loading'>
            <div className="cssload-container">
            <div className="cssload-speeding-wheel"></div>
            </div>
        </div>
    )
}

export default Loading