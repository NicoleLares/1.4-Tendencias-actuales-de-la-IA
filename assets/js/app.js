// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_BASE_URL =
    "https://1-4-tendencias-actuales-de-la-ia-iota.vercel.app";

const CHAT_ENDPOINT =
    `${API_BASE_URL}/api/chat`;

const MAX_CHARACTERS = 2000;


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


// ============================================================
// ESTADO
// ============================================================

let conversation = [];

let isProcessing = false;


// ============================================================
// ELEMENTOS
// ============================================================

const moduleButtons =
    document.querySelectorAll(".module-button");

const moduleViews =
    document.querySelectorAll(".module-view");

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

const emptyConversation =
    document.getElementById("emptyConversation");

const characterCounter =
    document.getElementById("characterCounter");

const sendButton =
    document.getElementById("sendButton");

const sendButtonContent =
    sendButton.querySelector(".send-button-content");

const sendButtonLoading =
    sendButton.querySelector(".send-button-loading");

const statusMessage =
    document.getElementById("statusMessage");

const newConversationButton =
    document.getElementById(
        "newConversationButton"
    );


// ============================================================
// NAVEGACIÓN DE MÓDULOS
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
// PARTICIPANTE
// ============================================================

function updateLanguageDirection() {

    const participant =
        PARTICIPANTS[
        senderSelect.value
        ];

    languageDirection.textContent =
        `${participant.sourceLabel} → ${participant.targetLabel}`;

    if (
        participant.id ===
        "participantA"
    ) {

        messageInput.placeholder =
            "Escribe un mensaje en español...";

    } else {

        messageInput.placeholder =
            "Write a message in English...";

    }

}


senderSelect.addEventListener(
    "change",
    updateLanguageDirection
);


// ============================================================
// CONTADOR DE CARACTERES
// ============================================================

function updateCharacterCounter() {

    const length =
        messageInput.value.length;

    characterCounter.textContent =
        `${length} / ${MAX_CHARACTERS}`;

    if (
        length >=
        MAX_CHARACTERS * 0.9
    ) {

        characterCounter.style.color =
            "#e4b75c";

    } else {

        characterCounter.style.color =
            "";

    }

}


messageInput.addEventListener(
    "input",
    updateCharacterCounter
);


// ============================================================
// ESTADOS
// ============================================================

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


// ============================================================
// ESTADO DEL BOTÓN
// ============================================================

function setLoading(loading) {

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


// ============================================================
// CREAR ELEMENTOS
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


// ============================================================
// MOSTRAR MENSAJE
// ============================================================

function renderMessage(message) {

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
        document.createElement("article");

    article.className =
        `message-entry ${participant.cssClass}`;


    // META
    const meta =
        document.createElement("div");

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


    // ORIGINAL
    const originalSection =
        document.createElement("div");

    originalSection.className =
        "translation-section";


    const originalLabel =
        createTextElement(
            "span",
            "translation-label",
            "Original"
        );


    const originalText =
        createTextElement(
            "p",
            "translation-text",
            message.original
        );


    originalSection.append(
        originalLabel,
        originalText
    );


    // TRADUCCIÓN
    const translatedSection =
        document.createElement("div");

    translatedSection.className =
        "translation-section";


    const translatedLabel =
        createTextElement(
            "span",
            "translation-label",
            "Traducción"
        );


    const translatedText =
        createTextElement(
            "p",
            "translation-text translated-text",
            message.translation
        );


    translatedSection.append(
        translatedLabel,
        translatedText
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


// ============================================================
// VALIDAR CONFIGURACIÓN
// ============================================================

function validateApiConfiguration() {

    if (
        API_BASE_URL.includes(
            "TU-PROYECTO"
        )
    ) {

        setStatus(
            "Configura primero la URL de tu proyecto de Vercel en app.js.",
            "warning"
        );

        return false;
    }

    return true;

}


// ============================================================
// ENVIAR MENSAJE
// ============================================================

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


    if (
        !validateApiConfiguration()
    ) {
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


        let data = null;


        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "El servidor devolvió una respuesta no válida."
            );

        }


        if (!response.ok) {

            throw new Error(
                data?.error ||
                "No fue posible procesar la solicitud."
            );

        }


        if (
            !data.translation
        ) {

            throw new Error(
                "La traducción recibida está vacía."
            );

        }


        const message = {

            sender:
                participant.id,

            source_language:
                participant.sourceLanguage,

            target_language:
                participant.targetLanguage,

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


        window.setTimeout(
            () => {

                setStatus();

            },
            2500
        );


    } catch (error) {

        console.error(
            "Error:",
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


// ============================================================
// FORMULARIO
// ============================================================

chatForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        sendMessage();

    }
);


// ============================================================
// ENTER PARA ENVIAR
// ============================================================

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


// ============================================================
// NUEVA CONVERSACIÓN
// ============================================================

function resetConversation() {

    conversation = [];


    messagesContainer.innerHTML =
        `
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
                Aquí aparecerán el texto original y
                su traducción.
            </p>

        </div>
        `;


    messageInput.value =
        "";

    updateCharacterCounter();

    setStatus();

    messageInput.focus();

}


newConversationButton.addEventListener(
    "click",
    resetConversation
);


// ============================================================
// INICIO
// ============================================================

updateLanguageDirection();

updateCharacterCounter();

messageInput.focus();