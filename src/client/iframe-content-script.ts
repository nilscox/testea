class PostMessageError extends Error {
  constructor(public readonly message: any, public readonly data: any) {
    super('IFrame.postMessage() failed');
  }
}

export class IFrame {
  constructor(public readonly element: HTMLIFrameElement) {}

  async clearLocalStorage() {
    return this.postMessage({ type: 'clearLocalStorage', target: 'content_script' });
  }

  async getLocalStorageItem(key: string) {
    return this.postMessage({ type: 'getLocalStorageItem', target: 'content_script', key });
  }

  async setLocalStorageItem(key: string, value: string) {
    return this.postMessage({ type: 'setLocalStorageItem', target: 'content_script', key, value });
  }

  private async postMessage(message: any) {
    if (!this.contentWindow || !this.location) {
      throw new Error('IFrame: contentWindow is not set');
    }

    if (this.location.href === 'about:blank') {
      throw new Error('IFrame: cannot postMessage when not in a page');
    }

    const commandId = Math.random().toString(36).slice(6);

    const promise = this.waitForMessage(({ data }) => {
      if (!data || !data.__test_runner_response__ || data.commandId !== commandId) {
        return [false, undefined];
      }

      if (data.success !== true) {
        throw new PostMessageError(message, data);
      } else {
        return [true, data];
      }
    });

    this.contentWindow.postMessage({ __test_runner_request__: true, commandId, ...message }, this.location.href);

    await promise;
  }

  private waitForMessage<T>(cb: (data: any) => [boolean, T]) {
    return new Promise<T>(resolve => {
      const handleMessage = (event: MessageEvent) => {
        const [isResponse, result] = cb(event);

        if (!isResponse) {
          return;
        }

        this.contentWindow?.removeEventListener('message', handleMessage);
        resolve(result);
      };

      this.contentWindow?.addEventListener('message', handleMessage);
    });
  }

  private async injectContentScript() {
    const { document, body } = this;

    if (!document || !body) {
      throw new Error();
    }

    const promise = this.waitForMessage(({ data }) => [data && data.__test_runner_content_script__, undefined]);

    const script = document.createElement('script');

    script.src = 'http://localhost:7357/content_script.js';
    body.appendChild(script);

    await promise;
  }
}
