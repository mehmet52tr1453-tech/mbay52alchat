import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:uuid/uuid.dart';
import '../services/socket_service.dart';
import '../services/api.dart';
import '../services/storage_service.dart';
import '../models/message.dart' as model;
import 'call_screen.dart';

class Chat1v1Screen extends StatefulWidget {
  final String chatId;
  final String targetName;
  const Chat1v1Screen({required this.chatId, required this.targetName, Key? key}) : super(key: key);
  @override
  State<Chat1v1Screen> createState() => _Chat1v1ScreenState();
}

class _Chat1v1ScreenState extends State<Chat1v1Screen> {
  final List<types.Message> _messages = [];
  late types.User _user;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _initUser();
    _loadMessages();
    
    // Join chat room
    SocketService.send('join', widget.chatId);
    
    // Listen for incoming messages
    SocketService.stream.listen((event) {
      if (event['type'] == 'message') {
        final m = model.Message.fromJson(event['data']);
        if (m.chatId == widget.chatId) _addMessage(m);
      }
    });
  }

  Future<void> _initUser() async {
    final userId = await StorageService.getUserId();
    setState(() {
      _user = types.User(id: userId ?? 'self');
    });
  }

  Future<void> _loadMessages() async {
    try {
      final res = await dio.get('/chats/${widget.chatId}/messages');
      final messages = res.data['messages'] as List;
      
      setState(() {
        _messages.clear();
        for (var msg in messages) {
          _messages.add(_convertToUIMessage(msg));
        }
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Mesajlar yüklenemedi: $e')),
        );
      }
    }
  }

  types.Message _convertToUIMessage(Map<String, dynamic> msg) {
    final senderId = msg['sender']?['_id'] ?? msg['sender'];
    final senderName = msg['sender']?['username'] ?? 'Bilinmeyen';
    
    if (msg['type'] == 'image') {
      return types.ImageMessage(
        id: msg['_id'],
        author: types.User(id: senderId, firstName: senderName),
        uri: msg['fileUrl'],
        name: msg['fileName'] ?? 'image',
        size: msg['fileSize'] ?? 0,
        createdAt: DateTime.parse(msg['createdAt']).millisecondsSinceEpoch,
      );
    } else if (msg['type'] == 'video') {
      return types.VideoMessage(
        id: msg['_id'],
        author: types.User(id: senderId, firstName: senderName),
        uri: msg['fileUrl'],
        name: msg['fileName'] ?? 'video',
        size: msg['fileSize'] ?? 0,
        createdAt: DateTime.parse(msg['createdAt']).millisecondsSinceEpoch,
      );
    } else if (msg['type'] == 'file') {
      return types.FileMessage(
        id: msg['_id'],
        author: types.User(id: senderId, firstName: senderName),
        uri: msg['fileUrl'],
        name: msg['fileName'] ?? 'file',
        size: msg['fileSize'] ?? 0,
        createdAt: DateTime.parse(msg['createdAt']).millisecondsSinceEpoch,
      );
    } else {
      return types.TextMessage(
        id: msg['_id'],
        author: types.User(id: senderId, firstName: senderName),
        text: msg['content'] ?? '',
        createdAt: DateTime.parse(msg['createdAt']).millisecondsSinceEpoch,
      );
    }
  }

  void _addMessage(model.Message m) {
    final msg = types.TextMessage(
      id: m.id,
      author: types.User(id: m.senderId),
      text: m.content,
      createdAt: m.time.millisecondsSinceEpoch,
    );
    setState(() => _messages.insert(0, msg));
  }

  void _handleSend(types.PartialText msg) async {
    final tempId = const Uuid().v4();
    
    // Add to UI immediately
    final uiMsg = types.TextMessage(
      id: tempId,
      author: _user,
      text: msg.text,
      createdAt: DateTime.now().millisecondsSinceEpoch,
    );
    setState(() => _messages.insert(0, uiMsg));

    try {
      // Save to backend
      final res = await dio.post('/chats/${widget.chatId}/messages', data: {
        'content': msg.text,
        'type': 'text',
      });
      
      // Send via socket for real-time delivery
      final m = model.Message(
        id: res.data['_id'],
        chatId: widget.chatId,
        senderId: _user.id,
        type: 'text',
        content: msg.text,
        time: DateTime.now(),
      );
      SocketService.send('message', m.toJson());
      
      // Update message with real ID
      setState(() {
        final index = _messages.indexWhere((m) => m.id == tempId);
        if (index != -1) {
          _messages[index] = types.TextMessage(
            id: res.data['_id'],
            author: _user,
            text: msg.text,
            createdAt: DateTime.now().millisecondsSinceEpoch,
          );
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Mesaj gönderilemedi: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.targetName),
        actions: [
          IconButton(
            icon: const Icon(Icons.videocam),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => CallScreen(chatId: widget.chatId, isVideo: true),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.call),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => CallScreen(chatId: widget.chatId, isVideo: false),
              ),
            ),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Chat(
              messages: _messages,
              onSendPressed: _handleSend,
              user: _user,
            ),
    );
  }
}

