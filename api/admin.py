from django.contrib import admin
from .models import Company, Event, Profile, NetworkingSlot

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'events_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'industry', 'created_at']
    search_fields = ['name', 'description', 'industry']
    readonly_fields = ['created_at', 'updated_at', 'events_count']
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'description', 'industry', 'is_active')
        }),
        ('Branding', {
            'fields': ('logo', 'primary_color', 'secondary_color', 'accent_color')
        }),
        ('Metadata', {
            'fields': ('events_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['name', 'event_code', 'company', 'start_date', 'end_date', 'networking_hours', 'profiles_count', 'is_active']
    list_filter = ['is_active', 'company', 'start_date']
    search_fields = ['name', 'event_code', 'description', 'company__name']
    readonly_fields = ['event_code', 'created_at', 'updated_at', 'profiles_count']
    fieldsets = (
        ('Información Básica', {
            'fields': ('company', 'name', 'event_code', 'description', 'is_active')
        }),
        ('Fechas y Ubicación', {
            'fields': ('start_date', 'end_date', 'start_time', 'end_time', 'location')
        }),
        ('Networking', {
            'fields': ('networking_hours',)
        }),
        ('Metadata', {
            'fields': ('profiles_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'event', 'company_name', 'code_verified', 'created_at']
    list_filter = ['code_verified', 'event', 'created_at']
    search_fields = ['full_name', 'email', 'company_name', 'access_code']
    readonly_fields = ['access_code', 'created_at', 'updated_at']
    fieldsets = (
        ('Información Personal', {
            'fields': ('full_name', 'email', 'phone', 'photo')
        }),
        ('Información Profesional', {
            'fields': ('position', 'company_name', 'bio', 'interests', 'linkedin_url')
        }),
        ('Evento', {
            'fields': ('event', 'access_code', 'code_verified')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(NetworkingSlot)
class NetworkingSlotAdmin(admin.ModelAdmin):
    list_display = ['get_event', 'profile', 'requester', 'time_slot', 'status', 'created_at']
    list_filter = ['status', 'time_slot', 'profile__event']
    search_fields = ['profile__full_name', 'requester__full_name', 'message']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Información del Slot', {
            'fields': ('profile', 'requester', 'time_slot', 'status')
        }),
        ('Mensaje', {
            'fields': ('message',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    def get_event(self, obj):
        return obj.profile.event.name
    get_event.short_description = 'Evento'
    get_event.admin_order_field = 'profile__event__name'