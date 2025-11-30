import { useState } from 'react';
import axios from 'axios';
import Users from './pages/Users';
import ChatMonitor from './pages/ChatMonitor';
import { API_URL } from './config';

function App() {
    const [token, setToken] = useState(localStorage.token);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('users'); // users, chats

    const login = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email: username, password });
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
            <nav className="bg-white shadow p-4 mb-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold">Al-Chat Admin</h1>
                    <button onClick={() => { localStorage.removeItem('token'); setToken(null); }} className="text-red-500">Logout</button>
                </div>
                <div className="flex gap-4 mt-4">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        👥 Kullanıcı Yönetimi
                    </button>
                    <button
                        onClick={() => setActiveTab('chats')}
                        className={`px-4 py-2 rounded ${activeTab === 'chats' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        💬 Sohbet İzleme
                    </button>
                </div>
            </nav>

            {activeTab === 'users' ? <Users /> : <ChatMonitor />}
        </div>
    );
}

export default App;
