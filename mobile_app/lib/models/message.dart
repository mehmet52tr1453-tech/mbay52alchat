class Message {
  final String id;
  final String chatId;
  final String senderId;
  final String type; // text / image / file / ai
  final String content;
  final String? fileUrl;
  final DateTime time;

  Message({
    required this.id,
    required this.chatId,
    required this.senderId,
    required this.type,
    required this.content,
    this.fileUrl,
    required this.time,
  });

  factory Message.fromJson(Map<String,dynamic> j)=>Message(
    id        : j['_id'] ?? j['id'] ?? '',
    chatId    : j['chatId'] ?? '',
    senderId  : j['senderId'] ?? '',
    type      : j['type'] ?? 'text',
    content   : j['content'] ?? '',
    fileUrl   : j['fileUrl'],
    time      : j['timestamp'] != null ? DateTime.parse(j['timestamp']) : DateTime.now(),
  );

  Map<String,dynamic> toJson()=>{
    '_id':id, 'id': id,
    'chatId':chatId,'senderId':senderId,'type':type,
    'content':content,'fileUrl':fileUrl,'timestamp':time.toIso8601String()
  };
}
