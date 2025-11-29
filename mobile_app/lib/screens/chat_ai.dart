import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import 'package:dio/dio.dart';
import '../services/api.dart';
import '../core/token_provider.dart';
import '../models/message.dart' as model;

class ChatAIScreen extends StatefulWidget {
  const ChatAIScreen({Key? key}) : super(key: key);
  @override
  State<ChatAIScreen> createState() => _ChatAIScreenState();
}

class _ChatAIScreenState extends State<ChatAIScreen> {
  final List<types.Message> _messages = [];
  final _user = const types.User(id: 'self');
  final _ai = const types.User(id: 'ai', firstName: 'AI');

  @override
  void initState() {
    super.initState();
    context.read<TokenProvider>().fetch();
  }

  void _handleSend(types.PartialText msg) async {
    final userMsg = types.TextMessage(
      id: const Uuid().v4(),
      author: _user,
      text: msg.text,
      createdAt: DateTime.now().millisecondsSinceEpoch,
    );
    setState(() => _messages.insert(0, userMsg));

    try {
      final res = await dio.post('/ai', data: {'prompt': msg.text, 'chatId': 'ai_global'});
      
      final aiMsg = types.TextMessage(
        id: const Uuid().v4(),
        author: _ai,
        text: res.data['answer'],
        createdAt: DateTime.now().millisecondsSinceEpoch,
      );
      setState(() => _messages.insert(0, aiMsg));
      
      context.read<TokenProvider>().setLeft(res.data['left']);
      
    } on DioException catch (e) {
      if (e.response?.statusCode == 402) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Aylık token limitin doldu.')),
        );
      } else {
         ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hata: ${e.message}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Sohbet'),
        actions: [
            Consumer<TokenProvider>(
            builder: (_, prov, __) => Center(
                child: Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Text(
                    prov.left == null ? '∞' : '${prov.left}',
                    style: const TextStyle(fontSize: 16),
                ),
                ),
            ),
            ),
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
