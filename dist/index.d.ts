/// <reference types="mocha" />
export { IFrame } from './iframe.js';
declare global {
    interface Window {
        iframe: HTMLIFrameElement;
    }
}
export declare const setup: (runner: Mocha.Runner) => void;
