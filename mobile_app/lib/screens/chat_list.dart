import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../services/api.dart';
import '../services/storage_service.dart';
import 'chat_1v1.dart';
import 'search_user.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({Key? key}) : super(key: key);

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  List<dynamic> _chats = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchChats();
  }

  Future<void> _fetchChats() async {
    try {
      setState(() => _loading = true);
      final res = await dio.get('/chats/my-chats');
      setState(() {
        _chats = res.data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hata: ${e.toString()}')),
        );
      }
    }
  }

  String _getOtherUserName(List participants) {
    // Get the other user's name (not current user)
    if (participants.isEmpty) return 'Bilinmeyen';
    if (participants.length == 1) return participants[0]['username'] ?? 'Bilinmeyen';
    // For now, just return first participant's name
    // You might want to filter out current user
    return participants[0]['username'] ?? 'Bilinmeyen';
  }

  String _formatTime(String? timestamp) {
    if (timestamp == null) return '';
    try {
      final date = DateTime.parse(timestamp);
      final now = DateTime.now();
      final diff = now.difference(date);
      
      if (diff.inDays > 0) {
        return '${diff.inDays}g';
      } else if (diff.inHours > 0) {
        return '${diff.inHours}s';
      } else if (diff.inMinutes > 0) {
        return '${diff.inMinutes}d';
      } else {
        return 'Şimdi';
      }
    } catch (e) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _chats.isEmpty
              ? const Center(
                  child: Text(
                    'Henüz sohbet yok\nYeni sohbet başlatmak için + butonuna basın',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchChats,
                  child: ListView.builder(
                    itemCount: _chats.length,
                    itemBuilder: (context, index) {
                      final chat = _chats[index];
                      final participants = chat['participants'] as List? ?? [];
                      final lastMessage = chat['lastMessage'];
                      final otherUserName = _getOtherUserName(participants);

                      return ListTile(
                        leading: CircleAvatar(
                          child: Text(
                            otherUserName.isNotEmpty
                                ? otherUserName[0].toUpperCase()
                                : '?',
                          ),
                        ),
                        title: Text(
                          otherUserName,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          lastMessage != null
                              ? (lastMessage['content'] ?? 'Medya')
                              : 'Mesaj yok',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: Text(
                          _formatTime(chat['updatedAt']),
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => Chat1v1Screen(
                                chatId: chat['_id'],
                                targetName: otherUserName,
                              ),
                            ),
                          ).then((_) => _fetchChats());
                        },
                      );
                    },
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final user = await Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const SearchUserScreen()),
          );
          if (user == null) return;

          try {
            final res = await dio.post('/chats/private', data: {
              'targetId': user['_id']
            });
            final chatId = res.data['_id'];
            if (mounted) {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => Chat1v1Screen(
                    chatId: chatId,
                    targetName: user['username'],
                  ),
                ),
              ).then((_) => _fetchChats());
            }
          } catch (e) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text("Hata: $e")),
              );
            }
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
