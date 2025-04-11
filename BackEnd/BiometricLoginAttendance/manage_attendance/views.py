from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework import status
from .models import Attendance
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


def calculate_distance(encoding1, encoding2):
    emb1 = np.array(list(map(float, encoding1.split(','))))
    emb2 = np.array(list(map(float, encoding2.split(','))))
    return np.linalg.norm(emb1 - emb2)


from datetime import date
from .models import Attendance

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark(request):
    image_data = request.data.get("image")
    user = request.user

    if not image_data:
        return Response({"error": "Image is required"}, status=status.HTTP_400_BAD_REQUEST)

    if not user.face_encoding:
        return Response({"error": "No registered face encoding for this user"}, status=status.HTTP_404_NOT_FOUND)

    try:
        image_bytes = base64.b64decode(image_data.split(',')[1])
    except Exception:
        return Response({"error": "Invalid image format"}, status=status.HTTP_400_BAD_REQUEST)

    encoding = extract_face_encoding(image_bytes)

    if not encoding:
        return Response({"error": "Could not extract face encoding"}, status=status.HTTP_400_BAD_REQUEST)

    # Compare with stored encoding
    distance = calculate_distance(encoding, user.face_encoding)
    threshold = 5  # Adjustable threshold

    if distance < threshold:
        today = date.today()
        already_marked = Attendance.objects.filter(user=user, timestamp__date=today).exists()

        if already_marked:
            return Response({"message": "Attendance already marked for today"}, status=status.HTTP_200_OK)

        Attendance.objects.create(user=user)
        return Response({
            "message": f"Attendance marked for {user.username}",
            "confidence": round((1 - distance), 2)
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            "error": "Face mismatch",
            "distance": round(distance, 4)
        }, status=status.HTTP_401_UNAUTHORIZED)
