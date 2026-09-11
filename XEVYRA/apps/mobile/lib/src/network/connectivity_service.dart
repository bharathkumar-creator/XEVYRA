import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  final Connectivity _connectivity;

  ConnectivityService({Connectivity? connectivity})
      : _connectivity = connectivity ?? Connectivity();

  Future<bool> isConnected() async {
    final results = await _connectivity.checkConnectivity();
    if (results.contains(ConnectivityResult.none) || results.isEmpty) {
      return false;
    }
    return true;
  }

  Stream<bool> get onConnectivityChanged {
    return _connectivity.onConnectivityChanged.map((results) {
      return !results.contains(ConnectivityResult.none) && results.isNotEmpty;
    });
  }
}
