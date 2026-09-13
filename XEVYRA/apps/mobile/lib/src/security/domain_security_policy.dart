enum EnvironmentMode {
  development,
  staging,
  production,
}

class DomainSecurityPolicy {
  final EnvironmentMode mode;

  const DomainSecurityPolicy({this.mode = EnvironmentMode.development});

  bool isAllowed(Uri uri) {
    // Staging: Strictly HTTPS and *.vercel.app, *.onrender.com, or *.xevyra.fit
    if (mode == EnvironmentMode.staging) {
      if (uri.scheme != 'https') {
        return false;
      }
      final host = uri.host.toLowerCase();
      return host == 'xevyra.fit' ||
          host.endsWith('.xevyra.fit') ||
          host.endsWith('.vercel.app') ||
          host.endsWith('.onrender.com');
    }

    // Production: Strictly HTTPS and *.xevyra.fit or xevyra.fit
    if (mode == EnvironmentMode.production) {
      if (uri.scheme != 'https') {
        return false;
      }
      final host = uri.host.toLowerCase();
      return host == 'xevyra.fit' || host.endsWith('.xevyra.fit');
    }

    // Development: Localhost / loopback / dev endpoints
    if (uri.scheme == 'http' || uri.scheme == 'https') {
      final host = uri.host.toLowerCase();
      if (host == 'localhost' ||
          host == '127.0.0.1' ||
          host == '10.0.2.2' ||
          host == 'xevyra.fit' ||
          host.endsWith('.xevyra.fit')) {
        return true;
      }
    }

    return false;
  }
}
