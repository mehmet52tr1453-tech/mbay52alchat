import 'dart:async';
import 'dart:convert';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'socket_service.dart';

Timer? _statsTimer;

void startStats(RTCVideoRenderer local, RTCVideoRenderer remote) {
  _statsTimer = Timer.periodic(const Duration(seconds: 2), (_) async {
    final localStats = await local.videoRenderer?.getStats();
    final remoteStats = await remote.videoRenderer?.getStats();
    
    // Stats parsing is complex and implementation specific. 
    // Simplified logic based on user prompt:
    final up = _kbps(localStats, 'bytesSent');
    final down = _kbps(remoteStats, 'bytesReceived');
    
    // Note: Finding FPS, width, height, loss requires iterating over reports correctly.
    // This is a simplified placeholder logic.
    int fps = 0;
    int width = 0;
    int height = 0;
    int loss = 0;

    if (remoteStats != null) {
        for (var report in remoteStats) {
            if (report.type == 'inbound-rtp' && report.values['mediaType'] == 'video') {
                fps = report.values['framesPerSecond']?.toInt() ?? 0;
                loss = report.values['packetsLost']?.toInt() ?? 0;
                // Width/Height might be in 'track' or 'inbound-rtp' depending on browser/impl
                width = report.values['frameWidth']?.toInt() ?? 0;
                height = report.values['frameHeight']?.toInt() ?? 0;
            }
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

double _kbps(List<StatsReport>? stats, String key) {
  if (stats == null) return 0;
  // This logic is very simplified and might not be accurate for all stats types
  // Real implementation needs to diff bytes over time.
  // Assuming 'stats' is a list of reports.
  return 0.0; // Placeholder implementation
}
