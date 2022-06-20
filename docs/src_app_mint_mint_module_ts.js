"use strict";
(self["webpackChunkapp"] = self["webpackChunkapp"] || []).push([["src_app_mint_mint_module_ts"],{

/***/ 3565:
/*!*********************************************!*\
  !*** ./src/app/mint/mint-routing.module.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MintPageRoutingModule": () => (/* binding */ MintPageRoutingModule)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 2816);
/* harmony import */ var _mint_page__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mint.page */ 6014);




const routes = [
    {
        path: '',
        component: _mint_page__WEBPACK_IMPORTED_MODULE_0__.MintPage
    }
];
let MintPageRoutingModule = class MintPageRoutingModule {
};
MintPageRoutingModule = (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule)({
        imports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule.forChild(routes)],
        exports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule],
    })
], MintPageRoutingModule);



/***/ }),

/***/ 1398:
/*!*************************************!*\
  !*** ./src/app/mint/mint.module.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MintPageModule": () => (/* binding */ MintPageModule)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 6362);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ 587);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var _mint_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mint-routing.module */ 3565);
/* harmony import */ var _mint_page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mint.page */ 6014);







let MintPageModule = class MintPageModule {
};
MintPageModule = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.NgModule)({
        imports: [
            _angular_common__WEBPACK_IMPORTED_MODULE_4__.CommonModule,
            _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormsModule,
            _ionic_angular__WEBPACK_IMPORTED_MODULE_6__.IonicModule,
            _mint_routing_module__WEBPACK_IMPORTED_MODULE_0__.MintPageRoutingModule
        ],
        declarations: [_mint_page__WEBPACK_IMPORTED_MODULE_1__.MintPage]
    })
], MintPageModule);



/***/ }),

/***/ 6014:
/*!***********************************!*\
  !*** ./src/app/mint/mint.page.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MintPage": () => (/* binding */ MintPage)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _mint_page_html_ngResource__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mint.page.html?ngResource */ 3433);
/* harmony import */ var _mint_page_scss_ngResource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mint.page.scss?ngResource */ 1393);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/environments/environment */ 2340);
/* harmony import */ var _utils_connectwallet_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/connectwallet.service */ 9570);
/* harmony import */ var _utils_drop_down_list_drop_down_list_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/drop-down-list/drop-down-list.component */ 6909);
/* harmony import */ var _utils_toast_message_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/toast-message.service */ 3911);









let MintPage = class MintPage {
    constructor(connectWallet, loadingController, toast, popoverController, alertController) {
        this.connectWallet = connectWallet;
        this.loadingController = loadingController;
        this.toast = toast;
        this.popoverController = popoverController;
        this.alertController = alertController;
        this.myUserAddress = null;
        this.isChainLoaded = false;
        this.chainModel = {};
        this.config = src_environments_environment__WEBPACK_IMPORTED_MODULE_2__.environment.configchain;
        this.maxMint = 4;
        this.devMint = 13;
        this.receiptDisplay = "";
        this.userMint = 1;
        this.isShowMintDone = true;
        this.navs = [
            {
                name: "Twitter",
                link: "https://twitter.com/CashcowsNFT"
            },
            {
                name: "Facebook",
                link: "https://www.facebook.com/CashcowsNFT"
            },
            {
                name: "Instagram",
                link: "https://instagram.com/Cashcows_collection"
            },
            {
                name: "Opensea",
                link: "https://opensea.io/collection/Cashcows"
            },
            {
                name: "Discord",
                link: "https://discord.gg/XjkkYMWhBr"
            }
        ];
    }
    ngOnInit() {
        // if(!environment.production){
        //   this.onConnectWallet();
        // }
    }
    onConnectWallet() {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__awaiter)(this, void 0, void 0, function* () {
            yield this.connectWallet.connect();
            yield this.onRefreshChainData();
        });
    }
    onRefreshChainData() {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__awaiter)(this, void 0, void 0, function* () {
            return new Promise((resolve) => (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__awaiter)(this, void 0, void 0, function* () {
                const loading = yield this.loadingController.create({ message: "Please wait ...." });
                yield loading.present();
                this.myUserAddress = this.connectWallet.userAddress;
                console.log(this.myUserAddress);
                this.chainModel.isPaused = yield this.connectWallet.contract.methods.isPaused().call();
                console.log(this.chainModel.isPaused);
                this.chainModel.isMintWLPaused = yield this.connectWallet.contract.methods.isMintWLPaused().call();
                console.log(this.chainModel.isMintWLPaused);
                this.chainModel.cost = parseInt(yield this.connectWallet.contract.methods.cost().call());
                console.log(this.chainModel.cost);
                this.chainModel.wlCost = parseInt(yield this.connectWallet.contract.methods.wlCost().call());
                console.log(this.chainModel.wlCost);
                this.chainModel.maxSupply = parseInt(yield this.connectWallet.contract.methods.maxSupply().call());
                console.log(this.chainModel.maxSupply);
                this.chainModel.supplyWL = parseInt(yield this.connectWallet.contract.methods.supplyWL().call());
                console.log(this.chainModel.supplyWL);
                this.chainModel.mintedSupply = parseInt(yield this.connectWallet.contract.methods.totalSupply().call());
                console.log(this.chainModel.mintedSupply);
                this.chainModel.wlMaxMint = parseInt(yield this.connectWallet.contract.methods.wlMaxMint().call());
                console.log(this.chainModel.wlMaxMint);
                this.chainModel.isWhiteListed = yield this.connectWallet.contract.methods.whitelistWallets(this.myUserAddress).call();
                console.log(this.chainModel.isWhiteListed);
                this.chainModel.addressNumberMinted = parseInt(yield this.connectWallet.contract.methods.addressNumberMinted(this.myUserAddress).call());
                console.log(this.chainModel.addressNumberMinted);
                if (!this.chainModel.isMintWLPaused && !this.chainModel.isWhiteListed) {
                    this.errorAlert("This wallet address is not whitelisted.");
                    yield loading.dismiss();
                    return;
                }
                if (!this.chainModel.isMintWLPaused) {
                    const wlMaxMint = this.chainModel.wlMaxMint;
                    const myNumberMint = this.chainModel.addressNumberMinted;
                    this.maxMint = wlMaxMint - myNumberMint;
                    console.log("maxMint", this.maxMint);
                    let wlSupply = this.chainModel.supplyWL;
                    let totalSupply = this.chainModel.mintedSupply;
                    let powerMint = this.maxMint;
                    let a = (this.devMint + wlSupply) - totalSupply;
                    if (powerMint > a) {
                        this.maxMint = a;
                    }
                    console.log("maxMint", a, this.maxMint);
                }
                if (!this.chainModel.isPaused) {
                    let totalSupply = this.chainModel.mintedSupply;
                    let maxSupply = this.chainModel.maxSupply;
                    let powerMint = this.maxMint;
                    let a = maxSupply - totalSupply;
                    if (powerMint > a) {
                        this.maxMint = a;
                    }
                }
                this.isChainLoaded = true;
                this.onReceipt();
                yield loading.dismiss();
                resolve({});
            }));
        });
    }
    onReceipt() {
        if (!this.chainModel.isMintWLPaused) {
            this.receiptDisplay = `${this.userMint} Cashcows${(this.userMint > 1 ? 's' : '')} cost for ${(this.chainModel.wlCost / Math.pow(10, 18) * this.userMint).toFixed(2)} Matic`;
        }
        else {
            this.receiptDisplay = `${this.userMint} Cashcows${(this.userMint > 1 ? 's' : '')} cost for ${(this.chainModel.cost / Math.pow(10, 18) * this.userMint).toFixed(2)} Matic`;
        }
    }
    rangeChange(ev) {
        this.userMint = ev.detail.value;
        console.log(this.userMint);
        this.onReceipt();
    }
    onMint() {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__awaiter)(this, void 0, void 0, function* () {
            if (!this.chainModel.isMintWLPaused && (this.devMint + this.chainModel.supplyWL) - this.chainModel.mintedSupply == 0) {
                return;
            }
            if (this.chainModel.isPaused && this.chainModel.isMintWLPaused) {
                return;
            }
            if (!this.connectWallet.userAddress) {
                return;
            }
            if (this.chainModel.mintedSupply == this.chainModel.maxSupply) {
                return;
            }
            const loading = yield this.loadingController.create({ message: "Please wait ...." });
            yield loading.present();
            yield this.onRefreshChainData();
            if (this.chainModel.isPaused && this.chainModel.isMintWLPaused) {
                this.toast.presentToast("Minting is under maintenance");
                return;
            }
            let contractAddress, mintAmount, gasLimit, cost, totalCostWei, totalGasLimit;
            contractAddress = this.config.CONTRACT_ADDRESS;
            mintAmount = this.userMint;
            gasLimit = this.config.GAS_LIMIT;
            cost = !this.chainModel.isMintWLPaused ? this.chainModel.wlCost : this.chainModel.cost;
            totalGasLimit = String(gasLimit * mintAmount);
            if (this.userMint > this.maxMint) {
                if (!this.chainModel.isMintWLPaused) {
                    this.toast.presentToast(`Up to ${this.chainModel.wlMaxMint} mint you can get in the whitelist period.`);
                }
                else {
                    this.toast.presentToast("Exceed number of mint.");
                }
                yield loading.dismiss();
                return;
            }
            totalCostWei = String(cost * mintAmount);
            console.log("minting....", this.myUserAddress, gasLimit, totalGasLimit, mintAmount, contractAddress);
            try {
                if (!this.chainModel.isMintWLPaused) {
                    yield this.connectWallet.contract.methods.preSaleMint(mintAmount).send({
                        gasLimit: totalGasLimit,
                        to: contractAddress,
                        from: this.myUserAddress,
                        value: totalCostWei
                    });
                }
                else {
                    yield this.connectWallet.contract.methods.mint(mintAmount).send({
                        gasLimit: totalGasLimit,
                        to: contractAddress,
                        from: this.myUserAddress,
                        value: totalCostWei
                    });
                }
                yield loading.dismiss();
                this.onOpenCloseThank();
            }
            catch (e) {
                yield loading.dismiss();
                if (e.code != 4001) {
                    this.errorAlert("Something went wrong.");
                }
            }
        });
    }
    onOpenCloseThank() {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__awaiter)(this, void 0, void 0, function* () {
            yield this.onRefreshChainData();
            this.onToggleMintDone();
        });
    }
    errorAlert(message) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__awaiter)(this, void 0, void 0, function* () {
            const alert = yield this.alertController.create({
                message: message + ` Please<a href="https://discord.gg/XjkkYMWhBr" target="_blank"> contact</a> the developer for more information.`,
                backdropDismiss: false,
                buttons: [{
                        text: 'Ok',
                        handler: () => (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__awaiter)(this, void 0, void 0, function* () {
                            window.location.reload();
                        })
                    }
                ]
            });
            yield alert.present();
        });
    }
    onToggleMenu(ev) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__awaiter)(this, void 0, void 0, function* () {
            const popover = yield this.popoverController.create({
                component: _utils_drop_down_list_drop_down_list_component__WEBPACK_IMPORTED_MODULE_4__.DropDownListComponent,
                event: ev,
                translucent: true,
                componentProps: {
                    datas: this.navs.map((e) => { return e.name; })
                }
            });
            yield popover.present();
            popover.onWillDismiss().then((data) => {
                window.open(this.navs.find((e) => { return data.data.title === e.name; }).link, '_blank');
            });
        });
    }
    onToggleMintDone() {
        this.isShowMintDone = !this.isShowMintDone;
    }
};
MintPage.ctorParameters = () => [
    { type: _utils_connectwallet_service__WEBPACK_IMPORTED_MODULE_3__.ConnectwalletService },
    { type: _ionic_angular__WEBPACK_IMPORTED_MODULE_7__.LoadingController },
    { type: _utils_toast_message_service__WEBPACK_IMPORTED_MODULE_5__.ToastMessageService },
    { type: _ionic_angular__WEBPACK_IMPORTED_MODULE_7__.PopoverController },
    { type: _ionic_angular__WEBPACK_IMPORTED_MODULE_7__.AlertController }
];
MintPage = (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_8__.Component)({
        selector: 'app-mint',
        template: _mint_page_html_ngResource__WEBPACK_IMPORTED_MODULE_0__,
        styles: [_mint_page_scss_ngResource__WEBPACK_IMPORTED_MODULE_1__]
    })
], MintPage);



/***/ }),

/***/ 1393:
/*!************************************************!*\
  !*** ./src/app/mint/mint.page.scss?ngResource ***!
  \************************************************/
/***/ ((module) => {

module.exports = "h2 {\n  color: #fff;\n}\n\n.c-connect {\n  margin-top: 25px;\n}\n\nbutton {\n  border-radius: 200px;\n  width: 100%;\n  font-weight: 800;\n  font-size: 16px;\n  line-height: 24px;\n  font-family: \"Poppins-ExtraBold\";\n}\n\n.c-main-logo {\n  padding: 20px 0px 50px 0px;\n  display: flex;\n  justify-content: space-between;\n  place-items: center;\n}\n\n.c-main-logo img {\n  max-height: 60px;\n}\n\n.c-main-logo .c-circle-buttons {\n  display: flex;\n  margin-top: 15px;\n  column-gap: 5px;\n}\n\n.c-main-logo .c-circle-buttons svg {\n  width: 19px;\n  height: 19px;\n}\n\n.c-main {\n  position: relative;\n  min-height: 736px;\n  border-radius: 10px;\n}\n\n.c-main .c-bg {\n  position: absolute;\n  top: 0;\n  z-index: -1;\n  height: 766px;\n  width: 100%;\n}\n\n.c-main .c-bg .c-bg-gif {\n  border-radius: 10px;\n  height: 100%;\n  width: 100%;\n  object-fit: cover;\n  border-radius: 10px;\n}\n\n.c-main .c-notes {\n  position: absolute;\n  bottom: 11px;\n  z-index: 10;\n  width: 100%;\n  display: grid;\n  place-content: center;\n}\n\n.c-main .c-notes p {\n  font-family: \"Poppins-Medium\";\n  font-style: normal;\n  font-weight: 500;\n  font-size: 10px;\n  line-height: 15px;\n  text-align: center;\n  color: #FFFFFF;\n}\n\n.c-main .c-content .c-details {\n  padding: 60px 20px 60px 20px;\n  border-top-right-radius: 30px;\n  background: rgba(0, 0, 0, 0.7);\n  border-bottom-right-radius: 30px;\n  display: grid;\n  place-items: center;\n  min-height: 413px;\n}\n\n.c-main .c-content .c-details .c-notes-1 {\n  margin-top: 13px;\n}\n\n.c-main .c-content .c-details .c-notes-1 p {\n  font-family: \"Poppins-Medium\";\n  font-style: normal;\n  font-weight: 500;\n  font-size: 10px;\n  line-height: 15px;\n  text-align: center;\n  color: #FFFFFF;\n}\n\n.c-main .c-content .c-details .c-action {\n  margin-top: 25px;\n  width: 100%;\n}\n\n.c-main .c-content .c-details .c-action .c-supplies {\n  font-family: \"Poppins-ExtraBold\";\n  font-style: italic;\n  font-weight: 800;\n  font-size: 96px;\n  color: #FFFFFF;\n}\n\n.c-main .c-content .c-details .c-action a {\n  text-decoration: none;\n  margin-bottom: 40px;\n  font-weight: 500;\n  font-size: 12px;\n  line-height: 18px;\n  color: #E5E5E5;\n}\n\n.c-main .c-content .c-details .c-action .c-receipt {\n  font-style: normal;\n  font-weight: 800;\n  font-size: 12px;\n  line-height: 18px;\n  color: #FFFFFF;\n}\n\n.c-main .c-content .c-details .c-action p {\n  margin: 0px;\n}\n\n.c-main .c-content .c-details .c-action .c-action-1 {\n  margin-top: 29px;\n}\n\n.c-main .c-content .c-details h1, .c-main .c-content .c-details h3, .c-main .c-content .c-details p {\n  color: #fff;\n}\n\n.c-main .c-content .c-details h1 {\n  font-style: italic;\n  font-weight: 800;\n  font-size: 64px;\n  line-height: 60px;\n  font-family: \"Poppins-ExtraBold\";\n}\n\n.c-main .c-content .c-details h3 {\n  font-style: normal;\n  font-weight: 800;\n  font-size: 12px;\n  line-height: 18px;\n  font-family: \"Poppins-ExtraBold\";\n}\n\n.c-main .c-content .c-box {\n  display: grid;\n  place-items: center;\n  height: 100%;\n}\n\n.c-main .c-content .c-box img {\n  cursor: pointer;\n  max-width: 450px;\n}\n\n.c-menu {\n  color: #fff;\n  height: 50px;\n  width: 50px;\n  margin-right: 10px;\n}\n\nion-range {\n  --ion-color-base: #fff !important;\n  --ion-color-shade: #fff !important;\n  --ion-color-tint: #fff !important;\n  --ion-color-contrast: #fff !important;\n}\n\n.c-popup {\n  position: absolute;\n  height: 100%;\n  width: 100%;\n  padding: 4%;\n  background: rgba(0, 0, 0, 0.4);\n}\n\n.c-popup .c-main {\n  background: #fff;\n  display: grid;\n  margin: 0 auto;\n  border-radius: 10px;\n  padding: 25px;\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  width: 685px;\n  min-height: 406.5px;\n  align-content: center;\n}\n\n.c-popup .c-main .c-thank-main {\n  height: 100%;\n  text-align: center;\n}\n\n.c-popup .c-main .c-thank-main h1 {\n  font-family: \"Poppins-ExtraBold\";\n  font-weight: 800;\n  font-size: 40px;\n  line-height: 60px;\n  text-align: center;\n  color: #000000;\n}\n\n.c-popup .c-main .c-thank-main button {\n  width: 70%;\n}\n\n@media only screen and (max-width: 1024px) {\n  .c-popup {\n    position: absolute;\n    height: 100%;\n    width: 100%;\n    padding: 0 !important;\n    background: rgba(0, 0, 0, 0.4);\n  }\n  .c-popup .c-main {\n    width: 90%;\n  }\n\n  .isDesktop {\n    display: none !important;\n  }\n\n  .isTabMobile {\n    display: inherit !important;\n  }\n\n  .c-box {\n    border-radius: 25px;\n    background: url(\"/assets/bg.gif\");\n  }\n  .c-box img {\n    margin-top: 80px;\n    margin-bottom: 80px;\n    max-width: 300px !important;\n  }\n\n  .c-main .c-content .c-details {\n    padding: 0px 20px 60px 20px;\n  }\n\n  .c-main-logo .c-circle-buttons {\n    display: none;\n  }\n}\n\n@media only screen and (min-width: 990px) {\n  .isDesktop {\n    display: inherit !important;\n  }\n\n  .isTabMobile {\n    display: none !important;\n  }\n\n  .c-menu {\n    display: none;\n  }\n}\n/*# sourceMappingURL=data:application/json;base64,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Qjs7QUEyRFk7RUFDSSxVQUFBO0FBekRoQjs7QUFpRUE7RUFDSTtJQUNJLGtCQUFBO0lBQ0EsWUFBQTtJQUNBLFdBQUE7SUFDQSxxQkFBQTtJQUNBLDhCQUFBO0VBOUROO0VBK0RNO0lBT0ksVUFBQTtFQW5FVjs7RUF1RUU7SUFDSSx3QkFBQTtFQXBFTjs7RUFzRUU7SUFDSSwyQkFBQTtFQW5FTjs7RUFxRUU7SUFDSSxtQkFBQTtJQUNBLGlDQUFBO0VBbEVOO0VBbUVNO0lBQ0ksZ0JBQUE7SUFDQSxtQkFBQTtJQUNBLDJCQUFBO0VBakVWOztFQXNFVTtJQUNJLDJCQUFBO0VBbkVkOztFQXdFTTtJQUNJLGFBQUE7RUFyRVY7QUFDRjs7QUF5RUE7RUFDSTtJQUNJLDJCQUFBO0VBdkVOOztFQXlFRTtJQUNJLHdCQUFBO0VBdEVOOztFQXdFRTtJQUNJLGFBQUE7RUFyRU47QUFDRiIsImZpbGUiOiJtaW50LnBhZ2Uuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbImgye1xyXG4gICAgY29sb3I6ICNmZmY7XHJcbn1cclxuLmMtY29ubmVjdHtcclxuICAgIG1hcmdpbi10b3A6IDI1cHg7XHJcbn1cclxuXHJcbmJ1dHRvbntcclxuICAgIGJvcmRlci1yYWRpdXM6IDIwMHB4O1xyXG4gICAgd2lkdGg6IDEwMCU7XHJcbiAgICAvLyBtYXgtd2lkdGg6IDQ1MHB4O1xyXG4gICAgZm9udC13ZWlnaHQ6IDgwMDtcclxuICAgIGZvbnQtc2l6ZTogMTZweDtcclxuICAgIGxpbmUtaGVpZ2h0OiAyNHB4O1xyXG4gICAgZm9udC1mYW1pbHk6IFwiUG9wcGlucy1FeHRyYUJvbGRcIjtcclxufVxyXG4uYy1tYWluLWxvZ297XHJcbiAgICBwYWRkaW5nOiAyMHB4IDBweCA1MHB4IDBweDtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcblx0anVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xyXG4gICAgcGxhY2UtaXRlbXM6IGNlbnRlcjtcclxuICAgIGltZ3sgICAgIFxyXG4gICAgICAgIG1heC1oZWlnaHQ6IDYwcHg7XHJcbiAgICB9XHJcbiAgICAuYy1jaXJjbGUtYnV0dG9uc3tcclxuICAgICAgICBkaXNwbGF5OiBmbGV4OyBcclxuICAgICAgICBtYXJnaW4tdG9wOiAxNXB4O1xyXG4gICAgICAgIGNvbHVtbi1nYXA6IDVweDtcclxuICAgICAgICBzdmd7XHJcbiAgICAgICAgICAgIHdpZHRoOiAxOXB4O1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDE5cHg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4uYy1tYWlue1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgbWluLWhlaWdodDogNzM2cHg7XHJcbiAgICAvLyBvdmVyZmxvdzogaGlkZGVuO1xyXG4gICAgLy8gZGlzcGxheTogZ3JpZDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XHJcbiAgICAvLyBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gICAgLmMtYmd7XHJcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgICAgIHRvcDogMDtcclxuICAgICAgICB6LWluZGV4OiAtMTsgXHJcbiAgICAgICAgaGVpZ2h0OiA3NjZweDtcclxuICAgICAgICB3aWR0aDogMTAwJTtcclxuICAgICAgICAuYy1iZy1naWZ7XHJcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XHJcbiAgICAgICAgICAgIGhlaWdodDogMTAwJTtcclxuICAgICAgICAgICAgd2lkdGg6IDEwMCU7ICAgICAgICBcclxuICAgICAgICAgICAgb2JqZWN0LWZpdDogY292ZXI7XHJcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAuYy1ub3Rlc3tcclxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgICAgYm90dG9tOiAxMXB4O1xyXG4gICAgICAgIHotaW5kZXg6IDEwO1xyXG4gICAgICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgICAgIGRpc3BsYXk6IGdyaWQ7XHJcbiAgICAgICAgcGxhY2UtY29udGVudDogY2VudGVyO1xyXG4gICAgICAgIHB7XHJcbiAgICAgICAgICAgIGZvbnQtZmFtaWx5OiBcIlBvcHBpbnMtTWVkaXVtXCI7XHJcbiAgICAgICAgICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcclxuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcclxuICAgICAgICAgICAgZm9udC1zaXplOiAxMHB4O1xyXG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMTVweDtcclxuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyOyBcclxuICAgICAgICAgICAgY29sb3I6ICNGRkZGRkY7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLmMtY29udGVudHtcclxuICAgICAgICAuYy1kZXRhaWxze1xyXG4gICAgICAgICAgICBwYWRkaW5nOiA2MHB4IDIwcHggNjBweCAyMHB4O1xyXG4gICAgICAgICAgICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMzBweDtcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDAsMCwuNyk7XHJcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOiAzMHB4O1xyXG4gICAgICAgICAgICBkaXNwbGF5OiBncmlkO1xyXG4gICAgICAgICAgICBwbGFjZS1pdGVtczogY2VudGVyO1xyXG4gICAgICAgICAgICBtaW4taGVpZ2h0OiA0MTNweDtcclxuICAgICAgICAgICAgLmMtbm90ZXMtMXtcclxuICAgICAgICAgICAgICAgIG1hcmdpbi10b3A6IDEzcHg7XHJcbiAgICAgICAgICAgICAgICBwe1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiBcIlBvcHBpbnMtTWVkaXVtXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udC1zdHlsZTogbm9ybWFsO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udC1zaXplOiAxMHB4O1xyXG4gICAgICAgICAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxNXB4O1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsgXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICNGRkZGRkY7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLmMtYWN0aW9ue1xyXG4gICAgICAgICAgICAgICAgbWFyZ2luLXRvcDogMjVweDtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgICAgICAgICAgICAgLmMtc3VwcGxpZXN7ICBcclxuICAgICAgICAgICAgICAgICAgICBmb250LWZhbWlseTogJ1BvcHBpbnMtRXh0cmFCb2xkJztcclxuICAgICAgICAgICAgICAgICAgICBmb250LXN0eWxlOiBpdGFsaWM7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDgwMDtcclxuICAgICAgICAgICAgICAgICAgICBmb250LXNpemU6IDk2cHg7IFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjRkZGRkZGOyBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGF7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDQwcHg7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcclxuICAgICAgICAgICAgICAgICAgICBmb250LXNpemU6IDEycHg7XHJcbiAgICAgICAgICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDE4cHg7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICNFNUU1RTU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAuYy1yZWNlaXB0e1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcclxuICAgICAgICAgICAgICAgICAgICBmb250LXdlaWdodDogODAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDtcclxuICAgICAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMThweDtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogI0ZGRkZGRjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAwcHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAuYy1hY3Rpb24tMXtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW4tdG9wOiAyOXB4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGgxLGgzLHB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogI2ZmZjtcclxuICAgICAgICAgICAgICAgIC8vIG1heC13aWR0aDogNDUwcHg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaDF7XHJcbiAgICAgICAgICAgICAgICBmb250LXN0eWxlOiBpdGFsaWM7XHJcbiAgICAgICAgICAgICAgICBmb250LXdlaWdodDogODAwO1xyXG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiA2NHB4O1xyXG4gICAgICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDYwcHg7XHJcbiAgICAgICAgICAgICAgICBmb250LWZhbWlseTogXCJQb3BwaW5zLUV4dHJhQm9sZFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGgze1xyXG4gICAgICAgICAgICAgICAgZm9udC1zdHlsZTogbm9ybWFsO1xyXG4gICAgICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDgwMDtcclxuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDtcclxuICAgICAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxOHB4O1xyXG4gICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IFwiUG9wcGlucy1FeHRyYUJvbGRcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBweyBcclxuICAgICAgICAgICAgLy8gICAgIGZvbnQtZmFtaWx5OiBcIlBvcHBpbnMtRXh0cmFCb2xkXCI7XHJcbiAgICAgICAgICAgIC8vICAgICBmb250LXdlaWdodDogODAwO1xyXG4gICAgICAgICAgICAvLyAgICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgICAgICAgICAvLyAgICAgbGluZS1oZWlnaHQ6IDE4cHg7XHJcbiAgICAgICAgICAgIC8vICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgICAgICAgICAgIC8vICAgICBjb2xvcjogI0E3QTdBNztcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgIH1cclxuICAgICAgICAuYy1ib3h7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6IGdyaWQ7XHJcbiAgICAgICAgICAgIHBsYWNlLWl0ZW1zOiBjZW50ZXI7XHJcbiAgICAgICAgICAgIGhlaWdodDogMTAwJTtcclxuICAgICAgICAgICAgaW1neyBcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICAgICAgICAgICAgICAgIG1heC13aWR0aDogNDUwcHg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIFxyXG4uYy1tZW51e1xyXG4gICAgY29sb3I6ICNmZmY7XHJcbiAgICBoZWlnaHQ6IDUwcHg7XHJcbiAgICB3aWR0aDogNTBweDtcclxuICAgIG1hcmdpbi1yaWdodDogMTBweDtcclxufVxyXG4vLyAuYy1maW5nZXIge1xyXG4vLyAgICAgd2lkdGg6MjAwcHg7XHJcbi8vICAgICBoZWlnaHQ6IDIwMHB4O1xyXG4vLyAgICAgYmFja2dyb3VuZDogcmVkO1xyXG4vLyAgICAgLXdlYmtpdC1hbmltYXRpb246IGZhZGVpbm91dCA0cyBpbmZpbml0ZTs7XHJcbi8vICAgICBhbmltYXRpb246ICBmYWRlaW5vdXQgNHMgaW5maW5pdGU7O1xyXG4vLyB9XHJcblxyXG4vLyBALXdlYmtpdC1rZXlmcmFtZXMgZmFkZWlub3V0IHtcclxuLy8gICAwJSwxMDAlIHsgb3BhY2l0eTogMDsgfVxyXG4vLyAgIDUwJSB7IG9wYWNpdHk6IDE7IH1cclxuLy8gfVxyXG5cclxuLy8gQGtleWZyYW1lcyBmYWRlaW5vdXQge1xyXG4vLyAgIDAlLDEwMCUgeyBvcGFjaXR5OiAwOyB9XHJcbi8vICAgNTAlIHsgb3BhY2l0eTogMTsgfVxyXG4vLyB9XHJcblxyXG4vLyAuYy1wb3B1cHtcclxuLy8gICAgIGJhY2tncm91bmQ6IHJnYmEoMCwwLDAsLjUpO1xyXG4vLyAgICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4vLyAgICAgei1pbmRleDogMTtcclxuLy8gICAgIHdpZHRoOiAxMDAlO1xyXG4vLyAgICAgaGVpZ2h0OiAxMDB2aDtcclxuLy8gICAgIC5jLW1haW4tbWFpbntcclxuLy8gICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbi8vICAgICAgICAgbGVmdDogNTAlO1xyXG4vLyAgICAgICAgIHRvcDogNTAlO1xyXG4vLyAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsLTUwJSk7XHJcbi8vICAgICAgICAgYmFja2dyb3VuZDogI2ZmZjsgXHJcbi8vICAgICAgICAgbWluLXdpZHRoOiA1MDBweDsgXHJcbi8vICAgICAgICAgbWluLWhlaWdodDogNDA2LjVweDtcclxuLy8gICAgICAgICBkaXNwbGF5OiBncmlkO1xyXG4vLyAgICAgICAgIHBsYWNlLWNvbnRlbnQ6IGNlbnRlcjtcclxuLy8gICAgICAgICBib3JkZXItcmFkaXVzOiAxNXB4O1xyXG4vLyAgICAgICAgIGgxe1xyXG4vLyAgICAgICAgICAgICBmb250LWZhbWlseTogXCJQb3BwaW5zLUV4dHJhQm9sZFwiO1xyXG4vLyAgICAgICAgICAgICBmb250LXdlaWdodDogODAwO1xyXG4vLyAgICAgICAgICAgICBmb250LXNpemU6IDQwcHg7XHJcbi8vICAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiA2MHB4OyBcclxuLy8gICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyOyBcclxuLy8gICAgICAgICAgICAgY29sb3I6ICMwMDAwMDA7XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgfVxyXG4vLyB9XHJcblxyXG5pb24tcmFuZ2V7XHJcbiAgICAgICAgLS1pb24tY29sb3ItYmFzZTogI2ZmZiAhaW1wb3J0YW50O1xyXG4gICAgICAgIC0taW9uLWNvbG9yLXNoYWRlOiAjZmZmICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgLS1pb24tY29sb3ItdGludDogI2ZmZiAhaW1wb3J0YW50OyBcclxuICAgICAgICAtLWlvbi1jb2xvci1jb250cmFzdDogI2ZmZiAhaW1wb3J0YW50O1xyXG59XHJcblxyXG4uYy1wb3B1cHtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIGhlaWdodDogMTAwJTtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgcGFkZGluZzogNCU7XHJcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLC40KTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAuYy1tYWlueyBcclxuICAgICAgICBiYWNrZ3JvdW5kOiAjZmZmO1xyXG4gICAgICAgIGRpc3BsYXk6IGdyaWQ7XHJcbiAgICAgICAgbWFyZ2luOiAwIGF1dG87XHJcbiAgICAgICAgYm9yZGVyLXJhZGl1czogMTBweDtcclxuICAgICAgICBwYWRkaW5nOiAyNXB4O1xyXG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgICAgICBsZWZ0OiA1MCU7XHJcbiAgICAgICAgdG9wOiA1MCU7XHJcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XHJcbiAgICAgICAgd2lkdGg6IDY4NXB4O1xyXG4gICAgICAgIG1pbi1oZWlnaHQ6IDQwNi41cHg7XHJcbiAgICAgICAgYWxpZ24tY29udGVudDogY2VudGVyO1xyXG4gICAgICAgIC5jLXRoYW5rLW1haW57XHJcbiAgICAgICAgICAgIGhlaWdodDogMTAwJTsgIFxyXG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgICAgICAgICAgIGgxe1xyXG4gICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IFwiUG9wcGlucy1FeHRyYUJvbGRcIjtcclxuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA4MDA7XHJcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDQwcHg7XHJcbiAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogNjBweDsgXHJcbiAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7IFxyXG4gICAgICAgICAgICAgICAgY29sb3I6ICMwMDAwMDA7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIGJ1dHRvbntcclxuICAgICAgICAgICAgICAgIHdpZHRoOiA3MCU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG4vLyBNb2JpbGVcclxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAxMDI0cHgpIHsgXHJcbiAgICAuYy1wb3B1cHtcclxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xyXG4gICAgICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgICAgIHBhZGRpbmc6IDAgIWltcG9ydGFudDtcclxuICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLC40KTtcclxuICAgICAgICAuYy1tYWlue1xyXG4gICAgICAgICAgICAvLyBoZWlnaHQ6IDEwMCUgIWltcG9ydGFudDtcclxuICAgICAgICAgICAgLy8gd2lkdGg6IDEwMCUgIWltcG9ydGFudDtcclxuICAgICAgICAgICAgLy8gYmFja2dyb3VuZDogI2ZmZjtcclxuICAgICAgICAgICAgLy8gZGlzcGxheTogaW5oZXJpdCAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICAvLyBtYXJnaW46IGluaGVyaXQgIWltcG9ydGFudDtcclxuICAgICAgICAgICAgLy8gYm9yZGVyLXJhZGl1czogMHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgICAgIHdpZHRoOiA5MCU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gXHJcbiAgICAuaXNEZXNrdG9we1xyXG4gICAgICAgIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcclxuICAgIH1cclxuICAgIC5pc1RhYk1vYmlsZXtcclxuICAgICAgICBkaXNwbGF5OiBpbmhlcml0ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcbiAgICAuYy1ib3h7XHJcbiAgICAgICAgYm9yZGVyLXJhZGl1czogMjVweDtcclxuICAgICAgICBiYWNrZ3JvdW5kOiB1cmwoJy9hc3NldHMvYmcuZ2lmJyk7XHJcbiAgICAgICAgaW1neyBcclxuICAgICAgICAgICAgbWFyZ2luLXRvcDogODBweDtcclxuICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogODBweDtcclxuICAgICAgICAgICAgbWF4LXdpZHRoOiAzMDBweCAhaW1wb3J0YW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC5jLW1haW57XHJcbiAgICAgICAgLmMtY29udGVudHtcclxuICAgICAgICAgICAgLmMtZGV0YWlsc3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6IDBweCAyMHB4IDYwcHggMjBweDtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAuYy1tYWluLWxvZ297XHJcbiAgICAgICAgLmMtY2lyY2xlLWJ1dHRvbnN7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6IG5vbmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDk5MHB4KSB7ICBcclxuICAgIC5pc0Rlc2t0b3B7XHJcbiAgICAgICAgZGlzcGxheTogaW5oZXJpdCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG4gICAgLmlzVGFiTW9iaWxle1xyXG4gICAgICAgIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcclxuICAgIH1cclxuICAgIC5jLW1lbnV7XHJcbiAgICAgICAgZGlzcGxheTogbm9uZTtcclxuICAgIH1cclxufSJdfQ== */";

/***/ }),

/***/ 3433:
/*!************************************************!*\
  !*** ./src/app/mint/mint.page.html?ngResource ***!
  \************************************************/
/***/ ((module) => {

module.exports = "<ion-content style=\"--background: #000;\">\n  <ion-row class=\"c-main-justify-center  \"\n  style=\"padding-bottom: 40px;\">\n    <ion-col class=\"container\" size=\"12\" size-lg=\"11\" size-md=\"12\" size-sm=\"12\" >\n      <div class=\"c-main-logo\">\n        <img src=\"/assets/logo2.png\" alt=\"\" [routerLink]=\"['/']\">\n        \n        <div class=\"c-circle-buttons\">\n          <div id=\"twitter\" class=\"c-circle-button\"\n          onclick=\"window.open('https://twitter.com/cashcowsNFT','_blank')\">\n            <svg width=\"17\" height=\"15\" viewBox=\"0 0 17 15\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"> <path d=\"M16.9454 2.14593C16.3283 2.41957 15.6645 2.60465 14.9684 2.68729C15.6791 2.26144 16.2246 1.58763 16.4821 0.783418C15.817 1.17795 15.08 1.46417 14.2964 1.61843C13.6685 0.949754 12.7739 0.53186 11.7834 0.53186C9.88279 0.53186 8.34141 2.07329 8.34141 3.97383C8.34141 4.24362 8.37194 4.50621 8.43098 4.75828C5.5704 4.61479 3.03402 3.24457 1.33627 1.16152C1.04005 1.66977 0.870114 2.26144 0.870114 2.89213C0.870114 4.08601 1.47822 5.13998 2.40128 5.75706C1.83733 5.73936 1.30623 5.58458 0.842394 5.32609C0.842135 5.34072 0.842135 5.35535 0.842135 5.36972C0.842135 7.03745 2.02908 8.42844 3.60336 8.74445C3.31485 8.8235 3.01016 8.86533 2.69673 8.86533C2.47444 8.86533 2.25907 8.84402 2.0491 8.80399C2.48702 10.1711 3.7579 11.1663 5.26442 11.1943C4.0862 12.1176 2.60227 12.6677 0.989224 12.6677C0.711995 12.6677 0.437336 12.6515 0.168579 12.6195C1.69101 13.5965 3.50069 14.166 5.44435 14.166C11.7754 14.166 15.2376 8.92128 15.2376 4.37248C15.2376 4.22334 15.2343 4.07471 15.2276 3.92737C15.9007 3.44223 16.4841 2.83618 16.9454 2.14593Z\" fill=\"black\"/> </svg>\n          </div>\n          <div id=\"facebook\" class=\"c-circle-button\"\n          onclick=\"window.open('https://www.facebook.com/cashcowsNFT','_blank')\">\n           <svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 90 90\" width=\"90px\" height=\"90px\"> <g id=\"surface163067\"> <path style=\" stroke:none;fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;\" d=\"M 45 9 C 25.117188 9 9 25.117188 9 45 C 9 63.046875 22.296875 77.953125 39.617188 80.554688 L 39.617188 54.539062 L 30.710938 54.539062 L 30.710938 45.078125 L 39.617188 45.078125 L 39.617188 38.78125 C 39.617188 28.355469 44.695312 23.78125 53.359375 23.78125 C 57.511719 23.78125 59.707031 24.089844 60.742188 24.226562 L 60.742188 32.488281 L 54.835938 32.488281 C 51.15625 32.488281 49.871094 35.976562 49.871094 39.90625 L 49.871094 45.078125 L 60.652344 45.078125 L 59.191406 54.539062 L 49.871094 54.539062 L 49.871094 80.632812 C 67.441406 78.25 81 63.226562 81 45 C 81 25.117188 64.882812 9 45 9 Z M 45 9 \"/> </g> </svg>\n          </div> \n          <div id=\"instagram\" class=\"c-circle-button\"\n          onclick=\"window.open('https://instagram.com/cashcows_collection','_blank')\">\n            <svg fill=\"#000000\" xmlns=\"http://www.w3.org/2000/svg\"  viewBox=\"0 0 30 30\" width=\"90px\" height=\"90px\">    <path d=\"M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z\"/></svg>\n          </div>\n          <div id=\"opensea\" class=\"c-circle-button\"\n          onclick=\"window.open('https://opensea.io/collection/cashcows','_blank')\">\n            <svg width=\"19\" height=\"17\" viewBox=\"0 0 19 17\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"> <g clip-path=\"url(#clip0_82_9)\"> <path d=\"M1.77752 9.41113L1.83728 9.31725L5.43921 3.68248C5.49183 3.59995 5.61561 3.60851 5.65543 3.69811C6.25718 5.04672 6.77641 6.72392 6.53315 7.76807C6.4293 8.19765 6.14481 8.77954 5.82472 9.31725C5.78346 9.39548 5.73795 9.47233 5.68958 9.54627C5.66682 9.5804 5.62841 9.60034 5.58715 9.60034H1.88278C1.78321 9.60034 1.72491 9.49227 1.77752 9.41113Z\" fill=\"black\"/> <path d=\"M17.8326 10.4582V11.3501C17.8326 11.4013 17.8013 11.4468 17.7558 11.4667C17.4769 11.5863 16.5224 12.0244 16.1255 12.5763C15.1126 13.9861 14.3387 16.0019 12.6089 16.0019H5.39224C2.83446 16.0019 0.76178 13.9221 0.76178 11.3558V11.2733C0.76178 11.205 0.817257 11.1495 0.885564 11.1495H4.90855C4.98821 11.1495 5.04655 11.2235 5.03944 11.3017C5.01098 11.5635 5.05935 11.8309 5.1831 12.0742C5.42212 12.5592 5.91716 12.8623 6.45206 12.8623H8.44361V11.3074H6.4748C6.37381 11.3074 6.31406 11.1908 6.3724 11.1082C6.39372 11.0756 6.4179 11.0414 6.44351 11.003C6.62987 10.7384 6.89587 10.3272 7.16049 9.85924C7.34114 9.54348 7.51613 9.20625 7.65694 8.86771C7.68539 8.80658 7.70817 8.744 7.73095 8.6828C7.76937 8.57466 7.80918 8.47365 7.83763 8.37265C7.86609 8.28735 7.88879 8.1977 7.91157 8.11372C7.97845 7.82641 8.0069 7.52197 8.0069 7.20616C8.0069 7.0824 8.00123 6.95295 7.98987 6.82917C7.98413 6.69403 7.96709 6.55889 7.94999 6.42375C7.93864 6.30424 7.91732 6.18619 7.89454 6.06243C7.86609 5.88175 7.82621 5.70252 7.78073 5.52185L7.76508 5.45357C7.73095 5.32981 7.70249 5.21172 7.66262 5.08797C7.55026 4.6996 7.42079 4.3212 7.28424 3.96699C7.23446 3.82615 7.17754 3.69101 7.12064 3.55587C7.0367 3.35243 6.95135 3.16751 6.87314 2.99252C6.83329 2.91286 6.79914 2.8403 6.76501 2.76634C6.72661 2.6824 6.68677 2.59849 6.64695 2.5188C6.61849 2.45763 6.58575 2.40074 6.56301 2.34384L6.31975 1.89431C6.2856 1.83313 6.34252 1.76058 6.40935 1.77907L7.93151 2.19163H7.9358C7.93864 2.19163 7.94003 2.19304 7.94148 2.19304L8.14204 2.24852L8.36254 2.3111L8.44361 2.33387V1.42914C8.44361 0.992399 8.79357 0.638184 9.22606 0.638184C9.44226 0.638184 9.6386 0.726368 9.77942 0.87006C9.92023 1.01375 10.0084 1.21006 10.0084 1.42914V2.77203L10.1706 2.81753C10.1834 2.82181 10.1963 2.8275 10.2076 2.83603C10.2474 2.86591 10.3043 2.91003 10.3769 2.96406C10.4338 3.0096 10.495 3.06508 10.5689 3.12197C10.7155 3.24006 10.8904 3.39227 11.0825 3.56723C11.1337 3.61135 11.1835 3.65686 11.229 3.7024C11.4765 3.93283 11.7539 4.20314 12.0185 4.50188C12.0925 4.58578 12.165 4.67114 12.239 4.76077C12.313 4.85181 12.3913 4.94144 12.4595 5.03108C12.5491 5.15056 12.6458 5.27431 12.7298 5.40378C12.7696 5.46495 12.8152 5.52754 12.8536 5.5887C12.9617 5.75231 13.057 5.9216 13.148 6.09086C13.1865 6.16911 13.2263 6.25446 13.2604 6.3384C13.3614 6.56458 13.4411 6.79504 13.4923 7.0255C13.508 7.07529 13.5193 7.12935 13.525 7.17772V7.18908C13.5421 7.25739 13.5478 7.32994 13.5535 7.40391C13.5762 7.64005 13.5649 7.87619 13.5137 8.11372C13.4923 8.2148 13.4639 8.31006 13.4297 8.41107C13.3955 8.50778 13.3614 8.60879 13.3173 8.70412C13.232 8.90184 13.1309 9.09957 13.0115 9.28455C12.9731 9.35281 12.9275 9.42537 12.882 9.49363C12.8322 9.56618 12.7811 9.63451 12.7355 9.70132C12.6729 9.78668 12.606 9.87634 12.5378 9.95595C12.4766 10.0399 12.414 10.1238 12.3457 10.1978C12.2504 10.3102 12.1594 10.4169 12.064 10.5194C12.0072 10.5862 11.946 10.6545 11.8834 10.7156C11.8222 10.7839 11.7596 10.8451 11.7027 10.902C11.6074 10.9973 11.5278 11.0713 11.4609 11.1325L11.3044 11.2761C11.2817 11.2961 11.2517 11.3074 11.2205 11.3074H10.0084V12.8623H11.5334C11.8748 12.8623 12.1992 12.7414 12.4609 12.5194C12.5506 12.4412 12.9418 12.1026 13.4041 11.5919C13.4198 11.5748 13.4397 11.562 13.4624 11.5564L17.6746 10.3387C17.7529 10.3159 17.8326 10.3756 17.8326 10.4582Z\" fill=\"black\"/> </g> <defs> <clipPath id=\"clip0_82_9\"> <rect width=\"18\" height=\"15.9231\" fill=\"white\" transform=\"translate(0.484863 0.638184)\"/> </clipPath> </defs> </svg>\n          </div>\n          <div id=\"discord\" class=\"c-circle-button\"\n          onclick=\"window.open('https://discord.gg/XjkkYMWhBr','_blank')\">\n            <svg width=\"19\" height=\"15\" viewBox=\"0 0 19 15\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"> <path d=\"M15.9519 2.00143C14.7848 1.46579 13.5532 1.08385 12.2879 0.865179C12.2764 0.862984 12.2644 0.864489 12.2538 0.869478C12.2433 0.874466 12.2345 0.882683 12.2288 0.892953C12.0608 1.19749 11.9083 1.51031 11.7718 1.83022C10.4079 1.62309 9.02061 1.62309 7.65675 1.83022C7.51965 1.50951 7.36496 1.19662 7.19339 0.892953C7.18751 0.882898 7.17871 0.874862 7.16817 0.869904C7.15763 0.864946 7.14583 0.863299 7.13433 0.865179C5.86936 1.0835 4.63817 1.46546 3.47175 2.00143C3.46171 2.00566 3.45323 2.0129 3.44749 2.02217C1.11417 5.50862 0.475032 8.90929 0.788625 12.2671C0.789521 12.2753 0.792068 12.2833 0.796115 12.2906C0.800162 12.2978 0.805625 12.3042 0.812181 12.3092C2.17091 13.3158 3.69078 14.0841 5.3069 14.5814C5.31831 14.5848 5.33048 14.5847 5.3418 14.5809C5.35311 14.5772 5.36301 14.5702 5.37019 14.5606C5.7172 14.0882 6.02468 13.588 6.28952 13.0651C6.29313 13.0579 6.29519 13.0501 6.29555 13.0421C6.29591 13.0341 6.29457 13.026 6.29162 13.0186C6.28866 13.0111 6.28416 13.0043 6.27841 12.9987C6.27266 12.9931 6.26578 12.9888 6.25823 12.986C5.77328 12.8008 5.30377 12.5774 4.8541 12.318C4.84593 12.3132 4.83907 12.3065 4.83414 12.2984C4.8292 12.2903 4.82632 12.2812 4.82576 12.2718C4.82521 12.2623 4.82699 12.2529 4.83095 12.2442C4.83491 12.2357 4.84093 12.2281 4.84847 12.2224C4.94269 12.1521 5.03725 12.0783 5.12725 12.0037C5.13525 11.9972 5.14491 11.9929 5.15516 11.9916C5.16541 11.9902 5.17584 11.9918 5.18527 11.996C8.131 13.341 11.3204 13.341 14.2313 11.996C14.2408 11.9914 14.2514 11.9897 14.2619 11.991C14.2723 11.9922 14.2822 11.9964 14.2904 12.003C14.3804 12.0772 14.4749 12.1517 14.5717 12.2224C14.5792 12.2281 14.5853 12.2355 14.5893 12.2441C14.5933 12.2527 14.5952 12.262 14.5947 12.2715C14.5942 12.2809 14.5914 12.2902 14.5865 12.2983C14.5817 12.3064 14.5748 12.3132 14.5667 12.318C14.1176 12.5799 13.6472 12.8034 13.1605 12.986C13.1529 12.9889 13.146 12.9933 13.1402 12.999C13.1345 13.0047 13.13 13.0116 13.1272 13.0192C13.1242 13.0268 13.123 13.0349 13.1235 13.043C13.1239 13.0511 13.1261 13.059 13.1299 13.0662C13.3991 13.5862 13.7061 14.0859 14.0485 14.561C14.0554 14.5708 14.0653 14.5781 14.0767 14.582C14.088 14.5858 14.1003 14.586 14.1118 14.5824C15.7301 14.0866 17.252 13.3182 18.6118 12.3103C18.6184 12.3054 18.624 12.2993 18.6281 12.2921C18.6321 12.285 18.6346 12.277 18.6353 12.2688C19.0108 8.38615 18.0068 5.01327 15.974 2.02357C15.9695 2.01382 15.9616 2.00597 15.9519 2.00143ZM6.72898 10.2227C5.84198 10.2227 5.11179 9.4085 5.11179 8.40865C5.11179 7.40881 5.82827 6.59459 6.72898 6.59459C7.63706 6.59459 8.36093 7.41584 8.34617 8.40865C8.34687 9.4085 7.63003 10.2227 6.72898 10.2227ZM12.7101 10.2227C11.8232 10.2227 11.0929 9.4085 11.0929 8.40865C11.0929 7.40881 11.8094 6.59459 12.7101 6.59459C13.6182 6.59459 14.3421 7.41584 14.3273 8.40865C14.3277 9.4085 13.6182 10.2227 12.7101 10.2227Z\" fill=\"black\"/> </svg>\n          </div>  \n        </div>\n        <ion-icon name=\"menu-outline\" class=\"c-menu\"\n        (click)=\"onToggleMenu($event)\"></ion-icon>\n      </div>\n      <div class=\"c-main\">\n        <div class=\"c-content\">\n          <ion-row style=\"place-items: center;    min-height: 736px;\"> \n            <ion-col size=\"12\" size-lg=\"6\" size-md=\"6\" size-sm=\"12\" \n            style=\"padding: 0px;\">\n              <div class=\"c-details\">\n                <div  *ngIf=\"!isChainLoaded\">\n                  <h1>WE ARE CASH COWS</h1>\n                  <h3>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. </h3>\n                  <button \n                  (click)=\"onConnectWallet()\"\n                  class=\"c-button-primary c-connect\" >Connect your wallet</button> \n                </div>\n\n                <div *ngIf=\"isChainLoaded\"\n                class=\"c-action\"> \n                  <p class=\"c-supplies\"\n                  *ngIf=\"chainModel.mintedSupply != chainModel.maxSupply\">{{chainModel.mintedSupply}} / {{chainModel.maxSupply}}</p>\n                     \n                  <p class=\"c-supplies\"\n                  *ngIf=\"chainModel.mintedSupply == chainModel.maxSupply\">\n                    Sold Out\n                  </p>\n\n                  <a href=\"{{config.SCAN_LINK}}\" target=\"_blank\">{{config.CONTRACT_ADDRESS}}</a>\n\n                  <p *ngIf=\"chainModel.mintedSupply != chainModel.maxSupply \n                  && (!chainModel.isPaused || !chainModel.isMintWLPaused)\">\n                    Just click the box to get mint.\n                  </p>\n                  \n                  {{maxMint}}\n\n                  <div class=\"c-action-1\"\n                  *ngIf=\"maxMint > 0 && chainModel.mintedSupply != chainModel.maxSupply \n                  && (!chainModel.isPaused || !chainModel.isMintWLPaused)\">\n                    <p class=\"c-receipt\">{{receiptDisplay}}</p> \n                    <ion-range *ngIf=\"maxMint > 1 \"\n                    min=\"1\" max=\"{{maxMint}}\" step=\"1\" snaps=\"true\" color=\"secondary\"\n                    (ionChange)=\"rangeChange($event)\"> \n                    </ion-range>\n                  </div>\n\n                  <div *ngIf=\"chainModel.isPaused && chainModel.isMintWLPaused\">\n                    <h2>Minting page is not yet ready.</h2>\n                  </div>\n                  \n                  <div *ngIf=\"!chainModel.isMintWLPaused && (devMint + chainModel.supplyWL) -  chainModel.mintedSupply == 0\">\n                    <h2>No available cashcows for whitelisted.</h2>\n                  </div>\n                   \n\n                  <div class=\"c-notes-1 isTabMobile\">\n                    <p>Please make sure you are connected to the right network ({{config.NETWORK.NAME}} Mainnet) and the correct address.<br> <br> Please note: Once you make the purchase, you cannot undo this action.</p>\n                  </div>\n                  \n                </div>\n              </div>\n            </ion-col>\n            <ion-col size=\"12\" size-lg=\"6\" size-md=\"6\" size-sm=\"12\" >\n              <div class=\"c-box\">\n                <img  class=\"c-center shake-slow shake-constant\" src=\"/assets/box.png\" alt=\"\"\n                (click)=\"onMint()\">\n                <!-- <div class=\"c-center\"> \n                  <img src=\"/assets/finger.png\" alt=\"\"\n                  class=\"c-finger\">\n                </div> -->\n              </div>\n            </ion-col>\n          </ion-row>\n        </div>\n        <div class=\"c-notes isDesktop\">\n          <p>Please make sure you are connected to the right network (Polygon Mainnet) and the correct address.\n            <br>Please note: Once you make the purchase, you cannot undo this action.</p>\n        </div>\n        <div class=\"c-bg isDesktop\">\n          <img  class=\"c-bg-gif\" loading=\"lazy\" src=\"assets/bg.jpg\" alt=\"\">\n        </div>\n      </div> \n    </ion-col>\n  </ion-row>\n</ion-content>\n\n\n<!-- <div class=\"c-popup\" *ngIf=\"isShowMintDone\">\n  <div class=\"c-main-main\">\n    <h1>Thank you for minting</h1>\n    <button \n    (click)=\"onToggleMintDone()\"\n    class=\"c-button-secondary c-connect\" >Mint again</button> \n  </div>\n</div> -->\n\n\n<div class=\"c-popup  k\" *ngIf=\"!isShowMintDone\"> \n  <div class=\"c-main\"> \n      <div class=\"c-thank-main\">   \n          <h1>THANK YOU FOR MINTING</h1> \n          <button \n          (click)=\"onOpenCloseThank()\"\n          class=\"c-button-secondary c-connect\" >Mint again</button> \n      </div>\n  </div>\n</div>";

/***/ })

}]);
//# sourceMappingURL=src_app_mint_mint_module_ts.js.map