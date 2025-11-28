import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/api.dart';
import 'chat_1v1.dart';
import 'chat_ai.dart';
import 'search_user.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _idx = 0;
  // Placeholder widgets until other screens are fully implemented and imported
  // But we will implement them in this turn, so imports should work.
  // For now, using placeholders to avoid compile errors if files don't exist yet?
  // No, I will create files sequentially.
  
  static final _tabs = [
    const Center(child: Text("Sohbetler")), // Placeholder for Chat List
    const ChatAIScreen()
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Al-Chat'),
        actions: [
          IconButton(
              icon: const Icon(Icons.shopping_cart),
              onPressed: () => Navigator.pushNamed(context, '/shop')),
          IconButton(
              icon: const Icon(Icons.history),
              onPressed: () => Navigator.pushNamed(context, '/history')),
          IconButton(
              icon: const Icon(Icons.logout),
              onPressed: () => context.read<AuthService>().logout())
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _idx,
        onTap: (i) => setState(() => _idx = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.person), label: '1-1 Sohbet'),
          BottomNavigationBarItem(icon: Icon(Icons.smart_toy), label: 'AI Sohbet'),
        ],
      ),
      body: _idx == 0 ? const ChatListPlaceholder() : const ChatAIScreen(),
      floatingActionButton: _idx == 0 ? FloatingActionButton(
        onPressed: () async {
          final user = await Navigator.of(context).push(MaterialPageRoute(
              builder: (_) => const SearchUserScreen()));
          if (user == null) return;
          
          // sohbet oluştur
          try {
            final res = await dio.post('/chats/private', data: {'targetId': user['_id']});
            final chatId = res.data['_id'];
            Navigator.of(context).push(MaterialPageRoute(
                builder: (_) => Chat1v1Screen(chatId: chatId, targetName: user['username'])));
          } catch (e) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Hata: $e")));
          }
        },
        child: const Icon(Icons.person_add),
      ) : null,
    );
  }
}

class ChatListPlaceholder extends StatelessWidget {
    const ChatListPlaceholder({Key? key}) : super(key: key);
    @override
    Widget build(BuildContext context) {
        return const Center(child: Text("Sohbet başlatmak için + butonuna basın"));
    }
}
