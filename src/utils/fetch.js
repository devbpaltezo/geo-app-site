import axios from 'axios';
import {API_URL, CLIENT_IP_API_URL} from '../configs/server';

const token = localStorage.getItem('authToken');

const defaultErrorHandler = (error) => {
    console.error('There was an error:', error);
}

export const getFetch = async (url, callback, onError = defaultErrorHandler) => {
    fetch(`${API_URL}${url}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }}) 
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => onError(error));
}

export const getClientIP = async (setIpAddress, getGeoInfo) => {
    try {
        const response = await axios.get(`${CLIENT_IP_API_URL}`);
        const ip = response.data.ip;
        setIpAddress(ip);
        getGeoInfo(ip);
    } catch (error) {
        console.error('Error fetching IP address:', error);
    }
}

export const postFetch = async ({
    url, 
    body, 
    auth = false,
    callback, 
    onError = defaultErrorHandler
}) => {

    let headers = {
        'Content-Type': 'application/json',
    }

    if(auth) {
        headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }

    fetch(`${API_URL}${url}`, {
        method:'POST',
        headers: headers,
        body: JSON.stringify(body),
        }) 
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => onError(error));
}

export const deleteFetch = async ({
    url, 
    body, 
    callback, 
    onError = defaultErrorHandler
}) => {
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