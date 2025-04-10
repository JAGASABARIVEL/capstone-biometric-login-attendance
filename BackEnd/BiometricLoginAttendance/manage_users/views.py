from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework import status
from .models import CustomUser
import cv2
import numpy as np
import base64
from deepface import DeepFace


def extract_face_encoding(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    try:
        analysis = DeepFace.represent(img_path=img, model_name="Facenet", enforce_detection=False)
        if analysis:
            return ','.join(map(str, analysis[0]["embedding"]))
    except Exception as e:
        print(f"Encoding error: {e}")
    return None


def compare_encodings(encoding1, encoding2, threshold=0.7):
    emb1 = np.array(list(map(float, encoding1.split(','))))
    emb2 = np.array(list(map(float, encoding2.split(','))))
    distance = np.linalg.norm(emb1 - emb2)
    return distance < threshold


from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")
    image_data = request.data.get("image")

    if not username or not password or not image_data:
        return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        image_bytes = base64.b64decode(image_data.split(',')[1])
    except Exception as e:
        return Response({"error": "Invalid image format"}, status=status.HTTP_400_BAD_REQUEST)

    face_encoding = extract_face_encoding(image_bytes)

    if not face_encoding:
        return Response({"error": "Face could not be processed"}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser(username=username)
    user.set_password(password)
    user.face_encoding = face_encoding
    user.save()

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)

    return Response({
        "message": "User registered with face",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "username": user.username
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    image_data = request.data.get("image")

    if not image_data:
        return Response({"error": "Image is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        image_bytes = base64.b64decode(image_data.split(',')[1])
    except Exception as e:
        return Response({"error": "Invalid image format"}, status=status.HTTP_400_BAD_REQUEST)

    encoding = extract_face_encoding(image_bytes)

    if not encoding:
        return Response({"error": "Could not extract face encoding"}, status=status.HTTP_400_BAD_REQUEST)

    for user in CustomUser.objects.exclude(face_encoding__isnull=True):
        if compare_encodings(encoding, user.face_encoding):
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": f"Login successful for {user.username}",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "username": user.username
            }, status=status.HTTP_200_OK)

    return Response({"error": "Face not recognized"}, status=status.HTTP_401_UNAUTHORIZED)
