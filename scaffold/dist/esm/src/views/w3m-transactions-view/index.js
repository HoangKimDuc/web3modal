var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { DateUtil } from '@web3modal/common';
import { AccountController, EventsController, OptionsController, TransactionsController } from '@web3modal/core';
import { TransactionUtil, customElement } from '@web3modal/ui';
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import styles from './styles.js';
const PAGINATOR_ID = 'last-transaction';
const LOADING_ITEM_COUNT = 7;
let W3mTransactionsView = class W3mTransactionsView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.paginationObserver = undefined;
        this.address = AccountController.state.address;
        this.transactionsByYear = TransactionsController.state.transactionsByYear;
        this.loading = TransactionsController.state.loading;
        this.empty = TransactionsController.state.empty;
        this.next = TransactionsController.state.next;
        this.unsubscribe.push(...[
            AccountController.subscribe(val => {
                if (val.isConnected) {
                    if (this.address !== val.address) {
                        this.address = val.address;
                        TransactionsController.resetTransactions();
                        TransactionsController.fetchTransactions(val.address);
                    }
                }
            }),
            TransactionsController.subscribe(val => {
                this.transactionsByYear = val.transactionsByYear;
                this.loading = val.loading;
                this.empty = val.empty;
                this.next = val.next;
            })
        ]);
    }
    firstUpdated() {
        TransactionsController.fetchTransactions(this.address);
        this.createPaginationObserver();
    }
    updated() {
        this.setPaginationObserver();
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        return html `
      <wui-flex flexDirection="column" gap="s">
        ${this.empty ? null : this.templateTransactionsByYear()}
        ${this.loading ? this.templateLoading() : null}
        ${!this.loading && this.empty ? this.templateEmpty() : null}
      </wui-flex>
    `;
    }
    templateTransactionsByYear() {
        const sortedYearKeys = Object.keys(this.transactionsByYear).sort().reverse();
        return sortedYearKeys.map((year, index) => {
            const isLastGroup = index === sortedYearKeys.length - 1;
            const yearInt = parseInt(year, 10);
            const sortedMonthIndexes = new Array(12)
                .fill(null)
                .map((_, idx) => idx)
                .reverse();
            return sortedMonthIndexes.map(month => {
                const groupTitle = TransactionUtil.getTransactionGroupTitle(yearInt, month);
                const transactions = this.transactionsByYear[yearInt]?.[month];
                if (!transactions) {
                    return null;
                }
                return html `
          <wui-flex flexDirection="column">
            <wui-flex
              alignItems="center"
              flexDirection="row"
              .padding=${['xs', 's', 's', 's']}
            >
              <wui-text variant="paragraph-500" color="fg-200">${groupTitle}</wui-text>
            </wui-flex>
            <wui-flex flexDirection="column" gap="xs">
              ${this.templateTransactions(transactions, isLastGroup)}
            </wui-flex>
          </wui-flex>
        `;
            });
        });
    }
    templateRenderTransaction(transaction, isLastTransaction) {
        const { date, descriptions, direction, isAllNFT, images, status, transfers, type } = this.getTransactionListItemProps(transaction);
        const haveMultipleTransfers = transfers?.length > 1;
        const haveTwoTransfers = transfers?.length === 2;
        if (haveTwoTransfers && !isAllNFT) {
            return html `
        <wui-transaction-list-item
          date=${date}
          .direction=${direction}
          id=${isLastTransaction && this.next ? PAGINATOR_ID : ''}
          status=${status}
          type=${type}
          .images=${images}
          .descriptions=${descriptions}
        ></wui-transaction-list-item>
      `;
        }
        if (haveMultipleTransfers) {
            return transfers.map((transfer, index) => {
                const description = TransactionUtil.getTransferDescription(transfer);
                const isLastTransfer = isLastTransaction && index === transfers.length - 1;
                return html ` <wui-transaction-list-item
          date=${date}
          direction=${transfer.direction}
          id=${isLastTransfer && this.next ? PAGINATOR_ID : ''}
          status=${status}
          type=${type}
          .onlyDirectionIcon=${true}
          .images=${[images[index]]}
          .descriptions=${[description]}
        ></wui-transaction-list-item>`;
            });
        }
        return html `
      <wui-transaction-list-item
        date=${date}
        .direction=${direction}
        id=${isLastTransaction && this.next ? PAGINATOR_ID : ''}
        status=${status}
        type=${type}
        .images=${images}
        .descriptions=${descriptions}
      ></wui-transaction-list-item>
    `;
    }
    templateTransactions(transactions, isLastGroup) {
        return transactions.map((transaction, index) => {
            const isLastTransaction = isLastGroup && index === transactions.length - 1;
            return html `${this.templateRenderTransaction(transaction, isLastTransaction)}`;
        });
    }
    templateEmpty() {
        return html `
      <wui-flex
        flexGrow="1"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        .padding=${['3xl', 'xl', '3xl', 'xl']}
        gap="xl"
      >
        <wui-icon-box
          backgroundColor="glass-005"
          background="gray"
          iconColor="fg-200"
          icon="wallet"
          size="lg"
          ?border=${true}
          borderColor="wui-color-bg-125"
        ></wui-icon-box>
        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-text align="center" variant="paragraph-500" color="fg-100"
            >No Transactions yet</wui-text
          >
          <wui-text align="center" variant="small-500" color="fg-200"
            >Start trading on dApps <br />
            to grow your wallet!</wui-text
          >
        </wui-flex>
      </wui-flex>
    `;
    }
    templateLoading() {
        return Array(LOADING_ITEM_COUNT)
            .fill(html ` <wui-transaction-list-item-loader></wui-transaction-list-item-loader> `)
            .map(item => item);
    }
    createPaginationObserver() {
        const { projectId } = OptionsController.state;
        this.paginationObserver = new IntersectionObserver(([element]) => {
            if (element?.isIntersecting && !this.loading) {
                TransactionsController.fetchTransactions(this.address);
                EventsController.sendEvent({
                    type: 'track',
                    event: 'LOAD_MORE_TRANSACTIONS',
                    properties: {
                        address: this.address,
                        projectId,
                        cursor: this.next
                    }
                });
            }
        }, {});
        this.setPaginationObserver();
    }
    setPaginationObserver() {
        this.paginationObserver?.disconnect();
        const lastItem = this.shadowRoot?.querySelector(`#${PAGINATOR_ID}`);
        if (lastItem) {
            this.paginationObserver?.observe(lastItem);
        }
    }
    getTransactionListItemProps(transaction) {
        const date = DateUtil.formatDate(transaction?.metadata?.minedAt);
        const descriptions = TransactionUtil.getTransactionDescriptions(transaction);
        const transfers = transaction?.transfers;
        const transfer = transaction?.transfers?.[0];
        const isAllNFT = Boolean(transfer) && transaction?.transfers?.every(item => Boolean(item.nft_info));
        const images = TransactionUtil.getTransactionImages(transfers);
        return {
            date,
            direction: transfer?.direction,
            descriptions,
            isAllNFT,
            images,
            status: transaction.metadata?.status,
            transfers,
            type: transaction.metadata?.operationType
        };
    }
};
W3mTransactionsView.styles = styles;
__decorate([
    state()
], W3mTransactionsView.prototype, "address", void 0);
__decorate([
    state()
], W3mTransactionsView.prototype, "transactionsByYear", void 0);
__decorate([
    state()
], W3mTransactionsView.prototype, "loading", void 0);
__decorate([
    state()
], W3mTransactionsView.prototype, "empty", void 0);
__decorate([
    state()
], W3mTransactionsView.prototype, "next", void 0);
W3mTransactionsView = __decorate([
    customElement('w3m-transactions-view')
], W3mTransactionsView);
export { W3mTransactionsView };
//# sourceMappingURL=index.js.map