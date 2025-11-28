import { useEffect, useState } from 'react';
import axios from 'axios';
import ModelSelect from '../components/ModelSelect';
import BulkUpload from '../components/BulkUpload';
import LiveStats from '../components/LiveStats';

export default function Users() {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const updateLimit = async (id, limit) => {
        await axios.patch(`http://localhost:5000/api/users/${id}/token-limit`, { limit }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchUsers();
    };

    useEffect(() => { fetchUsers(); }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Users & Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <BulkUpload onUploadComplete={fetchUsers} />
                <LiveStats />
            </div>

            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="px-4 py-2">Username</th>
                            <th className="px-4 py-2">Used Tokens</th>
                            <th className="px-4 py-2">Limit</th>
                            <th className="px-4 py-2">AI Model</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id} className="border-t">
                                <td className="px-4 py-2">{u.username}</td>
                                <td className="px-4 py-2">{u.monthlyTokenUsed}</td>
                                <td className="px-4 py-2">{u.monthlyTokenLimit === 0 ? '∞' : u.monthlyTokenLimit}</td>
                                <td className="px-4 py-2"><ModelSelect userId={u._id} current={u.aiModel} /></td>
                                <td className="px-4 py-2">
                                    <input
                                        type="number"
                                        className="border rounded px-2 py-1 w-24"
                                        defaultValue={u.monthlyTokenLimit}
                                        onBlur={(e) => updateLimit(u._id, parseInt(e.target.value) || 0)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
