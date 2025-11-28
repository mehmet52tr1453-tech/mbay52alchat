import { useState } from 'react';
import axios from 'axios';
import Users from './pages/Users';

function App() {
    const [token, setToken] = useState(localStorage.token);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email: username, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
        } catch (err) {
            alert('Login failed');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <form onSubmit={login} className="bg-white p-8 rounded shadow-md">
                    <h2 className="text-2xl mb-4">Admin Login</h2>
                    <input className="block border p-2 mb-2 w-full" placeholder="Email" value={username} onChange={e => setUsername(e.target.value)} />
                    <input className="block border p-2 mb-4 w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">Login</button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow p-4 mb-4 flex justify-between">
                <h1 className="text-xl font-bold">Al-Chat Admin</h1>
                <button onClick={() => { localStorage.removeItem('token'); setToken(null); }} className="text-red-500">Logout</button>
            </nav>
            <Users />
        </div>
    );
}

export default App;
