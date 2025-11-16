from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from .serializers import (
    LoginSerializer, RegisterSerializer, UserSerializer,
    CompanySerializer, CompanyListSerializer,
    EventSerializer, EventListSerializer,
    ProfileSerializer, ProfileListSerializer,
    NetworkingSlotSerializer
)
from .models import Company, Event, Profile, NetworkingSlot
from .emails import send_access_code_email

@api_view(['GET'])
@permission_classes([AllowAny])
def hello_world(request):
    return Response({"message": "Hola desde Django!"})

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Usuario registrado exitosamente'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout exitoso'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def token_refresh_view(request):
    return Response({'message': 'Use el endpoint /api/auth/token/refresh/'})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def company_list_create(request):
    if request.method == 'GET':
        companies = Company.objects.all()
        is_active = request.query_params.get('is_active')
        industry = request.query_params.get('industry')
        if is_active is not None:
            companies = companies.filter(is_active=is_active.lower() == 'true')
        if industry:
            companies = companies.filter(industry__icontains=industry)
        serializer = CompanyListSerializer(companies, many=True, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CompanySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def company_detail(request, pk):
    try:
        company = Company.objects.get(pk=pk)
    except Company.DoesNotExist:
        return Response({'error': 'Empresa no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = CompanySerializer(company, context={'request': request})
        return Response(serializer.data)
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = CompanySerializer(company, data=request.data, partial=partial, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        company.delete()
        return Response({'message': 'Empresa eliminada exitosamente'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def event_list_create(request):
    if request.method == 'GET':
        events = Event.objects.all()
        company_id = request.query_params.get('company')
        is_active = request.query_params.get('is_active')
        is_upcoming = request.query_params.get('is_upcoming')
        if company_id:
            events = events.filter(company_id=company_id)
        if is_active is not None:
            events = events.filter(is_active=is_active.lower() == 'true')
        if is_upcoming is not None:
            from django.utils import timezone
            if is_upcoming.lower() == 'true':
                events = events.filter(start_date__gte=timezone.now().date())
            else:
                events = events.filter(start_date__lt=timezone.now().date())
        serializer = EventListSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = EventSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def event_detail(request, pk):
    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response({'error': 'Evento no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = EventSerializer(event, context={'request': request})
        return Response(serializer.data)
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = EventSerializer(event, data=request.data, partial=partial, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        event.delete()
        return Response({'message': 'Evento eliminado exitosamente'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_list(request):
    profiles = Profile.objects.all()
    event_id = request.query_params.get('event')
    if event_id:
        profiles = profiles.filter(event_id=event_id)
    serializer = ProfileSerializer(profiles, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def profile_detail(request, pk):
    try:
        profile = Profile.objects.get(pk=pk)
    except Profile.DoesNotExist:
        return Response({'error': 'Perfil no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'DELETE':
        profile.delete()
        return Response({'message': 'Perfil eliminado exitosamente'}, status=status.HTTP_204_NO_CONTENT)

class PublicEventDetailView(generics.RetrieveAPIView):
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    lookup_field = "event_code"
    def get_queryset(self):
        return Event.objects.filter(is_active=True)

class PublicCheckExistingUserView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, event_code):
        email = request.data.get('email')
        access_code = request.data.get('access_code')
        
        if not email or not access_code:
            return Response(
                {'error': 'Email y código de acceso requeridos'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        event = get_object_or_404(Event, event_code=event_code, is_active=True)
        
        existing_profile = Profile.get_profile_by_email_and_code(email, access_code)
        
        if not existing_profile:
            return Response(
                {'exists': False, 'message': 'No se encontró un perfil con estos datos'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if Profile.objects.filter(event=event, email=email).exists():
            return Response(
                {'error': 'Ya estás registrado en este evento'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'exists': True,
            'profile': {
                'full_name': existing_profile.full_name,
                'position': existing_profile.position,
                'company_name': existing_profile.company_name,
                'bio': existing_profile.bio,
                'linkedin_url': existing_profile.linkedin_url,
                'phone': existing_profile.phone,
                'interests': existing_profile.interests,
                'photo_url': request.build_absolute_uri(existing_profile.photo.url) if existing_profile.photo else None
            }
        }, status=status.HTTP_200_OK)

class PublicProfileCreateView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, event_code):
        event = get_object_or_404(Event, event_code=event_code, is_active=True)
        data = request.data.copy()
        data['event'] = event.id
        
        use_existing = request.data.get('use_existing_profile', False)
        
        if use_existing:
            email = data.get('email')
            access_code = data.get('existing_access_code')
            
            if not email or not access_code:
                return Response(
                    {'error': 'Email y código de acceso requeridos'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            existing_profile = Profile.get_profile_by_email_and_code(email, access_code)
            
            if not existing_profile:
                return Response(
                    {'error': 'No se encontró un perfil con estos datos'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if Profile.objects.filter(event=event, email=email).exists():
                return Response(
                    {'error': 'Ya estás registrado en este evento'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            new_profile = Profile.objects.create(
                event=event,
                email=existing_profile.email,
                full_name=existing_profile.full_name,
                position=existing_profile.position,
                company_name=existing_profile.company_name,
                bio=existing_profile.bio,
                linkedin_url=existing_profile.linkedin_url,
                phone=existing_profile.phone,
                interests=existing_profile.interests,
                photo=existing_profile.photo
            )
            
            try:
                send_access_code_email(new_profile)
            except Exception as e:
                print(f"Error enviando email: {e}")
            
            serializer = ProfileSerializer(new_profile, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        serializer = ProfileSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            profile = serializer.save()
            try:
                send_access_code_email(profile)
            except Exception as e:
                print(f"Error enviando email: {e}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PublicVerifyCodeView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, event_code):
        event = get_object_or_404(Event, event_code=event_code, is_active=True)
        access_code = request.data.get('access_code')
        if not access_code:
            return Response({'error': 'Código de acceso requerido'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile = Profile.objects.get(event=event, access_code=access_code)
            if not profile.code_verified:
                profile.code_verified = True
                profile.save()
            serializer = ProfileSerializer(profile, context={'request': request})
            return Response({
                'verified': True,
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({'error': 'Código inválido'}, status=status.HTTP_404_NOT_FOUND)

class PublicDirectoryView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, event_code):
        event = get_object_or_404(Event, event_code=event_code, is_active=True)
        access_code = request.query_params.get('access_code')
        if not access_code:
            return Response({'error': 'Código de acceso requerido'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            requesting_profile = Profile.objects.get(event=event, access_code=access_code)
        except Profile.DoesNotExist:
            return Response({'error': 'Código inválido'}, status=status.HTTP_403_FORBIDDEN)
        profiles = Profile.objects.filter(event=event, code_verified=True)
        serializer = ProfileListSerializer(profiles, many=True, context={'request': request})
        return Response({
            'event': EventSerializer(event, context={'request': request}).data,
            'profiles': serializer.data
        }, status=status.HTTP_200_OK)

class PublicProfileView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, event_code):
        event = get_object_or_404(Event, event_code=event_code, is_active=True)
        access_code = request.query_params.get('access_code')
        if not access_code:
            return Response({'error': 'Código de acceso requerido'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile = Profile.objects.get(event=event, access_code=access_code)
            serializer = ProfileSerializer(profile, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({'error': 'Perfil no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request, event_code):
        event = get_object_or_404(Event, event_code=event_code, is_active=True)
        access_code = request.data.get('access_code')
        
        if not access_code:
            return Response({'error': 'Código de acceso requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            profile = Profile.objects.get(event=event, access_code=access_code)
            serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
            
            if serializer.is_valid():
                updated_profile = serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Profile.DoesNotExist:
            return Response({'error': 'Perfil no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NetworkingSlotRequestView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, event_code):
        event = get_object_or_404(Event, event_code=event_code, is_active=True)
        access_code = request.data.get('access_code')
        if not access_code:
            return Response({'error': 'Código de acceso requerido'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            requester = Profile.objects.get(event=event, access_code=access_code)
        except Profile.DoesNotExist:
            return Response({'error': 'Código inválido'}, status=status.HTTP_403_FORBIDDEN)
        profile_id = request.data.get('profile_id')
        time_slot = request.data.get('time_slot')
        message = request.data.get('message', '')
        if not profile_id or not time_slot:
            return Response({'error': 'Datos incompletos'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            target_profile = Profile.objects.get(id=profile_id, event=event)
        except Profile.DoesNotExist:
            return Response({'error': 'Perfil no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        if requester.id == target_profile.id:
            return Response({'error': 'No puedes solicitar un slot contigo mismo'}, status=status.HTTP_400_BAD_REQUEST)
        if time_slot not in target_profile.get_available_slots():
            return Response({'error': 'Este slot no está disponible'}, status=status.HTTP_400_BAD_REQUEST)
        slot, created = NetworkingSlot.objects.get_or_create(
            profile=target_profile,
            time_slot=time_slot,
            defaults={
                'requester': requester,
                'message': message,
                'status': 'pending'
            }
        )
        if not created:
            return Response({'error': 'Este slot ya tiene una solicitud'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = NetworkingSlotSerializer(slot, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class NetworkingSlotManageView(APIView):
    permission_classes = [AllowAny]
    def patch(self, request, event_code, slot_id):
        event = get_object_or_404(Event, event_code=event_code, is_active=True)
        access_code = request.data.get('access_code')
        if not access_code:
            return Response({'error': 'Código de acceso requerido'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile = Profile.objects.get(event=event, access_code=access_code)
        except Profile.DoesNotExist:
            return Response({'error': 'Código inválido'}, status=status.HTTP_403_FORBIDDEN)
        try:
            slot = NetworkingSlot.objects.get(id=slot_id, profile=profile)
        except NetworkingSlot.DoesNotExist:
            return Response({'error': 'Solicitud no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get('status')
        if new_status not in ['accepted', 'rejected']:
            return Response({'error': 'Estado inválido'}, status=status.HTTP_400_BAD_REQUEST)
        slot.status = new_status
        slot.save()
        serializer = NetworkingSlotSerializer(slot, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    def delete(self, request, event_code, slot_id):
        event = get_object_or_404(Event, event_code=event_code, is_active=True)
        access_code = request.query_params.get('access_code')
        if not access_code:
            return Response({'error': 'Código de acceso requerido'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile = Profile.objects.get(event=event, access_code=access_code)
        except Profile.DoesNotExist:
            return Response({'error': 'Código inválido'}, status=status.HTTP_403_FORBIDDEN)
        try:
            slot = NetworkingSlot.objects.get(id=slot_id)
            if slot.requester.id != profile.id and slot.profile.id != profile.id:
                return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        except NetworkingSlot.DoesNotExist:
            return Response({'error': 'Solicitud no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        slot.status = 'cancelled'
        slot.save()
        return Response({'message': 'Solicitud cancelada'}, status=status.HTTP_200_OK)