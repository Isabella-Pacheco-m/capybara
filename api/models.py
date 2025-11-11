from django.db import models
from django.db.models import Q
from django.core.validators import RegexValidator
from datetime import datetime, timedelta
import uuid
import secrets

class Company(models.Model):
    name = models.CharField(max_length=200, verbose_name="Nombre de la empresa")
    description = models.TextField(verbose_name="Descripción", blank=True)
    industry = models.CharField(max_length=100, verbose_name="Nicho/Área")
    logo = models.ImageField(upload_to='companies/logos/', verbose_name="Logo", null=True, blank=True)
    hex_color_validator = RegexValidator(
        regex=r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
        message='Ingresa un color hexadecimal válido'
    )
    primary_color = models.CharField(max_length=7, validators=[hex_color_validator], default='#3B82F6', verbose_name="Color primario")
    secondary_color = models.CharField(max_length=7, validators=[hex_color_validator], default='#1E40AF', verbose_name="Color secundario")
    accent_color = models.CharField(max_length=7, validators=[hex_color_validator], default='#60A5FA', verbose_name="Color de acento")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última actualización")
    is_active = models.BooleanField(default=True, verbose_name="Activa")
    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
        ordering = ['-created_at']
    def __str__(self):
        return self.name
    @property
    def events_count(self):
        return self.events.count()

class Event(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='events', verbose_name="Empresa organizadora")
    name = models.CharField(max_length=200, verbose_name="Nombre del evento")
    event_code = models.CharField(max_length=20, unique=True, verbose_name="Código del evento")
    description = models.TextField(verbose_name="Descripción", blank=True)
    start_date = models.DateField(verbose_name="Fecha de inicio")
    end_date = models.DateField(verbose_name="Fecha de finalización")
    start_time = models.TimeField(verbose_name="Hora de inicio", default='09:00')
    end_time = models.TimeField(verbose_name="Hora final", default='18:00')
    networking_hours = models.DecimalField(max_digits=4, decimal_places=1, verbose_name="Horas de networking", default=0)
    location = models.CharField(max_length=300, verbose_name="Lugar", blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última actualización")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    class Meta:
        verbose_name = "Evento"
        verbose_name_plural = "Eventos"
        ordering = ['-start_date', '-created_at']
    def __str__(self):
        return f"{self.name} - {self.event_code}"
    def save(self, *args, **kwargs):
        if not self.event_code:
            self.event_code = self.generate_unique_code()
        super().save(*args, **kwargs)
    @staticmethod
    def generate_unique_code():
        while True:
            code = str(uuid.uuid4().hex[:8]).upper()
            if not Event.objects.filter(event_code=code).exists():
                return code
    @property
    def profiles_count(self):
        return self.profiles.count()
    @property
    def is_upcoming(self):
        from django.utils import timezone
        return self.start_date >= timezone.now().date()
    @property
    def is_past(self):
        from django.utils import timezone
        return self.end_date < timezone.now().date()
    def generate_networking_slots(self):
        if self.networking_hours <= 0:
            return []
        end_datetime = datetime.combine(datetime.today(), self.end_time)
        start_networking = end_datetime + timedelta(minutes=15)
        end_networking = start_networking + timedelta(hours=float(self.networking_hours))
        slots = []
        current_time = start_networking
        while current_time < end_networking:
            slots.append(current_time.strftime('%H:%M'))
            current_time += timedelta(minutes=15)
        return slots

class Profile(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='profiles', verbose_name="Evento")
    photo = models.ImageField(upload_to='profiles/photos/', verbose_name="Foto de perfil", null=True, blank=True)
    full_name = models.CharField(max_length=200, verbose_name="Nombre completo")
    position = models.CharField(max_length=200, verbose_name="Cargo")
    company_name = models.CharField(max_length=200, verbose_name="Empresa")
    bio = models.TextField(verbose_name="Descripción", blank=True)
    interests = models.JSONField(default=list, verbose_name="Intereses")
    linkedin_url = models.URLField(max_length=500, verbose_name="LinkedIn", blank=True)
    email = models.EmailField(verbose_name="Correo electrónico")
    phone = models.CharField(max_length=20, verbose_name="Teléfono", blank=True)
    access_code = models.CharField(max_length=12, unique=True, verbose_name="Código de acceso")
    code_verified = models.BooleanField(default=False, verbose_name="Código verificado")
    available_slots = models.JSONField(default=list, verbose_name="Horarios disponibles", blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de registro")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última actualización")
    class Meta:
        verbose_name = "Perfil"
        verbose_name_plural = "Perfiles"
        ordering = ['-created_at']
        unique_together = ['event', 'email']
    def __str__(self):
        return f"{self.full_name} - {self.event.name}"
    def save(self, *args, **kwargs):
        if not self.access_code:
            self.access_code = self.generate_access_code()
        super().save(*args, **kwargs)
    @staticmethod
    def generate_access_code():
        while True:
            code = secrets.token_urlsafe(8).upper()
            if not Profile.objects.filter(access_code=code).exists():
                return code
    def get_available_slots(self):
        # Retorna los slots disponibles del usuario
        return self.available_slots if self.available_slots else []

class NetworkingSlot(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptada'),
        ('rejected', 'Rechazada'),
        ('cancelled', 'Cancelada'),
    ]
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='networking_slots_received', verbose_name="Perfil receptor")
    requester = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='networking_slots_sent', verbose_name="Perfil solicitante")
    time_slot = models.CharField(max_length=5, verbose_name="Hora del slot")
    message = models.TextField(verbose_name="Mensaje", blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Estado")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de solicitud")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última actualización")
    class Meta:
        verbose_name = "Slot de Networking"
        verbose_name_plural = "Slots de Networking"
        ordering = ['time_slot', '-created_at']
        unique_together = ['profile', 'time_slot']
    def __str__(self):
        return f"{self.requester.full_name} -> {self.profile.full_name} ({self.time_slot})"