import axios from 'axios';

export function getEvents (userId) {
    return dispatch => axios.get(`${global.apiUrl}/api/event/user/${userId}`)
        .then(response => {
            if (response.status === 200) {
                dispatch({
                    type : 'GET_EVENTS',
                    data : response.data
                });
                return true;
            }
        }).catch(error => {
            console.log(error);
            return false;
        });
}


export function submit(eventData, userId) {
    return dispatch => axios.post(`${global.apiUrl}/api/event`, { ...eventData, owner : userId })
        .then(eventRes => {
            dispatch({
                type : 'ADD_EVENT',
                data : eventRes.data
            });
            return 200;
        })
        .catch(e => console.log(e));
}