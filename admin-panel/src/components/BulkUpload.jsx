import { useRef, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export default function BulkUpload() {
    const fileRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleUpload = async () => {
        const file = fileRef.current.files[0];
        if (!file) return;
        setLoading(true);
        const form = new FormData();
        form.append('file', file);
        try {
            const res = await axios.post(`${API_URL}/api/upload/bulk-token-limit`, form, {
                headers: { Authorization: `Bearer ${localStorage.token}`, 'Content-Type': 'multipart/form-data' }
            });
            setMsg(`${res.data.updated} kullanıcı güncellendi.`);
        } catch (e) {
            setMsg('Hata: ' + (e.response?.data?.error || e.message));
        }
        setLoading(false);
    };

    return (
        <div className="p-4 bg-white rounded shadow max-w-xl mb-4">
            <h2 className="text-lg font-semibold mb-2">Toplu Token Limiti Güncelle</h2>
            <p className="text-sm text-gray-600 mb-2">Excel başlık: username, limit</p>
            <input type="file" accept=".xlsx,.xls" ref={fileRef} className="mb-2" />
            <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded ml-2"
            >
                {loading ? 'Yükleniyor…' : 'Yükle'}
            </button>
            {msg && <p className="mt-2 text-sm">{msg}</p>}
            <a href="/sample_token.xlsx" download className="text-blue-600 underline text-sm block mt-2">Örnek Excel indir</a>
        </div>
    );
}
