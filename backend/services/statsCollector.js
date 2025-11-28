const statsMap = new Map();

module.exports = {
    add(stat) { statsMap.set(stat.socketId, { ...stat, ts: Date.now() }); },
    del(socketId) { statsMap.delete(socketId); },
    getAll() {
        const now = Date.now();
        return Array.from(statsMap.entries())
            .filter(([, v]) => now - v.ts < 5000)
            .map(([k, v]) => ({ socketId: k, ...v }));
    }
};
