# Multimodal Translator AI

Aplicación web multimodal basada en Inteligencia Artificial para realizar traducciones entre **español e inglés** utilizando diferentes tipos de contenido: texto, audio, documentos e imágenes.

El proyecto integra un frontend desarrollado con **HTML, CSS, JavaScript y Bootstrap**, un backend desarrollado en **Python**, y servicios de Inteligencia Artificial mediante la **API de OpenAI**.

---

## Descripción

**Multimodal Translator AI** es una plataforma web que permite traducir contenido entre español e inglés mediante cuatro módulos principales:

- Chat bilingüe.
- Traducción de audio.
- Traducción de documentos.
- Traducción de texto visible en imágenes.

Cada módulo utiliza Inteligencia Artificial para procesar el contenido recibido y presentar los resultados dentro de una interfaz moderna, responsiva y fácil de utilizar.

La aplicación fue desarrollada como parte del proyecto:

**1.4 Tendencias actuales de la IA**

de la materia:

**Inteligencia artificial aplicada a las TIC**

---

# Funcionalidades

## 1. Chat bilingüe

El módulo de Chat permite simular una conversación entre dos participantes.

### Participante A

```text
Español → English
```

### Participant B

```text
English → Español
```

El sistema identifica la dirección de traducción dependiendo del participante seleccionado.

Cada mensaje muestra:

- Participante.
- Texto original.
- Traducción.
- Dirección de traducción.

El módulo también incluye:

- Contador de caracteres.
- Historial de conversación.
- Botón para iniciar una nueva conversación.
- Estados de carga.
- Validación de mensajes.
- Manejo de errores.
- Interfaz responsiva.

---

# 2. Traducción de audio

El módulo de Audio permite cargar archivos que contengan voz en español o inglés.

El sistema realiza el siguiente proceso:

```text
Archivo de audio
       ↓
Speech-to-Text
       ↓
Transcripción
       ↓
Traducción
       ↓
Text-to-Speech
       ↓
Audio traducido
```

La plataforma muestra:

- Reproductor del audio original.
- Transcripción obtenida.
- Traducción.
- Audio generado en el idioma de destino.

### Formatos soportados

```text
MP3
WAV
M4A
MP4
MPEG
MPGA
WEBM
```

Tamaño máximo configurado:

```text
2.5 MB
```

El usuario puede trabajar en ambas direcciones:

```text
Español → English
English → Español
```

---

# 3. Traducción de documentos

El módulo de Documentos permite procesar archivos que contienen texto.

### Formatos soportados

```text
PDF
DOCX
TXT
```

El sistema sigue este proceso:

```text
Documento
   ↓
Validación
   ↓
Extracción de texto
   ↓
Procesamiento
   ↓
Traducción con IA
   ↓
Resultado
```

La interfaz muestra:

- Información del archivo.
- Contenido original extraído.
- Traducción.
- Estado del procesamiento.

### PDF

Los documentos PDF son procesados utilizando:

```text
pypdf
```

El archivo debe contener texto extraíble.

Los documentos PDF que contienen únicamente imágenes escaneadas pueden no proporcionar texto utilizable, ya que este proyecto no utiliza OCR para documentos.

### DOCX

Los documentos de Microsoft Word son procesados utilizando:

```text
python-docx
```

### TXT

Los archivos de texto plano también pueden ser procesados directamente.

Tamaño máximo configurado:

```text
2.5 MB
```

---

# 4. Traducción de imágenes

El módulo de Imágenes utiliza capacidades de visión de Inteligencia Artificial para analizar imágenes que contienen texto visible.

Puede utilizarse con contenido como:

```text
Carteles
Menús
Capturas de pantalla
Señalizaciones
Anuncios
Etiquetas
Texto impreso
```

Flujo de procesamiento:

```text
Imagen
   ↓
Análisis visual con IA
   ↓
Detección de texto
   ↓
Interpretación
   ↓
Traducción
```

La plataforma muestra:

- Vista previa de la imagen.
- Texto detectado.
- Traducción.
- Mensajes cuando no se encuentra texto suficientemente legible.

### Formatos soportados

```text
PNG
JPG
JPEG
WEBP
```

Tamaño máximo configurado:

```text
3 MB
```

---

# Interfaz final

La aplicación utiliza una interfaz oscura inspirada en plataformas modernas de Inteligencia Artificial.

La identidad visual utiliza:

- Fondo grafito.
- Paneles oscuros.
- Azul eléctrico como color principal.
- Indicadores visuales de procesamiento.
- Tarjetas para organizar resultados.
- Navegación entre módulos.
- Iconos mediante Bootstrap Icons.
- Animaciones y efectos visuales discretos.
- Diseño responsivo.

Paleta principal aproximada:

```text
Fondo principal       #090A0C
Paneles               #14171B
Panel secundario      #20242A

Azul eléctrico        #3B82F6
Azul claro            #60A5FA
Azul suave            #93C5FD
Azul oscuro           #2563EB

Texto principal       #F7F7F8
Texto secundario      #A4ABB4
```

---

# Tecnologías utilizadas

## Frontend

```text
HTML5
CSS3
JavaScript
Bootstrap 5
Bootstrap Icons
```

## Backend

```text
Python 3.12
OpenAI Python SDK
pypdf
python-docx
```

## Inteligencia Artificial

La API de OpenAI es utilizada para tareas relacionadas con:

```text
Traducción de texto
Procesamiento de lenguaje natural
Análisis visual de imágenes
Transcripción de voz
Generación de voz
```

## Despliegue

```text
GitHub
GitHub Pages
Vercel
```

---

# Arquitectura del sistema

La aplicación utiliza una arquitectura separada entre frontend y backend.

```text
┌────────────────────────────┐
│          Usuario           │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│       GitHub Pages         │
│                            │
│  HTML + CSS + JavaScript   │
└─────────────┬──────────────┘
              │
           fetch()
              │
              ▼
┌────────────────────────────┐
│           Vercel           │
│                            │
│       Backend Python       │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│        OpenAI API          │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│         Resultado          │
│                            │
│    Español ⇄ English       │
└────────────────────────────┘
```

La API Key se mantiene únicamente en el backend mediante variables de entorno.

---

# Estructura del proyecto

```text
1.4-Tendencias-actuales-de-la-IA/
│
├── api/
│   ├── chat.py
│   ├── audio.py
│   ├── document.py
│   └── image.py
│
├── assets/
│   │
│   ├── css/
│   │   └── styles.css
│   │
│   └── js/
│       └── app.js
│
├── .gitignore
├── .python-version
├── index.html
├── README.md
├── requirements.txt
└── vercel.json
```

---

# Endpoints

El backend está dividido en cuatro endpoints principales.

## Chat

```http
POST /api/chat
```

Realiza traducciones de mensajes entre español e inglés.

---

## Audio

```http
POST /api/audio
```

Realiza:

```text
Transcripción
Traducción
Generación de voz
```

---

## Documentos

```http
POST /api/document
```

Procesa documentos:

```text
PDF
DOCX
TXT
```

Extrae el contenido disponible y realiza su traducción.

---

## Imágenes

```http
POST /api/image
```

Analiza imágenes, detecta texto visible y genera su traducción.

---

# Programación Orientada a Objetos

El backend utiliza Programación Orientada a Objetos para separar responsabilidades relacionadas con el procesamiento de información.

Se utilizan clases especializadas para tareas como:

```text
Procesamiento de imágenes
Extracción de documentos
Traducción de documentos
Procesamiento de audio
Traducción
```

Esta estructura facilita:

- Organización del código.
- Reutilización.
- Mantenimiento.
- Separación de responsabilidades.
- Escalabilidad del proyecto.

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

Entrar al proyecto:

```bash
cd 1.4-Tendencias-actuales-de-la-IA
```

---

## 2. Crear el entorno virtual

En PowerShell:

```powershell
python -m venv .venv
```

Activar:

```powershell
.\.venv\Scripts\Activate.ps1
```

En CMD:

```cmd
.venv\Scripts\activate
```

---

## 3. Instalar dependencias

```powershell
pip install -r requirements.txt
```

El archivo `requirements.txt` contiene:

```txt
openai
pypdf
python-docx
```

---

# Variables de entorno

Las claves privadas nunca deben colocarse directamente dentro del código fuente.

En Vercel se utilizan variables de entorno.

## Variables principales

```text
OPENAI_API_KEY
ALLOWED_ORIGIN
```

`OPENAI_API_KEY` contiene la clave utilizada para acceder a los servicios de OpenAI.

`ALLOWED_ORIGIN` contiene el origen autorizado para consumir el backend desde el frontend publicado.

Ejemplo:

```text
ALLOWED_ORIGIN=https://usuario.github.io
```

No debe incluirse la ruta completa del repositorio en el origen.

---

# Variables opcionales

Los diferentes modelos también pueden configurarse mediante variables de entorno.

Ejemplos:

```text
OPENAI_MODEL
OPENAI_IMAGE_MODEL
OPENAI_DOCUMENT_MODEL

OPENAI_TRANSCRIPTION_MODEL
OPENAI_AUDIO_TRANSLATION_MODEL
OPENAI_TTS_MODEL
OPENAI_TTS_VOICE
```

Si no se configuran, el backend puede utilizar los valores predeterminados definidos en cada endpoint.

---

# Seguridad

La aplicación utiliza diferentes medidas para reducir riesgos durante el procesamiento de información.

## API Key protegida

La clave de OpenAI se encuentra almacenada únicamente en las variables de entorno del backend.

Nunca se incluye directamente en:

```text
index.html
styles.css
app.js
GitHub
```

---

## CORS

El backend restringe las solicitudes utilizando:

```text
ALLOWED_ORIGIN
```

Esto permite controlar qué frontend puede realizar peticiones hacia los endpoints.

---

## Validación de archivos

Los endpoints validan elementos como:

```text
Extensión
Tamaño
Tipo de archivo
Contenido recibido
Datos vacíos
Idioma de origen
Idioma de destino
```

---

## Privacidad

La interfaz contiene un aviso para indicar que la información enviada puede ser procesada mediante servicios de Inteligencia Artificial.

Se recomienda no utilizar:

```text
Contraseñas
Información bancaria
Datos personales sensibles
Información confidencial
Documentos privados
```

---

# Manejo de errores

La aplicación incluye validaciones y mensajes para diferentes situaciones.

Por ejemplo:

```text
Archivo no seleccionado
Formato no permitido
Archivo demasiado grande
Mensaje vacío
Documento sin texto
Imagen sin texto legible
Error de conexión
Respuesta inválida
Error durante el procesamiento
```

Los botones también muestran estados como:

```text
Traduciendo...
Procesando...
Analizando...
```

para indicar que una operación se encuentra en curso.

---

# Diseño responsivo

La interfaz fue diseñada para adaptarse a diferentes tamaños de pantalla.

Es compatible con:

```text
Computadoras de escritorio
Laptops
Tablets
Teléfonos móviles
```

En dispositivos pequeños:

- Los paneles pasan a una sola columna.
- Los resultados se reorganizan verticalmente.
- Los botones ocupan más espacio disponible.
- La navegación puede desplazarse horizontalmente.
- Los reproductores y campos se adaptan al ancho disponible.

---

# Pruebas realizadas

Durante el desarrollo se realizaron pruebas en ambas direcciones de traducción:

```text
Español → English
English → Español
```

## Chat

Se comprobó:

```text
Envío de mensajes
Traducción
Cambio de participante
Historial conversacional
Nueva conversación
Contador de caracteres
```

---

## Imágenes

Se comprobó:

```text
Carga de archivos
Vista previa
Análisis visual
Detección de texto
Traducción
```

---

## Documentos

Se realizaron pruebas utilizando:

```text
PDF
DOCX
TXT
```

con contenido tanto en español como en inglés.

---

## Audio

Se realizaron pruebas con archivos de voz en:

```text
Español
English
```

Se comprobó:

```text
Carga del audio
Reproducción del archivo original
Transcripción
Traducción
Generación de voz
Reproducción del audio traducido
```

---

# Despliegue

## Frontend

El frontend se publica utilizando:

```text
GitHub Pages
```

Los principales archivos del frontend son:

```text
index.html
assets/css/styles.css
assets/js/app.js
```

---

## Backend

El backend se encuentra desplegado utilizando:

```text
Vercel
```

Los endpoints de Python se encuentran dentro de:

```text
/api
```

Vercel instala automáticamente las dependencias indicadas en:

```text
requirements.txt
```

---

# Git y GitHub

El proyecto utiliza Git para el control de versiones.

Flujo básico:

```bash
git status
git add .
git commit -m "descripcion del cambio"
git push
```

Ejemplos de commits utilizados durante el proyecto:

```bash
git commit -m "feat: agregar chat bilingue"
```

```bash
git commit -m "feat: agregar traduccion de imagenes"
```

```bash
git commit -m "feat: agregar traduccion de documentos"
```

```bash
git commit -m "feat: agregar traduccion y generacion de audio"
```

```bash
git commit -m "style: actualizar interfaz de la plataforma"
```

---

# Flujo general de la plataforma

```text
                    MULTIMODAL TRANSLATOR AI
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
           CHAT             AUDIO         DOCUMENTOS
             │                │                │
             │                │                │
             └───────────┬────┴──────┬─────────┘
                         │           │
                         │           ▼
                         │        IMÁGENES
                         │
                         ▼
                    BACKEND PYTHON
                         │
                         ▼
                     OPENAI API
                         │
                         ▼
                ESPAÑOL ⇄ ENGLISH
```

---

# Resultado final

El resultado es una plataforma multimodal capaz de trabajar con distintos tipos de información dentro de una sola aplicación.

```text
💬 Chat
   Español ⇄ English

🎙 Audio
   Voz → Texto → Traducción → Voz

📄 Documentos
   PDF
   DOCX
   TXT

🖼 Imágenes
   Imagen → Texto detectado → Traducción
```

Los cuatro módulos utilizan una misma interfaz y comparten la posibilidad de realizar traducciones entre español e inglés.

---

# Conclusión

El desarrollo de **Multimodal Translator AI** permitió integrar diferentes tecnologías relacionadas con el desarrollo web y la Inteligencia Artificial dentro de una sola plataforma.

Durante el proyecto se trabajó con frontend, backend, consumo de APIs, procesamiento de diferentes formatos, validación de información, Programación Orientada a Objetos, manejo de errores, seguridad mediante variables de entorno, CORS, control de versiones y despliegue en servicios web.

La integración de texto, audio, documentos e imágenes permitió construir una aplicación multimodal capaz de procesar diferentes tipos de contenido y utilizar Inteligencia Artificial para generar traducciones entre español e inglés.

El proyecto también permitió comprender la importancia de mantener separada la lógica del frontend y backend, proteger información sensible como las claves de API y diseñar interfaces responsivas que permitan utilizar las funciones de Inteligencia Artificial de forma clara y accesible.

---

# Autor

**Desarrollado por:** Nicole Dayana Esparza Lares  
**No. Control:** 22200208  
**Carrera:** ITICS  
**Materia:** Inteligencia artificial aplicada a las TIC  
**Institución:** Tecnológico Nacional de México campus Pachuca  

**Proyecto:** 1.4 Tendencias actuales de la IA

---

## Multimodal Translator AI

```text
Chat + Audio + Documentos + Imágenes
            │
            ▼
     Inteligencia Artificial
            │
            ▼
      Español ⇄ English
```

**Tecnologías principales:** HTML, CSS, JavaScript, Bootstrap, Python, OpenAI, GitHub Pages y Vercel.