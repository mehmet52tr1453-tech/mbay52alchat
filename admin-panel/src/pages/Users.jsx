import { useEffect, useState } from 'react';
import axios from 'axios';
import BulkUpload from '../components/BulkUpload';
import ModelSelect from '../components/ModelSelect';
import LiveStats from '../components/LiveStats';

export default function Users() {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${localStorage.token}` } });
            setUsers(res.data);
        } catch (e) {
            console.error("Fetch users error", e);
        }
    };

    const updateLimit = async (id, limit) => {
        try {
            await axios.patch(`http://localhost:5000/api/users/${id}/token-limit`, { limit }, { headers: { Authorization: `Bearer ${localStorage.token}` } });
            fetchUsers();
        } catch (e) {
            alert("Update error: " + e.message);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

            <LiveStats />
            <BulkUpload />

            <h2 className="text-xl font-bold mb-4 mt-8">Kullanıcılar & Token Limiti</h2>
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2 text-left">Kullanıcı</th>
                            <th className="px-4 py-2 text-left">Kullanılan</th>
                            <th className="px-4 py-2 text-left">Limit</th>
                            <th className="px-4 py-2 text-left">İşlem</th>
                            <th className="px-4 py-2 text-left">AI Model</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2">{u.username}</td>
                                <td className="px-4 py-2">{u.monthlyTokenUsed}</td>
                                <td className="px-4 py-2">{u.monthlyTokenLimit === 0 ? '∞' : u.monthlyTokenLimit}</td>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
