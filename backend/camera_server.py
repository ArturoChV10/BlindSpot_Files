# camera_server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app)

class DetectorColores:
    def __init__(self):
        # Definir rangos de colores en HSV
        self.colores = {
            'rojo': [
                {'lower': np.array([0, 100, 100]), 'upper': np.array([10, 255, 255])},
                {'lower': np.array([170, 100, 100]), 'upper': np.array([180, 255, 255])}
            ],
            'naranja': [
                {'lower': np.array([11, 100, 100]), 'upper': np.array([20, 255, 255])}
            ],
            'amarillo': [
                {'lower': np.array([21, 100, 100]), 'upper': np.array([30, 255, 255])}
            ],
            'verde': [
                {'lower': np.array([40, 50, 50]), 'upper': np.array([90, 255, 255])}
            ],
            'azul': [
                {'lower': np.array([100, 50, 50]), 'upper': np.array([130, 255, 255])}
            ],
            'morado': [
                {'lower': np.array([131, 50, 50]), 'upper': np.array([160, 255, 255])}
            ],
            'rosa': [
                {'lower': np.array([161, 50, 50]), 'upper': np.array([169, 255, 255])}
            ],
            'blanco': [
                {'lower': np.array([0, 0, 200]), 'upper': np.array([180, 50, 255])}
            ],
            'negro': [
                {'lower': np.array([0, 0, 0]), 'upper': np.array([180, 255, 50])}
            ],
            'gris': [
                {'lower': np.array([0, 0, 50]), 'upper': np.array([180, 50, 200])}
            ]
        }
    
    def detectar_color_central(self, imagen_b64):
        """Detecta el color en el centro de la imagen"""
        try:
            # Decodificar imagen base64
            imagen_bytes = base64.b64decode(imagen_b64)
            imagen_array = np.frombuffer(imagen_bytes, np.uint8)
            imagen = cv2.imdecode(imagen_array, cv2.IMREAD_COLOR)
            
            if imagen is None:
                return {'error': 'No se pudo decodificar la imagen'}
            
            # Obtener dimensiones
            altura, ancho = imagen.shape[:2]
            centro_x, centro_y = ancho // 2, altura // 2
            
            # Obtener el píxel central (usamos un área pequeña para mayor precisión)
            margen = 5
            area_central = imagen[centro_y-margen:centro_y+margen, centro_x-margen:centro_x+margen]
            
            if area_central.size == 0:
                return {'error': 'El área central está vacía'}
            
            # Convertir a HSV
            hsv = cv2.cvtColor(area_central, cv2.COLOR_BGR2HSV)
            
            # Calcular el promedio del área central
            hsv_promedio = np.mean(hsv, axis=(0, 1))
            h, s, v = hsv_promedio
            
            print(f"HSV promedio: H={h:.1f}, S={s:.1f}, V={v:.1f}")
            
            # Detectar color basado en los rangos
            color_detectado = self._clasificar_color(h, s, v)
            
            # También obtener el color RGB para mostrar
            bgr_promedio = np.mean(area_central, axis=(0, 1))
            r, g, b = int(bgr_promedio[2]), int(bgr_promedio[1]), int(bgr_promedio[0])
            
            return {
                'color': color_detectado,
                'rgb': f'rgb({r}, {g}, {b})',
                'hsv': f'hsv({int(h)}, {int(s)}%, {int(v)}%)',
                'coordenadas': {
                    'x': centro_x,
                    'y': centro_y,
                    'ancho': ancho,
                    'altura': altura
                },
                'muestra_rgb': f'#{r:02x}{g:02x}{b:02x}'
            }
            
        except Exception as e:
            print(f"Error en detección: {e}")
            return {'error': f'Error procesando imagen: {str(e)}'}
    
    def _clasificar_color(self, h, s, v):
        """Clasifica el color basado en los valores HSV"""
        
        # Primero verificar colores acromáticos
        if v < 30:
            return 'negro'
        elif s < 25 and v > 200:
            return 'blanco'
        elif s < 50 and 50 < v < 200:
            return 'gris'
        
        # Luego verificar colores cromáticos
        if 0 <= h <= 10 or 170 <= h <= 180:
            return 'rojo'
        elif 11 <= h <= 20:
            return 'naranja'
        elif 21 <= h <= 30:
            return 'amarillo'
        elif 40 <= h <= 90:
            return 'verde'
        elif 100 <= h <= 130:
            return 'azul'
        elif 131 <= h <= 160:
            return 'morado'
        elif 161 <= h <= 169:
            return 'rosa'
        else:
            return 'desconocido'

detector = DetectorColores()

@app.route('/detectar-color', methods=['POST'])
def detectar_color():
    try:
        data = request.json
        if not data or 'imagen' not in data:
            return jsonify({'error': 'No se envió imagen'}), 400
        
        imagen_b64 = data['imagen']
        print("Imagen recibida para detección de color")
        
        resultado = detector.detectar_color_central(imagen_b64)
        
        if 'error' in resultado:
            return jsonify(resultado), 400
        
        print(f"Color detectado: {resultado['color']}")
        return jsonify(resultado)
        
    except Exception as e:
        print(f"Error en servidor: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.route('/health-camera', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'OK', 
        'message': 'Servidor de cámara funcionando',
        'colores_soportados': list(detector.colores.keys())
    })

if __name__ == '__main__':
    print("SERVVIDOR DE DETECCIÓN DE COLORES INICIADO")
    print("URL: http://localhost:5001")
    print("Endpoints:")
    print("   POST /detectar-color - Detecta color central")
    print("   GET  /health-camera - Verifica estado")
    print("Colores soportados: rojo, naranja, amarillo, verde, azul, morado, rosa, blanco, negro, gris")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5001, debug=True)
