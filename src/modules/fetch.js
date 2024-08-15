import {API_URL} from '../configs/server';

const defaultErrorHandler = (error) => {
    console.error('There was an error:', error);
}

export const getFetch = async (url, callback, onError = defaultErrorHandler) => {
    const token = localStorage.getItem('authToken');

    fetch(`${API_URL}${url}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }}) 
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => onError(error));
}

export const deleteFetch = async ({url, body, callback, onError = defaultErrorHandler}) => {
    const token = localStorage.getItem('authToken');
    fetch(`${API_URL}${url}`, {
        method:'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(() =>  callback())
    .catch(error => onError(error));
}