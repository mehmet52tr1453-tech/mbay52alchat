import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';

class AuthService extends ChangeNotifier {
  static String? _token;
  String? get token => _token;

  // Use 10.0.2.2 for Android Emulator to access localhost
  static final Dio _dio = Dio(BaseOptions(
      baseUrl: 'https://al-chat-backend.onrender.com/api', 
      headers: {'Content-Type': 'application/json'}));

  static Future<void> loadToken() async {
    final sp = await SharedPreferences.getInstance();
    _token = sp.getString('token');
  }

  Future<bool> login(String email, String password) async {
    try {
      final res = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      _token = res.data['token'];
      final sp = await SharedPreferences.getInstance();
      await sp.setString('token', _token!);
      notifyListeners();
      return true;
    } catch (e) {
      print(e);
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    final sp = await SharedPreferences.getInstance();
    await sp.remove('token');
    notifyListeners();
  }

  static String? getToken() => _token;
}
