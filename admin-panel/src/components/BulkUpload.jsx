import { useRef, useState } from 'react';
import axios from 'axios';

export default function BulkUpload({ onUploadComplete }) {
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
            const res = await axios.post('http://localhost:5000/api/upload/bulk-token-limit', form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMsg(`${res.data.updated} users updated.`);
            if (onUploadComplete) onUploadComplete();
        } catch (e) {
            setMsg('Error: ' + (e.response?.data?.error || e.message));
        }
        setLoading(false);
    };

    return (
        <div className="p-4 bg-white rounded shadow mb-4">
            <h2 className="text-lg font-semibold mb-2">Bulk Token Limit Update</h2>
            <p className="text-sm text-gray-600 mb-2">Excel headers: username, limit</p>
            <input type="file" accept=".xlsx,.xls" ref={fileRef} className="mb-2 block" />
            <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                {loading ? 'Uploading...' : 'Upload'}
            </button>
            {msg && <p className="mt-2 text-sm">{msg}</p>}
        </div>
    );
}
