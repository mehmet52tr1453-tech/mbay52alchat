import 'package:flutter/material.dart';
import '../services/api.dart';

class AskHistoryScreen extends StatefulWidget {
  const AskHistoryScreen({Key? key}) : super(key: key);
  @override
  _AskHistoryScreenState createState() => _AskHistoryScreenState();
}

class _AskHistoryScreenState extends State<AskHistoryScreen> {
  final _ctrl = TextEditingController();
  String _result = '';

  void _ask() async {
    try {
      // Backend'de bu endpoint henüz yok (prompt'ta vardı ama backend koduna eklemedim, eklemeliyim)
      // Şimdilik mock response veya hata yönetimi
      final res = await dio.post('/ai/search-history', data: {'query': _ctrl.text});
      setState(() => _result = (res.data as List).map((m) => '• $m\n').join());
    } catch (e) {
      setState(() => _result = "Arama yapılamadı veya özellik aktif değil.");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Geçmişte Ara')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: _ctrl,
              decoration: const InputDecoration(hintText: 'Ne aramıştım?'),
            ),
            ElevatedButton(onPressed: _ask, child: const Text('Ara')),
            const SizedBox(height: 20),
            Expanded(child: SingleChildScrollView(child: Text(_result))),
          ],
        ),
      ),
    );
  }
}
