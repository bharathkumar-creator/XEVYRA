import 'package:flutter/material.dart';
import '../bootstrap/bootstrap_service.dart';
import '../security/domain_security_policy.dart';
import '../webview/fitness_webview.dart';
import '../bridge/js_bridge.dart';

enum ShellState {
  bootstrapping,
  ready,
  error,
}

class BootstrapShell extends StatefulWidget {
  final BootstrapService bootstrapService;
  final Function(BridgeMessage)? onBridgeMessage;
  final String? directUrlOverride; // Used for isolated test environments

  const BootstrapShell({
    super.key,
    required this.bootstrapService,
    this.onBridgeMessage,
    this.directUrlOverride,
  });

  @override
  State<BootstrapShell> createState() => _BootstrapShellState();
}

class _BootstrapShellState extends State<BootstrapShell> {
  ShellState _state = ShellState.bootstrapping;
  String? _resolvedWebAppUrl;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _startBootstrap();
  }

  Future<void> _startBootstrap() async {
    if (widget.directUrlOverride != null) {
      final overrideUri = Uri.tryParse(widget.directUrlOverride!);
      if (overrideUri != null && widget.bootstrapService.securityPolicy.isAllowed(overrideUri)) {
        setState(() {
          _resolvedWebAppUrl = widget.directUrlOverride;
          _state = ShellState.ready;
        });
        return;
      }
    }

    setState(() {
      _state = ShellState.bootstrapping;
      _errorMessage = null;
    });

    try {
      final targetUri = await widget.bootstrapService.fetchAndValidateWebAppUrl();
      if (!mounted) return;
      setState(() {
        _resolvedWebAppUrl = targetUri.toString();
        _state = ShellState.ready;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _state = ShellState.error;
        _errorMessage = 'Unable to connect to XEVYRA.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    switch (_state) {
      case ShellState.bootstrapping:
        return _buildLoadingScreen();
      case ShellState.error:
        return _buildErrorScreen();
      case ShellState.ready:
        return FitnessWebView(
          initialUrl: _resolvedWebAppUrl!,
          securityPolicy: widget.bootstrapService.securityPolicy,
          onBridgeMessage: widget.onBridgeMessage,
        );
    }
  }

  Widget _buildLoadingScreen() {
    return Container(
      color: const Color(0xFF090D16),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: const Color(0xFF3B82F6),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF3B82F6).withOpacity(0.35),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: const Center(
                child: Text(
                  'X',
                  style: TextStyle(
                    color: Color(0xFF090D16),
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'XEVYRA',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'TRAIN • FUEL • EVOLVE',
              style: TextStyle(
                color: Color(0xFF3B82F6),
                fontSize: 11,
                fontWeight: FontWeight.w800,
                letterSpacing: 3,
              ),
            ),
            const SizedBox(height: 36),
            const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF3B82F6)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorScreen() {
    return Container(
      color: const Color(0xFF090D16),
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.cloud_off_rounded,
                size: 48,
                color: Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              _errorMessage ?? 'Unable to connect to XEVYRA.',
              textAlign: TextAlign.center,
              style: const TextStyle(
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
            const SizedBox(height: 28),
            ElevatedButton.icon(
              onPressed: _startBootstrap,
              icon: const Icon(Icons.refresh_rounded, size: 20),
              label: const Text(
                'Retry',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3B82F6),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
