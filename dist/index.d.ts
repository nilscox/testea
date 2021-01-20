/// <reference types="mocha" />
export { IFrame } from './iframe.js';
declare global {
    interface Window {
        iframe: HTMLIFrameElement;
    }
}
declare const _default: {
    setup: () => void;
    run: (runner?: Mocha.Runner | undefined) => void;
};
export default _default;
