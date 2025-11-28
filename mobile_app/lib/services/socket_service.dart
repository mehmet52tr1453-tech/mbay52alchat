import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../core/constants.dart';

class SocketService {
  static IO.Socket? socket;
  static final _controller = StreamController<dynamic>.broadcast();
  static Stream<dynamic> get stream => _controller.stream;

  static void connect(String token) {
    socket = IO.io(Constants.baseUrl, IO.OptionBuilder()
        .setTransports(['websocket'])
        .setExtraHeaders({'Authorization': 'Bearer $token'}) // Auth middleware varsa
        .build());

    socket!.onConnect((_) {
      print('Socket connected');
    });

    socket!.on('message', (data) => _controller.add({'type': 'message', 'data': data}));
    socket!.on('offer', (data) => _controller.add({'type': 'offer', 'data': data}));
    socket!.on('answer', (data) => _controller.add({'type': 'answer', 'data': data}));
    socket!.on('ice', (data) => _controller.add({'type': 'ice', 'data': data}));
    socket!.on('call-invite', (data) => _controller.add({'type': 'call-invite', 'data': data}));
    
    socket!.onDisconnect((_) => print('Socket disconnected'));
  }

  static void send(String event, dynamic data) {
    socket?.emit(event, data);
  }

  static void dispose() {
    socket?.disconnect();
    socket?.dispose();
  }
}
