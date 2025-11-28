import { useEffect, useState } from 'react';
import axios from 'axios';

export default function LiveStats() {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const i = setInterval(async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/live-stats', {
                    headers: { Authorization: `Bearer ${localStorage.token}` }
                });
                setStats(res.data);
            } catch (e) {
                console.error("Stats fetch error", e);
            }
        }, 2000);
        return () => clearInterval(i);
    }, []);

    return (
        <div className="p-4 bg-white rounded shadow max-w-6xl mb-4">
            <h2 className="text-lg font-semibold mb-2">Canlı WebRTC Stats</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2">User</th>
                            <th className="px-4 py-2">Up (kbps)</th>
                            <th className="px-4 py-2">Down (kbps)</th>
                            <th className="px-4 py-2">FPS</th>
                            <th className="px-4 py-2">Çözünürlük</th>
                            <th className="px-4 py-2">Paket Kaybı</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map(s => (
                            <tr key={s.socketId} className="border-b">
                                <td className="px-4 py-2">{s.userId || 'Anon'}</td>
                                <td className="px-4 py-2">{s.upKbps?.toFixed(0)}</td>
                                <td className="px-4 py-2">{s.downKbps?.toFixed(0)}</td>
                                <td className="px-4 py-2">{s.fps}</td>
                                <td className="px-4 py-2">{s.width}x{s.height}</td>
                                <td className="px-4 py-2">{s.loss}</td>
                            </tr>
                        ))}
                        {stats.length === 0 && (
                            <tr><td colSpan="6" className="text-center py-4">Aktif görüşme yok</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
