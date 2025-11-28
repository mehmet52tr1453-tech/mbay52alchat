import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants.dart';

final dio = Dio(BaseOptions(
    baseUrl: '${Constants.baseUrl}/api',
    headers: {'Content-Type': 'application/json'}))
  ..interceptors.add(InterceptorsWrapper(
    onRequest: (opt, handler) async {
      final sp = await SharedPreferences.getInstance();
      final token = sp.getString('token');
      if (token != null) opt.headers['Authorization'] = 'Bearer $token';
      handler.next(opt);
    },
  ));
