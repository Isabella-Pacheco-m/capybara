from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Company, Event, Profile, NetworkingSlot

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('Usuario desactivado')
            else:
                raise serializers.ValidationError('Credenciales incorrectas')
        else:
            raise serializers.ValidationError('Debe incluir username y password')
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden'})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'Este email ya está registrado'})
        return data
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class CompanyBasicSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    class Meta:
        model = Company
        fields = ['id', 'name', 'logo_url', 'primary_color', 'secondary_color', 'accent_color']
    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

class CompanySerializer(serializers.ModelSerializer):
    events_count = serializers.SerializerMethodField()
    logo_url = serializers.SerializerMethodField()
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'description', 'industry',
            'logo', 'logo_url',
            'primary_color', 'secondary_color', 'accent_color',
            'is_active', 'events_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    def get_events_count(self, obj):
        return obj.events.count()
    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None
    def validate_description(self, value):
        return value if value else ''
    def validate_primary_color(self, value):
        if not value.startswith('#'):
            raise serializers.ValidationError('El color debe comenzar con #')
        return value.upper()
    def validate_secondary_color(self, value):
        if not value.startswith('#'):
            raise serializers.ValidationError('El color debe comenzar con #')
        return value.upper()
    def validate_accent_color(self, value):
        if not value.startswith('#'):
            raise serializers.ValidationError('El color debe comenzar con #')
        return value.upper()

class CompanyListSerializer(serializers.ModelSerializer):
    events_count = serializers.SerializerMethodField()
    logo_url = serializers.SerializerMethodField()
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'description', 'industry',
            'logo_url', 'events_count', 'is_active',
            'primary_color', 'secondary_color', 'accent_color'
        ]
    def get_events_count(self, obj):
        return obj.events.count()
    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

class EventSerializer(serializers.ModelSerializer):
    profiles_count = serializers.SerializerMethodField()
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_details = CompanyBasicSerializer(source='company', read_only=True)
    is_upcoming = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    networking_slots = serializers.SerializerMethodField()
    class Meta:
        model = Event
        fields = [
            'id', 'company', 'company_name', 'company_details', 'name', 'event_code',
            'description', 'start_date', 'end_date', 'start_time', 'end_time',
            'networking_hours', 'networking_slots', 'location', 'is_active', 'profiles_count',
            'is_upcoming', 'is_past',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'event_code', 'created_at', 'updated_at']
    def get_profiles_count(self, obj):
        try:
            return obj.profiles.count()
        except:
            return 0
    def get_networking_slots(self, obj):
        return obj.generate_networking_slots()
    def validate(self, data):
        if 'start_date' in data and 'end_date' in data:
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError({
                    'end_date': 'La fecha de finalización debe ser posterior a la fecha de inicio'
                })
        if 'start_time' in data and 'end_time' in data:
            if data['end_time'] <= data['start_time']:
                raise serializers.ValidationError({
                    'end_time': 'La hora final debe ser posterior a la hora de inicio'
                })
        if 'networking_hours' in data:
            if data['networking_hours'] < 0:
                raise serializers.ValidationError({
                    'networking_hours': 'Las horas de networking no pueden ser negativas'
                })
        return data

class EventListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    profiles_count = serializers.SerializerMethodField()
    is_upcoming = serializers.ReadOnlyField()
    class Meta:
        model = Event
        fields = [
            'id', 'name', 'event_code', 'company', 'company_name',
            'start_date', 'end_date', 'start_time', 'end_time',
            'networking_hours', 'location', 'is_active',
            'profiles_count', 'is_upcoming'
        ]
    def get_profiles_count(self, obj):
        try:
            return obj.profiles.count()
        except:
            return 0

class NetworkingSlotSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.full_name', read_only=True)
    requester_company = serializers.CharField(source='requester.company_name', read_only=True)
    requester_position = serializers.CharField(source='requester.position', read_only=True)
    requester_photo = serializers.SerializerMethodField()
    requester_email = serializers.SerializerMethodField()
    requester_phone = serializers.SerializerMethodField()
    profile_name = serializers.CharField(source='profile.full_name', read_only=True)
    profile_email = serializers.SerializerMethodField()
    profile_phone = serializers.SerializerMethodField()
    
    class Meta:
        model = NetworkingSlot
        fields = [
            'id', 'profile', 'profile_name', 'profile_email', 'profile_phone',
            'requester', 'requester_name', 'requester_company', 'requester_position', 
            'requester_photo', 'requester_email', 'requester_phone',
            'time_slot', 'message', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_requester_photo(self, obj):
        if obj.requester.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.requester.photo.url)
            return obj.requester.photo.url
        return None
    
    def get_requester_email(self, obj):
        if obj.status == 'accepted':
            return obj.requester.email
        return None
    
    def get_requester_phone(self, obj):
        if obj.status == 'accepted':
            return obj.requester.phone
        return None
    
    def get_profile_email(self, obj):
        if obj.status == 'accepted':
            return obj.profile.email
        return None
    
    def get_profile_phone(self, obj):
        if obj.status == 'accepted':
            return obj.profile.phone
        return None

class ProfileSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    event_name = serializers.CharField(source='event.name', read_only=True)
    networking_slots_received = serializers.SerializerMethodField()
    networking_slots_sent = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = [
            'id', 'event', 'event_name', 'photo', 'photo_url',
            'full_name', 'position', 'company_name', 'bio', 'interests',
            'linkedin_url', 'email', 'phone',
            'access_code', 'code_verified',
            'available_slots', 'networking_slots_received', 'networking_slots_sent',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'access_code', 'created_at', 'updated_at']
    
    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None
    
    def get_networking_slots_received(self, obj):
        slots = NetworkingSlot.objects.filter(profile=obj)
        return NetworkingSlotSerializer(slots, many=True, context=self.context).data
    
    def get_networking_slots_sent(self, obj):
        slots = NetworkingSlot.objects.filter(requester=obj)
        return NetworkingSlotSerializer(slots, many=True, context=self.context).data
    
    def validate_email(self, value):
        event = self.initial_data.get('event')
        instance_id = self.instance.id if self.instance else None
        if event:
            existing = Profile.objects.filter(event_id=event, email=value)
            if instance_id:
                existing = existing.exclude(id=instance_id)
            if existing.exists():
                raise serializers.ValidationError('Este email ya está registrado en el evento')
        return value

class ProfileListSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = [
            'id', 'photo_url', 'full_name', 'position',
            'company_name', 'bio', 'interests', 'linkedin_url', 'phone',
            'available_slots'
        ]
    
    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None