import React from 'react';

const ListItem = ({ entry, isSelected, onSelect, onClick }) => {
    return (
        <li className="history-item" onClick={onClick}>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="history-checkbox"
            />
            {entry.ip} - {entry.location}
        </li>
    );
};

export default ListItem;
