import 'package:flutter_test/flutter_test.dart';
import 'package:xevyra_mobile/src/security/domain_security_policy.dart';

void main() {
  group('Domain Security Policy Tests', () {
    test('Development mode allows localhost and loopbacks', () {
      const devPolicy = DomainSecurityPolicy(mode: EnvironmentMode.development);

      expect(devPolicy.isAllowed(Uri.parse('http://localhost:3000')), isTrue);
      expect(devPolicy.isAllowed(Uri.parse('http://127.0.0.1:3000')), isTrue);
      expect(devPolicy.isAllowed(Uri.parse('http://10.0.2.2:3000')), isTrue);
      expect(devPolicy.isAllowed(Uri.parse('https://app.xevyra.fit')), isTrue);
      expect(devPolicy.isAllowed(Uri.parse('https://malicious-site.com')), isFalse);
    });

    test('Production mode enforces HTTPS and *.xevyra.fit strictly', () {
      const prodPolicy = DomainSecurityPolicy(mode: EnvironmentMode.production);

      expect(prodPolicy.isAllowed(Uri.parse('https://app.xevyra.fit')), isTrue);
      expect(prodPolicy.isAllowed(Uri.parse('https://xevyra.fit')), isTrue);
      expect(prodPolicy.isAllowed(Uri.parse('https://api.xevyra.fit')), isTrue);

      // Rejections
      expect(prodPolicy.isAllowed(Uri.parse('http://app.xevyra.fit')), isFalse); // non-https rejected
      expect(prodPolicy.isAllowed(Uri.parse('http://localhost:3000')), isFalse); // localhost rejected in prod
      expect(prodPolicy.isAllowed(Uri.parse('https://external-auth.com')), isFalse); // external domains rejected
    });
  });
}
