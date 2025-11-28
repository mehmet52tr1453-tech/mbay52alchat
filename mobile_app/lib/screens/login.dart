import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/fcm_service.dart';
import '../services/api.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _pass  = TextEditingController();
  bool _loading = false;

  void _do() async {
    setState(() => _loading = true);
    final ok = await context.read<AuthService>().login(_email.text.trim(), _pass.text.trim());
    setState(() => _loading = false);
    
    if (ok) {
      // FCM Token kaydet
      final token = await FCMService.getToken();
      if (token != null) {
        try {
          await dio.patch('/users/fcm-token', data: {'token': token});
        } catch (e) {
          print("FCM Token update failed: $e");
        }
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Hatalı giriş')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(controller: _email, decoration: const InputDecoration(labelText: 'Email')),
            TextField(controller: _pass, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
            const SizedBox(height: 20),
            _loading
                ? const CircularProgressIndicator()
                : ElevatedButton(onPressed: _do, child: const Text('Giriş')),
          ],
        ),
      ),
    );
  }
}
