import base64
import json
import os
import tempfile

from http.server import BaseHTTPRequestHandler
from pathlib import Path

from openai import OpenAI


# ============================================================
# CONFIGURACIÓN
# ============================================================

MAX_REQUEST_BYTES = 4_300_000

MAX_AUDIO_BYTES = 2_500_000

MAX_TRANSCRIPTION_CHARACTERS = 6000

MAX_TTS_CHARACTERS = 3500


SUPPORTED_AUDIO_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".m4a",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".webm"
}


LANGUAGES = {
    "es": "Spanish",
    "en": "English"
}


# ============================================================
# MODELOS
# ============================================================

TRANSCRIPTION_MODEL = os.environ.get(
    "OPENAI_TRANSCRIPTION_MODEL",
    "gpt-4o-mini-transcribe"
)


TRANSLATION_MODEL = os.environ.get(
    "OPENAI_AUDIO_TRANSLATION_MODEL",
    "gpt-4.1-mini"
)


TTS_MODEL = os.environ.get(
    "OPENAI_TTS_MODEL",
    "gpt-4o-mini-tts"
)


TTS_VOICE = os.environ.get(
    "OPENAI_TTS_VOICE",
    "alloy"
)


# ============================================================
# CORS
# ============================================================

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
# SERVICIO DE AUDIO
# ============================================================

class AudioTranslationService:

    def __init__(self, client):
        self.client = client


    # --------------------------------------------------------
    # TRANSCRIPCIÓN
    # --------------------------------------------------------

    def transcribe(
        self,
        audio_bytes,
        file_name,
        source_language
    ):

        extension = (
            Path(file_name)
            .suffix
            .lower()
        )


        if (
            extension not in
            SUPPORTED_AUDIO_EXTENSIONS
        ):
            raise ValueError(
                "Formato de audio no permitido."
            )


        temporary_path = None


        try:

            with tempfile.NamedTemporaryFile(
                suffix=extension,
                delete=False
            ) as temporary_file:

                temporary_file.write(
                    audio_bytes
                )

                temporary_path = (
                    temporary_file.name
                )


            with open(
                temporary_path,
                "rb"
            ) as audio_file:

                transcription = (
                    self.client
                    .audio
                    .transcriptions
                    .create(
                        model=TRANSCRIPTION_MODEL,
                        file=audio_file,
                        language=source_language,
                        response_format="json"
                    )
                )


            text = (
                transcription.text
                or ""
            ).strip()


            if not text:

                raise ValueError(
                    "No se detectó contenido hablado utilizable."
                )


            if (
                len(text) >
                MAX_TRANSCRIPTION_CHARACTERS
            ):

                raise ValueError(
                    "La transcripción obtenida es demasiado extensa."
                )


            return text


        finally:

            if (
                temporary_path and
                os.path.exists(
                    temporary_path
                )
            ):

                try:

                    os.remove(
                        temporary_path
                    )

                except OSError:

                    pass


    # --------------------------------------------------------
    # TRADUCCIÓN
    # --------------------------------------------------------

    def translate(
        self,
        transcription,
        source_language,
        target_language
    ):

        source_name = (
            LANGUAGES[
                source_language
            ]
        )

        target_name = (
            LANGUAGES[
                target_language
            ]
        )


        instructions = (
            "You are a professional bilingual translator "
            "specialized in Spanish and English. "
            "Translate the spoken transcription accurately "
            "and naturally. Preserve names, numbers, dates, "
            "units, acronyms and technical terms when appropriate. "
            "Do not summarize, explain or add information. "
            "Return only the translated text."
        )


        prompt = (
            f"Source language: {source_name}\n"
            f"Target language: {target_name}\n\n"
            "Translate this spoken transcription:\n\n"
            f"{transcription}"
        )


        response = (
            self.client.responses.create(
                model=TRANSLATION_MODEL,
                instructions=instructions,
                input=prompt,
                store=False,
                max_output_tokens=2000
            )
        )


        translation = (
            response.output_text
            or ""
        ).strip()


        if not translation:

            raise ValueError(
                "La traducción recibida está vacía."
            )


        return translation


    # --------------------------------------------------------
    # GENERACIÓN DE VOZ
    # --------------------------------------------------------

    def generate_speech(
        self,
        translated_text,
        target_language
    ):

        if (
            len(translated_text) >
            MAX_TTS_CHARACTERS
        ):

            raise ValueError(
                "La traducción es demasiado extensa "
                "para generar el audio hablado."
            )


        language_name = (
            LANGUAGES[
                target_language
            ]
        )


        instructions = (
            f"Speak naturally and clearly in {language_name}. "
            "Use a neutral, professional and easy-to-understand tone. "
            "Preserve the natural pronunciation of names and technical terms."
        )


        speech_response = (
            self.client.audio.speech.create(
                model=TTS_MODEL,
                voice=TTS_VOICE,
                input=translated_text,
                instructions=instructions,
                response_format="mp3"
            )
        )


        audio_bytes = None


        if hasattr(
            speech_response,
            "read"
        ):

            audio_bytes = (
                speech_response.read()
            )


        elif hasattr(
            speech_response,
            "content"
        ):

            audio_bytes = (
                speech_response.content
            )


        if not audio_bytes:

            raise ValueError(
                "No fue posible generar el audio traducido."
            )


        return audio_bytes


    # --------------------------------------------------------
    # FLUJO COMPLETO
    # --------------------------------------------------------

    def process(
        self,
        audio_bytes,
        file_name,
        source_language,
        target_language
    ):

        transcription = (
            self.transcribe(
                audio_bytes=audio_bytes,
                file_name=file_name,
                source_language=source_language
            )
        )


        translation = (
            self.translate(
                transcription=transcription,
                source_language=source_language,
                target_language=target_language
            )
        )


        translated_audio = (
            self.generate_speech(
                translated_text=translation,
                target_language=target_language
            )
        )


        return {
            "transcription":
                transcription,

            "translation":
                translation,

            "translated_audio":
                translated_audio
        }


# ============================================================
# HANDLER VERCEL
# ============================================================

class handler(BaseHTTPRequestHandler):

    # --------------------------------------------------------
    # LOG
    # --------------------------------------------------------

    def log_message(
        self,
        format,
        *args
    ):
        return


    # --------------------------------------------------------
    # ORIGEN
    # --------------------------------------------------------

    def _get_origin(self):

        return (
            self.headers
            .get(
                "Origin",
                ""
            )
            .rstrip("/")
        )


    def _origin_is_allowed(self):

        origin = (
            self._get_origin()
        )


        if not origin:

            return False


        return (
            origin in
            ALLOWED_ORIGINS
        )


    # --------------------------------------------------------
    # CORS
    # --------------------------------------------------------

    def _add_cors_headers(self):

        origin = (
            self._get_origin()
        )


        if (
            origin and
            origin in ALLOWED_ORIGINS
        ):

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


    # --------------------------------------------------------
    # JSON
    # --------------------------------------------------------

    def _send_json(
        self,
        status_code,
        payload
    ):

        data = json.dumps(
            payload,
            ensure_ascii=False
        ).encode(
            "utf-8"
        )


        self.send_response(
            status_code
        )


        self._add_cors_headers()


        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8"
        )


        self.send_header(
            "Content-Length",
            str(
                len(data)
            )
        )


        self.end_headers()


        self.wfile.write(
            data
        )


    # --------------------------------------------------------
    # OPTIONS
    # --------------------------------------------------------

    def do_OPTIONS(self):

        if not self._origin_is_allowed():

            self.send_response(
                403
            )

            self.end_headers()

            return


        self.send_response(
            204
        )


        self._add_cors_headers()


        self.end_headers()


    # --------------------------------------------------------
    # POST
    # --------------------------------------------------------

    def do_POST(self):

        # ====================================================
        # CORS
        # ====================================================

        if not self._origin_is_allowed():

            self._send_json(
                403,
                {
                    "success": False,
                    "error": (
                        "Origen no autorizado."
                    )
                }
            )

            return


        # ====================================================
        # API KEY
        # ====================================================

        api_key = os.environ.get(
            "OPENAI_API_KEY"
        )


        if not api_key:

            self._send_json(
                500,
                {
                    "success": False,
                    "error": (
                        "El servicio no está configurado correctamente."
                    )
                }
            )

            return


        # ====================================================
        # CONTENT TYPE
        # ====================================================

        content_type = (
            self.headers
            .get(
                "Content-Type",
                ""
            )
            .lower()
        )


        if (
            "application/json"
            not in content_type
        ):

            self._send_json(
                415,
                {
                    "success": False,
                    "error": (
                        "El contenido debe enviarse en formato JSON."
                    )
                }
            )

            return


        # ====================================================
        # CONTENT LENGTH
        # ====================================================

        try:

            content_length = int(
                self.headers.get(
                    "Content-Length",
                    "0"
                )
            )


        except ValueError:

            self._send_json(
                400,
                {
                    "success": False,
                    "error": (
                        "Tamaño de solicitud inválido."
                    )
                }
            )

            return


        if (
            content_length <= 0
        ):

            self._send_json(
                400,
                {
                    "success": False,
                    "error": (
                        "La solicitud está vacía."
                    )
                }
            )

            return


        if (
            content_length >
            MAX_REQUEST_BYTES
        ):

            self._send_json(
                413,
                {
                    "success": False,
                    "error": (
                        "La solicitud supera el tamaño permitido."
                    )
                }
            )

            return


        # ====================================================
        # JSON
        # ====================================================

        try:

            raw_body = (
                self.rfile.read(
                    content_length
                )
            )


            body = json.loads(
                raw_body.decode(
                    "utf-8"
                )
            )


        except (
            json.JSONDecodeError,
            UnicodeDecodeError
        ):

            self._send_json(
                400,
                {
                    "success": False,
                    "error": (
                        "La solicitud no contiene JSON válido."
                    )
                }
            )

            return


        if not isinstance(
            body,
            dict
        ):

            self._send_json(
                400,
                {
                    "success": False,
                    "error": (
                        "Solicitud inválida."
                    )
                }
            )

            return


        # ====================================================
        # DATOS
        # ====================================================

        file_name = str(
            body.get(
                "file_name",
                ""
            )
        ).strip()


        audio_base64 = str(
            body.get(
                "audio_base64",
                ""
            )
        ).strip()


        source_language = (
            str(
                body.get(
                    "source_language",
                    ""
                )
            )
            .strip()
            .lower()
        )


        target_language = (
            str(
                body.get(
                    "target_language",
                    ""
                )
            )
            .strip()
            .lower()
        )


        # ====================================================
        # VALIDACIONES
        # ====================================================

        if not file_name:

            self._send_json(
                400,
                {
                    "success": False,
                    "error": (
                        "No se recibió el nombre del archivo."
                    )
                }
            )

            return


        extension = (
            Path(file_name)
            .suffix
            .lower()
        )


        if (
            extension not in
            SUPPORTED_AUDIO_EXTENSIONS
        ):

            self._send_json(
                415,
                {
                    "success": False,
                    "error": (
                        "Formato no permitido. "
                        "Usa MP3, WAV, M4A, MP4, MPEG, MPGA o WEBM."
                    )
                }
            )

            return


        if not audio_base64:

            self._send_json(
                400,
                {
                    "success": False,
                    "error": (
                        "Selecciona un archivo de audio."
                    )
                }
            )

            return


        if (
            source_language
            not in LANGUAGES
        ):

            self._send_json(
                400,
                {
                    "success": False,
                    "error": (
                        "Idioma de origen no válido."
                    )
                }
            )

            return


        if (
            target_language
            not in LANGUAGES
        ):

            self._send_json(
                400,
                {
                    "success": False,
                    "error": (
                        "Idioma de destino no válido."
                    )
                }
            )

            return


        if (
            source_language ==
            target_language
        ):

            self._send_json(
                400,
                {
                    "success": False,
                    "error": (
                        "Los idiomas de origen y destino "
                        "deben ser diferentes."
                    )
                }
            )

            return


        # ====================================================
        # BASE64
        # ====================================================

        try:

            audio_bytes = (
                base64.b64decode(
                    audio_base64,
                    validate=True
                )
            )


        except Exception:

            self._send_json(
                400,
                {
                    "success": False,
                    "error": (
                        "El archivo de audio codificado es inválido."
                    )
                }
            )

            return


        if not audio_bytes:

            self._send_json(
                400,
                {
                    "success": False,
                    "error": (
                        "El archivo de audio está vacío."
                    )
                }
            )

            return


        if (
            len(audio_bytes) >
            MAX_AUDIO_BYTES
        ):

            self._send_json(
                413,
                {
                    "success": False,
                    "error": (
                        "El audio supera el tamaño "
                        "máximo permitido de 2.5 MB."
                    )
                }
            )

            return


        # ====================================================
        # OPENAI
        # ====================================================

        try:

            client = OpenAI(
                api_key=api_key
            )


            service = (
                AudioTranslationService(
                    client=client
                )
            )


            result = (
                service.process(
                    audio_bytes=audio_bytes,
                    file_name=file_name,
                    source_language=source_language,
                    target_language=target_language
                )
            )


            translated_audio_base64 = (
                base64.b64encode(
                    result[
                        "translated_audio"
                    ]
                )
                .decode(
                    "ascii"
                )
            )


            self._send_json(
                200,
                {
                    "success":
                        True,

                    "file_name":
                        file_name,

                    "source_language":
                        source_language,

                    "target_language":
                        target_language,

                    "transcription":
                        result[
                            "transcription"
                        ],

                    "translation":
                        result[
                            "translation"
                        ],

                    "translated_audio_base64":
                        translated_audio_base64,

                    "translated_audio_mime_type":
                        "audio/mpeg",

                    "message": (
                        "Audio transcrito, traducido "
                        "y generado correctamente."
                    )
                }
            )


        except ValueError as error:

            self._send_json(
                422,
                {
                    "success": False,
                    "error": str(
                        error
                    )
                }
            )


        except Exception as error:

            print(
                "Audio processing error:",
                type(error).__name__,
                str(error)
            )


            self._send_json(
                502,
                {
                    "success": False,
                    "error": (
                        "No fue posible procesar el audio. "
                        "Intenta nuevamente."
                    )
                }
            )