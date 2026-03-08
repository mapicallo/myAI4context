// myContext Settings - Profile Wizard
class ProfileManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.profile = {
            name: '',
            type: 'person',
            bio: '',
            links: [],
            rules: ''
        };
        this.init();
    }

    async init() {
        await this.loadProfile();
        this.renderSteps();
        this.renderLinks();
        this.bindEvents();
        this.updateStepVisibility();
    }

    async loadProfile() {
        try {
            const { mycontext_profile } = await chrome.storage.local.get(['mycontext_profile']);
            if (mycontext_profile) {
                this.profile = { ...this.profile, ...mycontext_profile };
                if (!this.profile.links) this.profile.links = [];
                this.populateForm();
            }
        } catch (e) {
            console.warn('[myContext] Error loading profile:', e);
        }
    }

    populateForm() {
        document.getElementById('profileName').value = this.profile.name || '';
        document.getElementById('profileType').value = this.profile.type || 'person';
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

    renderLinks() {
        const container = document.getElementById('linksContainer');
        container.innerHTML = '';
        (this.profile.links || []).forEach((link, index) => {
            const div = document.createElement('div');
            div.className = 'link-item';
            div.innerHTML = `
                <input type="text" class="link-label" placeholder="Etiqueta (ej: LinkedIn)" value="${escapeHtml(link.label || '')}" data-index="${index}" data-field="label">
                <input type="url" class="link-url" placeholder="URL" value="${escapeHtml(link.url || '')}" data-index="${index}" data-field="url">
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
    }

    collectFormData() {
        this.profile.name = document.getElementById('profileName').value.trim();
        this.profile.type = document.getElementById('profileType').value;
        this.profile.bio = document.getElementById('profileBio').value.trim();
        this.profile.rules = document.getElementById('profileRules').value.trim();
        this.profile.links = (this.profile.links || []).filter(l => l.url && l.url.trim());
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
            this.showStatus('Perfil guardado correctamente', 'success');
        } catch (e) {
            this.showStatus('Error al guardar: ' + e.message, 'error');
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
