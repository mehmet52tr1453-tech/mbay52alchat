import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import BulkUpload from '../components/BulkUpload';
import ModelSelect from '../components/ModelSelect';
import LiveStats from '../components/LiveStats';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user',
        monthlyTokenLimit: 10000
    });

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${localStorage.token}` } });
            setUsers(res.data);
        } catch (e) {
            console.error("Fetch users error", e);
        }
    };

    const updateLimit = async (id, limit) => {
        try {
            await axios.patch(`${API_URL}/api/users/${id}/token-limit`, { limit }, { headers: { Authorization: `Bearer ${localStorage.token}` } });
            fetchUsers();
        } catch (e) {
            alert("Update error: " + e.message);
        }
    };

    const addUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/auth/register`, newUser, { headers: { Authorization: `Bearer ${localStorage.token}` } });
            alert('Kullanıcı eklendi!');
            setShowAddForm(false);
            setNewUser({ username: '', email: '', password: '', role: 'user', monthlyTokenLimit: 10000 });
            fetchUsers();
        } catch (e) {
            alert('Hata: ' + (e.response?.data?.error || e.message));
        }
    };

    const deleteUser = async (id, username) => {
        if (!confirm(`${username} kullanıcısını silmek istediğinize emin misiniz?`)) return;
        try {
            await axios.delete(`${API_URL}/api/users/${id}`, { headers: { Authorization: `Bearer ${localStorage.token}` } });
            alert('Kullanıcı silindi!');
            fetchUsers();
        } catch (e) {
            alert('Hata: ' + (e.response?.data?.error || e.message));
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';
        try {
            await axios.patch(`${API_URL}/api/users/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${localStorage.token}` } });
            fetchUsers();
        } catch (e) {
            alert('Hata: ' + (e.response?.data?.error || e.message));
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

            <LiveStats />
            <BulkUpload />

            <div className="flex justify-between items-center mb-4 mt-8">
                <h2 className="text-xl font-bold">Kullanıcılar & Token Limiti</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    {showAddForm ? 'İptal' : '+ Yeni Kullanıcı Ekle'}
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white p-6 rounded shadow mb-4">
                    <h3 className="text-lg font-semibold mb-4">Yeni Kullanıcı Ekle</h3>
                    <form onSubmit={addUser} className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Kullanıcı Adı"
                            className="border rounded px-3 py-2"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="border rounded px-3 py-2"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Şifre"
                            className="border rounded px-3 py-2"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            required
                        />
                        <select
                            className="border rounded px-3 py-2"
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="user">Kullanıcı</option>
                            <option value="admin">Admin</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Aylık Token Limiti"
                            className="border rounded px-3 py-2"
                            value={newUser.monthlyTokenLimit}
                            onChange={(e) => setNewUser({ ...newUser, monthlyTokenLimit: parseInt(e.target.value) })}
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Ekle
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2 text-left">Kullanıcı</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Kimin Eklediği</th>
                            <th className="px-4 py-2 text-left">Kullanılan</th>
                            <th className="px-4 py-2 text-left">Limit</th>
                            <th className="px-4 py-2 text-left">AI Model</th>
                            <th className="px-4 py-2 text-left">Durum</th>
                            <th className="px-4 py-2 text-left">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2">{u.username}</td>
                                <td className="px-4 py-2">{u.email}</td>
                                <td className="px-4 py-2">
                                    {u.createdBy ? (
                                        <span className="text-blue-600">{u.createdBy.username}</span>
                                    ) : (
                                        <span className="text-gray-400">Admin</span>
                                    )}
                                </td>
                                <td className="px-4 py-2">{u.monthlyTokenUsed}</td>
                                <td className="px-4 py-2">
                                    <input
                                        type="number"
                                        className="border rounded px-2 py-1 w-24"
                                        defaultValue={u.monthlyTokenLimit}
                                        onBlur={(e) => updateLimit(u._id, parseInt(e.target.value) || 0)}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <ModelSelect userId={u._id} current={u.aiModel} />
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => toggleStatus(u._id, u.status)}
                                        className={`px-3 py-1 rounded text-sm ${u.status === 'banned' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                                    >
                                        {u.status === 'banned' ? 'Yasaklı' : 'Aktif'}
                                    </button>
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => deleteUser(u._id, u.username)}
                                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                    >
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
