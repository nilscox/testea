import { getQueriesForElement, wait } from '@testing-library/dom';

let queries = getQueriesForElement(document.body);

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

  async clearCookies() {
    const now = new Date().toUTCString();

    this.document?.cookie.split(';').forEach(c => {
      this.document!.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${now};path=/`);
    });
  }

  async clearLocalStorage() {
    return this.contentWindow?.localStorage.clear();
  }

  async getLocalStorageItem(key: string) {
    return this.contentWindow?.localStorage.getItem(key);
  }

  async setLocalStorageItem(key: string, value: string) {
    return this.contentWindow?.localStorage.setItem(key, value);
  }

  async navigate(url: string) {
    return new Promise<typeof queries>(resolve => {
      this.element.onload = async () => {
        this.element.onload = null;

        if (this.body) {
          queries = getQueriesForElement(this.body);
        }

        resolve(queries);
      };

      this.element.src = url;
    });
  }
}
