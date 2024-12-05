import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from '../src/pages/Login';
import Homepage from '../src/pages/Homepage';
import MQTTPage from '../src/pages/MQTTPage';
import './App.css';


function App() {
  return (
    <Router>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#333', color: '#fff' }}>
        <div>
          <Link to="/" style={{ margin: '0 10px', color: '#fff', textDecoration: 'none' }}>Home</Link>
          {/* <Link to="/motor" style={{ margin: '0 10px', color: '#fff', textDecoration: 'none' }}>Motor</Link> */}
        </div>
        <Link to="/login" style={{ margin: '0 10px', color: '#fff', textDecoration: 'none' }}>Login</Link>
      </div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Homepage/>} />
        <Route path="/mqtt/:id" element={<MQTTPage />} />
      </Routes>
    </Router>
  );
}

export default App;
