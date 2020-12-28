import { getQueriesForElement, wait } from '@testing-library/dom';

let queries = getQueriesForElement(document.body);

class PostMessageError extends Error {
  constructor(public readonly message: any, public readonly data: any) {
    super('IFrame.postMessage() failed');
  }
}

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

  async postMessage(message: any) {
    return new Promise((resolve, reject) => {
      if (!this.contentWindow || !this.location) {
        throw new Error('IFrame: contentWindow is not set');
      }

      if (this.location.href === 'about:blank') {
        throw new Error('IFrame: cannot postMessage when not in a page');
      }

      const commandId = Math.random().toString(36).slice(6);

      const handleResponse = ({ data }: MessageEvent) => {
        if (!data || !data.__test_runner_response__ || data.commandId !== commandId) {
          return;
        }

        this.contentWindow?.removeEventListener('message', handleResponse);

        if (data.success !== true) {
          reject(new PostMessageError(message, data));
        } else {
          resolve(data);
        }
      };

      this.contentWindow.addEventListener('message', handleResponse);
      this.contentWindow.postMessage({ __test_runner_request__: true, commandId, ...message }, this.location.href);
    });
  }

  async clearCookies(domain: string) {
    const now = new Date().toUTCString();

    this.document?.cookie.split(';').forEach(c => {
      this.document!.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${now};path=/`);
    });
    // return this.postMessage(window.location.href, { type: 'clearCookies', target: 'background_script', domain });
  }

  async clearLocalStorage() {
    return this.postMessage({ type: 'clearLocalStorage', target: 'content_script' });
  }

  async getLocalStorageItem(key: string) {
    return this.postMessage({ type: 'getLocalStorageItem', target: 'content_script', key });
  }

  async setLocalStorageItem(key: string, value: string) {
    return this.postMessage({ type: 'setLocalStorageItem', target: 'content_script', key, value });
  }

  private async injectContentScript() {
    const { document, body } = this;

    if (!document || !body) {
      throw new Error();
    }

    return new Promise<void>(resolve => {
      const handleMessage = ({ data }: any) => {
        if (!data || !data.__test_runner_content_script__) {
          return;
        }

        this.contentWindow?.removeEventListener('message', handleMessage);
        resolve();
      };

      this.contentWindow?.addEventListener('message', handleMessage);

      const script = document.createElement('script');

      script.src = 'http://localhost:7357/content_script.js';
      body.appendChild(script);
    });
  }

  async navigate(url: string) {
    return new Promise<typeof queries>(resolve => {
      this.element.onload = async () => {
        this.element.onload = null;

        if (this.body) {
          await this.injectContentScript();
          queries = getQueriesForElement(this.body);
        }

        resolve(queries);
      };

      this.element.src = url;
    });
  }
}
