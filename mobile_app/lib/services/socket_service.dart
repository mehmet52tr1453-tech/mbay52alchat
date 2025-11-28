import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class SocketService {
  static WebSocketChannel? _channel;
  static final _controller = StreamController<String>.broadcast();
  static Stream<String> get stream => _controller.stream;

  static void connect() {
    // Socket.io requires a specific handshake, this is a simplified raw websocket connection
    // For real Socket.io, use 'socket_io_client' package instead of web_socket_channel
    // But sticking to the prompt's plan:
    // Actually, prompt used web_socket_channel for a custom WS implementation or socket.io wrapper?
    // The prompt code used IOWebSocketChannel.connect to a WS URL. 
    // Socket.io usually runs on http/ws but needs protocol support.
    // Assuming the backend is standard socket.io, we should use socket_io_client.
    // However, to strictly follow the prompt's code snippets:
    
    // NOTE: Standard Socket.io server does NOT work with raw WebSocket clients easily without configuration.
    // I will implement the code as requested in the prompt, but in a real scenario, use 'socket_io_client'.
    
    _channel = IOWebSocketChannel.connect(Uri.parse('wss://al-chat-backend.onrender.com/socket.io/?EIO=4&transport=websocket'));
    
    _channel!.stream.listen(
      (msg) => _controller.add(msg),
      onError: (e) => print('WS Error: $e'),
      onDone: () => print('WS Done'),
    );
  }

  static void send(String json) {
    _channel?.sink.add(json);
  }
  
  static void dispose() {
    _channel?.sink.close();
  }
}
