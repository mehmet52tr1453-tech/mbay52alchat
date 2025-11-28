import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:uni_links/uni_links.dart';
import 'services/auth_service.dart';
import 'screens/login.dart';
import 'screens/home.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // await Firebase.initializeApp(); // Uncomment when firebase is configured
  await AuthService.loadToken();
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthService(),
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
    _initDeepLink();
  }

  void _initDeepLink() async {
    // Handle deep links for Stripe success/cancel
    linkStream.listen((String? link) {
      if (link == null) return;
      final uri = Uri.parse(link);
      if (uri.path.contains('success')) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment Successful!')));
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Al-Chat',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: auth.token == null ? const LoginScreen() : const HomeScreen(),
    );
  }
}
