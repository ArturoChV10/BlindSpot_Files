# server.py - Versión mejorada
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import os
import tempfile
import io
from PIL import Image

app = Flask(__name__)
CORS(app)

class ProcesadorImagenes:
    def resaltar_color(self, imagen_path, color_a_resaltar):
        try:
            imagen = cv2.imread(imagen_path)
            if imagen is None:
                return None
            
            hsv = cv2.cvtColor(imagen, cv2.COLOR_BGR2HSV)
            
            if color_a_resaltar == 'rojo':
                lower1 = np.array([0, 100, 100])
                upper1 = np.array([10, 255, 255])
                lower2 = np.array([170, 100, 100])
                upper2 = np.array([180, 255, 255])
                mask1 = cv2.inRange(hsv, lower1, upper1)
                mask2 = cv2.inRange(hsv, lower2, upper2)
                mask = mask1 + mask2
            elif color_a_resaltar == 'verde':
                lower = np.array([40, 50, 50])
                upper = np.array([90, 255, 255])
                mask = cv2.inRange(hsv, lower, upper)
            elif color_a_resaltar == 'azul':
                lower = np.array([100, 50, 50])
                upper = np.array([140, 255, 255])
                mask = cv2.inRange(hsv, lower, upper)
            else:
                return None
            
            gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
            gris_3d = cv2.cvtColor(gris, cv2.COLOR_GRAY2BGR)
            resultado = np.where(mask[:,:,np.newaxis] == 255, imagen, gris_3d)
            
            return resultado.astype(np.uint8)
            
        except Exception as e:
            print(f"Error en procesamiento: {e}")
            return None

procesador = ProcesadorImagenes()

@app.route('/procesar-imagen', methods=['POST'])
def procesar_imagen():
    try:
        print(f"Petición recibida de: {request.remote_addr}")
        
        if 'imagen' not in request.files:
            return jsonify({'error': 'No se envió imagen'}), 400
        
        archivo = request.files['imagen']
        color = request.form.get('color', 'rojo')
        
        print(f"Color solicitado: {color}")
        print(f"Archivo: {archivo.filename}")
        
        if archivo.filename == '':
            return jsonify({'error': 'Nombre vacío'}), 400
        
        if color not in ['rojo', 'verde', 'azul']:
            return jsonify({'error': 'Color no válido'}), 400
        
        # Guardar archivo temporal
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_original:
            archivo.save(temp_original.name)
            temp_path = temp_original.name
        
        print("Procesando imagen...")
        imagen_procesada = procesador.resaltar_color(temp_path, color)
        
        if imagen_procesada is None:
            return jsonify({'error': 'Error al procesar'}), 500
        
        # Guardar resultado en memoria (no en archivo)
        _, buffer = cv2.imencode('.jpg', imagen_procesada)
        io_buffer = io.BytesIO(buffer)
        
        # Limpiar archivo temporal
        os.unlink(temp_path)
        
        print(f"Imagen procesada - Color: {color}")
        
        # Devolver la imagen directamente
        return send_file(
            io_buffer,
            mimetype='image/jpeg',
            as_attachment=False,
            download_name='imagen_procesada.jpg'
        )
        
    except Exception as e:
        print(f"Error en servidor: {e}")
        return jsonify({'error': 'Error interno'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Servidor funcionando'})

if __name__ == '__main__':
    print("Servidor de procesamiento de imágenes iniciado!")
    app.run(host='0.0.0.0', port=5000, debug=True)
