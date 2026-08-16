from django.contrib.auth import authenticate, login, logout
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Both username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if user is not None:
            if not (user.is_staff or user.is_superuser):
                return Response(
                    {"error": "Access denied. Admin credentials required."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Login successful",
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(APIView):
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
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
            token, _ = Token.objects.get_or_create(user=request.user)
            return Response({
                "authenticated": True,
                "token": token.key,
                "user": {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": request.user.email,
                    "is_staff": request.user.is_staff,
                    "is_superuser": request.user.is_superuser,
                }
            }, status=status.HTTP_200_OK)
        return Response({
            "authenticated": False,
            "user": None,
        }, status=status.HTTP_200_OK)
