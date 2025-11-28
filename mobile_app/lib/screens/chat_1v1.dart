import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:uuid/uuid.dart';
import '../services/socket_service.dart';
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
  final _user = const types.User(id: 'self');

  @override
  void initState() {
    super.initState();
    SocketService.stream.listen((raw) {
      // Parse message and add to list
      // Simplified for demo
    });
  }

  void _handleSend(types.PartialText msg) {
    final m = types.TextMessage(
      id: const Uuid().v4(),
      author: _user,
      text: msg.text,
      createdAt: DateTime.now().millisecondsSinceEpoch,
    );
    setState(() => _messages.insert(0, m));
    
    SocketService.send(jsonEncode({
        'chatId': widget.chatId,
        'content': msg.text,
        'type': 'text'
    }));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            title: Text(widget.targetName),
            actions: [
                IconButton(
                    icon: const Icon(Icons.videocam),
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CallScreen(chatId: widget.chatId, isVideo: true))),
                )
            ],
        ),
        body: Chat(
            messages: _messages,
            onSendPressed: _handleSend,
            user: _user,
        ),
    );
  }
}
