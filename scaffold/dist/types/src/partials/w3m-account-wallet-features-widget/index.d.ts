import { LitElement } from 'lit';
export declare class W3mAccountWalletFeaturesWidget extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    private address;
    private profileImage;
    private profileName;
    private network;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    private activateAccountTemplate;
    private onProfileButtonClick;
    private onBuyClick;
    private onReceiveClick;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-account-wallet-features-widget': W3mAccountWalletFeaturesWidget;
    }
}
