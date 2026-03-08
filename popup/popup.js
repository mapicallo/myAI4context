// myAI4context Popup - Multiple profiles
const t = (key, params = {}) => {
    const lang = typeof MyContextTranslations !== 'undefined' ? (currentLang && MyContextTranslations[currentLang] ? currentLang : 'es') : 'es';
    let text = MyContextTranslations[lang]?.[key] || MyContextTranslations.es?.[key] || key;
    for (const [k, v] of Object.entries(params)) text = text.replace(`{${k}}`, v);
    return text;
};

let currentLang = 'es';

function generateId() {
    return 'p' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

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

async function migrateFromSingleProfile() {
    const { mycontext_profile, mycontext_profiles } = await chrome.storage.local.get(['mycontext_profile', 'mycontext_profiles']);
    if (mycontext_profile && !mycontext_profiles) {
        const migrated = { id: generateId(), ...mycontext_profile };
        await chrome.storage.local.set({ mycontext_profiles: [migrated] });
        await chrome.storage.local.remove('mycontext_profile');
    }
}

function getProfileDisplayName(profile, index) {
    if (profile.name && profile.name.trim()) return profile.name.trim();
    return t('profileDefaultName', { n: index + 1 }) || `Perfil ${index + 1}`;
}

function renderProfiles(profiles) {
    const container = document.getElementById('profilesContainer');
    container.innerHTML = '';
    profiles.forEach((profile, index) => {
        const displayName = getProfileDisplayName(profile, index);
        const row = document.createElement('div');
        row.className = 'profile-row';
        row.innerHTML = `
            <span class="profile-name" title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</span>
            <div class="profile-actions">
                <button class="btn-icon" data-action="json" data-id="${profile.id}" title="${t('downloadJson')}">JSON</button>
                <button class="btn-icon" data-action="md" data-id="${profile.id}" title="${t('downloadMd')}">MD</button>
                <button class="btn-icon" data-action="edit" data-id="${profile.id}" title="${t('editProfile')}">✎</button>
                <button class="btn-icon btn-danger" data-action="delete" data-id="${profile.id}" title="${t('deleteProfile')}">🗑</button>
            </div>
        `;
        container.appendChild(row);
    });
    container.querySelectorAll('.btn-icon').forEach(btn => {
        btn.addEventListener('click', (e) => handleProfileAction(e.target.dataset.action, e.target.dataset.id));
    });
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

async function fetchLinksContent(links) {
    const validLinks = (links || []).filter(l => l.url && l.url.trim() && (l.url.startsWith('http://') || l.url.startsWith('https://')));
    if (validLinks.length === 0) return '';
    const parts = [];
    for (const link of validLinks) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const res = await fetch(link.url, { method: 'GET', credentials: 'omit', signal: controller.signal });
            if (!res.ok) continue;
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const text = (doc.body?.textContent || html.replace(/<[^>]+>/g, ' '))
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 15000);
            if (text) parts.push(`# ${link.label || link.url}\n\n${text}`);
        } catch (e) {
            console.warn('[myAI4context] Error fetching link:', link.url, e);
        } finally {
            clearTimeout(timeout);
        }
    }
    return parts.join('\n\n---\n\n');
}

async function handleProfileAction(action, profileId) {
    const { mycontext_profiles: profiles } = await chrome.storage.local.get(['mycontext_profiles']);
    const profile = (profiles || []).find(p => p.id === profileId);
    if (!profile && action !== 'new') return;

    if (action === 'edit') {
        await chrome.storage.local.set({ mycontext_editingProfileId: profileId });
        chrome.runtime.openOptionsPage();
        return;
    }
    if (action === 'delete') {
        if (!confirm(t('confirmDelete'))) return;
        const updated = (profiles || []).filter(p => p.id !== profileId);
        await chrome.storage.local.set({ mycontext_profiles: updated });
        refreshPopup();
        return;
    }
    let profileToUse = profile;
    if (profile.includeLinksContent && (profile.links || []).length > 0) {
        const linksContent = await fetchLinksContent(profile.links);
        if (linksContent) {
            profileToUse = { ...profile, linksContent };
        }
    }
    if (action === 'json') {
        const doc = buildContextDocument(profileToUse);
        const slug = (profile.name || 'perfil').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 30) || 'perfil';
        downloadFile(JSON.stringify(doc, null, 2), `myAI4c-${slug}.json`, 'application/json');
    }
    if (action === 'md') {
        const doc = buildContextDocument(profileToUse);
        const md = contextToMarkdown(doc);
        const slug = (profile.name || 'perfil').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 30) || 'perfil';
        downloadFile(md, `myAI4c-${slug}.md`, 'text/markdown');
    }
}

async function refreshPopup() {
    const { mycontext_profiles: profiles } = await chrome.storage.local.get(['mycontext_profiles']);
    const list = profiles || [];

    const noProfiles = document.getElementById('noProfiles');
    const profilesList = document.getElementById('profilesList');

    if (list.length === 0) {
        noProfiles.style.display = 'block';
        profilesList.style.display = 'none';
    } else {
        noProfiles.style.display = 'none';
        profilesList.style.display = 'block';
        renderProfiles(list);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const { mycontext_language: lang } = await chrome.storage.local.get(['mycontext_language']);
    currentLang = lang || 'es';

    await migrateFromSingleProfile();
    applyTranslations();
    await refreshPopup();

    const languageSelect = document.getElementById('languageSelect');
    languageSelect?.addEventListener('change', async (e) => {
        currentLang = e.target.value;
        await chrome.storage.local.set({ mycontext_language: currentLang });
        applyTranslations();
        await refreshPopup();
    });

    document.getElementById('newProfile')?.addEventListener('click', async () => {
        await chrome.storage.local.set({ mycontext_editingProfileId: null });
        chrome.runtime.openOptionsPage();
    });

    document.getElementById('newProfileFromList')?.addEventListener('click', async () => {
        await chrome.storage.local.set({ mycontext_editingProfileId: null });
        chrome.runtime.openOptionsPage();
    });
});

const DEFAULT_RULES = {
    es: `## Prioridad del documento (IMPORTANTE)
- Las preguntas del usuario se refieren **siempre** al contenido de este documento.
- Si un término tiene varios significados (ej. "Factorial" = empresa de software vs. concepto matemático), **interpreta según este documento**, no según conocimiento general.

## Reglas mínimas por defecto
- No inventar datos que no estén en este documento.
- Solo responder basándose en la información proporcionada.
- No dar opiniones personales ni políticas.
- Si no sabes algo, indícalo en lugar de inventar.

## Uso de enlaces
- Si la información no está en la descripción ni en los archivos adjuntos, **consulta los enlaces proporcionados** en la sección Enlaces.
- Si tienes capacidad de navegación web, **visita esos enlaces** (web, LinkedIn, blogs, etc.) para obtener la información antes de responder.
- Prioriza: 1) descripción y archivos, 2) contenido de los enlaces.`,
    en: `## Document priority (IMPORTANT)
- The user's questions **always** refer to the content of this document.
- If a term has multiple meanings (e.g. "Factorial" = software company vs. mathematical concept), **interpret according to this document**, not general knowledge.

## Default minimum rules
- Do not invent data that is not in this document.
- Only respond based on the information provided.
- Do not give personal or political opinions.
- If you don't know something, say so instead of inventing.

## Use of links
- If the information is not in the description or attached files, **consult the provided links** in the Links section.
- If you have web browsing capability, **visit those links** (website, LinkedIn, blogs, etc.) to obtain the information before responding.
- Priority: 1) description and files, 2) content from the links.`
};

const DOC_ATTRIBUTION = {
    tool: 'myAI4context',
    developer: 'Manuel Angel Picallo Pérez',
    contact: ['mapicalloperez@hotmail.com', 'mapicalloperez1971@gmail.com'],
    copyright: '© 2025 Manuel Angel Picallo Pérez'
};

function buildContextDocument(profile) {
    const bioFromFiles = (profile.bioFiles || []).map(f => `# ${f.name}\n\n${f.content || ''}`).join('\n\n---\n\n');
    let fullBio = [profile.bio || '', bioFromFiles].filter(Boolean).join('\n\n\n');
    if (profile.linksContent) {
        fullBio = [fullBio, `## Contenido de enlaces\n\n${profile.linksContent}`].filter(Boolean).join('\n\n\n');
    }
    const rulesFromFiles = (profile.rulesFiles || []).map(f => `# ${f.name}\n\n${f.content || ''}`).join('\n\n---\n\n');
    let fullRules = [profile.rules || '', rulesFromFiles].filter(Boolean).join('\n\n\n');
    if (profile.useDefaultRules !== false) {
        const lang = (typeof MyContextTranslations !== 'undefined' && currentLang) ? currentLang : 'es';
        const defaultRules = DEFAULT_RULES[lang] || DEFAULT_RULES.es;
        fullRules = [defaultRules, fullRules].filter(Boolean).join('\n\n\n');
    }
    return {
        version: '1.0',
        type: 'ai-context-document',
        schema: 'https://ai4context.com/schemas/ai-context-1.0.json',
        updatedAt: new Date().toISOString(),
        profile: {
            name: profile.name || '',
            bio: fullBio,
            links: profile.links || [],
            rules: fullRules
        },
        attribution: DOC_ATTRIBUTION
    };
}

const DOC_PREAMBLE = {
    es: '**Las preguntas del usuario se refieren a este documento.** Si un término es ambiguo (ej. Factorial = empresa vs. concepto matemático), interpreta según el contenido aquí.',
    en: '**The user\'s questions refer to this document.** If a term is ambiguous (e.g. Factorial = company vs. mathematical concept), interpret according to the content here.'
};

function contextToMarkdown(doc) {
    const p = doc.profile;
    const attr = doc.attribution || DOC_ATTRIBUTION;
    const lang = (typeof MyContextTranslations !== 'undefined' && currentLang) ? currentLang : 'es';
    const preamble = DOC_PREAMBLE[lang] || DOC_PREAMBLE.es;
    let md = `# AI Context Document\n\n`;
    md += `> Documento de contexto para IAs. Generado por myAI4context (AI4Context).\n\n`;
    md += `> ${preamble}\n\n`;
    md += `## ${p.name || 'Sin nombre'}\n\n`;
    if (p.bio) md += `${p.bio}\n\n`;
    if (p.links && p.links.length > 0) {
        md += `### Enlaces\n\n`;
        p.links.forEach(l => {
            md += `- [${l.label || l.url}](${l.url})\n`;
        });
        md += `\n`;
    }
    if (p.rules) md += `### Reglas\n\n${p.rules}\n\n`;
    md += `---\n\n`;
    md += `*myAI4context* — Desarrollado por ${attr.developer}.  \n`;
    md += `Contacto: ${attr.contact.join(' · ')}  \n`;
    md += `${attr.copyright}\n`;
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
