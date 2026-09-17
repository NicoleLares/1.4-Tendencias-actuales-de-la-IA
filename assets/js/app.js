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

const MAX_CHARACTERS =
    2000;

const MAX_IMAGE_BYTES =
    3 * 1024 * 1024;

const MAX_DOCUMENT_BYTES =
    2_500_000;

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


// ============================================================
// IDIOMAS
// ============================================================

const LANGUAGE_LABELS = {
    es: "Español",
    en: "English"
};


// ============================================================
// PARTICIPANTES
// ============================================================

const PARTICIPANTS = {

    participantA: {

        id:
            "participantA",

        name:
            "Participante A",

        flag:
            "🇲🇽",

        sourceLanguage:
            "es",

        targetLanguage:
            "en",

        sourceLabel:
            "Español",

        targetLabel:
            "English",

        cssClass:
            "participant-a"

    },


    participantB: {

        id:
            "participantB",

        name:
            "Participant B",

        flag:
            "🇺🇸",

        sourceLanguage:
            "en",

        targetLanguage:
            "es",

        sourceLabel:
            "English",

        targetLabel:
            "Español",

        cssClass:
            "participant-b"

    }

};


// ============================================================
// ESTADO
// ============================================================

let conversation = [];

let isProcessing =
    false;

let isImageProcessing =
    false;

let isDocumentProcessing =
    false;

let selectedImagePayload =
    null;

let selectedDocumentPayload =
    null;


// ============================================================
// ELEMENTOS GENERALES
// ============================================================

const moduleButtons =
    document.querySelectorAll(
        ".module-button"
    );

const moduleViews =
    document.querySelectorAll(
        ".module-view"
    );


// ============================================================
// ELEMENTOS CHAT
// ============================================================

const chatForm =
    document.getElementById(
        "chatForm"
    );

const senderSelect =
    document.getElementById(
        "senderSelect"
    );

const languageDirection =
    document.getElementById(
        "languageDirection"
    );

const messageInput =
    document.getElementById(
        "messageInput"
    );

const messagesContainer =
    document.getElementById(
        "messagesContainer"
    );

const characterCounter =
    document.getElementById(
        "characterCounter"
    );

const sendButton =
    document.getElementById(
        "sendButton"
    );

const sendButtonContent =
    sendButton.querySelector(
        ".send-button-content"
    );

const sendButtonLoading =
    sendButton.querySelector(
        ".send-button-loading"
    );

const statusMessage =
    document.getElementById(
        "statusMessage"
    );

const newConversationButton =
    document.getElementById(
        "newConversationButton"
    );


// ============================================================
// ELEMENTOS IMÁGENES
// ============================================================

const imageForm =
    document.getElementById(
        "imageForm"
    );

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
    analyzeImageButton.querySelector(
        ".image-button-content"
    );

const imageButtonLoading =
    analyzeImageButton.querySelector(
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
    translateDocumentButton.querySelector(
        ".document-button-content"
    );

const documentButtonLoading =
    translateDocumentButton.querySelector(
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
// NAVEGACIÓN
// ============================================================

moduleButtons.forEach(
    (button) => {

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

    }
);


// ============================================================
// UTILIDADES
// ============================================================

function createTextElement(
    tag,
    className,
    text
) {

    const element =
        document.createElement(
            tag
        );


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

    if (
        bytes < 1024
    ) {

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


// ============================================================
// CHAT
// ============================================================

function updateLanguageDirection() {

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


senderSelect.addEventListener(
    "change",
    updateLanguageDirection
);


function updateCharacterCounter() {

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


messageInput.addEventListener(
    "input",
    updateCharacterCounter
);


function setStatus(
    message = "",
    type = "info"
) {

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


    sendButton.disabled =
        loading;

    messageInput.disabled =
        loading;

    senderSelect.disabled =
        loading;


    sendButtonContent.classList.toggle(
        "d-none",
        loading
    );


    sendButtonLoading.classList.toggle(
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
            conversation.slice(
                -10
            )

    };


    try {

        setLoading(
            true
        );


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
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                data?.error ||
                "No fue posible procesar la solicitud."
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

        setLoading(
            false
        );

    }

}


chatForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        sendMessage();

    }
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


newConversationButton.addEventListener(
    "click",
    () => {

        conversation =
            [];


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


// ============================================================
// IMÁGENES
// ============================================================

function setImageStatus(
    message = "",
    type = "info"
) {

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


    analyzeImageButton.disabled =
        loading;

    imageFileInput.disabled =
        loading;

    imageSourceLanguage.disabled =
        loading;

    imageTargetLanguage.disabled =
        loading;

    swapImageLanguagesButton.disabled =
        loading;


    imageButtonContent.classList.toggle(
        "d-none",
        loading
    );


    imageButtonLoading.classList.toggle(
        "d-none",
        !loading
    );

}


function updateImageLanguageDirection() {

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
            changed === "source"
        ) {

            imageTargetLanguage.value =
                imageSourceLanguage.value === "es"
                    ? "en"
                    : "es";

        } else {

            imageSourceLanguage.value =
                imageTargetLanguage.value === "es"
                    ? "en"
                    : "es";

        }

    }


    updateImageLanguageDirection();

}


imageSourceLanguage.addEventListener(
    "change",
    () => {

        normalizeImageLanguages(
            "source"
        );

    }
);


imageTargetLanguage.addEventListener(
    "change",
    () => {

        normalizeImageLanguages(
            "target"
        );

    }
);


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


function clearImagePreview() {

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

    detectedTextResult.textContent =
        "Aún no hay resultados.";


    translatedImageTextResult.textContent =
        "La traducción aparecerá aquí.";


    detectedTextResult.classList.add(
        "empty-result"
    );


    translatedImageTextResult.classList.add(
        "empty-result"
    );

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
                await response.json();


            if (
                !response.ok
            ) {

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
                error.message,
                "error"
            );


        } finally {

            setImageLoading(
                false
            );

        }

    }
);


// ============================================================
// DOCUMENTOS
// ============================================================

function setDocumentStatus(
    message = "",
    type = "info"
) {

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


    translateDocumentButton.disabled =
        loading;

    documentFileInput.disabled =
        loading;

    documentSourceLanguage.disabled =
        loading;

    documentTargetLanguage.disabled =
        loading;

    swapDocumentLanguagesButton.disabled =
        loading;


    documentButtonContent.classList.toggle(
        "d-none",
        loading
    );


    documentButtonLoading.classList.toggle(
        "d-none",
        !loading
    );

}


function updateDocumentLanguageDirection() {

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
            changed === "source"
        ) {

            documentTargetLanguage.value =
                documentSourceLanguage.value === "es"
                    ? "en"
                    : "es";

        } else {

            documentSourceLanguage.value =
                documentTargetLanguage.value === "es"
                    ? "en"
                    : "es";

        }

    }


    updateDocumentLanguageDirection();

}


documentSourceLanguage.addEventListener(
    "change",
    () => {

        normalizeDocumentLanguages(
            "source"
        );

    }
);


documentTargetLanguage.addEventListener(
    "change",
    () => {

        normalizeDocumentLanguages(
            "target"
        );

    }
);


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


function getDocumentExtension(
    fileName
) {

    const parts =
        fileName
            .toLowerCase()
            .split(".");


    if (
        parts.length < 2
    ) {

        return "";

    }


    return parts.pop();

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
        getDocumentExtension(
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

    documentOriginalResult.textContent =
        "Aún no hay contenido.";


    documentTranslationResult.textContent =
        "La traducción aparecerá aquí.";


    documentOriginalResult.classList.add(
        "empty-result"
    );


    documentTranslationResult.classList.add(
        "empty-result"
    );


    documentMetadata.innerHTML = `
        <i class="bi bi-file-text"></i>

        <span>
            Los datos del documento aparecerán aquí.
        </span>
    `;

}


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
                await response.json();


            if (
                !response.ok
            ) {

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


messageInput.focus();