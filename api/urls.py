from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('hello/', views.hello_world, name='hello'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.user_profile, name='profile'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('companies/', views.company_list_create, name='company-list-create'),
    path('companies/<int:pk>/', views.company_detail, name='company-detail'),
    path('events/', views.event_list_create, name='event-list-create'),
    path('events/<int:pk>/', views.event_detail, name='event-detail'),
    path('profiles/', views.profile_list, name='profile-list'),
    path('profiles/<int:pk>/', views.profile_detail, name='profile-detail'),
    path('public/events/<str:event_code>/', views.PublicEventDetailView.as_view(), name='public-event-detail'),
    path('public/events/<str:event_code>/check-existing/', views.PublicCheckExistingUserView.as_view(), name='public-check-existing'),
    path('public/events/<str:event_code>/register/', views.PublicProfileCreateView.as_view(), name='public-profile-register'),
    path('public/events/<str:event_code>/verify/', views.PublicVerifyCodeView.as_view(), name='public-verify-code'),
    path('public/events/<str:event_code>/directory/', views.PublicDirectoryView.as_view(), name='public-directory'),
    path('public/events/<str:event_code>/profile/', views.PublicProfileView.as_view(), name='public-profile-detail'),
    path('public/events/<str:event_code>/networking/request/', views.NetworkingSlotRequestView.as_view(), name='networking-request'),
    path('public/events/<str:event_code>/networking/<int:slot_id>/', views.NetworkingSlotManageView.as_view(), name='networking-manage'),
]