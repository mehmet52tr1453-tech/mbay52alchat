import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:uuid/uuid.dart';
import '../services/socket_service.dart';
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
  final _user = const types.User(id: 'self');

  @override
  void initState() {
    super.initState();
    SocketService.stream.listen((event) {
      if (event['type'] == 'message') {
          final m = model.Message.fromJson(event['data']); // data is Map
          if (m.chatId == widget.chatId) _add(m);
      }
    });
  }

  void _add(model.Message m) {
    final msg = types.TextMessage(
      id: m.id,
      author: types.User(id: m.senderId == 'self' ? 'self' : m.senderId), // Backend senderId mapping needed
      text: m.content,
      createdAt: m.time.millisecondsSinceEpoch,
    );
    setState(() => _messages.insert(0, msg));
  }

  void _handleSend(types.PartialText msg) {
    final m = model.Message(
      id: const Uuid().v4(),
      chatId: widget.chatId,
      senderId: 'self',
      type: 'text',
      content: msg.text,
      time: DateTime.now(),
    );
    SocketService.send('message', m.toJson());
    _add(m);
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
                      builder: (_) => CallScreen(chatId: widget.chatId, isVideo: true))),
            ),
            IconButton(
              icon: const Icon(Icons.call),
              onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => CallScreen(chatId: widget.chatId, isVideo: false))),
            ),
          ],
        ),
        body: Chat(
          messages: _messages,
          onSendPressed: _handleSend,
          user: _user,
        )
    );
  }
}
