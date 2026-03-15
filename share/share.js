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
            claude: `https://claude.ai/?context_url=${encoded}`,
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

    function updateTemplates() {
        const docUrl = document.getElementById('docUrl').value.trim();
        const placeholder = t('templatePlaceholder');
        if (!docUrl) {
            document.querySelector('#htmlTemplate code').textContent = '<!-- ' + placeholder + ' -->';
            document.querySelector('#linkedInTemplate code').textContent = placeholder;
            document.querySelector('#docTemplate code').textContent = placeholder;
            return;
        }

        const urls = getChatUrls(docUrl);
        const chatLabel = t('templateChatLinkLabel');
        const downloadLabel = t('templateDownloadLabel');
        const urlDescarga = t('templateUrlDescarga');
        const urlChat = t('templateUrlChat');

        document.querySelector('#htmlTemplate code').textContent = getHtmlTemplate(docUrl);

        document.querySelector('#linkedInTemplate code').textContent =
            `${chatLabel}\n${urls.chatgpt}\n\n` +
            `${downloadLabel}\n${docUrl}`;

        document.querySelector('#docTemplate code').textContent =
            `${urlDescarga}\n${docUrl}\n\n` +
            `${urlChat}\n${urls.chatgpt}`;
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
        document.getElementById('templateLinkedInTitle').textContent = t('templateLinkedInTitle');
        document.getElementById('templateLinkedInDesc').textContent = t('templateLinkedInDesc');
        document.getElementById('templateDocTitle').textContent = t('templateDocTitle');
        document.getElementById('templateDocDesc').textContent = t('templateDocDesc');
        document.querySelectorAll('.btn-copy').forEach(b => b.textContent = t('copyButton'));
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

        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                const block = btn.closest('.template-block');
                const code = block?.querySelector('code');
                if (code) copyToClipboard(code.textContent, btn);
            });
        });

        updateTemplates();
    });
})();
