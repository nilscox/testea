export class IFrame {
    constructor(element) {
        this.element = element;
    }
    get contentWindow() {
        return this.element.contentWindow;
    }
    get document() {
        return this.contentWindow?.document;
    }
    get body() {
        return this.document?.body;
    }
    get location() {
        return this.contentWindow?.location;
    }
    async clearCookies() {
        const now = new Date().toUTCString();
        this.document?.cookie.split(';').forEach(c => {
            this.document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${now};path=/`);
        });
    }
    async clearLocalStorage() {
        return this.contentWindow?.localStorage.clear();
    }
    async getLocalStorageItem(key) {
        return this.contentWindow?.localStorage.getItem(key);
    }
    async setLocalStorageItem(key, value) {
        return this.contentWindow?.localStorage.setItem(key, value);
    }
    async navigate(url) {
        return new Promise(resolve => {
            this.element.onload = async () => {
                this.element.onload = null;
                resolve(this.element);
            };
            this.element.src = url;
        });
    }
}
//# sourceMappingURL=iframe.js.map