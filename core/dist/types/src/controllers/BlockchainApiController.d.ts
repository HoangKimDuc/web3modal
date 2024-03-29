import type { BlockchainApiTransactionsRequest, BlockchainApiTransactionsResponse, BlockchainApiIdentityRequest, BlockchainApiIdentityResponse, GenerateOnRampUrlArgs, GetQuoteArgs, OnrampQuote } from '../utils/TypeUtil.js';
export declare const BlockchainApiController: {
    fetchIdentity({ caipChainId, address }: BlockchainApiIdentityRequest): Promise<BlockchainApiIdentityResponse>;
    fetchTransactions({ account, projectId, cursor, onramp, signal }: BlockchainApiTransactionsRequest): Promise<BlockchainApiTransactionsResponse>;
    generateOnRampURL({ destinationWallets, partnerUserId, defaultNetwork, purchaseAmount, paymentAmount }: GenerateOnRampUrlArgs): Promise<string>;
    getOnrampOptions(): Promise<{
        purchaseCurrencies: {
            id: string;
            name: string;
            symbol: string;
            networks: {
                name: string;
                display_name: string;
                chain_id: string;
                contract_address: string;
            }[];
        }[];
        paymentCurrencies: {
            id: string;
            payment_method_limits: {
                id: string;
                min: string;
                max: string;
            }[];
        }[];
    }>;
    getOnrampQuote({ purchaseCurrency, paymentCurrency, amount, network }: GetQuoteArgs): Promise<OnrampQuote>;
};
