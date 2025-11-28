import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';

class CallScreen extends StatefulWidget {
  final String chatId;
  final bool isVideo;
  const CallScreen({required this.chatId, required this.isVideo, Key? key}) : super(key: key);
  @override
  _CallScreenState createState() => _CallScreenState();
}

class _CallScreenState extends State<CallScreen> {
  final _local = RTCVideoRenderer();
  final _remote = RTCVideoRenderer();

  @override
  void initState() {
    super.initState();
    _init();
  }

  void _init() async {
    await _local.initialize();
    await _remote.initialize();
    // Signalling logic would go here (getUserMedia, createPeerConnection, etc.)
    // Simplified for file generation
  }

  @override
  void dispose() {
    _local.dispose();
    _remote.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          Positioned.fill(child: RTCVideoView(_remote, mirror: true)),
          Positioned(
            right: 20, top: 40, width: 100, height: 150,
            child: Container(
              decoration: BoxDecoration(border: Border.all(color: Colors.white)),
              child: RTCVideoView(_local, mirror: true),
            ),
          ),
          Positioned(
            bottom: 40, left: 0, right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FloatingActionButton(
                  backgroundColor: Colors.red,
                  child: const Icon(Icons.call_end),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
