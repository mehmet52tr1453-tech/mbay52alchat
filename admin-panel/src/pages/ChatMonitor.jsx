import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export default function ChatMonitor() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // all, private, ai, group

    useEffect(() => {
        fetchChats();
    }, [filter]);

    const fetchChats = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/admin/chats`, {
                headers: { Authorization: `Bearer ${localStorage.token}` }
            });

            let filteredChats = res.data;
            if (filter !== 'all') {
                filteredChats = res.data.filter(chat => chat.type === filter);
            }

            setChats(filteredChats);
        } catch (e) {
            console.error('Fetch chats error:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/admin/chats/${chatId}/messages`, {
                headers: { Authorization: `Bearer ${localStorage.token}` }
            });
            setMessages(res.data.messages);
            setSelectedChat(chats.find(c => c._id === chatId));
        } catch (e) {
            console.error('Fetch messages error:', e);
        } finally {
            setLoading(false);
        }
    };

    const deleteChat = async (chatId) => {
        if (!confirm('Bu sohbeti silmek istediğinize emin misiniz?')) return;

        try {
            await axios.delete(`${API_URL}/api/admin/chats/${chatId}`, {
                headers: { Authorization: `Bearer ${localStorage.token}` }
            });
            alert('Sohbet silindi!');
            setSelectedChat(null);
            setMessages([]);
            fetchChats();
        } catch (e) {
            alert('Hata: ' + (e.response?.data?.error || e.message));
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('tr-TR');
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'image': return '🖼️';
            case 'video': return '🎥';
            case 'audio': return '🎵';
            case 'file': return '📎';
            default: return '💬';
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Sohbet İzleme</h1>

            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Tümü ({chats.length})
                </button>
                <button
                    onClick={() => setFilter('private')}
                    className={`px-4 py-2 rounded ${filter === 'private' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    1-1 Sohbetler
                </button>
                <button
                    onClick={() => setFilter('ai')}
                    className={`px-4 py-2 rounded ${filter === 'ai' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    AI Sohbetler
                </button>
                <button
                    onClick={() => setFilter('group')}
                    className={`px-4 py-2 rounded ${filter === 'group' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Grup Sohbetler
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {/* Sohbet Listesi */}
                <div className="col-span-1 bg-white rounded shadow overflow-y-auto" style={{ maxHeight: '70vh' }}>
                    <div className="p-4 bg-gray-100 border-b font-semibold">
                        Sohbetler
                    </div>
                    {loading && chats.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">Yükleniyor...</div>
                    ) : chats.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">Sohbet bulunamadı</div>
                    ) : (
                        <div>
                            {chats.map(chat => (
                                <div
                                    key={chat._id}
                                    onClick={() => fetchMessages(chat._id)}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedChat?._id === chat._id ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm">
                                                {chat.type === 'ai' ? '🤖 AI Sohbet' :
                                                    chat.participants?.map(p => p.username).join(', ')}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {chat.lastMessage ? (
                                                    <>
                                                        {getFileIcon(chat.lastMessage.type)} {' '}
                                                        {chat.lastMessage.content?.substring(0, 30) || 'Medya'}
                                                    </>
                                                ) : 'Mesaj yok'}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {formatDate(chat.updatedAt).split(' ')[0]}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mesaj Detayları */}
                <div className="col-span-2 bg-white rounded shadow flex flex-col" style={{ maxHeight: '70vh' }}>
                    {selectedChat ? (
                        <>
                            <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
                                <div>
                                    <div className="font-semibold">
                                        {selectedChat.type === 'ai' ? '🤖 AI Sohbet' :
                                            selectedChat.participants?.map(p => p.username).join(', ')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {selectedChat.participants?.map(p => p.email).join(', ')}
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteChat(selectedChat._id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                >
                                    Sohbeti Sil
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                {loading && messages.length === 0 ? (
                                    <div className="text-center text-gray-500">Yükleniyor...</div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-gray-500">Mesaj yok</div>
                                ) : (
                                    <div className="space-y-3">
                                        {messages.map(msg => (
                                            <div key={msg._id} className="border-b pb-3">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold text-sm text-blue-600">
                                                        {msg.sender?.username || 'Bilinmeyen'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(msg.createdAt)}
                                                    </span>
                                                </div>

                                                {msg.type === 'text' ? (
                                                    <div className="text-sm">{msg.content}</div>
                                                ) : msg.type === 'image' ? (
                                                    <div>
                                                        <img
                                                            src={msg.fileUrl}
                                                            alt="Görsel"
                                                            className="max-w-xs rounded border"
                                                        />
                                                        {msg.content && <div className="text-sm mt-1">{msg.content}</div>}
                                                    </div>
                                                ) : msg.type === 'video' ? (
                                                    <div>
                                                        <video
                                                            src={msg.fileUrl}
                                                            controls
                                                            className="max-w-xs rounded border"
                                                        />
                                                        {msg.content && <div className="text-sm mt-1">{msg.content}</div>}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm">
                                                        {getFileIcon(msg.type)} {' '}
                                                        <a
                                                            href={msg.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {msg.fileName || 'Dosya'}
                                                        </a>
                                                        {msg.fileSize && ` (${(msg.fileSize / 1024).toFixed(2)} KB)`}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Bir sohbet seçin
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
