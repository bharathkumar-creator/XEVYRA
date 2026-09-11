import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../bridge/js_bridge.dart';
import '../security/domain_security_policy.dart';

class FitnessWebView extends StatefulWidget {
  final String initialUrl;
  final Function(BridgeMessage)? onBridgeMessage;
  final DomainSecurityPolicy securityPolicy;

  const FitnessWebView({
    super.key,
    required this.initialUrl,
    this.onBridgeMessage,
    this.securityPolicy = const DomainSecurityPolicy(mode: EnvironmentMode.development),
  });

  @override
  State<FitnessWebView> createState() => _FitnessWebViewState();
}

class _FitnessWebViewState extends State<FitnessWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;
  double _loadingProgress = 0.0;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _initController();
  }

  void _initController() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF090D16))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            setState(() {
              _loadingProgress = progress / 100.0;
            });
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            if (error.isForMainFrame ?? true) {
              setState(() {
                _isLoading = false;
                _hasError = true;
              });
            }
          },
          onNavigationRequest: (NavigationRequest request) async {
            final uri = Uri.tryParse(request.url);
            if (uri == null) return NavigationDecision.prevent;

            if (widget.securityPolicy.isAllowed(uri)) {
              return NavigationDecision.navigate;
            }

            // External URLs are delegated to the system browser
            if (await canLaunchUrl(uri)) {
              await launchUrl(uri, mode: LaunchMode.externalApplication);
            }
            return NavigationDecision.prevent;
          },
        ),
      )
      ..addJavaScriptChannel(
        'flutterBridge',
        onMessageReceived: (JavaScriptMessage message) {
          final bridgeMsg = BridgeMessage.parse(message.message);
          widget.onBridgeMessage?.call(bridgeMsg);
        },
      )
      ..loadRequest(Uri.parse(widget.initialUrl));
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) {
      return Container(
        color: const Color(0xFF090D16),
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.wifi_off_rounded,
                size: 56,
                color: Color(0xFF94A3B8),
              ),
              const SizedBox(height: 16),
              const Text(
                'Connection Unavailable',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Please check your internet connection and try again.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    _hasError = false;
                    _isLoading = true;
                  });
                  _controller.reload();
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3B82F6),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Stack(
      children: [
        WebViewWidget(controller: _controller),
        if (_isLoading)
          LinearProgressIndicator(
            value: _loadingProgress,
            backgroundColor: Colors.transparent,
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF3B82F6)),
            minHeight: 3,
          ),
      ],
    );
  }
}
