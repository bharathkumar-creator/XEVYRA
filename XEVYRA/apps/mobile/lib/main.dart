import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'src/webview/fitness_webview.dart';
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

  const XevyraMobileApp({super.key, this.initialUrl});

  @override
  Widget build(BuildContext context) {
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
          child: FitnessWebView(
            initialUrl: initialUrl ?? 'http://localhost:3000',
            onBridgeMessage: (BridgeMessage message) {
              debugPrint('Received Bridge Action: ${message.action}');
              if (message.action == BridgeAction.requestNativeAuth) {
                // Bridge proof-of-concept handling: In Phase 2 native auth, Firebase Google Sign In triggers here
                debugPrint('Native Auth requested from WebView JavaScript.');
              }
            },
          ),
        ),
      ),
    );
  }
}
