import 'package:flutter/material.dart';
import '../services/api.dart';

class SearchUserScreen extends StatefulWidget {
  const SearchUserScreen({Key? key}) : super(key: key);
  @override
  _SearchUserScreenState createState() => _SearchUserScreenState();
}

class _SearchUserScreenState extends State<SearchUserScreen> {
  final _ctrl = TextEditingController();
  List<dynamic> _users = [];

  void _search() async {
    try {
      final res = await dio.get('/users/search', queryParameters: {'q': _ctrl.text});
      setState(() => _users = res.data);
    } catch (e) {
      print("Search error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kullanıcı Ara')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _ctrl,
              decoration: InputDecoration(
                hintText: 'Kullanıcı adı…',
                suffixIcon: IconButton(icon: const Icon(Icons.search), onPressed: _search),
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _users.length,
              itemBuilder: (_, i) => ListTile(
                title: Text(_users[i]['username']),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () => Navigator.pop(context, _users[i]),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
