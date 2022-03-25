//Styles
import './NotFound.scss'
// Dependencies
import {IoSadOutline} from 'react-icons/io5';

function NotFound() {
    return (
        <section className='not-found'>
            <h1>Page Not Found</h1>
            <IoSadOutline className="not-found-icon" />
        </section>
    )
}

export default NotFound