import 'package:flutter_test/flutter_test.dart';
import 'package:xevyra_mobile/src/bridge/js_bridge.dart';

void main() {
  group('Flutter JS Bridge Parser Tests', () {
    test('should parse requestNativeAuth action correctly', () {
      const json = '{"action":"requestNativeAuth"}';
      final message = BridgeMessage.parse(json);

      expect(message.isValid, isTrue);
      expect(message.action, equals(BridgeAction.requestNativeAuth));
    });

    test('should parse getAppVersion action with payload', () {
      const json = '{"action":"getAppVersion","payload":{"client":"web"}}';
      final message = BridgeMessage.parse(json);

      expect(message.isValid, isTrue);
      expect(message.action, equals(BridgeAction.getAppVersion));
      expect(message.payload?['client'], equals('web'));
    });

    test('should handle unknown actions gracefully', () {
      const json = '{"action":"maliciousOrUnknownAction"}';
      final message = BridgeMessage.parse(json);

      expect(message.isValid, isFalse);
      expect(message.action, equals(BridgeAction.unknown));
    });

    test('should handle invalid JSON strings gracefully without throwing', () {
      const invalidJson = 'not a json string';
      final message = BridgeMessage.parse(invalidJson);

      expect(message.isValid, isFalse);
      expect(message.action, equals(BridgeAction.unknown));
    });
  });
}
