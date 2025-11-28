import 'dart:async';
import 'dart:convert';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'socket_service.dart';
import 'stats_sender.dart';

class SignallingService {
  RTCPeerConnection? _pc;
  MediaStream? _localStream;
  RTCVideoRenderer? localR, remoteR;
  bool isVideo = true;
  bool camOff = false, micOff = false;

  Future<void> init(String chatId, RTCVideoRenderer l, RTCVideoRenderer r, bool video) async {
    localR = l; remoteR = r; isVideo = video;

    _localStream = await navigator.mediaDevices.getUserMedia({
      'audio': true,
      'video': video ? {'facingMode': 'user'} : false,
    });
    localR!.srcObject = _localStream;

    _pc = await createPeerConnection({
      'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]
    });

    _pc!.onIceCandidate = (e) {
      if (e.candidate != null) {
        SocketService.send('ice', {
          'chatId': chatId,
          'candidate': {
            'candidate': e.candidate!.candidate,
            'sdpMid': e.candidate!.sdpMid,
            'sdpMLineIndex': e.candidate!.sdpMLineIndex,
          },
        });
      }
    };

    _pc!.onTrack = (event) {
      if (event.track.kind == 'video') {
        remoteR!.srcObject = event.streams[0];
      }
    };

    SocketService.stream.listen((event) async {
      if (event['type'] == 'offer') {
        final data = event['data'];
        if (data['chatId'] != chatId) return;
        await _pc!.setRemoteDescription(RTCSessionDescription(data['sdp'], 'offer'));
        final answer = await _pc!.createAnswer();
        await _pc!.setLocalDescription(answer);
        SocketService.send('answer', {
          'chatId': chatId,
          'sdp': answer.sdp,
        });
      } else if (event['type'] == 'answer') {
        final data = event['data'];
        if (data['chatId'] != chatId) return;
        await _pc!.setRemoteDescription(RTCSessionDescription(data['sdp'], 'answer'));
      } else if (event['type'] == 'ice') {
        final data = event['data'];
        if (data['chatId'] != chatId) return;
        await _pc!.addCandidate(RTCIceCandidate(
          data['candidate']['candidate'],
          data['candidate']['sdpMid'],
          data['candidate']['sdpMLineIndex'],
        ));
      }
    });

    final offer = await _pc!.createOffer();
    await _pc!.setLocalDescription(offer);
    SocketService.send('offer', {
      'chatId': chatId,
      'sdp': offer.sdp,
    });
    
    // Stats başlat
    startStats(_pc!);
  }

  void toggleCam() {
    if (_localStream == null) return;
    final videoTrack = _localStream!.getVideoTracks().firstOrNull;
    if (videoTrack != null) {
      final enabled = !videoTrack.enabled;
      videoTrack.enabled = enabled;
      camOff = !enabled;
    }
  }

  void toggleMic() {
    if (_localStream == null) return;
    final audioTrack = _localStream!.getAudioTracks().firstOrNull;
    if (audioTrack != null) {
      final enabled = !audioTrack.enabled;
      audioTrack.enabled = enabled;
      micOff = !enabled;
    }
  }

  void dispose() {
    stopStats();
    _localStream?.dispose();
    _pc?.close();
  }
}
