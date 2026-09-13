import 'dart:convert';
import 'dart:io';
import '../security/domain_security_policy.dart';

class BootstrapException implements Exception {
  final String message;
  const BootstrapException(this.message);

  @override
  String toString() => 'BootstrapException: $message';
}

class BootstrapService {
  final String apiBaseUrl;
  final DomainSecurityPolicy securityPolicy;
  final HttpClient Function()? clientFactory;

  const BootstrapService({
    this.apiBaseUrl = const String.fromEnvironment(
      'XEVYRA_API_BASE_URL',
      defaultValue: 'http://10.0.2.2:4000',
    ),
    this.securityPolicy = const DomainSecurityPolicy(mode: EnvironmentMode.development),
    this.clientFactory,
  });

  Future<Uri> fetchAndValidateWebAppUrl() async {
    final configEndpoint = Uri.parse('$apiBaseUrl/api/v1/app/config');
    
    // Validate configEndpoint scheme
    if (securityPolicy.mode == EnvironmentMode.production || securityPolicy.mode == EnvironmentMode.staging) {
      if (configEndpoint.scheme != 'https') {
        throw const BootstrapException('Secure HTTPS API connection required in staging/production');
      }
    }

    HttpClient? client;
    try {
      client = clientFactory != null ? clientFactory!() : HttpClient();
      client.connectionTimeout = const Duration(seconds: 8);

      final request = await client.getUrl(configEndpoint);
      request.headers.set(HttpHeaders.acceptHeader, 'application/json');
      request.headers.set(HttpHeaders.userAgentHeader, 'XEVYRA_Mobile_Shell/1.0.0');

      final response = await request.close();
      if (response.statusCode != 200) {
        throw BootstrapException('Server returned HTTP ${response.statusCode}');
      }

      final responseBody = await response.transform(utf8.decoder).join();
      final dynamic decoded = jsonDecode(responseBody);

      if (decoded is! Map<String, dynamic> || decoded['webAppUrl'] == null) {
        throw const BootstrapException('Malformed bootstrap response: missing webAppUrl');
      }

      final String rawUrl = decoded['webAppUrl'] as String;
      final Uri? targetUri = Uri.tryParse(rawUrl);

      if (targetUri == null || !targetUri.hasScheme || !targetUri.hasAuthority) {
        throw const BootstrapException('Invalid web application URL format returned by server');
      }

      // Reject unsafe schemes
      if (targetUri.scheme != 'http' && targetUri.scheme != 'https') {
        throw BootstrapException('Unsafe URL scheme rejected: ${targetUri.scheme}');
      }

      // Validate against domain security policy
      if (!securityPolicy.isAllowed(targetUri)) {
        throw BootstrapException('Target Web App domain not allowed by security policy: ${targetUri.host}');
      }

      return targetUri;
    } catch (e) {
      if (e is BootstrapException) rethrow;
      throw BootstrapException('Failed to bootstrap application: $e');
    } finally {
      client?.close(force: true);
    }
  }
}
