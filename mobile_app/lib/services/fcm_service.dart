import 'dart:async';
import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/material.dart';

class FCMService {
  static final FirebaseMessaging _fm = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _local =
      FlutterLocalNotificationsPlugin();

  static Future<void> init() async {
    // izin (ios)
    await _fm.requestPermission(provisional: true);

    // foreground bildirim kanalı
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      'al_chat_call', // id
      'Call & Message', // title
      importance: Importance.high,
    );
    await _local.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    // başlat
    const AndroidInitializationSettings android =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const InitializationSettings settings = InitializationSettings(android: android);
    await _local.initialize(settings);

    // arka plan & terminate handler
    FirebaseMessaging.onBackgroundMessage(_bgHandler);

    // foreground handler
    FirebaseMessaging.onMessage.listen((RemoteMessage msg) {
      _show(msg);
    });
  }

  static Future<void> _bgHandler(RemoteMessage msg) async {
    // sadece static fonksiyon çağrılabilir
    // _show(msg); // Background handler'da UI işlemi yapılamaz, notification otomatik gösterilir
  }

  static void _show(RemoteMessage msg) {
    final data = msg.data;
    _local.show(
      0,
      msg.notification?.title ?? 'Al-Chat',
      msg.notification?.body ?? '',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'al_chat_call',
          'Call & Message',
          icon: '@mipmap/ic_launcher',
          playSound: true,
          priority: Priority.high,
        ),
      ),
      payload: jsonEncode(data),
    );
  }

  // sunucuya gönderilecek token
  static Future<String?> getToken() => _fm.getToken();
}
