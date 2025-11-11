"""
Script de prueba para enviar email usando Gmail API
Ejecuta: python test_gmail.py
"""

import os
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def get_gmail_service():
    """Crea y retorna el servicio de Gmail API"""
    print("🔐 Autenticando con Gmail API...")
    
    creds = Credentials(
        token=None,
        refresh_token=os.getenv('GMAIL_REFRESH_TOKEN'),
        token_uri='https://oauth2.googleapis.com/token',
        client_id=os.getenv('GMAIL_CLIENT_ID'),
        client_secret=os.getenv('GMAIL_CLIENT_SECRET'),
        scopes=['https://www.googleapis.com/auth/gmail.send']
    )
    
    service = build('gmail', 'v1', credentials=creds)
    print("✅ Autenticación exitosa!")
    return service

def create_message(sender, to, subject, html_content, plain_content):
    """Crea un mensaje de email"""
    message = MIMEMultipart('alternative')
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    
    # Adjunta versiones texto plano y HTML
    part1 = MIMEText(plain_content, 'plain', 'utf-8')
    part2 = MIMEText(html_content, 'html', 'utf-8')
    
    message.attach(part1)
    message.attach(part2)
    
    # Codifica el mensaje
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
    return {'raw': raw_message}

def send_test_email(to_email):
    """Envía un email de prueba"""
    from_email = os.getenv('DEFAULT_FROM_EMAIL')
    subject = '🎉 Email de Prueba - NetU Platform'
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
                background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
                border-radius: 10px 10px 0 0; 
            }
            .content { 
                background: #f9fafb; 
                padding: 30px; 
                border-radius: 0 0 10px 10px; 
            }
            .success-badge {
                background: #10B981;
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                display: inline-block;
                margin: 20px 0;
                font-weight: bold;
            }
            .info-box {
                background: white;
                border-left: 4px solid #3B82F6;
                padding: 15px;
                margin: 20px 0;
            }
            .footer { 
                text-align: center; 
                color: #6b7280; 
                font-size: 12px; 
                margin-top: 30px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Gmail API Funcionando!</h1>
            </div>
            <div class="content">
                <div class="success-badge">
                    🎯 Prueba Exitosa
                </div>
                
                <h2>¡Hola desde NetU! 👋</h2>
                
                <p>Si estás leyendo este email, significa que la integración con Gmail API está funcionando perfectamente.</p>
                
                <div class="info-box">
                    <strong>✨ Características configuradas:</strong>
                    <ul>
                        <li>✅ Autenticación OAuth 2.0</li>
                        <li>✅ Envío de emails HTML</li>
                        <li>✅ Refresh Token configurado</li>
                        <li>✅ Gmail API activa</li>
                    </ul>
                </div>
                
                <p><strong>Próximos pasos:</strong></p>
                <ol>
                    <li>Integrar el envío de códigos de acceso</li>
                    <li>Personalizar templates de email</li>
                    <li>Configurar emails transaccionales</li>
                </ol>
                
                <p style="margin-top: 30px;">
                    <em>Este es un email de prueba generado automáticamente.</em>
                </p>
                
                <div class="footer">
                    <p>Este es un correo automático de prueba</p>
                    <p>&copy; 2025 NetU - Plataforma de Networking</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_content = """
    ✅ Gmail API Funcionando!
    
    ¡Hola desde NetU! 👋
    
    Si estás leyendo este email, significa que la integración con Gmail API está funcionando perfectamente.
    
    Características configuradas:
    ✅ Autenticación OAuth 2.0
    ✅ Envío de emails HTML
    ✅ Refresh Token configurado
    ✅ Gmail API activa
    
    Próximos pasos:
    1. Integrar el envío de códigos de acceso
    2. Personalizar templates de email
    3. Configurar emails transaccionales
    
    Este es un email de prueba generado automáticamente.
    
    © 2025 NetU - Plataforma de Networking
    """
    
    try:
        print(f"\n📧 Enviando email de prueba...")
        print(f"   De: {from_email}")
        print(f"   Para: {to_email}")
        print(f"   Asunto: {subject}")
        
        service = get_gmail_service()
        message = create_message(from_email, to_email, subject, html_content, plain_content)
        
        sent_message = service.users().messages().send(
            userId='me',
            body=message
        ).execute()
        
        print(f"\n✅ ¡Email enviado exitosamente!")
        print(f"   Message ID: {sent_message['id']}")
        print(f"\n📬 Revisa tu bandeja de entrada en: {to_email}")
        return True
        
    except Exception as e:
        print(f"\n❌ Error al enviar email: {e}")
        print("\n🔍 Posibles causas:")
        print("1. Verifica que todas las credenciales en .env sean correctas")
        print("2. Asegúrate que el GMAIL_REFRESH_TOKEN no tenga espacios")
        print("3. Verifica que DEFAULT_FROM_EMAIL sea el mismo email autorizado")
        print("4. Revisa que Gmail API esté habilitada en Google Cloud Console")
        return False

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🧪 TEST DE ENVÍO DE EMAIL - GMAIL API")
    print("=" * 60)
    
    # Verificar variables de entorno
    print("\n🔍 Verificando configuración...")
    
    required_vars = [
        'GMAIL_CLIENT_ID',
        'GMAIL_CLIENT_SECRET', 
        'GMAIL_REFRESH_TOKEN',
        'DEFAULT_FROM_EMAIL'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing_vars.append(var)
            print(f"   ❌ {var}: No configurado")
        else:
            # Mostrar solo los primeros caracteres por seguridad
            display_value = value[:20] + "..." if len(value) > 20 else value
            print(f"   ✅ {var}: {display_value}")
    
    if missing_vars:
        print(f"\n❌ Faltan variables de entorno: {', '.join(missing_vars)}")
        print("   Configúralas en tu archivo .env")
        exit(1)
    
    print("\n" + "=" * 60)
    
    # Solicitar email de destino
    default_email = os.getenv('DEFAULT_FROM_EMAIL')
    print(f"\n📬 ¿A qué email enviar la prueba?")
    print(f"   (Enter para usar: {default_email})")
    
    to_email = input("\nEmail destino: ").strip()
    if not to_email:
        to_email = default_email
    
    print("\n" + "=" * 60)
    
    # Enviar email de prueba
    success = send_test_email(to_email)
    
    print("\n" + "=" * 60)
    
    if success:
        print("\n🎉 ¡Prueba completada exitosamente!")
        print("\n💡 Ahora puedes usar emails.py en tu aplicación Django")
    else:
        print("\n⚠️  La prueba falló. Revisa los errores anteriores.")
    
    print("\n" + "=" * 60)