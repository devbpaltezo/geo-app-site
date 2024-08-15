import React, { useState, useEffect } from 'react';
import { deleteFetch, getFetch, getClientIP } from '../../utils/fetch';

import './css/index.css';

import ListItem from './components/ListItem';
import Map from './components/Map';

const Home = () => {

    const [localGeoInfo, setLocalGeoInfo] = useState(null);
    const [geoInfo, setGeoInfo] = useState(null);
    const [ipAddress, setIpAddress] = useState('');
    const [history, setHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState([]);
    const [mapCenter, setMapCenter] = useState([51.505, -0.09]);

    useEffect(() => {
        // Fetch the client's IP address
        getClientIP(setIpAddress, getGeoInfo);
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
        window.location.href = '/login';
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
                            <Map center={mapCenter} geoInfo={geoInfo} />
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
                                    <ListItem
                                        key={entry.id}
                                        entry={entry}
                                        isSelected={selectedHistory.includes(entry.id)}
                                        onSelect={() => handleCheckboxChange(entry.id)}
                                        onClick={() => handleSelectLocation(entry)}
                                    />
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
