import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/api.dart';
import '../pages/add_user_page.dart';
import 'chat_1v1.dart';
import 'chat_ai.dart';
import 'chat_list.dart';
import 'search_user.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _idx = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Al-Chat'),
        actions: [
          IconButton(
              icon: const Icon(Icons.person_add),
              tooltip: 'Kullanıcı Ekle',
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AddUserPage()),
              )),
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
      body: _idx == 0 ? const ChatListScreen() : const ChatAIScreen(),
    );
  }
}

