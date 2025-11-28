import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import '../services/signalling.dart';

class CallScreen extends StatefulWidget {
  final String chatId;
  final bool isVideo;
  const CallScreen({required this.chatId, required this.isVideo, Key? key}) : super(key: key);
  @override
  _CallScreenState createState() => _CallScreenState();
}

class _CallScreenState extends State<CallScreen> {
  final _local  = RTCVideoRenderer();
  final _remote = RTCVideoRenderer();
  final _sig    = SignallingService();

  @override
  void initState() {
    super.initState();
    _init();
  }

  void _init() async {
    await _local.initialize();
    await _remote.initialize();
    await _sig.init(widget.chatId, _local, _remote, widget.isVideo);
  }

  @override
  void dispose() {
    _sig.dispose();
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
          Positioned.fill(child: RTCVideoView(_remote, mirror: true, objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover)),
          Positioned(
            right: 20,
            top: 40,
            width: 100,
            height: 150,
            child: Container(
              decoration: BoxDecoration(border: Border.all(color: Colors.white)),
              child: RTCVideoView(_local, mirror: true, objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover),
            ),
          ),
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FloatingActionButton(
                  heroTag: 'end',
                  backgroundColor: Colors.red,
                  child: const Icon(Icons.call_end),
                  onPressed: () => Navigator.pop(context),
                ),
                const SizedBox(width: 20),
                FloatingActionButton(
                  heroTag: 'cam',
                  child: Icon(_sig.camOff ? Icons.videocam_off : Icons.videocam),
                  onPressed: () {
                      _sig.toggleCam();
                      setState(() {});
                  },
                ),
                const SizedBox(width: 20),
                FloatingActionButton(
                  heroTag: 'mic',
                  child: Icon(_sig.micOff ? Icons.mic_off : Icons.mic),
                  onPressed: () {
                      _sig.toggleMic();
                      setState(() {});
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
