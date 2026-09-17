import json
import os

from http.server import BaseHTTPRequestHandler

from openai import OpenAI


# ============================================================
# CONFIGURACIÓN
# ============================================================

MAX_REQUEST_BYTES = 64 * 1024

MAX_MESSAGE_CHARACTERS = 2000

MAX_HISTORY_MESSAGES = 10


OPENAI_MODEL = os.environ.get(
    "OPENAI_MODEL",
    "gpt-5.6-luna"
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


LANGUAGES = {
    "es": "Spanish",
    "en": "English"
}


# ============================================================
# SERVICIO DE TRADUCCIÓN
# ============================================================

class TranslationService:

    def __init__(
        self,
        client,
        model
    ):
        self.client = client

        self.model = model


    def _build_context(
        self,
        history
    ):

        if not isinstance(
            history,
            list
        ):
            return ""


        lines = []


        for item in history[
            -MAX_HISTORY_MESSAGES:
        ]:

            if not isinstance(
                item,
                dict
            ):
                continue


            original = str(
                item.get(
                    "original",
                    ""
                )
            ).strip()


            translation = str(
                item.get(
                    "translation",
                    ""
                )
            ).strip()


            if not original:
                continue


            if translation:

                lines.append(
                    f"Original: {original}\n"
                    f"Translation: {translation}"
                )

            else:

                lines.append(
                    f"Original: {original}"
                )


        return "\n\n".join(
            lines
        )


    def translate(
        self,
        text,
        source_language,
        target_language,
        history=None
    ):

        source_name = LANGUAGES[
            source_language
        ]

        target_name = LANGUAGES[
            target_language
        ]


        conversation_context = (
            self._build_context(
                history
            )
        )


        instructions = (
            "You are a professional bilingual translator between "
            "Spanish and English. Translate accurately and naturally. "
            "Preserve names, numbers, dates, units, technical terms "
            "and acronyms when appropriate. Use conversation context "
            "only to resolve meaning. Return only the translated text, "
            "without explanations or quotation marks."
        )


        prompt_parts = [

            (
                "Translation direction:\n"
                f"{source_name} -> {target_name}"
            )

        ]


        if conversation_context:

            prompt_parts.append(
                (
                    "Previous conversation context:\n"
                    f"{conversation_context}"
                )
            )


        prompt_parts.append(
            (
                "TEXT TO TRANSLATE:\n"
                f"{text}"
            )
        )


        prompt = "\n\n".join(
            prompt_parts
        )


        response = (
            self.client.responses.create(
                model=self.model,
                instructions=instructions,
                input=prompt,
                store=False,
                max_output_tokens=2000
            )
        )


        translated_text = (
            response.output_text or ""
        ).strip()


        if not translated_text:

            raise ValueError(
                "Empty translation response."
            )


        return translated_text


# ============================================================
# HANDLER DE VERCEL
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
    # VALIDACIÓN DE ORIGEN
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


    def _origin_is_allowed(
        self
    ):

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

    def _add_cors_headers(
        self
    ):

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
    # RESPUESTA JSON
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

    def do_OPTIONS(
        self
    ):

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

    def do_POST(
        self
    ):

        # ----------------------------------------------------
        # CORS
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # API KEY
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # CONTENT TYPE
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # TAMAÑO
        # ----------------------------------------------------

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


        if content_length <= 0:

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


        # ----------------------------------------------------
        # LEER JSON
        # ----------------------------------------------------

        try:

            raw_body = self.rfile.read(
                content_length
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
                        "El cuerpo de la solicitud no contiene JSON válido."
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


        # ----------------------------------------------------
        # OBTENER DATOS
        # ----------------------------------------------------

        message = str(
            body.get(
                "message",
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


        history = body.get(
            "history",
            []
        )


        # ----------------------------------------------------
        # VALIDAR MENSAJE
        # ----------------------------------------------------

        if not message:

            self._send_json(
                400,
                {
                    "success": False,
                    "error": (
                        "Escribe un mensaje antes de enviarlo."
                    )
                }
            )

            return


        if (
            len(message) >
            MAX_MESSAGE_CHARACTERS
        ):

            self._send_json(
                413,
                {
                    "success": False,
                    "error": (
                        f"El mensaje no puede superar "
                        f"{MAX_MESSAGE_CHARACTERS} caracteres."
                    )
                }
            )

            return


        # ----------------------------------------------------
        # VALIDAR IDIOMAS
        # ----------------------------------------------------

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
                        "Los idiomas de origen y destino deben ser diferentes."
                    )
                }
            )

            return


        # ----------------------------------------------------
        # VALIDAR HISTORIAL
        # ----------------------------------------------------

        if not isinstance(
            history,
            list
        ):

            history = []


        history = history[
            -MAX_HISTORY_MESSAGES:
        ]


        # ----------------------------------------------------
        # OPENAI
        # ----------------------------------------------------

        try:

            client = OpenAI(
                api_key=api_key
            )


            translator = (
                TranslationService(
                    client=client,
                    model=OPENAI_MODEL
                )
            )


            translation = (
                translator.translate(
                    text=message,
                    source_language=source_language,
                    target_language=target_language,
                    history=history
                )
            )


            self._send_json(
                200,
                {
                    "success": True,
                    "original": message,
                    "translation": translation,
                    "source_language": source_language,
                    "target_language": target_language
                }
            )


        except Exception as error:

            # El error completo se registra únicamente
            # en el servidor para diagnóstico.
            print(
                "Translation error:",
                type(error).__name__,
                str(error)
            )


            self._send_json(
                502,
                {
                    "success": False,
                    "error": (
                        "No fue posible completar la traducción. "
                        "Intenta nuevamente."
                    )
                }
            )