import { getQueriesForElement } from '@testing-library/dom';
import { command } from './command';

let queries = getQueriesForElement(document.body);

class PostMessageError extends Error {
  constructor(public readonly message: any, public readonly data: any) {
    super('IFrame.postMessage() failed');
  }
}

export class IFrame {
  public element: HTMLIFrameElement;

  constructor() {
    const iframe = document.createElement('iframe');

    iframe.src = '';
    iframe.height = '600';
    iframe.width = '100%';
    iframe.frameBorder = '0';
    iframe.style.borderTop = '1px solid #CCC';
    iframe.style.borderBottom = '1px solid #CCC';

    this.element = iframe;
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

  // async clearCookies(domain: string) {
  //   return command(window.location.href, { type: 'clearCookies', target: 'background_script', domain });
  // }

  async clearLocalStorage() {
    return this.postMessage({ type: 'clearLocalStorage', target: 'content_script' });
  }

  async getLocalStorageItem(key: string) {
    return this.postMessage({ type: 'getLocalStorageItem', target: 'content_script', key });
  }

  async setLocalStorageItem(key: string, value: string) {
    return this.postMessage({ type: 'setLocalStorageItem', target: 'content_script', key, value });
  }

  async navigate(url: string) {
    return new Promise<typeof queries>(resolve => {
      this.element.onload = () => {
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
