import 'package:flutter/material.dart';
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:uuid/uuid.dart';
import '../services/api.dart';

class ChatAIScreen extends StatefulWidget {
  const ChatAIScreen({Key? key}) : super(key: key);
  @override
  State<ChatAIScreen> createState() => _ChatAIScreenState();
}

class _ChatAIScreenState extends State<ChatAIScreen> {
  final List<types.Message> _messages = [];
  final _user = const types.User(id: 'self');
  final _ai = const types.User(id: 'ai', firstName: 'AI');

  void _handleSend(types.PartialText msg) async {
    final userMsg = types.TextMessage(
      id: const Uuid().v4(),
      author: _user,
      text: msg.text,
      createdAt: DateTime.now().millisecondsSinceEpoch,
    );
    setState(() => _messages.insert(0, userMsg));

    try {
        final res = await dio.post('/ai', data: {'prompt': msg.text});
        final aiMsg = types.TextMessage(
            id: const Uuid().v4(),
            author: _ai,
            text: res.data['answer'],
            createdAt: DateTime.now().millisecondsSinceEpoch,
        );
        setState(() => _messages.insert(0, aiMsg));
    } catch (e) {
        // Handle error (e.g. token limit)
        final errorMsg = types.TextMessage(
            id: const Uuid().v4(),
            author: _ai,
            text: "Error: Could not get response. Check token limit.",
            createdAt: DateTime.now().millisecondsSinceEpoch,
        );
        setState(() => _messages.insert(0, errorMsg));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Chat(
      messages: _messages,
      onSendPressed: _handleSend,
      user: _user,
    );
  }
}
