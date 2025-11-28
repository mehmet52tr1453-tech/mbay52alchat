import 'package:flutter/foundation.dart';
import '../services/api.dart';

class TokenProvider extends ChangeNotifier {
  int? _left;
  int? get left => _left;

  void setLeft(int? v) {
    _left = v;
    notifyListeners();
  }

  Future<void> fetch() async {
    try {
      final res = await dio.get('/ai/token-left');
      setLeft(res.data['left']);
    } catch (e) {
      print("Token fetch error: $e");
    }
  }
}
