import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import '../core/constants.dart';

class AuthService extends ChangeNotifier {
  String? _token;
  String? get token => _token;
  String? _userId;
  String? get userId => _userId;

  static final Dio _dio = Dio(BaseOptions(
      baseUrl: '${Constants.baseUrl}/api',
      headers: {'Content-Type': 'application/json'}));

  Future<void> loadToken() async {
    final sp = await SharedPreferences.getInstance();
    _token = sp.getString('token');
    _userId = sp.getString('userId');
    notifyListeners();
  }

  // static String? _token; // Duplicate definition removed

  Future<bool> login(String email, String password) async {
    try {
      final res = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      _token = res.data['token'];
      _userId = res.data['user']['id']; // Backend'den user objesi dönmeli
      
      final sp = await SharedPreferences.getInstance();
      await sp.setString('token', _token!);
      if (_userId != null) await sp.setString('userId', _userId!);
      
      notifyListeners();
      return true;
    } catch (e) {
      print("Login error: $e");
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _userId = null;
    final sp = await SharedPreferences.getInstance();
    await sp.remove('token');
    await sp.remove('userId');
    notifyListeners();
  }
}
