export declare class IFrame {
    readonly element: HTMLIFrameElement;
    constructor(element: HTMLIFrameElement);
    get contentWindow(): Window | null;
    get document(): Document | undefined;
    get body(): HTMLElement | undefined;
    get location(): Location | undefined;
    navigate(url: string): Promise<HTMLIFrameElement>;
    reload(): Promise<HTMLIFrameElement>;
    takeScreenshot(path: string): Promise<void>;
    getCookie(name: string): string | undefined;
    setCookie(name: string, value: string, expires: Date, path?: string): void;
    clearCookies(): void;
    getLocalStorageItem(key: string): string | null;
    setLocalStorageItem(key: string, value: string): void;
    clearLocalStorage(): void;
    private getContentWindow;
    private getDocument;
}
