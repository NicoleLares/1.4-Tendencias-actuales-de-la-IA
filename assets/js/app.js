// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_BASE_URL =
    "https://1-4-tendencias-actuales-de-la-ia-iota.vercel.app";

const CHAT_ENDPOINT =
    `${API_BASE_URL}/api/chat`;

const IMAGE_ENDPOINT =
    `${API_BASE_URL}/api/image`;

const DOCUMENT_ENDPOINT =
    `${API_BASE_URL}/api/document`;

const AUDIO_ENDPOINT =
    `${API_BASE_URL}/api/audio`;


// ============================================================
// LÍMITES
// ============================================================

const MAX_CHARACTERS = 2000;

const MAX_IMAGE_BYTES =
    3 * 1024 * 1024;

const MAX_DOCUMENT_BYTES =
    2_500_000;

const MAX_AUDIO_BYTES =
    2_500_000;


// ============================================================
// FORMATOS PERMITIDOS
// ============================================================

const ALLOWED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp"
];

const ALLOWED_DOCUMENT_EXTENSIONS = [
    "pdf",
    "docx",
    "txt"
];

const ALLOWED_AUDIO_EXTENSIONS = [
    "mp3",
    "wav",
    "m4a",
    "mp4",
    "mpeg",
    "mpga",
    "webm"
];


// ============================================================
// IDIOMAS
// ============================================================

const LANGUAGE_LABELS = {
    es: "Español",
    en: "English"
};


// ============================================================
// PARTICIPANTES DEL CHAT
// ============================================================

const PARTICIPANTS = {
    participantA: {
        id: "participantA",
        name: "Participante A",
        flag: "🇲🇽",
        sourceLanguage: "es",
        targetLanguage: "en",
        sourceLabel: "Español",
        targetLabel: "English",
        cssClass: "participant-a"
    },

    participantB: {
        id: "participantB",
        name: "Participant B",
        flag: "🇺🇸",
        sourceLanguage: "en",
        targetLanguage: "es",
        sourceLabel: "English",
        targetLabel: "Español",
        cssClass: "participant-b"
    }
};


// ============================================================
// ESTADO GENERAL
// ============================================================

let conversation = [];

let isProcessing = false;
let isImageProcessing = false;
let isDocumentProcessing = false;
let isAudioProcessing = false;

let selectedImagePayload = null;
let selectedDocumentPayload = null;
let selectedAudioPayload = null;

let originalAudioObjectUrl = null;


// ============================================================
// ELEMENTOS GENERALES
// ============================================================

const moduleButtons =
    document.querySelectorAll(".module-button");

const moduleViews =
    document.querySelectorAll(".module-view");


// ============================================================
// ELEMENTOS CHAT
// ============================================================

const chatForm =
    document.getElementById("chatForm");

const senderSelect =
    document.getElementById("senderSelect");

const languageDirection =
    document.getElementById("languageDirection");

const messageInput =
    document.getElementById("messageInput");

const messagesContainer =
    document.getElementById("messagesContainer");

const characterCounter =
    document.getElementById("characterCounter");

const sendButton =
    document.getElementById("sendButton");

const sendButtonContent =
    sendButton?.querySelector(
        ".send-button-content"
    );

const sendButtonLoading =
    sendButton?.querySelector(
        ".send-button-loading"
    );

const statusMessage =
    document.getElementById("statusMessage");

const newConversationButton =
    document.getElementById(
        "newConversationButton"
    );


// ============================================================
// ELEMENTOS IMÁGENES
// ============================================================

const imageForm =
    document.getElementById("imageForm");

const imageSourceLanguage =
    document.getElementById(
        "imageSourceLanguage"
    );

const imageTargetLanguage =
    document.getElementById(
        "imageTargetLanguage"
    );

const imageLanguageDirection =
    document.getElementById(
        "imageLanguageDirection"
    );

const swapImageLanguagesButton =
    document.getElementById(
        "swapImageLanguagesButton"
    );

const imageFileInput =
    document.getElementById(
        "imageFileInput"
    );

const imagePreviewContainer =
    document.getElementById(
        "imagePreviewContainer"
    );

const analyzeImageButton =
    document.getElementById(
        "analyzeImageButton"
    );

const imageButtonContent =
    analyzeImageButton?.querySelector(
        ".image-button-content"
    );

const imageButtonLoading =
    analyzeImageButton?.querySelector(
        ".image-button-loading"
    );

const imageStatusMessage =
    document.getElementById(
        "imageStatusMessage"
    );

const detectedTextResult =
    document.getElementById(
        "detectedTextResult"
    );

const translatedImageTextResult =
    document.getElementById(
        "translatedImageTextResult"
    );


// ============================================================
// ELEMENTOS DOCUMENTOS
// ============================================================

const documentForm =
    document.getElementById(
        "documentForm"
    );

const documentSourceLanguage =
    document.getElementById(
        "documentSourceLanguage"
    );

const documentTargetLanguage =
    document.getElementById(
        "documentTargetLanguage"
    );

const documentLanguageDirection =
    document.getElementById(
        "documentLanguageDirection"
    );

const swapDocumentLanguagesButton =
    document.getElementById(
        "swapDocumentLanguagesButton"
    );

const documentFileInput =
    document.getElementById(
        "documentFileInput"
    );

const documentFileInfo =
    document.getElementById(
        "documentFileInfo"
    );

const translateDocumentButton =
    document.getElementById(
        "translateDocumentButton"
    );

const documentButtonContent =
    translateDocumentButton?.querySelector(
        ".document-button-content"
    );

const documentButtonLoading =
    translateDocumentButton?.querySelector(
        ".document-button-loading"
    );

const documentStatusMessage =
    document.getElementById(
        "documentStatusMessage"
    );

const documentMetadata =
    document.getElementById(
        "documentMetadata"
    );

const documentOriginalResult =
    document.getElementById(
        "documentOriginalResult"
    );

const documentTranslationResult =
    document.getElementById(
        "documentTranslationResult"
    );


// ============================================================
// ELEMENTOS AUDIO
// ============================================================

const audioForm =
    document.getElementById(
        "audioForm"
    );

const audioSourceLanguage =
    document.getElementById(
        "audioSourceLanguage"
    );

const audioTargetLanguage =
    document.getElementById(
        "audioTargetLanguage"
    );

const audioLanguageDirection =
    document.getElementById(
        "audioLanguageDirection"
    );

const swapAudioLanguagesButton =
    document.getElementById(
        "swapAudioLanguagesButton"
    );

const audioFileInput =
    document.getElementById(
        "audioFileInput"
    );

const audioFileInfo =
    document.getElementById(
        "audioFileInfo"
    );

const translateAudioButton =
    document.getElementById(
        "translateAudioButton"
    );

const audioButtonContent =
    translateAudioButton?.querySelector(
        ".audio-button-content"
    );

const audioButtonLoading =
    translateAudioButton?.querySelector(
        ".audio-button-loading"
    );

const audioStatusMessage =
    document.getElementById(
        "audioStatusMessage"
    );

const originalAudioPlayer =
    document.getElementById(
        "originalAudioPlayer"
    );

const originalAudioContainer =
    document.getElementById(
        "originalAudioContainer"
    );

const audioTranscriptionResult =
    document.getElementById(
        "audioTranscriptionResult"
    );

const audioTranslationResult =
    document.getElementById(
        "audioTranslationResult"
    );

const translatedAudioPlayer =
    document.getElementById(
        "translatedAudioPlayer"
    );

const translatedAudioContainer =
    document.getElementById(
        "translatedAudioContainer"
    );


// ============================================================
// NAVEGACIÓN ENTRE MÓDULOS
// ============================================================

moduleButtons.forEach((button) => {
    button.addEventListener(
        "click",
        () => {
            const module =
                button.dataset.module;

            moduleButtons.forEach(
                (item) => {
                    item.classList.remove(
                        "active"
                    );
                }
            );

            moduleViews.forEach(
                (view) => {
                    view.classList.remove(
                        "active"
                    );
                }
            );

            button.classList.add(
                "active"
            );

            const target =
                document.getElementById(
                    `${module}Module`
                );

            if (target) {
                target.classList.add(
                    "active"
                );
            }
        }
    );
});


// ============================================================
// UTILIDADES
// ============================================================

function createTextElement(
    tag,
    className,
    text
) {
    const element =
        document.createElement(tag);

    element.className =
        className;

    element.textContent =
        text;

    return element;
}


function readFileAsDataUrl(
    file
) {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            const reader =
                new FileReader();

            reader.onload =
                () => {
                    resolve(
                        reader.result
                    );
                };

            reader.onerror =
                () => {
                    reject(
                        new Error(
                            "No fue posible leer el archivo seleccionado."
                        )
                    );
                };

            reader.readAsDataURL(
                file
            );
        }
    );
}


function formatFileSize(
    bytes
) {
    if (bytes < 1024) {
        return `${bytes} bytes`;
    }

    if (
        bytes <
        1024 * 1024
    ) {
        return (
            `${(
                bytes / 1024
            ).toFixed(1)} KB`
        );
    }

    return (
        `${(
            bytes /
            (1024 * 1024)
        ).toFixed(2)} MB`
    );
}


function getFileExtension(
    fileName
) {
    const parts =
        String(fileName)
            .toLowerCase()
            .split(".");

    if (
        parts.length < 2
    ) {
        return "";
    }

    return parts.pop();
}


async function getJsonResponse(
    response
) {
    try {
        return await response.json();
    } catch {
        throw new Error(
            "El servidor devolvió una respuesta no válida."
        );
    }
}


// ============================================================
// CHAT
// ============================================================

function updateLanguageDirection() {
    if (
        !senderSelect ||
        !languageDirection ||
        !messageInput
    ) {
        return;
    }

    const participant =
        PARTICIPANTS[
        senderSelect.value
        ];

    languageDirection.textContent =
        `${participant.sourceLabel} → ${participant.targetLabel}`;

    messageInput.placeholder =
        participant.id ===
            "participantA"
            ? "Escribe un mensaje en español..."
            : "Write a message in English...";
}


function updateCharacterCounter() {
    if (
        !messageInput ||
        !characterCounter
    ) {
        return;
    }

    const length =
        messageInput.value.length;

    characterCounter.textContent =
        `${length} / ${MAX_CHARACTERS}`;

    characterCounter.style.color =
        length >=
            MAX_CHARACTERS * 0.9
            ? "#e4b75c"
            : "";
}


function setStatus(
    message = "",
    type = "info"
) {
    if (!statusMessage) {
        return;
    }

    statusMessage.textContent =
        message;

    statusMessage.className =
        "status-message";

    if (!message) {
        return;
    }

    statusMessage.classList.add(
        "visible",
        type
    );
}


function setLoading(
    loading
) {
    isProcessing =
        loading;

    if (sendButton) {
        sendButton.disabled =
            loading;
    }

    if (messageInput) {
        messageInput.disabled =
            loading;
    }

    if (senderSelect) {
        senderSelect.disabled =
            loading;
    }

    sendButtonContent?.classList.toggle(
        "d-none",
        loading
    );

    sendButtonLoading?.classList.toggle(
        "d-none",
        !loading
    );
}


function renderMessage(
    message
) {
    const emptyConversation =
        document.getElementById(
            "emptyConversation"
        );

    if (
        emptyConversation &&
        emptyConversation.parentNode
    ) {
        emptyConversation.remove();
    }

    const participant =
        PARTICIPANTS[
        message.sender
        ];

    const article =
        document.createElement(
            "article"
        );

    article.className =
        `message-entry ${participant.cssClass}`;

    const meta =
        document.createElement(
            "div"
        );

    meta.className =
        "message-meta";

    const sender =
        createTextElement(
            "span",
            "message-sender",
            `${participant.flag} ${participant.name}`
        );

    const direction =
        createTextElement(
            "span",
            "message-direction",
            `${participant.sourceLabel} → ${participant.targetLabel}`
        );

    meta.append(
        sender,
        direction
    );

    const originalSection =
        document.createElement(
            "div"
        );

    originalSection.className =
        "translation-section";

    originalSection.append(
        createTextElement(
            "span",
            "translation-label",
            "Original"
        ),
        createTextElement(
            "p",
            "translation-text",
            message.original
        )
    );

    const translatedSection =
        document.createElement(
            "div"
        );

    translatedSection.className =
        "translation-section";

    translatedSection.append(
        createTextElement(
            "span",
            "translation-label",
            "Traducción"
        ),
        createTextElement(
            "p",
            "translation-text translated-text",
            message.translation
        )
    );

    article.append(
        meta,
        originalSection,
        translatedSection
    );

    messagesContainer.appendChild(
        article
    );

    messagesContainer.scrollTo({
        top:
            messagesContainer.scrollHeight,

        behavior:
            "smooth"
    });
}


async function sendMessage() {
    if (isProcessing) {
        return;
    }

    const text =
        messageInput.value.trim();

    if (!text) {
        setStatus(
            "Escribe un mensaje antes de enviarlo.",
            "warning"
        );

        messageInput.focus();

        return;
    }

    if (
        text.length >
        MAX_CHARACTERS
    ) {
        setStatus(
            `El mensaje no puede superar ${MAX_CHARACTERS} caracteres.`,
            "warning"
        );

        return;
    }

    const participant =
        PARTICIPANTS[
        senderSelect.value
        ];

    const payload = {
        message:
            text,

        sender:
            participant.id,

        source_language:
            participant.sourceLanguage,

        target_language:
            participant.targetLanguage,

        history:
            conversation.slice(-10)
    };

    try {
        setLoading(true);

        setStatus(
            "Traduciendo mensaje...",
            "info"
        );

        const response =
            await fetch(
                CHAT_ENDPOINT,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

        const data =
            await getJsonResponse(
                response
            );

        if (!response.ok) {
            throw new Error(
                data?.error ||
                "No fue posible procesar la solicitud."
            );
        }

        if (!data.translation) {
            throw new Error(
                "La traducción recibida está vacía."
            );
        }

        const message = {
            sender:
                participant.id,

            original:
                text,

            translation:
                data.translation
        };

        conversation.push(
            message
        );

        renderMessage(
            message
        );

        messageInput.value =
            "";

        updateCharacterCounter();

        setStatus(
            "Traducción completada.",
            "success"
        );

        messageInput.focus();

    } catch (error) {
        console.error(
            "Chat error:",
            error
        );

        setStatus(
            error.message ||
            "No fue posible conectar con el servidor.",
            "error"
        );

    } finally {
        setLoading(false);
    }
}


if (senderSelect) {
    senderSelect.addEventListener(
        "change",
        updateLanguageDirection
    );
}


if (messageInput) {
    messageInput.addEventListener(
        "input",
        updateCharacterCounter
    );

    messageInput.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();

                sendMessage();
            }
        }
    );
}


if (chatForm) {
    chatForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            sendMessage();
        }
    );
}


if (newConversationButton) {
    newConversationButton.addEventListener(
        "click",
        () => {
            conversation = [];

            messagesContainer.innerHTML = `
                <div
                    id="emptyConversation"
                    class="empty-conversation"
                >

                    <div class="empty-icon">
                        <i class="bi bi-translate"></i>
                    </div>

                    <h3>
                        Inicia una conversación
                    </h3>

                    <p>
                        Escribe un mensaje en español o inglés.
                        Aquí aparecerán el texto original
                        y su traducción.
                    </p>

                </div>
            `;

            messageInput.value =
                "";

            updateCharacterCounter();

            setStatus();

            messageInput.focus();
        }
    );
}


// ============================================================
// IMÁGENES
// ============================================================

function setImageStatus(
    message = "",
    type = "info"
) {
    if (!imageStatusMessage) {
        return;
    }

    imageStatusMessage.textContent =
        message;

    imageStatusMessage.className =
        "status-message";

    if (!message) {
        return;
    }

    imageStatusMessage.classList.add(
        "visible",
        type
    );
}


function setImageLoading(
    loading
) {
    isImageProcessing =
        loading;

    if (analyzeImageButton) {
        analyzeImageButton.disabled =
            loading;
    }

    if (imageFileInput) {
        imageFileInput.disabled =
            loading;
    }

    if (imageSourceLanguage) {
        imageSourceLanguage.disabled =
            loading;
    }

    if (imageTargetLanguage) {
        imageTargetLanguage.disabled =
            loading;
    }

    if (swapImageLanguagesButton) {
        swapImageLanguagesButton.disabled =
            loading;
    }

    imageButtonContent?.classList.toggle(
        "d-none",
        loading
    );

    imageButtonLoading?.classList.toggle(
        "d-none",
        !loading
    );
}


function updateImageLanguageDirection() {
    if (
        !imageLanguageDirection ||
        !imageSourceLanguage ||
        !imageTargetLanguage
    ) {
        return;
    }

    imageLanguageDirection.textContent =
        `${LANGUAGE_LABELS[imageSourceLanguage.value]} → ${LANGUAGE_LABELS[imageTargetLanguage.value]}`;
}


function normalizeImageLanguages(
    changed
) {
    if (
        imageSourceLanguage.value ===
        imageTargetLanguage.value
    ) {
        if (
            changed ===
            "source"
        ) {
            imageTargetLanguage.value =
                imageSourceLanguage.value ===
                    "es"
                    ? "en"
                    : "es";
        } else {
            imageSourceLanguage.value =
                imageTargetLanguage.value ===
                    "es"
                    ? "en"
                    : "es";
        }
    }

    updateImageLanguageDirection();
}


function clearImagePreview() {
    if (!imagePreviewContainer) {
        return;
    }

    imagePreviewContainer.innerHTML = `
        <div class="image-preview-empty">

            <i class="bi bi-image"></i>

            <p>
                No has seleccionado ninguna imagen.
            </p>

        </div>
    `;
}


function clearImageResults() {
    if (detectedTextResult) {
        detectedTextResult.textContent =
            "Aún no hay resultados.";

        detectedTextResult.classList.add(
            "empty-result"
        );
    }

    if (translatedImageTextResult) {
        translatedImageTextResult.textContent =
            "La traducción aparecerá aquí.";

        translatedImageTextResult.classList.add(
            "empty-result"
        );
    }
}


function validateImage(
    file
) {
    if (!file) {
        throw new Error(
            "Selecciona una imagen."
        );
    }

    if (
        !ALLOWED_IMAGE_TYPES.includes(
            file.type
        )
    ) {
        throw new Error(
            "Formato no permitido. Usa PNG, JPG, JPEG o WEBP."
        );
    }

    if (
        file.size >
        MAX_IMAGE_BYTES
    ) {
        throw new Error(
            "La imagen supera los 3 MB permitidos."
        );
    }
}


if (imageSourceLanguage) {
    imageSourceLanguage.addEventListener(
        "change",
        () => {
            normalizeImageLanguages(
                "source"
            );
        }
    );
}


if (imageTargetLanguage) {
    imageTargetLanguage.addEventListener(
        "change",
        () => {
            normalizeImageLanguages(
                "target"
            );
        }
    );
}


if (swapImageLanguagesButton) {
    swapImageLanguagesButton.addEventListener(
        "click",
        () => {
            const source =
                imageSourceLanguage.value;

            imageSourceLanguage.value =
                imageTargetLanguage.value;

            imageTargetLanguage.value =
                source;

            updateImageLanguageDirection();
        }
    );
}


if (imageFileInput) {
    imageFileInput.addEventListener(
        "change",
        async () => {
            const file =
                imageFileInput.files[0];

            try {
                validateImage(
                    file
                );

                const dataUrl =
                    await readFileAsDataUrl(
                        file
                    );

                selectedImagePayload = {
                    fileName:
                        file.name,

                    mimeType:
                        file.type,

                    base64:
                        String(
                            dataUrl
                        ).split(",")[1]
                };

                imagePreviewContainer.innerHTML =
                    "";

                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    dataUrl;

                image.alt =
                    file.name;

                imagePreviewContainer.appendChild(
                    image
                );

                clearImageResults();

                setImageStatus(
                    "Imagen cargada correctamente.",
                    "success"
                );

            } catch (error) {
                selectedImagePayload =
                    null;

                imageFileInput.value =
                    "";

                clearImagePreview();

                clearImageResults();

                setImageStatus(
                    error.message,
                    "warning"
                );
            }
        }
    );
}


if (imageForm) {
    imageForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            if (
                isImageProcessing
            ) {
                return;
            }

            if (
                !selectedImagePayload
            ) {
                setImageStatus(
                    "Selecciona una imagen antes de analizarla.",
                    "warning"
                );

                return;
            }

            try {
                setImageLoading(
                    true
                );

                setImageStatus(
                    "Analizando imagen y traduciendo texto...",
                    "info"
                );

                const response =
                    await fetch(
                        IMAGE_ENDPOINT,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    image_base64:
                                        selectedImagePayload.base64,

                                    mime_type:
                                        selectedImagePayload.mimeType,

                                    file_name:
                                        selectedImagePayload.fileName,

                                    source_language:
                                        imageSourceLanguage.value,

                                    target_language:
                                        imageTargetLanguage.value
                                })
                        }
                    );

                const data =
                    await getJsonResponse(
                        response
                    );

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                        "No fue posible procesar la imagen."
                    );
                }

                detectedTextResult.classList.remove(
                    "empty-result"
                );

                translatedImageTextResult.classList.remove(
                    "empty-result"
                );

                detectedTextResult.textContent =
                    data.detected_text ||
                    "No se encontró texto legible.";

                translatedImageTextResult.textContent =
                    data.translation ||
                    "No fue posible obtener una traducción.";

                setImageStatus(
                    data.message ||
                    "Imagen procesada correctamente.",

                    data.legible
                        ? "success"
                        : "warning"
                );

            } catch (error) {
                console.error(
                    "Image error:",
                    error
                );

                setImageStatus(
                    error.message ||
                    "No fue posible conectar con el servidor.",
                    "error"
                );

            } finally {
                setImageLoading(
                    false
                );
            }
        }
    );
}


// ============================================================
// DOCUMENTOS
// ============================================================

function setDocumentStatus(
    message = "",
    type = "info"
) {
    if (!documentStatusMessage) {
        return;
    }

    documentStatusMessage.textContent =
        message;

    documentStatusMessage.className =
        "status-message";

    if (!message) {
        return;
    }

    documentStatusMessage.classList.add(
        "visible",
        type
    );
}


function setDocumentLoading(
    loading
) {
    isDocumentProcessing =
        loading;

    if (translateDocumentButton) {
        translateDocumentButton.disabled =
            loading;
    }

    if (documentFileInput) {
        documentFileInput.disabled =
            loading;
    }

    if (documentSourceLanguage) {
        documentSourceLanguage.disabled =
            loading;
    }

    if (documentTargetLanguage) {
        documentTargetLanguage.disabled =
            loading;
    }

    if (swapDocumentLanguagesButton) {
        swapDocumentLanguagesButton.disabled =
            loading;
    }

    documentButtonContent?.classList.toggle(
        "d-none",
        loading
    );

    documentButtonLoading?.classList.toggle(
        "d-none",
        !loading
    );
}


function updateDocumentLanguageDirection() {
    if (
        !documentLanguageDirection ||
        !documentSourceLanguage ||
        !documentTargetLanguage
    ) {
        return;
    }

    documentLanguageDirection.textContent =
        `${LANGUAGE_LABELS[documentSourceLanguage.value]} → ${LANGUAGE_LABELS[documentTargetLanguage.value]}`;
}


function normalizeDocumentLanguages(
    changed
) {
    if (
        documentSourceLanguage.value ===
        documentTargetLanguage.value
    ) {
        if (
            changed ===
            "source"
        ) {
            documentTargetLanguage.value =
                documentSourceLanguage.value ===
                    "es"
                    ? "en"
                    : "es";
        } else {
            documentSourceLanguage.value =
                documentTargetLanguage.value ===
                    "es"
                    ? "en"
                    : "es";
        }
    }

    updateDocumentLanguageDirection();
}


function validateDocument(
    file
) {
    if (!file) {
        throw new Error(
            "Selecciona un documento."
        );
    }

    const extension =
        getFileExtension(
            file.name
        );

    if (
        !ALLOWED_DOCUMENT_EXTENSIONS.includes(
            extension
        )
    ) {
        throw new Error(
            "Formato no permitido. Usa PDF, DOCX o TXT."
        );
    }

    if (
        file.size >
        MAX_DOCUMENT_BYTES
    ) {
        throw new Error(
            "El documento supera el tamaño máximo de 2.5 MB."
        );
    }

    return extension;
}


function clearDocumentFileInfo() {
    if (!documentFileInfo) {
        return;
    }

    documentFileInfo.innerHTML = `
        <i class="bi bi-file-earmark"></i>

        <div>

            <strong>
                Ningún archivo seleccionado
            </strong>

            <small>
                Selecciona un documento para comenzar.
            </small>

        </div>
    `;
}


function clearDocumentResults() {
    if (documentOriginalResult) {
        documentOriginalResult.textContent =
            "Aún no hay contenido.";

        documentOriginalResult.classList.add(
            "empty-result"
        );
    }

    if (documentTranslationResult) {
        documentTranslationResult.textContent =
            "La traducción aparecerá aquí.";

        documentTranslationResult.classList.add(
            "empty-result"
        );
    }

    if (documentMetadata) {
        documentMetadata.innerHTML = `
            <i class="bi bi-file-text"></i>

            <span>
                Los datos del documento aparecerán aquí.
            </span>
        `;
    }
}


function renderDocumentMetadata(
    data
) {
    const metadata =
        data.metadata || {};

    const details = [
        data.file_name ||
        "Documento",

        metadata.type ||
        "",

        metadata.characters
            ? `${metadata.characters.toLocaleString()} caracteres`
            : "",

        metadata.pages
            ? `${metadata.pages} página${metadata.pages === 1 ? "" : "s"}`
            : "",

        metadata.chunks
            ? `${metadata.chunks} sección${metadata.chunks === 1 ? "" : "es"} procesada${metadata.chunks === 1 ? "" : "s"}`
            : ""
    ]
        .filter(Boolean)
        .join(" · ");

    documentMetadata.innerHTML =
        "";

    const icon =
        document.createElement(
            "i"
        );

    icon.className =
        "bi bi-file-earmark-check";

    const text =
        document.createElement(
            "span"
        );

    text.textContent =
        details;

    documentMetadata.append(
        icon,
        text
    );
}


if (documentSourceLanguage) {
    documentSourceLanguage.addEventListener(
        "change",
        () => {
            normalizeDocumentLanguages(
                "source"
            );
        }
    );
}


if (documentTargetLanguage) {
    documentTargetLanguage.addEventListener(
        "change",
        () => {
            normalizeDocumentLanguages(
                "target"
            );
        }
    );
}


if (swapDocumentLanguagesButton) {
    swapDocumentLanguagesButton.addEventListener(
        "click",
        () => {
            const source =
                documentSourceLanguage.value;

            documentSourceLanguage.value =
                documentTargetLanguage.value;

            documentTargetLanguage.value =
                source;

            updateDocumentLanguageDirection();
        }
    );
}


if (documentFileInput) {
    documentFileInput.addEventListener(
        "change",
        async () => {
            const file =
                documentFileInput.files[0];

            try {
                const extension =
                    validateDocument(
                        file
                    );

                const dataUrl =
                    await readFileAsDataUrl(
                        file
                    );

                selectedDocumentPayload = {
                    fileName:
                        file.name,

                    extension,

                    size:
                        file.size,

                    base64:
                        String(
                            dataUrl
                        ).split(",")[1]
                };

                documentFileInfo.innerHTML = `
                    <i class="bi bi-file-earmark-check"></i>

                    <div>
                        <strong></strong>
                        <small></small>
                    </div>
                `;

                documentFileInfo
                    .querySelector(
                        "strong"
                    )
                    .textContent =
                    file.name;

                documentFileInfo
                    .querySelector(
                        "small"
                    )
                    .textContent =
                    `${extension.toUpperCase()} · ${formatFileSize(file.size)}`;

                clearDocumentResults();

                setDocumentStatus(
                    "Documento cargado correctamente.",
                    "success"
                );

            } catch (error) {
                selectedDocumentPayload =
                    null;

                documentFileInput.value =
                    "";

                clearDocumentFileInfo();

                clearDocumentResults();

                setDocumentStatus(
                    error.message,
                    "warning"
                );
            }
        }
    );
}


if (documentForm) {
    documentForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            if (
                isDocumentProcessing
            ) {
                return;
            }

            if (
                !selectedDocumentPayload
            ) {
                setDocumentStatus(
                    "Selecciona un documento antes de traducirlo.",
                    "warning"
                );

                return;
            }

            try {
                setDocumentLoading(
                    true
                );

                setDocumentStatus(
                    "Extrayendo y traduciendo el contenido del documento...",
                    "info"
                );

                const response =
                    await fetch(
                        DOCUMENT_ENDPOINT,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    file_name:
                                        selectedDocumentPayload.fileName,

                                    file_base64:
                                        selectedDocumentPayload.base64,

                                    source_language:
                                        documentSourceLanguage.value,

                                    target_language:
                                        documentTargetLanguage.value
                                })
                        }
                    );

                const data =
                    await getJsonResponse(
                        response
                    );

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                        "No fue posible procesar el documento."
                    );
                }

                documentOriginalResult.textContent =
                    data.original_text ||
                    "No se encontró contenido.";

                documentTranslationResult.textContent =
                    data.translation ||
                    "No se obtuvo traducción.";

                documentOriginalResult.classList.remove(
                    "empty-result"
                );

                documentTranslationResult.classList.remove(
                    "empty-result"
                );

                renderDocumentMetadata(
                    data
                );

                setDocumentStatus(
                    data.message ||
                    "Documento traducido correctamente.",
                    "success"
                );

            } catch (error) {
                console.error(
                    "Document error:",
                    error
                );

                setDocumentStatus(
                    error.message ||
                    "No fue posible conectar con el servidor.",
                    "error"
                );

            } finally {
                setDocumentLoading(
                    false
                );
            }
        }
    );
}


// ============================================================
// AUDIO
// ============================================================

function setAudioStatus(
    message = "",
    type = "info"
) {
    if (!audioStatusMessage) {
        return;
    }

    audioStatusMessage.textContent =
        message;

    audioStatusMessage.className =
        "status-message";

    if (!message) {
        return;
    }

    audioStatusMessage.classList.add(
        "visible",
        type
    );
}


function setAudioLoading(
    loading
) {
    isAudioProcessing =
        loading;

    if (translateAudioButton) {
        translateAudioButton.disabled =
            loading;
    }

    if (audioFileInput) {
        audioFileInput.disabled =
            loading;
    }

    if (audioSourceLanguage) {
        audioSourceLanguage.disabled =
            loading;
    }

    if (audioTargetLanguage) {
        audioTargetLanguage.disabled =
            loading;
    }

    if (swapAudioLanguagesButton) {
        swapAudioLanguagesButton.disabled =
            loading;
    }

    audioButtonContent?.classList.toggle(
        "d-none",
        loading
    );

    audioButtonLoading?.classList.toggle(
        "d-none",
        !loading
    );
}


function updateAudioLanguageDirection() {
    if (
        !audioLanguageDirection ||
        !audioSourceLanguage ||
        !audioTargetLanguage
    ) {
        return;
    }

    audioLanguageDirection.textContent =
        `${LANGUAGE_LABELS[audioSourceLanguage.value]} → ${LANGUAGE_LABELS[audioTargetLanguage.value]}`;
}


function normalizeAudioLanguages(
    changed
) {
    if (
        audioSourceLanguage.value ===
        audioTargetLanguage.value
    ) {
        if (
            changed ===
            "source"
        ) {
            audioTargetLanguage.value =
                audioSourceLanguage.value ===
                    "es"
                    ? "en"
                    : "es";
        } else {
            audioSourceLanguage.value =
                audioTargetLanguage.value ===
                    "es"
                    ? "en"
                    : "es";
        }
    }

    updateAudioLanguageDirection();
}


function validateAudio(
    file
) {
    if (!file) {
        throw new Error(
            "Selecciona un archivo de audio."
        );
    }

    const extension =
        getFileExtension(
            file.name
        );

    if (
        !ALLOWED_AUDIO_EXTENSIONS.includes(
            extension
        )
    ) {
        throw new Error(
            "Formato de audio no permitido. Usa MP3, WAV, M4A, MP4, MPEG, MPGA o WEBM."
        );
    }

    if (
        file.size >
        MAX_AUDIO_BYTES
    ) {
        throw new Error(
            "El audio supera el tamaño máximo permitido de 2.5 MB."
        );
    }

    if (
        file.size === 0
    ) {
        throw new Error(
            "El archivo de audio está vacío."
        );
    }

    return extension;
}


function clearAudioFileInfo() {
    if (!audioFileInfo) {
        return;
    }

    audioFileInfo.innerHTML = `
        <i class="bi bi-file-earmark-music"></i>

        <div>

            <strong>
                Ningún audio seleccionado
            </strong>

            <small>
                Selecciona un archivo para comenzar.
            </small>

        </div>
    `;
}


function clearAudioResults() {
    if (audioTranscriptionResult) {
        audioTranscriptionResult.textContent =
            "La transcripción aparecerá aquí.";

        audioTranscriptionResult.classList.add(
            "empty-result"
        );
    }

    if (audioTranslationResult) {
        audioTranslationResult.textContent =
            "La traducción aparecerá aquí.";

        audioTranslationResult.classList.add(
            "empty-result"
        );
    }

    if (translatedAudioPlayer) {
        translatedAudioPlayer.removeAttribute(
            "src"
        );

        translatedAudioPlayer.load();
    }

    if (translatedAudioContainer) {
        translatedAudioContainer.classList.add(
            "d-none"
        );
    }
}


function showOriginalAudio(
    file
) {
    if (
        !originalAudioPlayer
    ) {
        return;
    }

    if (
        originalAudioObjectUrl
    ) {
        URL.revokeObjectURL(
            originalAudioObjectUrl
        );
    }

    originalAudioObjectUrl =
        URL.createObjectURL(
            file
        );

    originalAudioPlayer.src =
        originalAudioObjectUrl;

    originalAudioPlayer.load();

    if (originalAudioContainer) {
        originalAudioContainer.classList.remove(
            "d-none"
        );
    }
}


function showTranslatedAudio(
    base64,
    mimeType = "audio/mpeg"
) {
    if (
        !translatedAudioPlayer ||
        !base64
    ) {
        return;
    }

    translatedAudioPlayer.src =
        `data:${mimeType};base64,${base64}`;

    translatedAudioPlayer.load();

    if (
        translatedAudioContainer
    ) {
        translatedAudioContainer.classList.remove(
            "d-none"
        );
    }
}


if (audioSourceLanguage) {
    audioSourceLanguage.addEventListener(
        "change",
        () => {
            normalizeAudioLanguages(
                "source"
            );
        }
    );
}


if (audioTargetLanguage) {
    audioTargetLanguage.addEventListener(
        "change",
        () => {
            normalizeAudioLanguages(
                "target"
            );
        }
    );
}


if (swapAudioLanguagesButton) {
    swapAudioLanguagesButton.addEventListener(
        "click",
        () => {
            const source =
                audioSourceLanguage.value;

            audioSourceLanguage.value =
                audioTargetLanguage.value;

            audioTargetLanguage.value =
                source;

            updateAudioLanguageDirection();
        }
    );
}


if (audioFileInput) {
    audioFileInput.addEventListener(
        "change",
        async () => {
            const file =
                audioFileInput.files[0];

            try {
                setAudioStatus();

                const extension =
                    validateAudio(
                        file
                    );

                const dataUrl =
                    await readFileAsDataUrl(
                        file
                    );

                const parts =
                    String(
                        dataUrl
                    ).split(",");

                if (
                    parts.length < 2
                ) {
                    throw new Error(
                        "No fue posible preparar el archivo de audio."
                    );
                }

                selectedAudioPayload = {
                    fileName:
                        file.name,

                    extension,

                    mimeType:
                        file.type ||
                        "application/octet-stream",

                    size:
                        file.size,

                    base64:
                        parts[1]
                };

                if (audioFileInfo) {
                    audioFileInfo.innerHTML = `
                        <i class="bi bi-file-earmark-music"></i>

                        <div>
                            <strong></strong>
                            <small></small>
                        </div>
                    `;

                    audioFileInfo
                        .querySelector(
                            "strong"
                        )
                        .textContent =
                        file.name;

                    audioFileInfo
                        .querySelector(
                            "small"
                        )
                        .textContent =
                        `${extension.toUpperCase()} · ${formatFileSize(file.size)}`;
                }

                showOriginalAudio(
                    file
                );

                clearAudioResults();

                setAudioStatus(
                    "Audio cargado correctamente. Ya puedes procesarlo.",
                    "success"
                );

            } catch (error) {
                selectedAudioPayload =
                    null;

                audioFileInput.value =
                    "";

                clearAudioFileInfo();

                clearAudioResults();

                if (
                    originalAudioPlayer
                ) {
                    originalAudioPlayer.removeAttribute(
                        "src"
                    );

                    originalAudioPlayer.load();
                }

                if (
                    originalAudioContainer
                ) {
                    originalAudioContainer.classList.add(
                        "d-none"
                    );
                }

                setAudioStatus(
                    error.message,
                    "warning"
                );
            }
        }
    );
}


if (audioForm) {
    audioForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            if (
                isAudioProcessing
            ) {
                return;
            }

            if (
                !selectedAudioPayload
            ) {
                setAudioStatus(
                    "Selecciona un archivo de audio antes de traducirlo.",
                    "warning"
                );

                return;
            }

            const payload = {
                file_name:
                    selectedAudioPayload.fileName,

                audio_base64:
                    selectedAudioPayload.base64,

                mime_type:
                    selectedAudioPayload.mimeType,

                source_language:
                    audioSourceLanguage.value,

                target_language:
                    audioTargetLanguage.value
            };

            try {
                setAudioLoading(
                    true
                );

                clearAudioResults();

                setAudioStatus(
                    "Transcribiendo, traduciendo y generando el audio traducido...",
                    "info"
                );

                const response =
                    await fetch(
                        AUDIO_ENDPOINT,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

                const data =
                    await getJsonResponse(
                        response
                    );

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                        "No fue posible procesar el audio."
                    );
                }

                if (
                    !data.transcription
                ) {
                    throw new Error(
                        "No se obtuvo una transcripción utilizable."
                    );
                }

                if (
                    !data.translation
                ) {
                    throw new Error(
                        "No se obtuvo una traducción del audio."
                    );
                }

                audioTranscriptionResult.textContent =
                    data.transcription;

                audioTranslationResult.textContent =
                    data.translation;

                audioTranscriptionResult.classList.remove(
                    "empty-result"
                );

                audioTranslationResult.classList.remove(
                    "empty-result"
                );

                if (
                    data.translated_audio_base64
                ) {
                    showTranslatedAudio(
                        data.translated_audio_base64,
                        data.translated_audio_mime_type ||
                        "audio/mpeg"
                    );
                }

                setAudioStatus(
                    data.message ||
                    "Audio transcrito, traducido y generado correctamente.",
                    "success"
                );

            } catch (error) {
                console.error(
                    "Audio error:",
                    error
                );

                setAudioStatus(
                    error.message ||
                    "No fue posible conectar con el servidor.",
                    "error"
                );

            } finally {
                setAudioLoading(
                    false
                );
            }
        }
    );
}


// ============================================================
// INICIO
// ============================================================

updateLanguageDirection();

updateCharacterCounter();


updateImageLanguageDirection();

clearImagePreview();

clearImageResults();


updateDocumentLanguageDirection();

clearDocumentFileInfo();

clearDocumentResults();


if (audioForm) {
    updateAudioLanguageDirection();

    clearAudioFileInfo();

    clearAudioResults();
}


if (messageInput) {
    messageInput.focus();
}


// ============================================================
// LIMPIEZA
// ============================================================

window.addEventListener(
    "beforeunload",
    () => {
        if (
            originalAudioObjectUrl
        ) {
            URL.revokeObjectURL(
                originalAudioObjectUrl
            );
        }
    }
);