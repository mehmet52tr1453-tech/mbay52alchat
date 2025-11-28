import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function LiveStats() {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        socket.emit('join-admin');
        socket.on('live-stats', (data) => {
            // Update stats list (simplified: just replace or append)
            setStats(prev => {
                const idx = prev.findIndex(s => s.socketId === data.socketId);
                if (idx > -1) {
                    const newStats = [...prev];
                    newStats[idx] = data;
                    return newStats;
                }
                return [...prev, data];
            });
        });
        return () => socket.off('live-stats');
    }, []);

    return (
        <div className="p-4 bg-white rounded shadow mt-4">
            <h2 className="text-lg font-semibold mb-2">Live WebRTC Stats</h2>
            <table className="min-w-full table-auto text-sm">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="p-2">Socket ID</th>
                        <th className="p-2">Up (kbps)</th>
                        <th className="p-2">Down (kbps)</th>
                        <th className="p-2">FPS</th>
                        <th className="p-2">Res</th>
                        <th className="p-2">Loss</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map(s => (
                        <tr key={s.socketId} className="border-t">
                            <td className="p-2">{s.socketId.substr(0, 6)}...</td>
                            <td className="p-2">{s.upKbps?.toFixed(0)}</td>
                            <td className="p-2">{s.downKbps?.toFixed(0)}</td>
                            <td className="p-2">{s.fps}</td>
                            <td className="p-2">{s.width}x{s.height}</td>
                            <td className="p-2">{s.loss}</td>
                        </tr>
                    ))}
                    {stats.length === 0 && <tr><td colSpan="6" className="p-2 text-center text-gray-500">No active calls</td></tr>}
                </tbody>
            </table>
        </div>
    );
}
