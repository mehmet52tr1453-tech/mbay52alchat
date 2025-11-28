import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Users from './pages/Users';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-100">
                <nav className="bg-white shadow p-4 mb-4 flex gap-4">
                    <Link to="/users" className="text-blue-600 font-bold">Users</Link>
                    <Link to="/" className="text-gray-600">Dashboard</Link>
                </nav>
                <Routes>
                    <Route path="/users" element={<Users />} />
                    <Route path="/" element={<div className="p-8">Welcome to Admin Panel</div>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
