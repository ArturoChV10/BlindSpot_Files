# chatbot_server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# ⚠️ PON TU API KEY AQUÍ (la misma que usaste en el test)
API_KEY = 'AIzaSyDi0qfqEQQKRrlQ-nDfHqZ24rBcVLGBY'

print("🚀 INICIANDO CHATBOT DALTONISMO...")

try:
    genai.configure(api_key=API_KEY)
    
    # Usar el modelo que sabemos que funciona
    model = genai.GenerativeModel('models/gemini-2.0-flash')
    
    print("✅ API configurada correctamente")
    print("✅ Modelo: gemini-2.0-flash cargado")
    print("✅ Servicio listo para usar")
        
except Exception as e:
    print(f"❌ Error: {e}")
    model = None

# Prompt del sistema para daltonismo
SISTEMA_DALTONISMO = """Eres un experto en oftalmología especializado en daltonismo. 
Responde ÚNICAMENTE preguntas sobre:

• Daltonismo y visión del color
• Tests de detección (Ishihara, Farnsworth)
• Tipos (protanopia, deuteranopia, tritanopia)
• Estrategias de manejo y adaptación
• Información general sobre la condición

Si la pregunta NO es sobre daltonismo, responde cortésmente:
"Solo puedo ayudarte con preguntas relacionadas con daltonismo y visión del color."

Mantén tus respuestas en español, claras, informativas y útiles."""

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        mensaje = data.get('mensaje', '').strip()
        
        if not mensaje:
            return jsonify({'error': 'Mensaje vacío'}), 400
            
        if not model:
            return jsonify({'error': 'Servicio no disponible'}), 500

        print(f"💬 Pregunta recibida: {mensaje}")
        
        # Crear el prompt completo
        prompt = f"{SISTEMA_DALTONISMO}\n\nPregunta del usuario: {mensaje}\n\nRespuesta:"
        
        # Generar respuesta
        response = model.generate_content(prompt)
        respuesta = response.text.strip()
        
        print(f"🤖 Respuesta generada: {respuesta[:100]}...")
        
        return jsonify({
            'respuesta': respuesta,
            'exito': True
        })
        
    except Exception as e:
        print(f"❌ Error en /chat: {e}")
        return jsonify({
            'error': f'Error del servicio: {str(e)}',
            'exito': False
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'OK' if model else 'ERROR',
        'message': 'Chatbot de Daltonismo funcionando' if model else 'Servicio no disponible',
        'modelo': 'gemini-2.0-flash'
    })

@app.route('/test', methods=['GET'])
def test():
    """Endpoint de prueba rápida"""
    try:
        if not model:
            return jsonify({'error': 'Modelo no cargado'}), 500
            
        response = model.generate_content("Responde con 'OK' si el chatbot de daltonismo funciona correctamente")
        
        return jsonify({
            'status': 'OK',
            'respuesta': response.text,
            'mensaje': 'Chatbot funcionando correctamente'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    if model:
        print("\n🎯 CHATBOT DALTONISMO LISTO")
        print("📍 URL: http://localhost:5002")
        print("📋 Endpoints disponibles:")
        print("   POST /chat      - Enviar mensaje al chatbot")
        print("   GET  /health    - Estado del servicio")
        print("   GET  /test      - Prueba rápida")
        print("\n💡 Características:")
        print("   • Especializado en daltonismo")
        print("   • Respuestas en español")
        print("   • Modelo rápido y confiable")
        print("   • Listo para usar con React Native")
    else:
        print("❌ CHATBOT NO INICIALIZADO - Verifica tu API Key")
    
    app.run(host='0.0.0.0', port=5002, debug=True)