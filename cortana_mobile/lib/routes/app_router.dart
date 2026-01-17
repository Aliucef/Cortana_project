import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../presentation/screens/auth/login_screen.dart';
import '../presentation/screens/auth/signup_screen.dart';
import '../presentation/screens/auth/auth_loading_screen.dart';
import '../presentation/screens/dashboard/main_dashboard_screen.dart';
import '../presentation/screens/finance/finance_dashboard_screen.dart';
import '../presentation/screens/finance/budget_setting_screen.dart';
import '../presentation/screens/finance/category_analytics_screen.dart';
import '../presentation/screens/finance/category_goals_screen.dart';
import '../presentation/screens/chat/chat_screen.dart';
import '../presentation/screens/profile/profile_screen.dart';
import '../presentation/providers/auth_provider.dart';

class AppRouter {
  final AuthProvider authProvider;

  AppRouter(this.authProvider);

  late final GoRouter router = GoRouter(
    initialLocation: '/loading',
    refreshListenable: authProvider,
    redirect: (BuildContext context, GoRouterState state) {
      final authState = authProvider.state;
      final isAuthenticated = authProvider.isAuthenticated;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/signup';
      final isLoadingRoute = state.matchedLocation == '/loading';

      // If checking auth status on app startup (initial state only), show loading screen
      // Don't redirect to loading if we're already on login/signup (prevents interference during login)
      if (authState == AuthState.initial && !isAuthRoute && !isLoadingRoute) {
        return '/loading';
      }

      // If on loading route and auth check complete
      if (isLoadingRoute) {
        if (authState == AuthState.authenticated) {
          return '/home';
        } else if (authState == AuthState.unauthenticated) {
          return '/login';
        }
        // Still checking, stay on loading
        return null;
      }

      // If not authenticated and not going to auth pages, redirect to login
      if (!isAuthenticated && !isAuthRoute && authState != AuthState.initial) {
        return '/login';
      }

      // If authenticated and going to auth pages, redirect to home
      if (isAuthenticated && isAuthRoute) {
        return '/home';
      }

      // No redirect needed
      return null;
    },
    routes: [
      GoRoute(
        path: '/loading',
        builder: (context, state) => const AuthLoadingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const MainDashboardScreen(),
      ),
      GoRoute(
        path: '/finance',
        builder: (context, state) => const FinanceDashboardScreen(),
      ),
      GoRoute(
        path: '/finance/budget-settings',
        builder: (context, state) => const BudgetSettingScreen(),
      ),
      GoRoute(
        path: '/finance/category-analytics',
        builder: (context, state) => const CategoryAnalyticsScreen(),
      ),
      GoRoute(
        path: '/finance/category-goals',
        builder: (context, state) => const CategoryGoalsScreen(),
      ),
      GoRoute(
        path: '/chat',
        builder: (context, state) => const ChatScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text('Page not found: ${state.matchedLocation}'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
}
