import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api.dart';

class ShopPage extends StatelessWidget {
  static const Map<String,int> packs = {
    '50.000 Token': 50000,
    '100.000 Token': 100000,
    '250.000 Token': 250000,
  };

  const ShopPage({Key? key}) : super(key: key);

  void buy(String name, int tokens) async {
    // priceId'leri environment'da tut veya backend'den çek
    // Mock Price IDs
    final priceMap = {
      50000:  'price_1LoP9BHzXXXXX', // 5 ₺
      100000: 'price_1LoP9CHzYYYYY', // 10 ₺
      250000: 'price_1LoP9DHzzZZZZ', // 25 ₺
    };
    
    try {
      final res = await dio.post('/stripe/create-checkout', data: {
        'tokenAmount': tokens,
        'priceId': priceMap[tokens],
      });
      
      final url = Uri.parse(res.data['url']);
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      print("Shop error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Token Satın Al')),
      body: ListView(
        children: packs.entries.map((e) => Card(
          child: ListTile(
            title: Text(e.key),
            subtitle: Text('${e.value} token'),
            trailing: ElevatedButton(
              onPressed: () => buy(e.key, e.value),
              child: const Text('Satın Al'),
            ),
          ),
        )).toList(),
      ),
    );
  }
}
