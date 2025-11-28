import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:uni_links/uni_links.dart';

import 'core/constants.dart';
import 'core/token_provider.dart';
import 'services/auth_service.dart';
import 'services/fcm_service.dart';
import 'services/socket_service.dart';

import 'screens/login.dart';
import 'screens/home.dart';
import 'screens/shop_page.dart';
import 'screens/ask_history.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await FCMService.init();
  await AuthService().loadToken(); // Static yerine instance method kullandım

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()..loadToken()),
        ChangeNotifierProvider(create: (_) => TokenProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
    initUniLinks();
  }

  void initUniLinks() async {
    try {
      final initial = await getInitialLink();
      if (initial != null) _handleDeepLink(initial);
      linkStream.listen((link) {
          if (link != null) _handleDeepLink(link);
      });
    } catch (e) {
      // Deep link error
    }
  }

  void _handleDeepLink(String link) {
    final uri = Uri.parse(link);
    if (uri.path == '/success') {
      // Navigator context'i burada zor, global key gerekebilir.
      // Basitlik için sadece print
      print("Payment Success");
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    
    // Token varsa socket bağla
    if (auth.token != null) {
        SocketService.connect(auth.token!);
    } else {
        SocketService.dispose();
    }

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Al-Chat',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: auth.token == null ? const LoginScreen() : const HomeScreen(),
      routes: {
        '/shop': (context) => const ShopPage(),
        '/history': (context) => const AskHistoryScreen(),
      },
    );
  }
}
