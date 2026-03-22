// myAI4context Share – Plantillas e instrucciones
(function () {
    'use strict';

    const t = (key) => {
        const lang = currentLang in MyContextShareTranslations ? currentLang : 'es';
        return MyContextShareTranslations[lang]?.[key] || MyContextShareTranslations.es?.[key] || key;
    };

    let currentLang = 'es';

    function getChatUrls(docUrl) {
        const encoded = encodeURIComponent(docUrl);
        return {
            chatgpt: `https://chat.openai.com/?context_url=${encoded}`,
            // /new abre conversación nueva con el parámetro visible para el content script
            claude: `https://claude.ai/new?context_url=${encoded}`,
            gemini: `https://gemini.google.com/?context_url=${encoded}`
        };
    }

    function getHtmlTemplate(docUrl) {
        const urls = getChatUrls(docUrl);
        const downloadLabel = t('htmlDownloadBtn');
        return `<!-- myAI4context: botones para compartir -->
<div class="myai4context-share">
  <a href="${docUrl}" download class="myai4context-btn">${downloadLabel}</a>
  <a href="${urls.chatgpt}" target="_blank" rel="noopener">ChatGPT</a>
  <a href="${urls.claude}" target="_blank" rel="noopener">Claude</a>
  <a href="${urls.gemini}" target="_blank" rel="noopener">Gemini</a>
</div>
<style>
.myai4context-share { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
.myai4context-share a { padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 0.9rem; }
.myai4context-btn { background: #6366f1; color: white; }
.myai4context-share a[target="_blank"] { background: rgba(99,102,241,0.2); color: #4f46e5; }
.myai4context-share a:hover { opacity: 0.9; }
</style>`;
    }

    function renderProfileUrlRows(docUrl) {
        const container = document.getElementById('profileUrlsContainer');
        if (!container) return;

        container.replaceChildren();

        const placeholder = t('templatePlaceholder');
        if (!docUrl) {
            const p = document.createElement('p');
            p.className = 'profile-urls-empty';
            p.textContent = placeholder;
            container.appendChild(p);
            return;
        }

        const urls = getChatUrls(docUrl);
        const rows = [
            { label: t('templateDownloadLabel'), value: docUrl },
            { label: t('templateChatGptLabel'), value: urls.chatgpt },
            { label: t('templateClaudeLabel'), value: urls.claude },
            { label: t('templateGeminiLabel'), value: urls.gemini }
        ];

        rows.forEach(({ label, value }) => {
            const row = document.createElement('div');
            row.className = 'url-row';

            const lab = document.createElement('span');
            lab.className = 'url-row-label';
            lab.textContent = label;

            const body = document.createElement('div');
            body.className = 'url-row-body';

            const code = document.createElement('code');
            code.className = 'url-row-value';
            code.textContent = value;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-copy-row';
            btn.textContent = t('copyButton');
            btn.addEventListener('click', () => copyToClipboard(value, btn));

            body.appendChild(code);
            body.appendChild(btn);
            row.appendChild(lab);
            row.appendChild(body);
            container.appendChild(row);
        });
    }

    function updateTemplates() {
        const docUrl = document.getElementById('docUrl').value.trim();
        const placeholder = t('templatePlaceholder');
        if (!docUrl) {
            document.querySelector('#htmlTemplate code').textContent = '<!-- ' + placeholder + ' -->';
            renderProfileUrlRows('');
            return;
        }

        document.querySelector('#htmlTemplate code').textContent = getHtmlTemplate(docUrl);
        renderProfileUrlRows(docUrl);
    }

    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            const orig = btn.textContent;
            btn.textContent = t('copied');
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = orig;
                btn.classList.remove('copied');
            }, 1500);
        });
    }

    function applyTranslations() {
        document.getElementById('shareSubtitle').textContent = t('shareSubtitle');
        document.getElementById('step1Title').textContent = t('step1Title');
        document.getElementById('step1Desc').textContent = t('step1Desc');
        document.getElementById('step1Hint').textContent = t('step1Hint');
        document.getElementById('step2Title').textContent = t('step2Title');
        document.getElementById('urlHint').textContent = t('urlHint');
        document.getElementById('templatesTitle').textContent = t('templatesTitle');
        document.getElementById('templateWebTitle').textContent = t('templateWebTitle');
        document.getElementById('templateWebDesc').textContent = t('templateWebDesc');
        const profileTitle = document.getElementById('templateProfileTitle');
        const profileDesc = document.getElementById('templateProfileDesc');
        if (profileTitle) profileTitle.textContent = t('templateProfileTitle');
        if (profileDesc) profileDesc.textContent = t('templateProfileDesc');
        document.querySelectorAll('.code-block .btn-copy').forEach(b => b.textContent = t('copyButton'));
        document.querySelectorAll('#profileUrlsContainer .btn-copy-row').forEach(b => b.textContent = t('copyButton'));
        document.getElementById('docUrl').placeholder = t('urlPlaceholder');
        const langLabel = document.getElementById('languageLabel');
        if (langLabel) langLabel.textContent = t('language');
        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = currentLang;
            const optEs = langSelect?.querySelector('option[value="es"]');
            const optEn = langSelect?.querySelector('option[value="en"]');
            if (optEs) optEs.textContent = t('spanish');
            if (optEn) optEn.textContent = t('english');
        }
        document.documentElement.lang = currentLang === 'es' ? 'es' : 'en';
        const pricingLink = document.getElementById('pricingLink');
        if (pricingLink) pricingLink.textContent = t('pricingLink');
    }

    function showExtensionVersionInFooter() {
        try {
            const v = chrome.runtime.getManifest()?.version;
            const el = document.getElementById('extensionVersion');
            if (!el || !v) return;
            el.textContent = 'v' + v;
            el.title = 'myAI4context ' + v;
            el.removeAttribute('hidden');
        } catch (e) {
            console.warn('[myAI4context] version footer:', e);
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const params = new URLSearchParams(window.location.search);
        const langParam = params.get('lang');
        if (langParam === 'en' || langParam === 'es') currentLang = langParam;
        else {
            const { mycontext_language } = await chrome.storage.local.get('mycontext_language');
            currentLang = mycontext_language || 'es';
        }

        applyTranslations();
        showExtensionVersionInFooter();

        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                currentLang = e.target.value;
                applyTranslations();
                updateTemplates();
            });
        }

        const docUrlInput = document.getElementById('docUrl');
        docUrlInput.addEventListener('input', updateTemplates);
        docUrlInput.addEventListener('paste', () => setTimeout(updateTemplates, 0));

        document.querySelectorAll('.code-block .btn-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                const block = btn.closest('.code-block');
                const code = block?.querySelector('code');
                if (code) copyToClipboard(code.textContent, btn);
            });
        });

        updateTemplates();
    });
})();
