export class IFrame {
  constructor(public readonly element: HTMLIFrameElement) {}

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

  async navigate(url: string) {
    return new Promise<HTMLIFrameElement>(resolve => {
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

  async takeScreenshot(path: string) {
    window.__TESTEA_EVENTS__.push({ type: 'screenshot', path });
    await new Promise(r => setTimeout(r, 100));
  }

  setViewportSize(width: number | string, height: number | string) {
    this.element.style.width = width + (typeof width === 'number' ? 'px' : '');
    this.element.style.height = height + (typeof height === 'number' ? 'px' : '');
  }

  getCookie(name: string) {
    const document = this.getDocument('Cannot get cookie');

    for (const str of document.cookie.split(/; */)) {
      if (str.startsWith(name + '=')) {
        return str.substr(name.length + 1);
      }
    }
  }

  setCookie(name: string, value: string, expires: Date, path = '/') {
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

  getLocalStorageItem(key: string) {
    const window = this.getContentWindow('Cannot get local storage item');

    return window.localStorage.getItem(key);
  }

  setLocalStorageItem(key: string, value: string) {
    const window = this.getContentWindow('Cannot set local storage item');

    return window.localStorage.setItem(key, value);
  }

  clearLocalStorage() {
    const window = this.getContentWindow('Cannot clear local storage');

    return window.localStorage.clear();
  }

  private getContentWindow(message: string) {
    if (!this.contentWindow) {
      throw new Error(message + ': iframe.contentWindow is undefined');
    }

    return this.contentWindow;
  }

  private getDocument(message: string) {
    if (!this.document) {
      throw new Error(message + ': iframe.document is undefined');
    }

    return this.document;
  }
}
