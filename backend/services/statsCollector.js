const statsMap = new Map(); // socketId -> {userId, upKbps, downKbps, fps, width, height, loss}

module.exports = {
    add(stat) { statsMap.set(stat.socketId, { ...stat, ts: Date.now() }); },
    del(socketId) { statsMap.delete(socketId); },
    getAll() {
        const now = Date.now();
        return Array.from(statsMap.entries())
            .filter(([, v]) => now - v.ts < 5000) // 5 sn içinde
            .map(([k, v]) => ({ socketId: k, ...v }));
    }
};
