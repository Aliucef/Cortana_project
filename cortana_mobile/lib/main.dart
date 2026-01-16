import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'data/datasources/local/secure_storage_service.dart';
import 'data/datasources/local/hive_service.dart';
import 'data/datasources/local/preferences_service.dart';
import 'data/datasources/remote/api_client.dart';
import 'data/repositories/auth_repository.dart';
import 'data/repositories/finance_repository.dart';
import 'data/repositories/chat_repository.dart';
import 'data/repositories/user_repository.dart';
import 'presentation/providers/auth_provider.dart';
import 'presentation/providers/theme_provider.dart';
import 'routes/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize local storage services
  final hiveService = HiveService();
  await hiveService.init();

  final preferencesService = PreferencesService();
  await preferencesService.init();

  final secureStorage = SecureStorageService();

  // Initialize API client
  final apiClient = ApiClient(secureStorage);

  // Initialize repositories
  final authRepository = AuthRepository(apiClient, secureStorage);
  final financeRepository = FinanceRepository(apiClient, secureStorage);
  final chatRepository = ChatRepository(apiClient);
  final userRepository = UserRepository(apiClient, secureStorage);

  runApp(
    CortanaApp(
      secureStorage: secureStorage,
      hiveService: hiveService,
      preferencesService: preferencesService,
      apiClient: apiClient,
      authRepository: authRepository,
      financeRepository: financeRepository,
      chatRepository: chatRepository,
      userRepository: userRepository,
    ),
  );
}

class CortanaApp extends StatelessWidget {
  final SecureStorageService secureStorage;
  final HiveService hiveService;
  final PreferencesService preferencesService;
  final ApiClient apiClient;
  final AuthRepository authRepository;
  final FinanceRepository financeRepository;
  final ChatRepository chatRepository;
  final UserRepository userRepository;

  const CortanaApp({
    super.key,
    required this.secureStorage,
    required this.hiveService,
    required this.preferencesService,
    required this.apiClient,
    required this.authRepository,
    required this.financeRepository,
    required this.chatRepository,
    required this.userRepository,
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Theme Provider
        ChangeNotifierProvider(
          create: (_) => ThemeProvider(preferencesService),
        ),

        // Auth Provider
        ChangeNotifierProvider(
          create: (_) => AuthProvider(authRepository, secureStorage),
        ),

        // Additional providers will be added in later phases:
        // - FinanceProvider
        // - ChatProvider
        // - etc.
      ],
      child: Consumer2<ThemeProvider, AuthProvider>(
        builder: (context, themeProvider, authProvider, child) {
          // Set up 401 handler for API client
          apiClient.onUnauthorized = () {
            authProvider.logout();
          };

          final appRouter = AppRouter(authProvider);

          return MaterialApp.router(
            title: 'Cortana AI',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeProvider.themeMode,
            routerConfig: appRouter.router,
          );
        },
      ),
    );
  }
}
