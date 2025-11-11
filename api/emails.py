import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from django.conf import settings

def get_gmail_service():
    """Create and return Gmail API service instance"""
    creds = Credentials(
        token=None,
        refresh_token=settings.GMAIL_REFRESH_TOKEN,
        token_uri='https://oauth2.googleapis.com/token',
        client_id=settings.GMAIL_CLIENT_ID,
        client_secret=settings.GMAIL_CLIENT_SECRET,
        scopes=['https://www.googleapis.com/auth/gmail.send']
    )
    
    service = build('gmail', 'v1', credentials=creds)
    return service

def create_message(sender, to, subject, html_content, plain_content):
    """Create a message for an email"""
    message = MIMEMultipart('alternative')
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    
    # Attach plain text and HTML versions
    part1 = MIMEText(plain_content, 'plain', 'utf-8')
    part2 = MIMEText(html_content, 'html', 'utf-8')
    
    message.attach(part1)
    message.attach(part2)
    
    # Encode the message
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
    return {'raw': raw_message}

def send_email_via_gmail(to_email, subject, html_content, plain_content):
    """Send email using Gmail API"""
    try:
        service = get_gmail_service()
        message = create_message(
            settings.DEFAULT_FROM_EMAIL,
            to_email,
            subject,
            html_content,
            plain_content
        )
        
        sent_message = service.users().messages().send(
            userId='me',
            body=message
        ).execute()
        
        print(f"Email sent successfully. Message ID: {sent_message['id']}")
        return True
    except Exception as e:
        print(f"Error sending email via Gmail API: {e}")
        return False

def send_access_code_email(profile):
    """Send access code email to event participant"""
    subject = f'Tu código de acceso para {profile.event.name}'
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .code-box {{ background: white; border: 2px dashed #3B82F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
            .code {{ font-size: 32px; font-weight: bold; color: #1E40AF; letter-spacing: 3px; }}
            .button {{ display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>¡Bienvenido a {profile.event.name}!</h1>
            </div>
            <div class="content">
                <p>Hola <strong>{profile.full_name}</strong>,</p>
                <p>Gracias por registrarte en <strong>{profile.event.name}</strong>.</p>
                <p>Tu registro ha sido exitoso. Usa el siguiente código para acceder al directorio del evento:</p>
                
                <div class="code-box">
                    <div class="code">{profile.access_code}</div>
                </div>
                
                <p style="text-align: center;">
                    <a href="{settings.FRONTEND_URL}/events/{profile.event.event_code}/directory" class="button">
                        Acceder al Directorio
                    </a>
                </p>
                
                <p><strong>Detalles del evento:</strong></p>
                <ul>
                    <li>📅 Fecha: {profile.event.start_date.strftime('%d de %B, %Y')}</li>
                    <li>📍 Lugar: {profile.event.location or 'Por confirmar'}</li>
                </ul>
                
                <p>Guarda este código en un lugar seguro. Lo necesitarás para acceder al directorio de participantes.</p>
                
                <div class="footer">
                    <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                    <p>&copy; 2025 NetU - Plataforma de Networking</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
    ¡Bienvenido a {profile.event.name}!
    
    Hola {profile.full_name},
    
    Gracias por registrarte en {profile.event.name}.
    
    Tu código de acceso es: {profile.access_code}
    
    Usa este código para acceder al directorio del evento en:
    {settings.FRONTEND_URL}/events/{profile.event.event_code}/directory
    
    Detalles del evento:
    - Fecha: {profile.event.start_date.strftime('%d de %B, %Y')}
    - Lugar: {profile.event.location or 'Por confirmar'}
    
    Guarda este código en un lugar seguro.
    
    Saludos,
    Equipo de NetU
    """
    
    return send_email_via_gmail(
        profile.email,
        subject,
        html_message,
        plain_message
    )