import 'package:dio/dio.dart';
import 'auth_service.dart';

final dio = Dio(BaseOptions(
    baseUrl: 'http://192.168.19.148:5000/api',
    headers: {'Content-Type': 'application/json'}))
  ..interceptors.add(InterceptorsWrapper(
    onRequest: (opt, handler) {
      final t = AuthService.getToken();
      if (t != null) opt.headers['Authorization'] = 'Bearer $t';
      handler.next(opt);
    },
  ));
