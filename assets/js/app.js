// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_BASE_URL =
    "https://1-4-tendencias-actuales-de-la-ia-iota.vercel.app";

const CHAT_ENDPOINT =
    `${API_BASE_URL}/api/chat`;

const IMAGE_ENDPOINT =
    `${API_BASE_URL}/api/image`;

const MAX_CHARACTERS = 2000;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp"
];


// ============================================================
// PARTICIPANTES
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

const LANGUAGE_LABELS = {
    es: "Español",
    en: "English"
};


// ============================================================
// ESTADO
// ============================================================

let conversation = [];
let isProcessing = false;
let isImageProcessing = false;
let selectedImagePayload = null;


// ============================================================
// ELEMENTOS GENERALES / CHAT
// ============================================================

const moduleButtons = document.querySelectorAll(".module-button");
const moduleViews = document.querySelectorAll(".module-view");

const chatForm = document.getElementById("chatForm");
const senderSelect = document.getElementById("senderSelect");
const languageDirection = document.getElementById("languageDirection");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messagesContainer");
const characterCounter = document.getElementById("characterCounter");
const sendButton = document.getElementById("sendButton");
const sendButtonContent = sendButton.querySelector(".send-button-content");
const sendButtonLoading = sendButton.querySelector(".send-button-loading");
const statusMessage = document.getElementById("statusMessage");
const newConversationButton = document.getElementById("newConversationButton");


// ============================================================
// ELEMENTOS IMÁGENES
// ============================================================

const imageForm = document.getElementById("imageForm");
const imageSourceLanguage = document.getElementById("imageSourceLanguage");
const imageTargetLanguage = document.getElementById("imageTargetLanguage");
const imageLanguageDirection = document.getElementById("imageLanguageDirection");
const swapImageLanguagesButton = document.getElementById("swapImageLanguagesButton");
const imageFileInput = document.getElementById("imageFileInput");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const analyzeImageButton = document.getElementById("analyzeImageButton");
const imageButtonContent = analyzeImageButton.querySelector(".image-button-content");
const imageButtonLoading = analyzeImageButton.querySelector(".image-button-loading");
const imageStatusMessage = document.getElementById("imageStatusMessage");
const detectedTextResult = document.getElementById("detectedTextResult");
const translatedImageTextResult = document.getElementById("translatedImageTextResult");


// ============================================================
// NAVEGACIÓN DE MÓDULOS
// ============================================================

moduleButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const module = button.dataset.module;

        moduleButtons.forEach((item) => {
            item.classList.remove("active");
        });

        moduleViews.forEach((view) => {
            view.classList.remove("active");
        });

        button.classList.add("active");

        const target = document.getElementById(`${module}Module`);
        if (target) {
            target.classList.add("active");
        }
    });
});


// ============================================================
// CHAT
// ============================================================

function updateLanguageDirection() {
    const participant = PARTICIPANTS[senderSelect.value];

    languageDirection.textContent =
        `${participant.sourceLabel} → ${participant.targetLabel}`;

    if (participant.id === "participantA") {
        messageInput.placeholder = "Escribe un mensaje en español...";
    } else {
        messageInput.placeholder = "Write a message in English...";
    }
}

senderSelect.addEventListener("change", updateLanguageDirection);

function updateCharacterCounter() {
    const length = messageInput.value.length;

    characterCounter.textContent = `${length} / ${MAX_CHARACTERS}`;

    if (length >= MAX_CHARACTERS * 0.9) {
        characterCounter.style.color = "#e4b75c";
    } else {
        characterCounter.style.color = "";
    }
}

messageInput.addEventListener("input", updateCharacterCounter);

function setStatus(message = "", type = "info") {
    statusMessage.textContent = message;
    statusMessage.className = "status-message";

    if (!message) {
        return;
    }

    statusMessage.classList.add("visible", type);
}

function setLoading(loading) {
    isProcessing = loading;

    sendButton.disabled = loading;
    messageInput.disabled = loading;
    senderSelect.disabled = loading;

    sendButtonContent.classList.toggle("d-none", loading);
    sendButtonLoading.classList.toggle("d-none", !loading);
}

function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

function renderMessage(message) {
    const emptyConversation = document.getElementById("emptyConversation");

    if (emptyConversation && emptyConversation.parentNode) {
        emptyConversation.remove();
    }

    const participant = PARTICIPANTS[message.sender];

    const article = document.createElement("article");
    article.className = `message-entry ${participant.cssClass}`;

    const meta = document.createElement("div");
    meta.className = "message-meta";

    const sender = createTextElement(
        "span",
        "message-sender",
        `${participant.flag} ${participant.name}`
    );

    const direction = createTextElement(
        "span",
        "message-direction",
        `${participant.sourceLabel} → ${participant.targetLabel}`
    );

    meta.append(sender, direction);

    const originalSection = document.createElement("div");
    originalSection.className = "translation-section";

    const originalLabel = createTextElement(
        "span",
        "translation-label",
        "Original"
    );

    const originalText = createTextElement(
        "p",
        "translation-text",
        message.original
    );

    originalSection.append(originalLabel, originalText);

    const translatedSection = document.createElement("div");
    translatedSection.className = "translation-section";

    const translatedLabel = createTextElement(
        "span",
        "translation-label",
        "Traducción"
    );

    const translatedText = createTextElement(
        "p",
        "translation-text translated-text",
        message.translation
    );

    translatedSection.append(translatedLabel, translatedText);

    article.append(meta, originalSection, translatedSection);
    messagesContainer.appendChild(article);

    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "smooth"
    });
}

function validateApiConfiguration() {
    if (API_BASE_URL.includes("TU-PROYECTO")) {
        setStatus(
            "Configura primero la URL de tu proyecto de Vercel en app.js.",
            "warning"
        );
        return false;
    }

    return true;
}

async function sendMessage() {
    if (isProcessing) {
        return;
    }

    const text = messageInput.value.trim();

    if (!text) {
        setStatus("Escribe un mensaje antes de enviarlo.", "warning");
        messageInput.focus();
        return;
    }

    if (text.length > MAX_CHARACTERS) {
        setStatus(
            `El mensaje no puede superar ${MAX_CHARACTERS} caracteres.`,
            "warning"
        );
        return;
    }

    if (!validateApiConfiguration()) {
        return;
    }

    const participant = PARTICIPANTS[senderSelect.value];

    const payload = {
        message: text,
        sender: participant.id,
        source_language: participant.sourceLanguage,
        target_language: participant.targetLanguage,
        history: conversation.slice(-10)
    };

    try {
        setLoading(true);
        setStatus("Traduciendo mensaje...", "info");

        const response = await fetch(CHAT_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        let data = null;

        try {
            data = await response.json();
        } catch {
            throw new Error("El servidor devolvió una respuesta no válida.");
        }

        if (!response.ok) {
            throw new Error(
                data?.error || "No fue posible procesar la solicitud."
            );
        }

        if (!data.translation) {
            throw new Error("La traducción recibida está vacía.");
        }

        const message = {
            sender: participant.id,
            source_language: participant.sourceLanguage,
            target_language: participant.targetLanguage,
            original: text,
            translation: data.translation
        };

        conversation.push(message);
        renderMessage(message);

        messageInput.value = "";
        updateCharacterCounter();

        setStatus("Traducción completada.", "success");
        messageInput.focus();

        window.setTimeout(() => {
            setStatus();
        }, 2500);

    } catch (error) {
        console.error("Error:", error);

        setStatus(
            error.message || "No fue posible conectar con el servidor.",
            "error"
        );

    } finally {
        setLoading(false);
    }
}

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage();
});

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

function resetConversation() {
    conversation = [];

    messagesContainer.innerHTML = `
        <div id="emptyConversation" class="empty-conversation">
            <div class="empty-icon">
                <i class="bi bi-translate"></i>
            </div>
            <h3>Inicia una conversación</h3>
            <p>
                Escribe un mensaje en español o inglés.
                Aquí aparecerán el texto original y su traducción.
            </p>
        </div>
    `;

    messageInput.value = "";
    updateCharacterCounter();
    setStatus();
    messageInput.focus();
}

newConversationButton.addEventListener("click", resetConversation);


// ============================================================
// IMÁGENES
// ============================================================

function setImageStatus(message = "", type = "info") {
    imageStatusMessage.textContent = message;
    imageStatusMessage.className = "status-message";

    if (!message) {
        return;
    }

    imageStatusMessage.classList.add("visible", type);
}

function setImageLoading(loading) {
    isImageProcessing = loading;

    analyzeImageButton.disabled = loading;
    imageFileInput.disabled = loading;
    imageSourceLanguage.disabled = loading;
    imageTargetLanguage.disabled = loading;
    swapImageLanguagesButton.disabled = loading;

    imageButtonContent.classList.toggle("d-none", loading);
    imageButtonLoading.classList.toggle("d-none", !loading);
}

function updateImageLanguageDirection() {
    const source = imageSourceLanguage.value;
    const target = imageTargetLanguage.value;

    imageLanguageDirection.textContent =
        `${LANGUAGE_LABELS[source]} → ${LANGUAGE_LABELS[target]}`;
}

function normalizeImageLanguageSelectors(changedSelect) {
    if (imageSourceLanguage.value === imageTargetLanguage.value) {
        if (changedSelect === "source") {
            imageTargetLanguage.value =
                imageSourceLanguage.value === "es" ? "en" : "es";
        } else {
            imageSourceLanguage.value =
                imageTargetLanguage.value === "es" ? "en" : "es";
        }
    }

    updateImageLanguageDirection();
}

imageSourceLanguage.addEventListener("change", () => {
    normalizeImageLanguageSelectors("source");
});

imageTargetLanguage.addEventListener("change", () => {
    normalizeImageLanguageSelectors("target");
});

swapImageLanguagesButton.addEventListener("click", () => {
    const currentSource = imageSourceLanguage.value;
    const currentTarget = imageTargetLanguage.value;

    imageSourceLanguage.value = currentTarget;
    imageTargetLanguage.value = currentSource;

    updateImageLanguageDirection();
});

function clearImagePreview() {
    imagePreviewContainer.innerHTML = `
        <div class="image-preview-empty">
            <i class="bi bi-image"></i>
            <p>No has seleccionado ninguna imagen.</p>
        </div>
    `;
}

function renderImagePreview(dataUrl, fileName) {
    imagePreviewContainer.innerHTML = `
        <img src="${dataUrl}" alt="${fileName}">
    `;
}

function clearImageResults() {
    detectedTextResult.textContent = "Aún no hay resultados.";
    translatedImageTextResult.textContent = "La traducción aparecerá aquí.";
    detectedTextResult.classList.add("empty-result");
    translatedImageTextResult.classList.add("empty-result");
}

function validateSelectedImage(file) {
    if (!file) {
        throw new Error("Selecciona una imagen antes de continuar.");
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error(
            "Formato no permitido. Usa PNG, JPG, JPEG o WEBP."
        );
    }

    if (file.size > MAX_IMAGE_BYTES) {
        throw new Error(
            "La imagen supera el tamaño máximo permitido de 3 MB."
        );
    }
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = () => {
            reject(new Error("No fue posible leer la imagen seleccionada."));
        };

        reader.readAsDataURL(file);
    });
}

async function handleImageSelection() {
    const file = imageFileInput.files[0];

    try {
        setImageStatus();
        validateSelectedImage(file);

        const dataUrl = await readFileAsDataUrl(file);
        const base64 = String(dataUrl).split(",")[1];

        selectedImagePayload = {
            fileName: file.name,
            mimeType: file.type,
            base64,
            dataUrl
        };

        renderImagePreview(dataUrl, file.name);
        clearImageResults();
        setImageStatus("Imagen cargada correctamente. Ya puedes analizarla.", "success");

    } catch (error) {
        selectedImagePayload = null;
        imageFileInput.value = "";
        clearImagePreview();
        clearImageResults();
        setImageStatus(error.message, "warning");
    }
}

imageFileInput.addEventListener("change", handleImageSelection);

function validateImageApiConfiguration() {
    if (API_BASE_URL.includes("TU-PROYECTO")) {
        setImageStatus(
            "Configura primero la URL de tu proyecto de Vercel en app.js.",
            "warning"
        );
        return false;
    }

    return true;
}

async function submitImageTranslation() {
    if (isImageProcessing) {
        return;
    }

    if (!validateImageApiConfiguration()) {
        return;
    }

    if (!selectedImagePayload) {
        setImageStatus("Selecciona una imagen antes de analizarla.", "warning");
        return;
    }

    const payload = {
        image_base64: selectedImagePayload.base64,
        mime_type: selectedImagePayload.mimeType,
        file_name: selectedImagePayload.fileName,
        source_language: imageSourceLanguage.value,
        target_language: imageTargetLanguage.value
    };

    try {
        setImageLoading(true);
        setImageStatus("Analizando imagen y traduciendo texto...", "info");

        const response = await fetch(IMAGE_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        let data = null;

        try {
            data = await response.json();
        } catch {
            throw new Error("El servidor devolvió una respuesta no válida.");
        }

        if (!response.ok) {
            throw new Error(
                data?.error || "No fue posible procesar la imagen."
            );
        }

        detectedTextResult.classList.remove("empty-result");
        translatedImageTextResult.classList.remove("empty-result");

        if (data.legible) {
            detectedTextResult.textContent =
                data.detected_text || "No se detectó texto.";

            translatedImageTextResult.textContent =
                data.translation || "No se obtuvo traducción.";

            setImageStatus(
                data.message || "Imagen analizada correctamente.",
                "success"
            );
        } else {
            detectedTextResult.textContent =
                data.detected_text || "No se encontró texto legible.";

            translatedImageTextResult.textContent =
                data.translation || "No fue posible generar una traducción confiable.";

            setImageStatus(
                data.message || "No se encontró texto legible en la imagen.",
                "warning"
            );
        }

    } catch (error) {
        console.error("Image error:", error);
        setImageStatus(
            error.message || "No fue posible conectar con el servidor.",
            "error"
        );
    } finally {
        setImageLoading(false);
    }
}

imageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitImageTranslation();
});


// ============================================================
// INICIO
// ============================================================

updateLanguageDirection();
updateCharacterCounter();
updateImageLanguageDirection();
clearImagePreview();
clearImageResults();
messageInput.focus();