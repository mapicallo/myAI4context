// myAI4context - POC: Inyectar contexto al abrir chat de ChatGPT, Claude o Gemini
// URL: chat.openai.com?context_url=https://...&context_prompt=...
// Requiere extensión instalada. Al cargar con context_url, obtiene el .md y lo inyecta.

(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const contextUrl = params.get('context_url');
    const contextPrompt = params.get('context_prompt') || 'Pregunta lo que quieras sobre el contenido. ¿En qué puedo ayudarte?';

    if (!contextUrl) return;

    const platform = detectPlatform();
    if (!platform) return;

    console.log('[myAI4context] context_url detected, platform:', platform);

    async function run() {
        try {
            const response = await fetch(contextUrl);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const content = await response.text();
            const fullMessage = content.trim() + '\n\n---\n\n' + contextPrompt;

            // Esperar a que el input esté disponible (las IAs cargan dinámicamente)
            const input = await waitForInput(platform, 15000);
            if (!input) {
                console.warn('[myAI4context] Input not found after timeout');
                showToast('No se encontró el área de mensaje. Recarga la página.', 'error');
                return;
            }

            setInputText(input, fullMessage);
            triggerInputEvents(input);

            // Limpiar URL para no re-ejecutar al recargar
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, '', cleanUrl);

            showToast('Contexto cargado. Pulsa Enviar o Enter.', 'success');

            // Opcional: auto-enviar tras 500ms
            setTimeout(() => {
                const btn = findSendButton(input, platform);
                if (btn && !btn.disabled) {
                    btn.click();
                    showToast('Mensaje enviado.', 'success');
                }
            }, 500);
        } catch (e) {
            console.error('[myAI4context] Error:', e);
            showToast('Error al cargar el contexto: ' + e.message, 'error');
        }
    }

    function detectPlatform() {
        const h = window.location.hostname;
        if (h.includes('chat.openai.com') || h.includes('chatgpt.com')) return 'chatgpt';
        if (h.includes('claude.ai')) return 'claude';
        if (h.includes('gemini.google.com') || h.includes('aistudio.google.com')) return 'gemini';
        return null;
    }

    function findInput(platform) {
        const selectors = {
            chatgpt: [
                '#prompt-textarea',
                'textarea[data-id="root"]',
                'textarea[placeholder*="Message"]',
                'textarea[placeholder*="mensaje"]',
                'div[contenteditable="true"][role="textbox"]',
                'textarea'
            ],
            claude: [
                'textarea[placeholder*="Message"]',
                'textarea[placeholder*="Ask"]',
                'textarea[placeholder*="Claude"]',
                'div[contenteditable="true"][role="textbox"]',
                'textarea'
            ],
            gemini: [
                'textarea[placeholder*="prompt"]',
                'textarea[placeholder*="Ask"]',
                'textarea[placeholder*="Escribe"]',
                'div[contenteditable="true"][role="textbox"]',
                'textarea'
            ]
        };
        const list = selectors[platform] || selectors.chatgpt;
        for (const sel of list) {
            const el = document.querySelector(sel);
            if (el && el.offsetParent && el.getBoundingClientRect().width > 80) return el;
        }
        return null;
    }

    function waitForInput(platform, timeout) {
        return new Promise((resolve) => {
            const start = Date.now();
            const check = () => {
                const el = findInput(platform);
                if (el) return resolve(el);
                if (Date.now() - start > timeout) return resolve(null);
                setTimeout(check, 500);
            };
            check();
        });
    }

    function setInputText(input, text) {
        if (input.tagName === 'TEXTAREA') {
            input.value = text;
        } else if (input.contentEditable === 'true') {
            input.textContent = text;
            input.innerHTML = text.replace(/\n/g, '<br>');
        } else {
            input.textContent = text;
        }
    }

    function triggerInputEvents(input) {
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function findSendButton(input, platform) {
        const selectors = [
            'button[data-testid="send-button"]',
            'button[aria-label*="Send"]',
            'button[aria-label*="Enviar"]',
            'button[aria-label*="Submit"]',
            'button[type="submit"]'
        ];
        for (const sel of selectors) {
            const btn = document.querySelector(sel);
            if (btn && btn.offsetParent) return btn;
        }
        const rect = input.getBoundingClientRect();
        for (const btn of document.querySelectorAll('button')) {
            const r = btn.getBoundingClientRect();
            if (r.top >= rect.bottom - 80 && r.width > 24 && r.height > 24) return btn;
        }
        return null;
    }

    function showToast(msg, type) {
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;top:16px;right:16px;padding:12px 20px;border-radius:8px;z-index:99999;font-size:14px;background:${type === 'error' ? '#dc3545' : '#28a745'};color:white;box-shadow:0 4px 12px rgba(0,0,0,0.2);`;
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
