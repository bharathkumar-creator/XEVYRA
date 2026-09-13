import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:xevyra_mobile/src/bootstrap/bootstrap_service.dart';
import 'package:xevyra_mobile/src/security/domain_security_policy.dart';

class MockHttpClient implements HttpClient {
  final int statusCode;
  final String responseBody;
  final bool shouldThrow;

  MockHttpClient({
    this.statusCode = 200,
    this.responseBody = '{"webAppUrl":"https://xevyra-web.vercel.app","version":"1.0.0","environment":"staging"}',
    this.shouldThrow = false,
  });

  @override
  Duration? connectionTimeout;

  @override
  void close({bool force = false}) {}

  @override
  Future<HttpClientRequest> getUrl(Uri url) async {
    if (shouldThrow) {
      throw const SocketException('Connection refused');
    }
    return MockHttpClientRequest(statusCode: statusCode, responseBody: responseBody);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockHttpClientRequest implements HttpClientRequest {
  final int statusCode;
  final String responseBody;

  MockHttpClientRequest({required this.statusCode, required this.responseBody});

  @override
  final HttpHeaders headers = MockHttpHeaders();

  @override
  Future<HttpClientResponse> close() async {
    return MockHttpClientResponse(statusCode: statusCode, responseBody: responseBody);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockHttpHeaders implements HttpHeaders {
  final Map<String, String> _headers = {};

  @override
  void set(String name, Object value, {bool preserveHeaderCase = false}) {
    _headers[name] = value.toString();
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockHttpClientResponse extends Stream<List<int>> implements HttpClientResponse {
  @override
  final int statusCode;
  final String responseBody;

  MockHttpClientResponse({required this.statusCode, required this.responseBody});

  @override
  StreamSubscription<List<int>> listen(
    void Function(List<int> event)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    final stream = Stream.value(utf8.encode(responseBody));
    return stream.listen(onData, onError: onError, onDone: onDone, cancelOnError: cancelOnError);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  group('Bootstrap Service Tests', () {
    test('fetches and validates Web App URL from staging API successfully', () async {
      final service = BootstrapService(
        apiBaseUrl: 'https://xevyra-api.onrender.com',
        securityPolicy: const DomainSecurityPolicy(mode: EnvironmentMode.staging),
        clientFactory: () => MockHttpClient(
          statusCode: 200,
          responseBody: '{"webAppUrl":"https://xevyra-web.vercel.app","version":"1.0.0","environment":"staging"}',
        ),
      );

      final url = await service.fetchAndValidateWebAppUrl();
      expect(url.toString(), equals('https://xevyra-web.vercel.app'));
    });

    test('rejects non-HTTPS Web App URL in staging mode', () async {
      final service = BootstrapService(
        apiBaseUrl: 'https://xevyra-api.onrender.com',
        securityPolicy: const DomainSecurityPolicy(mode: EnvironmentMode.staging),
        clientFactory: () => MockHttpClient(
          statusCode: 200,
          responseBody: '{"webAppUrl":"http://xevyra-web.vercel.app","version":"1.0.0","environment":"staging"}',
        ),
      );

      expect(
        () async => await service.fetchAndValidateWebAppUrl(),
        throwsA(isA<BootstrapException>()),
      );
    });

    test('rejects unapproved external domains returned by API', () async {
      final service = BootstrapService(
        apiBaseUrl: 'https://xevyra-api.onrender.com',
        securityPolicy: const DomainSecurityPolicy(mode: EnvironmentMode.staging),
        clientFactory: () => MockHttpClient(
          statusCode: 200,
          responseBody: '{"webAppUrl":"https://malicious-phishing-site.com","version":"1.0.0","environment":"staging"}',
        ),
      );

      expect(
        () async => await service.fetchAndValidateWebAppUrl(),
        throwsA(isA<BootstrapException>()),
      );
    });

    test('handles API network failure gracefully', () async {
      final service = BootstrapService(
        apiBaseUrl: 'https://xevyra-api.onrender.com',
        securityPolicy: const DomainSecurityPolicy(mode: EnvironmentMode.staging),
        clientFactory: () => MockHttpClient(shouldThrow: true),
      );

      expect(
        () async => await service.fetchAndValidateWebAppUrl(),
        throwsA(isA<BootstrapException>()),
      );
    });

    test('rejects malformed API response missing webAppUrl', () async {
      final service = BootstrapService(
        apiBaseUrl: 'https://xevyra-api.onrender.com',
        securityPolicy: const DomainSecurityPolicy(mode: EnvironmentMode.staging),
        clientFactory: () => MockHttpClient(
          statusCode: 200,
          responseBody: '{"version":"1.0.0"}',
        ),
      );

      expect(
        () async => await service.fetchAndValidateWebAppUrl(),
        throwsA(isA<BootstrapException>()),
      );
    });
  });
}
