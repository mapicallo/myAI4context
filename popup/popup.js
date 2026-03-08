// myContext Popup
document.addEventListener('DOMContentLoaded', async () => {
    const noProfile = document.getElementById('noProfile');
    const hasProfile = document.getElementById('hasProfile');
    const openSettings = document.getElementById('openSettings');
    const openSettingsFromProfile = document.getElementById('openSettingsFromProfile');
    const downloadJson = document.getElementById('downloadJson');
    const downloadMd = document.getElementById('downloadMd');

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
    md += `> Documento de contexto para IAs. Generado por myContext.\n\n`;
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
