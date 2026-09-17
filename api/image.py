import base64
import json
import os
import re

from http.server import BaseHTTPRequestHandler

from openai import OpenAI


# ============================================================
# CONFIGURACIÓN
# ============================================================

MAX_REQUEST_BYTES = 4_400_000
MAX_IMAGE_BYTES = 3 * 1024 * 1024

SUPPORTED_IMAGE_TYPES = {
    "image/png",
    "image/jpeg",
    "image/webp"
}

LANGUAGES = {
    "es": "Spanish",
    "en": "English"
}

OPENAI_IMAGE_MODEL = os.environ.get(
    "OPENAI_IMAGE_MODEL",
    "gpt-4.1-mini"
)

RAW_ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGIN",
    ""
)

ALLOWED_ORIGINS = {
    origin.strip().rstrip("/")
    for origin in RAW_ALLOWED_ORIGINS.split(",")
    if origin.strip()
}


# ============================================================
# SERVICIO DE IMÁGENES
# ============================================================

class ImageTranslationService:

    def __init__(self, client, model):
        self.client = client
        self.model = model

    def _clean_json_text(self, text):
        cleaned = text.strip()

        if cleaned.startswith("```"):
            cleaned = re.sub(
                r"^```(?:json)?\s*",
                "",
                cleaned
            )
            cleaned = re.sub(
                r"\s*```$",
                "",
                cleaned
            )

        return cleaned.strip()

    def _parse_response(self, text):
        cleaned = self._clean_json_text(text)

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError:
            raise ValueError(
                "La respuesta del modelo no contiene JSON válido."
            )

        if not isinstance(data, dict):
            raise ValueError(
                "La respuesta del modelo tiene un formato inválido."
            )

        legible = bool(data.get("legible", False))
        detected_text = str(
            data.get("detected_text", "")
        ).strip()

        translation = str(
            data.get("translation", "")
        ).strip()

        message = str(
            data.get("message", "")
        ).strip()

        if not message:
            if legible:
                message = "Texto detectado y traducido correctamente."
            else:
                message = "No se encontró texto suficientemente legible en la imagen."

        if not legible:
            if not detected_text:
                detected_text = "No se encontró texto legible."
            if not translation:
                translation = "No fue posible generar una traducción confiable."

        return {
            "legible": legible,
            "detected_text": detected_text,
            "translation": translation,
            "message": message
        }

    def translate_visible_text(
        self,
        image_base64,
        mime_type,
        source_language,
        target_language
    ):
        source_name = LANGUAGES[source_language]
        target_name = LANGUAGES[target_language]

        prompt = (
            f"Analyze the image. The visible text is expected in {source_name} "
            f"and it must be translated into {target_name}.\n\n"
            "Tasks:\n"
            "1. Extract only the readable visible text from the image.\n"
            "2. Preserve line breaks and structure when practical.\n"
            "3. Translate the extracted text naturally.\n"
            "4. Do not invent text that is not visible.\n"
            "5. If the text is not readable or there is no text, set legible to false.\n\n"
            "Return ONLY valid JSON with this exact structure:\n"
            "{\n"
            '  "legible": true,\n'
            '  "detected_text": "visible text here",\n'
            '  "translation": "translated text here",\n'
            '  "message": "short status message"\n'
            "}\n\n"
            "If no reliable text can be extracted, return:\n"
            "{\n"
            '  "legible": false,\n'
            '  "detected_text": "",\n'
            '  "translation": "",\n'
            '  "message": "No readable text was found in the image."\n'
            "}"
        )

        response = self.client.responses.create(
            model=self.model,
            instructions=(
                "You are an OCR and translation assistant specialized in "
                "Spanish and English. Return only valid JSON."
            ),
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": prompt
                        },
                        {
                            "type": "input_image",
                            "image_url": f"data:{mime_type};base64,{image_base64}"
                        }
                    ]
                }
            ],
            store=False,
            max_output_tokens=2000
        )

        output_text = (response.output_text or "").strip()

        if not output_text:
            raise ValueError(
                "La respuesta del modelo llegó vacía."
            )

        return self._parse_response(output_text)


# ============================================================
# HANDLER
# ============================================================

class handler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        return

    def _get_origin(self):
        return self.headers.get("Origin", "").rstrip("/")

    def _origin_is_allowed(self):
        origin = self._get_origin()

        if not origin:
            return False

        return origin in ALLOWED_ORIGINS

    def _add_cors_headers(self):
        origin = self._get_origin()

        if origin and origin in ALLOWED_ORIGINS:
            self.send_header(
                "Access-Control-Allow-Origin",
                origin
            )
            self.send_header(
                "Vary",
                "Origin"
            )

        self.send_header(
            "Access-Control-Allow-Methods",
            "POST, OPTIONS"
        )
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

    def _send_json(self, status_code, payload):
        data = json.dumps(
            payload,
            ensure_ascii=False
        ).encode("utf-8")

        self.send_response(status_code)
        self._add_cors_headers()

        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8"
        )
        self.send_header(
            "Content-Length",
            str(len(data))
        )

        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        if not self._origin_is_allowed():
            self.send_response(403)
            self.end_headers()
            return

        self.send_response(204)
        self._add_cors_headers()
        self.end_headers()

    def do_POST(self):
        if not self._origin_is_allowed():
            self._send_json(
                403,
                {
                    "success": False,
                    "error": "Origen no autorizado."
                }
            )
            return

        api_key = os.environ.get("OPENAI_API_KEY")

        if not api_key:
            self._send_json(
                500,
                {
                    "success": False,
                    "error": "El servicio no está configurado correctamente."
                }
            )
            return

        content_type = self.headers.get(
            "Content-Type",
            ""
        ).lower()

        if "application/json" not in content_type:
            self._send_json(
                415,
                {
                    "success": False,
                    "error": "El contenido debe enviarse en formato JSON."
                }
            )
            return

        try:
            content_length = int(
                self.headers.get("Content-Length", "0")
            )
        except ValueError:
            self._send_json(
                400,
                {
                    "success": False,
                    "error": "Tamaño de solicitud inválido."
                }
            )
            return

        if content_length <= 0:
            self._send_json(
                400,
                {
                    "success": False,
                    "error": "La solicitud está vacía."
                }
            )
            return

        if content_length > MAX_REQUEST_BYTES:
            self._send_json(
                413,
                {
                    "success": False,
                    "error": "La solicitud supera el tamaño permitido."
                }
            )
            return

        try:
            raw_body = self.rfile.read(content_length)
            body = json.loads(raw_body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send_json(
                400,
                {
                    "success": False,
                    "error": "El cuerpo de la solicitud no contiene JSON válido."
                }
            )
            return

        if not isinstance(body, dict):
            self._send_json(
                400,
                {
                    "success": False,
                    "error": "Solicitud inválida."
                }
            )
            return

        image_base64 = str(
            body.get("image_base64", "")
        ).strip()

        mime_type = str(
            body.get("mime_type", "")
        ).strip().lower()

        source_language = str(
            body.get("source_language", "")
        ).strip().lower()

        target_language = str(
            body.get("target_language", "")
        ).strip().lower()

        if image_base64.startswith("data:"):
            try:
                header, image_base64 = image_base64.split(",", 1)

                if not mime_type:
                    mime_type = (
                        header
                        .split(";")[0]
                        .replace("data:", "")
                        .strip()
                        .lower()
                    )
            except ValueError:
                self._send_json(
                    400,
                    {
                        "success": False,
                        "error": "La imagen base64 tiene un formato inválido."
                    }
                )
                return

        if not image_base64:
            self._send_json(
                400,
                {
                    "success": False,
                    "error": "Selecciona una imagen antes de continuar."
                }
            )
            return

        if mime_type not in SUPPORTED_IMAGE_TYPES:
            self._send_json(
                415,
                {
                    "success": False,
                    "error": "Formato no permitido. Usa PNG, JPG, JPEG o WEBP."
                }
            )
            return

        if source_language not in LANGUAGES:
            self._send_json(
                400,
                {
                    "success": False,
                    "error": "Idioma de origen no válido."
                }
            )
            return

        if target_language not in LANGUAGES:
            self._send_json(
                400,
                {
                    "success": False,
                    "error": "Idioma de destino no válido."
                }
            )
            return

        if source_language == target_language:
            self._send_json(
                400,
                {
                    "success": False,
                    "error": "Los idiomas de origen y destino deben ser diferentes."
                }
            )
            return

        try:
            image_bytes = base64.b64decode(
                image_base64,
                validate=True
            )
        except Exception:
            self._send_json(
                400,
                {
                    "success": False,
                    "error": "La imagen codificada en base64 es inválida."
                }
            )
            return

        if not image_bytes:
            self._send_json(
                400,
                {
                    "success": False,
                    "error": "La imagen está vacía."
                }
            )
            return

        if len(image_bytes) > MAX_IMAGE_BYTES:
            self._send_json(
                413,
                {
                    "success": False,
                    "error": "La imagen supera el tamaño máximo permitido de 3 MB."
                }
            )
            return

        try:
            client = OpenAI(api_key=api_key)

            service = ImageTranslationService(
                client=client,
                model=OPENAI_IMAGE_MODEL
            )

            result = service.translate_visible_text(
                image_base64=image_base64,
                mime_type=mime_type,
                source_language=source_language,
                target_language=target_language
            )

            self._send_json(
                200,
                {
                    "success": True,
                    "legible": result["legible"],
                    "detected_text": result["detected_text"],
                    "translation": result["translation"],
                    "message": result["message"],
                    "source_language": source_language,
                    "target_language": target_language
                }
            )

        except Exception as error:
            print(
                "Image translation error:",
                type(error).__name__,
                str(error)
            )

            self._send_json(
                502,
                {
                    "success": False,
                    "error": (
                        "No fue posible procesar la imagen. "
                        "Intenta nuevamente."
                    )
                }
            )