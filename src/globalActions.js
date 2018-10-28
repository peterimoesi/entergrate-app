import axios from 'axios';
import history from './routes/history';

export function logout() {
    return dispatch =>
        axios
            .post('/api/users/logout')
            .then(() => {
                dispatch({
                    type: 'USER_LOGOUT'
                });
                localStorage.removeItem('userCredentials');
                history.push('/login');
            })
            .catch(e => {
                console.log(e);
                // remove item still even if api error
                dispatch({
                    type: 'USER_LOGOUT'
                });
                localStorage.removeItem('userCredentials');
                history.push('/login');
            });
}

export function showNotice(message) {
    // hide notification after 3 seconds
    return dispatch => {
        setTimeout(() => dispatch(hideNotice()), 3000);
        dispatch({
            type: 'SHOW_NOTICE',
            message
        });
    };
}

export function hideNotice() {
    return {
        type: 'HIDE_NOTICE'
    };
}