import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import 'chat_1v1.dart';
import 'chat_ai.dart';
import 'shop_page.dart';
import 'search_user.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _idx = 0;
  // Placeholder for chats, in reality we'd have a list of chats
  static final _tabs = [
    const Center(child: Text('Select a chat or search user')), 
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
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ShopPage())),
          ),
          IconButton(
              icon: const Icon(Icons.logout),
              onPressed: () => context.read<AuthService>().logout())
        ],
      ),
      body: _idx == 0 ? _buildChatList() : const ChatAIScreen(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _idx,
        onTap: (i) => setState(() => _idx = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Chats'),
          BottomNavigationBarItem(icon: Icon(Icons.smart_toy), label: 'AI Chat'),
        ],
      ),
      floatingActionButton: _idx == 0 ? FloatingActionButton(
        child: const Icon(Icons.person_add),
        onPressed: () async {
            final user = await Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchUserScreen()));
            if (user != null) {
                // Navigate to 1v1 chat with this user
                Navigator.push(context, MaterialPageRoute(builder: (_) => Chat1v1Screen(chatId: 'new_${user['_id']}', targetName: user['username'])));
            }
        },
      ) : null,
    );
  }

  Widget _buildChatList() {
      return Center(child: Text('Chat List (Empty)'));
  }
}
