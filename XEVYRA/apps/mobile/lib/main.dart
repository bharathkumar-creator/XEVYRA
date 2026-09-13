import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'src/bootstrap/bootstrap_service.dart';
import 'src/security/domain_security_policy.dart';
import 'src/shell/bootstrap_shell.dart';
import 'src/bridge/js_bridge.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF090D16),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const XevyraMobileApp());
}

class XevyraMobileApp extends StatelessWidget {
  final String? initialUrl;
  final BootstrapService? bootstrapService;

  const XevyraMobileApp({
    super.key,
    this.initialUrl,
    this.bootstrapService,
  });

  @override
  Widget build(BuildContext context) {
    const environmentMode = String.fromEnvironment('ENVIRONMENT_MODE', defaultValue: 'development');
    final mode = environmentMode == 'production'
        ? EnvironmentMode.production
        : environmentMode == 'staging'
            ? EnvironmentMode.staging
            : EnvironmentMode.development;

    final effectiveBootstrapService = bootstrapService ??
        BootstrapService(
          securityPolicy: DomainSecurityPolicy(mode: mode),
        );

    return MaterialApp(
      title: 'XEVYRA',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF090D16),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF3B82F6),
          surface: Color(0xFF111726),
        ),
      ),
      home: Scaffold(
        body: SafeArea(
          child: BootstrapShell(
            bootstrapService: effectiveBootstrapService,
            directUrlOverride: initialUrl,
            onBridgeMessage: (BridgeMessage message) {
              debugPrint('Received Bridge Action: ${message.action}');
            },
          ),
        ),
      ),
    );
  }
}
