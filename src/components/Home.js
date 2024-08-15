import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { deleteFetch, getFetch } from '../modules/fetch';
import './styles/Home.css';

// Fix marker icon issue with leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Home = () => {

    const [localGeoInfo, setLocalGeoInfo] = useState(null);
    const [geoInfo, setGeoInfo] = useState(null);
    const [ipAddress, setIpAddress] = useState('');
    const [history, setHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState([]);
    const [mapCenter, setMapCenter] = useState([51.505, -0.09]);

    useEffect(() => {
        // Fetch the client's IP address
        axios.get('https://api.ipify.org?format=json')
            .then(response => {
                const ip = response.data.ip;
                setIpAddress(ip);
                getGeoInfo(ip);
            })
            .catch(error => console.error('Error fetching IP address:', error));

        fetchSearchHistory();
    }, []);

    const fetchSearchHistory = () => {
        getFetch('/history', (data) => {
            setHistory(data)
        }, (error) => {
            console.error('Error fetching search history:', error)
        });
    };

    const getGeoInfo = (ip) => {
        // Implement your function to get geo info based on the IP address
        getFetch(`/geo/${ip}`, (data) => {

            setGeoInfo(data);
            setLocalGeoInfo(data);

            // Update map center based on the geo information
            const [lat, lon] = data.coordinates.split(',');
            setMapCenter([parseFloat(lat), parseFloat(lon)]);

        });
    };

    const handleSearch = () => {

        getFetch(`/geo/search/${ipAddress}`, (data) => {
            console.log(data)
            handleSelectLocation(data);
            // Add to search history
            fetchSearchHistory();
        }, (error) => {
            console.error('Error fetching IP geo info:', error)
        });

    };

    const handleSelectLocation = (data) => {
        if (data.coordinates) {
            const [lat, lon] = data.coordinates?.split(',');
            setMapCenter([parseFloat(lat), parseFloat(lon)]);
        }
        setGeoInfo(data)
    }

    const handleCheckboxChange = (id) => {
        setSelectedHistory(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        );
    };

    const deleteSelectedHistory = () => {

        deleteFetch({
            url: '/history',
            body: {
                historyIds: selectedHistory
            },
            callback: () => {
                // After deletion, refetch the search history
                fetchSearchHistory();
                // Clear the selected history
                setSelectedHistory([]);
            },
            onError: (error) => {
                console.error('Error deleting search history:', error);
            }
        })

    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        history.push('/login');
    };

    return (
        <div className="home-container">
            <div className="header">
                <h2>Geolocation App</h2>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
            <div className="main-content">
                {geoInfo && (
                    <div className="geo-info">
                        <p><strong>IP:</strong> {geoInfo.ip || "Invalid IP Address"}</p>
                        <p><strong>Location:</strong> {geoInfo.location || "Unknown"}</p>
                    </div>
                )}

                <div className="grid-container">
                    <div className="map-section">
                        <div className="search-section">
                            <input
                                type="text"
                                value={ipAddress}
                                onChange={(e) => setIpAddress(e.target.value)}
                                placeholder="Enter IP Address"
                                className="ip-input"
                            />
                            <button onClick={handleSearch} className="search-button">
                                Search
                            </button>
                        </div>
                        {geoInfo && (
                            <MapContainer center={mapCenter} zoom={2} style={{ height: '400px', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={mapCenter}>
                                    <Popup>
                                        {geoInfo.location}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        )}
                    </div>
                    <div className="history-section">
                        <h2>Search History</h2>
                        <div className="history-dropdown">
                            <button onClick={deleteSelectedHistory} disabled={selectedHistory.length === 0} className="delete-button">
                                Delete Selected
                            </button>
                            <ul className="history-list">
                                {localGeoInfo &&
                                    <li className="history-item" onClick={() => handleSelectLocation(localGeoInfo)}>
                                        <input
                                            type="checkbox"
                                            checked={false}
                                            readOnly={true}
                                            disabled={true}
                                            className="history-checkbox"
                                        />
                                        {localGeoInfo.ip} - {localGeoInfo.location} <small>(Your location)</small>
                                    </li>}
                                {history.length > 0 && history.map((entry) => (
                                    <li key={entry.id} className="history-item" onClick={() => handleSelectLocation(entry)}>
                                        <input
                                            type="checkbox"
                                            checked={selectedHistory.includes(entry.id)}
                                            onChange={() => handleCheckboxChange(entry.id)}
                                            className="history-checkbox"
                                        />
                                        {entry.ip} - {entry.location}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
