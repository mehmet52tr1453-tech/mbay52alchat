import { useState } from 'react';
import axios from 'axios';

export default function ModelSelect({ userId, current }) {
    const [model, setModel] = useState(current || 'gpt-3.5-turbo');

    const save = async () => {
        try {
            await axios.patch(`http://localhost:5000/api/users/${userId}/model`, { model }, {
                headers: { Authorization: `Bearer ${localStorage.token}` }
            });
            alert('Kaydedildi');
        } catch (e) {
            alert('Hata: ' + e.message);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <select className="border rounded px-2 py-1" value={model} onChange={e => setModel(e.target.value)}>
                <option value="gpt-3.5-turbo">GPT-3.5</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude">Claude</option>
            </select>
            <button onClick={save} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Kaydet</button>
        </div>
    );
}
