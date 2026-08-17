from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token


class SignupView(APIView):
    """
    POST /api/auth/signup/ (public)
    Registers a new citizen account and logs them in immediately.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = (request.data.get("password") or "").strip()
        email = (request.data.get("email") or "").strip()
        first_name = (request.data.get("name") or "").strip()

        if not username or not password:
            return Response(
                {"error": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 6:
            return Response(
                {"error": "Password must be at least 6 characters long."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {"error": f"Username '{username}' is already taken. Please choose another."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email and User.objects.filter(email__iexact=email).exists():
            return Response(
                {"error": f"An account with email '{email}' already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                first_name=first_name,
                is_staff=False,
                is_superuser=False,
            )
            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                "message": "Citizen account created successfully",
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "name": user.first_name,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                    "role": "citizen",
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as exc:
            return Response(
                {"error": f"Failed to register citizen account: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoginView(APIView):
    """
    POST /api/auth/login/ (public)
    Authenticates both citizens and municipal officers.
    Optional 'require_admin=True' parameter gates to municipal officers only.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = (request.data.get("password") or "").strip()
        require_admin = request.data.get("require_admin", False)

        if not username or not password:
            return Response(
                {"error": "Both username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if user is not None:
            if not user.is_active:
                return Response(
                    {"error": "Account is disabled."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if require_admin and not (user.is_staff or user.is_superuser):
                return Response(
                    {"error": "Access denied. Municipal officer credentials required for Command Desk."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)

            role = "admin" if (user.is_staff or user.is_superuser) else "citizen"

            return Response({
                "message": "Login successful",
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "name": user.first_name,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                    "role": role,
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(APIView):
    """
    POST /api/auth/logout/ (public)
    Clears server-side session and auth tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if request.user.is_authenticated:
            try:
                Token.objects.filter(user=request.user).delete()
            except Exception:
                pass
        logout(request)
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    """
    GET /api/auth/me/ (public)
    Returns session and user details for any active user (Citizen or Officer).
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            token, _ = Token.objects.get_or_create(user=request.user)
            role = "admin" if (request.user.is_staff or request.user.is_superuser) else "citizen"
            return Response({
                "authenticated": True,
                "token": token.key,
                "user": {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": request.user.email,
                    "name": request.user.first_name,
                    "is_staff": request.user.is_staff,
                    "is_superuser": request.user.is_superuser,
                    "role": role,
                }
            }, status=status.HTTP_200_OK)

        return Response({
            "authenticated": False,
            "user": None,
        }, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CSRFTokenView(APIView):
    """
    GET /api/auth/csrf/ (public)
    Sets and returns the CSRF cookie for client request authorization.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        csrf_token = get_token(request)
        return Response({"csrftoken": csrf_token}, status=status.HTTP_200_OK)

