// myContext Settings - Profile Wizard
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('libs/pdf.worker.min.js');
}

class ProfileManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.currentLanguage = 'es';
        this.profile = {
            name: '',
            bio: '',
            bioFiles: [],
            links: [],
            rules: ''
        };
        this.init();
    }

    t(key) {
        const tr = typeof MyContextSettingsTranslations !== 'undefined' ? MyContextSettingsTranslations : {};
        return tr[this.currentLanguage]?.[key] || tr.es?.[key] || key;
    }

    getTrashIcon() {
        return `<svg class="icon-trash" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
    }

    async init() {
        await this.loadLanguage();
        await this.loadProfile();
        this.applyTranslations();
        this.renderSteps();
        this.renderLinks();
        this.renderBioFiles();
        this.bindEvents();
        this.updateStepVisibility();
    }

    async loadLanguage() {
        try {
            const { mycontext_language } = await chrome.storage.local.get(['mycontext_language']);
            this.currentLanguage = mycontext_language || 'es';
            const langSelect = document.getElementById('languageSelect');
            if (langSelect) langSelect.value = this.currentLanguage;
        } catch (e) {
            console.warn('[myContext] Error loading language:', e);
        }
    }

    async changeLanguage(lang) {
        this.currentLanguage = lang;
        await chrome.storage.local.set({ mycontext_language: lang });
        document.documentElement.lang = lang === 'es' ? 'es' : 'en';
        this.applyTranslations();
        this.renderLinks();
        this.renderBioFiles();
    }

    applyTranslations() {
        const t = (k) => this.t(k);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) el.textContent = t(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) el.placeholder = t(key);
        });

        document.querySelectorAll('[data-i18n-step]').forEach((el, i) => {
            const keys = ['step1', 'step2', 'step3', 'step4'];
            if (keys[i]) el.textContent = t(keys[i]);
        });

        document.getElementById('headerSubtitle').textContent = t('subtitle');

        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = this.currentLanguage;
            const optEs = langSelect.querySelector('option[value="es"]');
            const optEn = langSelect.querySelector('option[value="en"]');
            if (optEs) optEs.textContent = t('spanish');
            if (optEn) optEn.textContent = t('english');
        }

    }

    async loadProfile() {
        try {
            const { mycontext_profile } = await chrome.storage.local.get(['mycontext_profile']);
            if (mycontext_profile) {
                this.profile = { ...this.profile, ...mycontext_profile };
                if (!this.profile.links) this.profile.links = [];
                if (!this.profile.bioFiles) this.profile.bioFiles = [];
                this.populateForm();
            }
        } catch (e) {
            console.warn('[myContext] Error loading profile:', e);
        }
    }

    populateForm() {
        document.getElementById('profileName').value = this.profile.name || '';
        document.getElementById('profileBio').value = this.profile.bio || '';
        document.getElementById('profileRules').value = this.profile.rules || '';
    }

    renderSteps() {
        document.querySelectorAll('.step').forEach((el, i) => {
            const stepNum = i + 1;
            el.classList.remove('active', 'completed');
            if (stepNum === this.currentStep) el.classList.add('active');
            else if (stepNum < this.currentStep) el.classList.add('completed');
        });
    }

    renderBioFiles() {
        const container = document.getElementById('bioFilesList');
        if (!container) return;
        container.innerHTML = '';
        (this.profile.bioFiles || []).forEach((f, index) => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.innerHTML = `
                <span class="file-item-name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span>
                <button type="button" class="btn-remove btn-remove-file" data-index="${index}" title="${this.t('removeFile') || 'Eliminar'}" aria-label="Eliminar">${this.getTrashIcon()}</button>
            `;
            container.appendChild(div);
        });
        container.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.closest('.btn-remove').dataset.index);
                this.profile.bioFiles.splice(idx, 1);
                this.renderBioFiles();
            });
        });
    }

    renderLinks() {
        const container = document.getElementById('linksContainer');
        container.innerHTML = '';
        const labelPh = this.t('linkLabelPlaceholder');
        const urlPh = this.t('linkUrlPlaceholder');
        (this.profile.links || []).forEach((link, index) => {
            const div = document.createElement('div');
            div.className = 'link-item';
            div.innerHTML = `
                <input type="text" class="link-label" placeholder="${escapeHtml(labelPh)}" value="${escapeHtml(link.label || '')}" data-index="${index}" data-field="label">
                <input type="url" class="link-url" placeholder="${escapeHtml(urlPh)}" value="${escapeHtml(link.url || '')}" data-index="${index}" data-field="url">
                <button type="button" class="btn-remove" data-index="${index}">×</button>
            `;
            container.appendChild(div);
        });
        this.bindLinkEvents();
    }

    bindLinkEvents() {
        document.querySelectorAll('.link-item input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const field = e.target.dataset.field;
                if (!this.profile.links[idx]) this.profile.links[idx] = { label: '', url: '' };
                this.profile.links[idx][field] = e.target.value;
            });
        });
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                this.profile.links.splice(idx, 1);
                this.renderLinks();
            });
        });
    }

    bindEvents() {
        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
        }

        document.getElementById('addLink').addEventListener('click', () => {
            this.profile.links = this.profile.links || [];
            this.profile.links.push({ label: '', url: '' });
            this.renderLinks();
        });

        document.getElementById('prevStep').addEventListener('click', () => this.goStep(-1));
        document.getElementById('nextStep').addEventListener('click', () => this.goStep(1));
        document.getElementById('saveProfile').addEventListener('click', () => this.saveProfile());

        document.querySelectorAll('.step').forEach(el => {
            el.addEventListener('click', () => {
                const step = parseInt(el.dataset.step);
                if (step <= this.currentStep) this.goToStep(step);
            });
        });

        document.getElementById('selectBioFiles')?.addEventListener('click', () => {
            document.getElementById('bioFilesInput').click();
        });
        document.getElementById('bioFilesInput')?.addEventListener('change', (e) => this.handleBioFiles(e));
    }

    async handleBioFiles(e) {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (files.length === 0) return;

        const statusEl = document.getElementById('bioFilesStatus');
        statusEl.textContent = this.t('processingFiles');

        this.profile.bioFiles = this.profile.bioFiles || [];
        for (const file of files) {
            try {
                const text = await this.extractTextFromFile(file);
                this.profile.bioFiles.push({ name: file.name, content: text || '' });
            } catch (err) {
                console.warn('[myAI4context] Error extracting:', file.name, err);
                statusEl.textContent = this.t('fileError') + ': ' + file.name;
            }
        }

        this.renderBioFiles();
        statusEl.textContent = this.t('filesAdded');
        setTimeout(() => { statusEl.textContent = ''; }, 2000);
    }

    async extractTextFromFile(file) {
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (['md', 'txt'].includes(ext)) {
            return new Promise((resolve, reject) => {
                const r = new FileReader();
                r.onload = () => resolve(r.result || '');
                r.onerror = () => reject(r.error);
                r.readAsText(file);
            });
        }
        if (['doc', 'docx'].includes(ext) && typeof mammoth !== 'undefined') {
            const buf = await file.arrayBuffer();
            const r = await mammoth.extractRawText({ arrayBuffer: buf });
            return r.value || '';
        }
        if (ext === 'pdf' && typeof pdfjsLib !== 'undefined') {
            const buf = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(buf).promise;
            const numPages = pdf.numPages;
            let text = '';
            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(' ') + '\n';
            }
            return text.trim();
        }
        throw new Error('Formato no soportado: ' + ext);
    }

    collectFormData() {
        this.profile.name = document.getElementById('profileName').value.trim();
        this.profile.bio = document.getElementById('profileBio').value.trim();
        this.profile.rules = document.getElementById('profileRules').value.trim();
        this.profile.links = (this.profile.links || []).filter(l => l.url && l.url.trim());
        this.profile.bioFiles = this.profile.bioFiles || [];
    }

    goStep(delta) {
        this.collectFormData();
        const next = this.currentStep + delta;
        if (next >= 1 && next <= this.totalSteps) {
            this.currentStep = next;
            this.updateStepVisibility();
        }
    }

    goToStep(step) {
        this.collectFormData();
        this.currentStep = step;
        this.updateStepVisibility();
    }

    updateStepVisibility() {
        document.querySelectorAll('.step-content').forEach((el, i) => {
            el.classList.toggle('active', i + 1 === this.currentStep);
        });
        this.renderSteps();

        const prevBtn = document.getElementById('prevStep');
        const nextBtn = document.getElementById('nextStep');
        const saveBtn = document.getElementById('saveProfile');

        prevBtn.disabled = this.currentStep === 1;
        nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'inline-block';
        saveBtn.style.display = this.currentStep === this.totalSteps ? 'inline-block' : 'none';
    }

    async saveProfile() {
        this.collectFormData();
        try {
            await chrome.storage.local.set({ mycontext_profile: this.profile });
            this.showStatus(this.t('profileSaved'), 'success');
        } catch (e) {
            this.showStatus(this.t('errorSaving') + ': ' + e.message, 'error');
        }
    }

    showStatus(message, type = 'info') {
        const el = document.getElementById('statusMessage');
        el.textContent = message;
        el.className = 'status-message ' + type;
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 3000);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});
