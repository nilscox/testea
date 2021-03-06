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
    async navigate(url) {
        return new Promise(resolve => {
            this.element.onload = async () => {
                this.element.onload = null;
                resolve(this.element);
            };
            this.element.src = url;
        });
    }
    async reload() {
        return this.navigate(this.element.src);
    }
    async takeScreenshot(path) {
        window.__TESTEA_EVENTS__.push({ type: 'screenshot', path });
        await new Promise(r => setTimeout(r, 100));
    }
    getCookie(name) {
        const document = this.getDocument('Cannot get cookie');
        for (const str of document.cookie.split(/; */)) {
            if (str.startsWith(name + '=')) {
                return str.substr(name.length + 1);
            }
        }
    }
    setCookie(name, value, expires, path = '/') {
        const document = this.getDocument('Cannot set cookie');
        document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=${path}`;
    }
    clearCookies() {
        const document = this.getDocument('Cannot clear cookies');
        const now = new Date();
        for (const str of document.cookie.split(/; */)) {
            const [key] = str.split('=', 1);
            this.setCookie(key, '', now);
        }
    }
    getLocalStorageItem(key) {
        const window = this.getContentWindow('Cannot get local storage item');
        return window.localStorage.getItem(key);
    }
    setLocalStorageItem(key, value) {
        const window = this.getContentWindow('Cannot set local storage item');
        return window.localStorage.setItem(key, value);
    }
    clearLocalStorage() {
        const window = this.getContentWindow('Cannot clear local storage');
        return window.localStorage.clear();
    }
    getContentWindow(message) {
        if (!this.contentWindow) {
            throw new Error(message + ': iframe.contentWindow is undefined');
        }
        return this.contentWindow;
    }
    getDocument(message) {
        if (!this.document) {
            throw new Error(message + ': iframe.document is undefined');
        }
        return this.document;
    }
}
//# sourceMappingURL=iframe.js.map