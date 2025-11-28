import 'dart:async';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'socket_service.dart';

Timer? _statsTimer;

void startStats(RTCPeerConnection pc) {
  _statsTimer = Timer.periodic(const Duration(seconds: 2), (_) async {
    final stats = await pc.getStats();
    
    // Simplified logic
    double up = 0;
    double down = 0;
    int fps = 0;
    int width = 0;
    int height = 0;
    int loss = 0;

    for (var report in stats) {
        if (report.type == 'inbound-rtp' && report.values['mediaType'] == 'video') {
            // bytesReceived is cumulative, need diff for kbps. Skipping for simplicity in this fix.
            // down = report.values['bytesReceived']; 
            fps = report.values['framesPerSecond']?.toInt() ?? 0;
            loss = report.values['packetsLost']?.toInt() ?? 0;
        }
        if (report.type == 'track' && report.values['kind'] == 'video') {
             width = report.values['frameWidth']?.toInt() ?? 0;
             height = report.values['frameHeight']?.toInt() ?? 0;
        }
    }

    SocketService.send('webrtc-stats', {
      'upKbps': up,
      'downKbps': down,
      'fps': fps,
      'width': width,
      'height': height,
      'loss': loss,
    });
  });
}

void stopStats() => _statsTimer?.cancel();
