// myContext Popup
const t = (key, params = {}) => {
    const lang = typeof MyContextTranslations !== 'undefined' ? (currentLang && MyContextTranslations[currentLang] ? currentLang : 'es') : 'es';
    let text = MyContextTranslations[lang]?.[key] || MyContextTranslations.es?.[key] || key;
    for (const [k, v] of Object.entries(params)) text = text.replace(`{${k}}`, v);
    return text;
};

let currentLang = 'es';

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t(key)) el.textContent = t(key);
    });
    const subtitle = document.getElementById('subtitle');
    if (subtitle) subtitle.textContent = t('subtitle');
    const langLabel = document.getElementById('languageLabel');
    if (langLabel) langLabel.textContent = t('language');
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.value = currentLang;
        const optEs = langSelect.querySelector('option[value="es"]');
        const optEn = langSelect.querySelector('option[value="en"]');
        if (optEs) optEs.textContent = t('spanish');
        if (optEn) optEn.textContent = t('english');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const { mycontext_language: lang } = await chrome.storage.local.get(['mycontext_language']);
    currentLang = lang || 'es';

    const noProfile = document.getElementById('noProfile');
    const hasProfile = document.getElementById('hasProfile');
    const openSettings = document.getElementById('openSettings');
    const openSettingsFromProfile = document.getElementById('openSettingsFromProfile');
    const downloadJson = document.getElementById('downloadJson');
    const downloadMd = document.getElementById('downloadMd');
    const languageSelect = document.getElementById('languageSelect');

    applyTranslations();

    languageSelect?.addEventListener('change', async (e) => {
        currentLang = e.target.value;
        await chrome.storage.local.set({ mycontext_language: currentLang });
        applyTranslations();
    });

    // Check if profile exists
    const { mycontext_profile: profile } = await chrome.storage.local.get(['mycontext_profile']);
    const hasData = profile && (profile.name || profile.bio || (profile.links && profile.links.length > 0));

    if (hasData) {
        noProfile.style.display = 'none';
        hasProfile.style.display = 'block';
    } else {
        noProfile.style.display = 'block';
        hasProfile.style.display = 'none';
    }

    // Open settings (options page)
    openSettings?.addEventListener('click', () => chrome.runtime.openOptionsPage());
    openSettingsFromProfile?.addEventListener('click', () => chrome.runtime.openOptionsPage());

    // Download handlers
    downloadJson?.addEventListener('click', async () => {
        const { mycontext_profile } = await chrome.storage.local.get(['mycontext_profile']);
        if (!mycontext_profile) return;
        const doc = buildContextDocument(mycontext_profile);
        downloadFile(JSON.stringify(doc, null, 2), 'mycontext.json', 'application/json');
    });

    downloadMd?.addEventListener('click', async () => {
        const { mycontext_profile } = await chrome.storage.local.get(['mycontext_profile']);
        if (!mycontext_profile) return;
        const doc = buildContextDocument(mycontext_profile);
        const md = contextToMarkdown(doc);
        downloadFile(md, 'mycontext.md', 'text/markdown');
    });
});

function buildContextDocument(profile) {
    return {
        version: '1.0',
        type: 'ai-context-document',
        schema: 'https://ai4context.com/schemas/ai-context-1.0.json',
        updatedAt: new Date().toISOString(),
        profile: {
            name: profile.name || '',
            type: profile.type || 'person',
            bio: profile.bio || '',
            links: profile.links || [],
            rules: profile.rules || ''
        }
    };
}

function contextToMarkdown(doc) {
    const p = doc.profile;
    let md = `# AI Context Document\n\n`;
    md += `> Documento de contexto para IAs. Generado por myAI4context (AI4Context).\n\n`;
    md += `## ${p.name || 'Sin nombre'}\n\n`;
    if (p.bio) md += `${p.bio}\n\n`;
    if (p.links && p.links.length > 0) {
        md += `### Enlaces\n\n`;
        p.links.forEach(l => {
            md += `- [${l.label || l.url}](${l.url})\n`;
        });
        md += `\n`;
    }
    if (p.rules) md += `### Reglas\n\n${p.rules}\n`;
    return md;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
