//Styles
import './NotFound.scss'
// Dependencies
import { Icon } from '@iconify/react';

function NotFound() {
    return (
        <section className='not-found'>
            <h1>Page Not Found</h1>
            <Icon className="not-found-icon" icon="akar-icons:face-sad" />
        </section>
    )
}

export default NotFound