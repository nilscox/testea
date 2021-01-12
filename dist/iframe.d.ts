export declare class IFrame {
    readonly element: HTMLIFrameElement;
    constructor(element: HTMLIFrameElement);
    get contentWindow(): Window | null;
    get document(): Document | undefined;
    get body(): HTMLElement | undefined;
    get location(): Location | undefined;
    clearCookies(): Promise<void>;
    clearLocalStorage(): Promise<void | undefined>;
    getLocalStorageItem(key: string): Promise<string | null | undefined>;
    setLocalStorageItem(key: string, value: string): Promise<void | undefined>;
    navigate(url: string): Promise<HTMLIFrameElement>;
}
