import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
// import './MQTTPage.css'; 

// Connect to the backend Socket.io server
const socket = io('http://localhost:5000'); 

function MQTTPage() {
  const { id } = useParams(); // Booster fan ID
  const [data, setData] = useState('Waiting for data...');

  useEffect(() => {
    // Listen for MQTT data from the backend
    socket.on('mqttData', (message) => {
      setData(message); // Update state with received data
    });

    return () => {
      socket.off('mqttData'); // Clean up the listener on component unmount
    };
  }, []);

  return (
    <div className="mqtt-page">
      <h1>MQTT Data for Booster Fan {id}</h1>
      <p><strong>Received:</strong> {data}</p>
    </div>
  );
}

export default MQTTPage;
