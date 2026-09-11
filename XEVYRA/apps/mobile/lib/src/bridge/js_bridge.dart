import 'dart:convert';

enum BridgeAction {
  requestNativeAuth,
  getAppVersion,
  openExternalUrl,
  shareContent,
  notifyReady,
  unknown,
}

class BridgeMessage {
  final BridgeAction action;
  final Map<String, dynamic>? payload;

  const BridgeMessage({required this.action, this.payload});

  static BridgeMessage parse(String jsonString) {
    try {
      final dynamic decoded = jsonDecode(jsonString);
      if (decoded is! Map<String, dynamic>) {
        return const BridgeMessage(action: BridgeAction.unknown);
      }

      final actionStr = decoded['action'] as String?;
      final payload = decoded['payload'] as Map<String, dynamic>?;

      BridgeAction action;
      switch (actionStr) {
        case 'requestNativeAuth':
          action = BridgeAction.requestNativeAuth;
          break;
        case 'getAppVersion':
          action = BridgeAction.getAppVersion;
          break;
        case 'openExternalUrl':
          action = BridgeAction.openExternalUrl;
          break;
        case 'shareContent':
          action = BridgeAction.shareContent;
          break;
        case 'notifyReady':
          action = BridgeAction.notifyReady;
          break;
        default:
          action = BridgeAction.unknown;
      }

      return BridgeMessage(action: action, payload: payload);
    } catch (_) {
      return const BridgeMessage(action: BridgeAction.unknown);
    }
  }

  bool get isValid => action != BridgeAction.unknown;
}
