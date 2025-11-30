import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static Future<String?> getToken() async {
    final sp = await SharedPreferences.getInstance();
    return sp.getString('token');
  }

  static Future<String?> getUserId() async {
    final sp = await SharedPreferences.getInstance();
    return sp.getString('userId');
  }

  static Future<void> setToken(String token) async {
    final sp = await SharedPreferences.getInstance();
    await sp.setString('token', token);
  }

  static Future<void> setUserId(String userId) async {
    final sp = await SharedPreferences.getInstance();
    await sp.setString('userId', userId);
  }

  static Future<void> clear() async {
    final sp = await SharedPreferences.getInstance();
    await sp.clear();
  }
}
