"use strict";
(self["webpackChunkapp"] = self["webpackChunkapp"] || []).push([["src_app_royalty-browser_royalty-browser_module_ts"],{

/***/ 4252:
/*!*******************************************************************!*\
  !*** ./src/app/royalty-browser/royalty-browser-routing.module.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RoyaltyBrowserPageRoutingModule": () => (/* binding */ RoyaltyBrowserPageRoutingModule)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 2816);
/* harmony import */ var _royalty_browser_page__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./royalty-browser.page */ 9857);




const routes = [
    {
        path: '',
        component: _royalty_browser_page__WEBPACK_IMPORTED_MODULE_0__.RoyaltyBrowserPage
    }
];
let RoyaltyBrowserPageRoutingModule = class RoyaltyBrowserPageRoutingModule {
};
RoyaltyBrowserPageRoutingModule = (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.NgModule)({
        imports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule.forChild(routes)],
        exports: [_angular_router__WEBPACK_IMPORTED_MODULE_3__.RouterModule],
    })
], RoyaltyBrowserPageRoutingModule);



/***/ }),

/***/ 3613:
/*!***********************************************************!*\
  !*** ./src/app/royalty-browser/royalty-browser.module.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RoyaltyBrowserPageModule": () => (/* binding */ RoyaltyBrowserPageModule)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 6362);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ 587);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var _royalty_browser_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./royalty-browser-routing.module */ 4252);
/* harmony import */ var _royalty_browser_page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./royalty-browser.page */ 9857);







let RoyaltyBrowserPageModule = class RoyaltyBrowserPageModule {
};
RoyaltyBrowserPageModule = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.NgModule)({
        imports: [
            _angular_common__WEBPACK_IMPORTED_MODULE_4__.CommonModule,
            _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormsModule,
            _ionic_angular__WEBPACK_IMPORTED_MODULE_6__.IonicModule,
            _royalty_browser_routing_module__WEBPACK_IMPORTED_MODULE_0__.RoyaltyBrowserPageRoutingModule
        ],
        declarations: [_royalty_browser_page__WEBPACK_IMPORTED_MODULE_1__.RoyaltyBrowserPage]
    })
], RoyaltyBrowserPageModule);



/***/ }),

/***/ 9857:
/*!*********************************************************!*\
  !*** ./src/app/royalty-browser/royalty-browser.page.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RoyaltyBrowserPage": () => (/* binding */ RoyaltyBrowserPage)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! tslib */ 4929);
/* harmony import */ var _royalty_browser_page_html_ngResource__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./royalty-browser.page.html?ngResource */ 9882);
/* harmony import */ var _royalty_browser_page_scss_ngResource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./royalty-browser.page.scss?ngResource */ 2610);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/core */ 3184);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ionic/angular */ 3819);
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/environments/environment */ 2340);
/* harmony import */ var _utils_connectwallet_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/connectwallet.service */ 9570);
/* harmony import */ var _utils_toast_message_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/toast-message.service */ 3911);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ 8784);









let RoyaltyBrowserPage = class RoyaltyBrowserPage {
    constructor(http, connectWallet, loadingController, toast, popoverController, alertController) {
        this.http = http;
        this.connectWallet = connectWallet;
        this.loadingController = loadingController;
        this.toast = toast;
        this.popoverController = popoverController;
        this.alertController = alertController;
        this.totalRoyalties = 0;
        this.isLoaded = false;
        this.chainModel = {};
        this.config = src_environments_environment__WEBPACK_IMPORTED_MODULE_2__.environment.configchain;
    }
    ngOnInit() {
        if (!src_environments_environment__WEBPACK_IMPORTED_MODULE_2__.environment.production) {
            this.onConnectWallet();
        }
    }
    onConnectWallet() {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_5__.__awaiter)(this, void 0, void 0, function* () {
            yield this.connectWallet.connect();
            yield this.onRefreshChainData();
        });
    }
    onRefreshChainData() {
        return new Promise((resolve) => (0,tslib__WEBPACK_IMPORTED_MODULE_5__.__awaiter)(this, void 0, void 0, function* () {
            this.isLoaded = false;
            this.myUserAddress = this.connectWallet.userAddress;
            const loading = yield this.loadingController.create({ message: "Please wait ...." });
            // await loading.present();  
            const ownerTokens = yield this.connectWallet.contract.methods.ownerTokens(this.myUserAddress).call();
            this.chainModel.tokenData = [];
            this.chainModel.ownerTokens = [];
            for (let i = 0; i < ownerTokens.length; i++) {
                this.chainModel.ownerTokens.push(parseInt(ownerTokens[i]));
                const tokenID = this.chainModel.ownerTokens[i];
                const tokenURI = yield this.connectWallet.contract.methods.tokenURI(tokenID).call();
                let tokenData = yield new Promise((resolve, reject) => {
                    if (!src_environments_environment__WEBPACK_IMPORTED_MODULE_2__.environment.production) {
                        const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_6__.HttpHeaders()
                            .set('content-type', 'application/json');
                        this.http.get(tokenURI, { headers: headers }).subscribe((res) => (0,tslib__WEBPACK_IMPORTED_MODULE_5__.__awaiter)(this, void 0, void 0, function* () {
                            resolve(res);
                        }));
                    }
                    else {
                        const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_6__.HttpHeaders()
                            .set('content-type', 'application/json');
                        this.http.get(`https://opensea.mypinata.cloud/ipfs/${tokenURI.split('ipfs/')[1]}`, { headers: headers }).subscribe((res) => (0,tslib__WEBPACK_IMPORTED_MODULE_5__.__awaiter)(this, void 0, void 0, function* () {
                            res.image = `https://opensea.mypinata.cloud/ipfs/${res.image.split('ipfs/')[1]}`;
                            resolve(res);
                        }));
                    }
                });
                let royalty = parseInt(yield this.connectWallet.contractRoyalty.methods.releaseable(tokenID).call());
                royalty = royalty / Math.pow(10, 18);
                tokenData = Object.assign(tokenData, { royalty });
                this.totalRoyalties += royalty;
                this.chainModel.tokenData.push(tokenData);
            }
            console.log("Chain Model", this.chainModel);
            this.isLoaded = true;
            yield loading.dismiss();
            resolve({});
        }));
    }
    claimRoyalties() {
        return new Promise((resolve) => (0,tslib__WEBPACK_IMPORTED_MODULE_5__.__awaiter)(this, void 0, void 0, function* () {
            const loading = yield this.loadingController.create({ message: "Please wait ...." });
            yield loading.present();
            let gasLimit = this.config.GAS_LIMIT;
            console.log("this.chainModel.ownerTokens", this.chainModel.ownerTokens, JSON.stringify(this.chainModel.ownerTokens), this.chainModel.ownerTokens.join(","));
            yield this.connectWallet.contractRoyalty.methods.releaseBatch(this.chainModel.ownerTokens)
                .send({
                gasLimit: gasLimit,
                to: this.config.CONTRACT_ADDRESS_ROYALTY,
                from: this.myUserAddress
            });
            yield loading.dismiss();
            this.toast.presentToast("Claimed Successfully!");
            this.onRefreshChainData();
            resolve({});
        }));
    }
    updateChainHoldNft() {
    }
};
RoyaltyBrowserPage.ctorParameters = () => [
    { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_6__.HttpClient },
    { type: _utils_connectwallet_service__WEBPACK_IMPORTED_MODULE_3__.ConnectwalletService },
    { type: _ionic_angular__WEBPACK_IMPORTED_MODULE_7__.LoadingController },
    { type: _utils_toast_message_service__WEBPACK_IMPORTED_MODULE_4__.ToastMessageService },
    { type: _ionic_angular__WEBPACK_IMPORTED_MODULE_7__.PopoverController },
    { type: _ionic_angular__WEBPACK_IMPORTED_MODULE_7__.AlertController }
];
RoyaltyBrowserPage = (0,tslib__WEBPACK_IMPORTED_MODULE_5__.__decorate)([
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_8__.Component)({
        selector: 'app-royalty-browser',
        template: _royalty_browser_page_html_ngResource__WEBPACK_IMPORTED_MODULE_0__,
        styles: [_royalty_browser_page_scss_ngResource__WEBPACK_IMPORTED_MODULE_1__]
    })
], RoyaltyBrowserPage);



/***/ }),

/***/ 2610:
/*!**********************************************************************!*\
  !*** ./src/app/royalty-browser/royalty-browser.page.scss?ngResource ***!
  \**********************************************************************/
/***/ ((module) => {

module.exports = "h2, h1, p {\n  color: #fff;\n}\n\n.c-main-logo {\n  padding: 20px 0px 30px 0px;\n  display: flex;\n  justify-content: space-between;\n  place-items: center;\n}\n\n.c-main-logo img {\n  max-height: 60px;\n}\n\n.c-main-logo .c-circle-buttons {\n  display: flex;\n  margin-top: 15px;\n  column-gap: 5px;\n}\n\n.c-main-logo .c-circle-buttons svg {\n  width: 19px;\n  height: 19px;\n}\n\n.bg {\n  position: fixed;\n  object-fit: cover;\n  height: 100%;\n  width: 100%;\n  opacity: 0.3;\n}\n\n.c-header {\n  text-align: center;\n  display: grid;\n  place-items: center;\n}\n\n.c-header h1 {\n  font-weight: 800;\n  font-size: 64px;\n  line-height: 60px;\n  font-family: \"Poppins-ExtraBold\";\n}\n\n.c-header h2 {\n  font-style: normal;\n  font-size: 13px;\n  line-height: 18px;\n  font-family: \"Poppins\";\n  margin-top: 0px;\n}\n\n.c-header p {\n  font-style: normal;\n  font-size: 16px;\n  font-family: \"Poppins\";\n  max-width: 750px;\n  margin-top: 18px;\n}\n\n.c-list-nft {\n  margin-top: 50px;\n}\n\n.c-list-nft ion-skeleton-text {\n  width: 95%;\n  border-radius: 10px;\n  min-height: 350px;\n  --background-rgb: 255, 255, 255;\n}\n\n.c-list-nft .c-item-nft {\n  border-radius: 10px;\n  overflow: auto;\n  background: #fff;\n}\n\n.c-list-nft .c-item-nft .c-desc {\n  padding: 10px;\n}\n\n.c-list-nft .c-item-nft .c-desc h1 {\n  color: #000;\n  font-size: 15px;\n  margin: 0px;\n}\n\n.c-list-nft .c-item-nft .c-desc p {\n  color: green;\n  margin-bottom: 0px;\n  margin-top: 6px;\n  font-size: 12px;\n}\n\n.c-action-claim {\n  text-align: center;\n  margin-top: 53px;\n}\n\n.c-action-claim button {\n  height: 70px;\n  font-size: 25px;\n}\n\n@media only screen and (max-width: 1024px) {\n  .c-main-logo .c-circle-buttons {\n    display: none;\n  }\n}\n\n@media only screen and (min-width: 990px) {\n  .isDesktop {\n    display: inherit !important;\n  }\n\n  .isTabMobile {\n    display: none !important;\n  }\n\n  .c-menu {\n    display: none;\n  }\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJveWFsdHktYnJvd3Nlci5wYWdlLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxXQUFBO0FBQ0o7O0FBRUE7RUFDSSwwQkFBQTtFQUNBLGFBQUE7RUFDSCw4QkFBQTtFQUNHLG1CQUFBO0FBQ0o7O0FBQUk7RUFDSSxnQkFBQTtBQUVSOztBQUFJO0VBQ0ksYUFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtBQUVSOztBQURRO0VBQ0ksV0FBQTtFQUNBLFlBQUE7QUFHWjs7QUFFQTtFQUNJLGVBQUE7RUFDQSxpQkFBQTtFQUNBLFlBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtBQUNKOztBQUNBO0VBQ0ksa0JBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7QUFFSjs7QUFESTtFQUNJLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0EsZ0NBQUE7QUFHUjs7QUFBSTtFQUNJLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0Esc0JBQUE7RUFDQSxlQUFBO0FBRVI7O0FBQUk7RUFDSSxrQkFBQTtFQUNBLGVBQUE7RUFDQSxzQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZ0JBQUE7QUFFUjs7QUFFQTtFQUNJLGdCQUFBO0FBQ0o7O0FBQUk7RUFDSSxVQUFBO0VBQ0EsbUJBQUE7RUFDQSxpQkFBQTtFQUNBLCtCQUFBO0FBRVI7O0FBQUk7RUFDSSxtQkFBQTtFQUNBLGNBQUE7RUFDQSxnQkFBQTtBQUVSOztBQURRO0VBQ0ksYUFBQTtBQUdaOztBQUZZO0VBQ0ksV0FBQTtFQUNBLGVBQUE7RUFDQSxXQUFBO0FBSWhCOztBQUZZO0VBQ0ksWUFBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLGVBQUE7QUFJaEI7O0FBRUE7RUFDSSxrQkFBQTtFQUNBLGdCQUFBO0FBQ0o7O0FBQUk7RUFDSSxZQUFBO0VBQ0EsZUFBQTtBQUVSOztBQUdBO0VBRVE7SUFDSSxhQUFBO0VBRFY7QUFDRjs7QUFLQTtFQUNJO0lBQ0ksMkJBQUE7RUFITjs7RUFLRTtJQUNJLHdCQUFBO0VBRk47O0VBSUU7SUFDSSxhQUFBO0VBRE47QUFDRiIsImZpbGUiOiJyb3lhbHR5LWJyb3dzZXIucGFnZS5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiaDIsaDEscHtcclxuICAgIGNvbG9yOiAjZmZmO1xyXG59XHJcblxyXG4uYy1tYWluLWxvZ297XHJcbiAgICBwYWRkaW5nOiAyMHB4IDBweCAzMHB4IDBweDtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcblx0anVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xyXG4gICAgcGxhY2UtaXRlbXM6IGNlbnRlcjtcclxuICAgIGltZ3sgICAgIFxyXG4gICAgICAgIG1heC1oZWlnaHQ6IDYwcHg7XHJcbiAgICB9XHJcbiAgICAuYy1jaXJjbGUtYnV0dG9uc3tcclxuICAgICAgICBkaXNwbGF5OiBmbGV4OyBcclxuICAgICAgICBtYXJnaW4tdG9wOiAxNXB4O1xyXG4gICAgICAgIGNvbHVtbi1nYXA6IDVweDtcclxuICAgICAgICBzdmd7XHJcbiAgICAgICAgICAgIHdpZHRoOiAxOXB4O1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDE5cHg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4uYmd7XHJcbiAgICBwb3NpdGlvbjogZml4ZWQ7XHJcbiAgICBvYmplY3QtZml0OiBjb3ZlcjtcclxuICAgIGhlaWdodDogMTAwJTtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgb3BhY2l0eTogMC4zO1xyXG59XHJcbi5jLWhlYWRlcntcclxuICAgIHRleHQtYWxpZ246IGNlbnRlcjsgXHJcbiAgICBkaXNwbGF5OiBncmlkO1xyXG4gICAgcGxhY2UtaXRlbXM6IGNlbnRlcjtcclxuICAgIGgxeyBcclxuICAgICAgICBmb250LXdlaWdodDogODAwO1xyXG4gICAgICAgIGZvbnQtc2l6ZTogNjRweDtcclxuICAgICAgICBsaW5lLWhlaWdodDogNjBweDtcclxuICAgICAgICBmb250LWZhbWlseTogXCJQb3BwaW5zLUV4dHJhQm9sZFwiO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBoMntcclxuICAgICAgICBmb250LXN0eWxlOiBub3JtYWw7IFxyXG4gICAgICAgIGZvbnQtc2l6ZTogMTNweDtcclxuICAgICAgICBsaW5lLWhlaWdodDogMThweDtcclxuICAgICAgICBmb250LWZhbWlseTogXCJQb3BwaW5zXCI7XHJcbiAgICAgICAgbWFyZ2luLXRvcDogMHB4O1xyXG4gICAgfVxyXG4gICAgcHtcclxuICAgICAgICBmb250LXN0eWxlOiBub3JtYWw7XHJcbiAgICAgICAgZm9udC1zaXplOiAxNnB4OyBcclxuICAgICAgICBmb250LWZhbWlseTogXCJQb3BwaW5zXCI7XHJcbiAgICAgICAgbWF4LXdpZHRoOiA3NTBweDsgXHJcbiAgICAgICAgbWFyZ2luLXRvcDogMThweDtcclxuICAgIH1cclxufVxyXG5cclxuLmMtbGlzdC1uZnR7XHJcbiAgICBtYXJnaW4tdG9wOiA1MHB4O1xyXG4gICAgaW9uLXNrZWxldG9uLXRleHR7XHJcbiAgICAgICAgd2lkdGg6IDk1JTtcclxuICAgICAgICBib3JkZXItcmFkaXVzOiAxMHB4O1xyXG4gICAgICAgIG1pbi1oZWlnaHQ6IDM1MHB4O1xyXG4gICAgICAgIC0tYmFja2dyb3VuZC1yZ2I6IDI1NSwgMjU1LCAyNTU7XHJcbiAgICB9XHJcbiAgICAuYy1pdGVtLW5mdHtcclxuICAgICAgICBib3JkZXItcmFkaXVzOiAxMHB4O1xyXG4gICAgICAgIG92ZXJmbG93OiBhdXRvO1xyXG4gICAgICAgIGJhY2tncm91bmQ6ICNmZmY7XHJcbiAgICAgICAgLmMtZGVzY3tcclxuICAgICAgICAgICAgcGFkZGluZzogMTBweDtcclxuICAgICAgICAgICAgaDF7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogIzAwMDtcclxuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMTVweDtcclxuICAgICAgICAgICAgICAgIG1hcmdpbjogMHB4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogZ3JlZW47XHJcbiAgICAgICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAwcHg7XHJcbiAgICAgICAgICAgICAgICBtYXJnaW4tdG9wOiA2cHg7XHJcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDEycHg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi5jLWFjdGlvbi1jbGFpbXtcclxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcclxuICAgIG1hcmdpbi10b3A6IDUzcHg7IFxyXG4gICAgYnV0dG9ue1xyXG4gICAgICAgIGhlaWdodDogNzBweDtcclxuICAgICAgICBmb250LXNpemU6IDI1cHg7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIE1vYmlsZVxyXG5AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDEwMjRweCkgeyAgXHJcbiAgICAuYy1tYWluLWxvZ297XHJcbiAgICAgICAgLmMtY2lyY2xlLWJ1dHRvbnN7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6IG5vbmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDk5MHB4KSB7ICBcclxuICAgIC5pc0Rlc2t0b3B7XHJcbiAgICAgICAgZGlzcGxheTogaW5oZXJpdCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG4gICAgLmlzVGFiTW9iaWxle1xyXG4gICAgICAgIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcclxuICAgIH1cclxuICAgIC5jLW1lbnV7XHJcbiAgICAgICAgZGlzcGxheTogbm9uZTtcclxuICAgIH1cclxufSJdfQ== */";

/***/ }),

/***/ 9882:
/*!**********************************************************************!*\
  !*** ./src/app/royalty-browser/royalty-browser.page.html?ngResource ***!
  \**********************************************************************/
/***/ ((module) => {

module.exports = "<ion-content style=\"--background: #000;\">\n  \n  <img class=\"bg\" src=\"assets/bg.jpg\" alt=\"\">\n\n  <ion-row class=\"c-main-justify-center  \"\n  style=\"padding-bottom: 40px;\">\n    <ion-col class=\"container\" size=\"12\" size-lg=\"11\" size-md=\"12\" size-sm=\"12\" >\n\n      <div class=\"c-main-logo\">\n        <img src=\"/assets/logo2.png\" alt=\"\" [routerLink]=\"['/']\">\n        \n        <div class=\"c-circle-buttons\">\n          <div id=\"twitter\" class=\"c-circle-button\"\n          onclick=\"window.open('https://twitter.com/cashcowsNFT','_blank')\">\n            <svg width=\"17\" height=\"15\" viewBox=\"0 0 17 15\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"> <path d=\"M16.9454 2.14593C16.3283 2.41957 15.6645 2.60465 14.9684 2.68729C15.6791 2.26144 16.2246 1.58763 16.4821 0.783418C15.817 1.17795 15.08 1.46417 14.2964 1.61843C13.6685 0.949754 12.7739 0.53186 11.7834 0.53186C9.88279 0.53186 8.34141 2.07329 8.34141 3.97383C8.34141 4.24362 8.37194 4.50621 8.43098 4.75828C5.5704 4.61479 3.03402 3.24457 1.33627 1.16152C1.04005 1.66977 0.870114 2.26144 0.870114 2.89213C0.870114 4.08601 1.47822 5.13998 2.40128 5.75706C1.83733 5.73936 1.30623 5.58458 0.842394 5.32609C0.842135 5.34072 0.842135 5.35535 0.842135 5.36972C0.842135 7.03745 2.02908 8.42844 3.60336 8.74445C3.31485 8.8235 3.01016 8.86533 2.69673 8.86533C2.47444 8.86533 2.25907 8.84402 2.0491 8.80399C2.48702 10.1711 3.7579 11.1663 5.26442 11.1943C4.0862 12.1176 2.60227 12.6677 0.989224 12.6677C0.711995 12.6677 0.437336 12.6515 0.168579 12.6195C1.69101 13.5965 3.50069 14.166 5.44435 14.166C11.7754 14.166 15.2376 8.92128 15.2376 4.37248C15.2376 4.22334 15.2343 4.07471 15.2276 3.92737C15.9007 3.44223 16.4841 2.83618 16.9454 2.14593Z\" fill=\"black\"/> </svg>\n          </div>\n          <div id=\"facebook\" class=\"c-circle-button\"\n          onclick=\"window.open('https://www.facebook.com/cashcowsNFT','_blank')\">\n           <svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 90 90\" width=\"90px\" height=\"90px\"> <g id=\"surface163067\"> <path style=\" stroke:none;fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;\" d=\"M 45 9 C 25.117188 9 9 25.117188 9 45 C 9 63.046875 22.296875 77.953125 39.617188 80.554688 L 39.617188 54.539062 L 30.710938 54.539062 L 30.710938 45.078125 L 39.617188 45.078125 L 39.617188 38.78125 C 39.617188 28.355469 44.695312 23.78125 53.359375 23.78125 C 57.511719 23.78125 59.707031 24.089844 60.742188 24.226562 L 60.742188 32.488281 L 54.835938 32.488281 C 51.15625 32.488281 49.871094 35.976562 49.871094 39.90625 L 49.871094 45.078125 L 60.652344 45.078125 L 59.191406 54.539062 L 49.871094 54.539062 L 49.871094 80.632812 C 67.441406 78.25 81 63.226562 81 45 C 81 25.117188 64.882812 9 45 9 Z M 45 9 \"/> </g> </svg>\n          </div> \n          <div id=\"instagram\" class=\"c-circle-button\"\n          onclick=\"window.open('https://instagram.com/cashcows_collection','_blank')\">\n            <svg fill=\"#000000\" xmlns=\"http://www.w3.org/2000/svg\"  viewBox=\"0 0 30 30\" width=\"90px\" height=\"90px\">    <path d=\"M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z\"/></svg>\n          </div>\n          <div id=\"opensea\" class=\"c-circle-button\"\n          onclick=\"window.open('https://opensea.io/collection/cashcows','_blank')\">\n            <svg width=\"19\" height=\"17\" viewBox=\"0 0 19 17\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"> <g clip-path=\"url(#clip0_82_9)\"> <path d=\"M1.77752 9.41113L1.83728 9.31725L5.43921 3.68248C5.49183 3.59995 5.61561 3.60851 5.65543 3.69811C6.25718 5.04672 6.77641 6.72392 6.53315 7.76807C6.4293 8.19765 6.14481 8.77954 5.82472 9.31725C5.78346 9.39548 5.73795 9.47233 5.68958 9.54627C5.66682 9.5804 5.62841 9.60034 5.58715 9.60034H1.88278C1.78321 9.60034 1.72491 9.49227 1.77752 9.41113Z\" fill=\"black\"/> <path d=\"M17.8326 10.4582V11.3501C17.8326 11.4013 17.8013 11.4468 17.7558 11.4667C17.4769 11.5863 16.5224 12.0244 16.1255 12.5763C15.1126 13.9861 14.3387 16.0019 12.6089 16.0019H5.39224C2.83446 16.0019 0.76178 13.9221 0.76178 11.3558V11.2733C0.76178 11.205 0.817257 11.1495 0.885564 11.1495H4.90855C4.98821 11.1495 5.04655 11.2235 5.03944 11.3017C5.01098 11.5635 5.05935 11.8309 5.1831 12.0742C5.42212 12.5592 5.91716 12.8623 6.45206 12.8623H8.44361V11.3074H6.4748C6.37381 11.3074 6.31406 11.1908 6.3724 11.1082C6.39372 11.0756 6.4179 11.0414 6.44351 11.003C6.62987 10.7384 6.89587 10.3272 7.16049 9.85924C7.34114 9.54348 7.51613 9.20625 7.65694 8.86771C7.68539 8.80658 7.70817 8.744 7.73095 8.6828C7.76937 8.57466 7.80918 8.47365 7.83763 8.37265C7.86609 8.28735 7.88879 8.1977 7.91157 8.11372C7.97845 7.82641 8.0069 7.52197 8.0069 7.20616C8.0069 7.0824 8.00123 6.95295 7.98987 6.82917C7.98413 6.69403 7.96709 6.55889 7.94999 6.42375C7.93864 6.30424 7.91732 6.18619 7.89454 6.06243C7.86609 5.88175 7.82621 5.70252 7.78073 5.52185L7.76508 5.45357C7.73095 5.32981 7.70249 5.21172 7.66262 5.08797C7.55026 4.6996 7.42079 4.3212 7.28424 3.96699C7.23446 3.82615 7.17754 3.69101 7.12064 3.55587C7.0367 3.35243 6.95135 3.16751 6.87314 2.99252C6.83329 2.91286 6.79914 2.8403 6.76501 2.76634C6.72661 2.6824 6.68677 2.59849 6.64695 2.5188C6.61849 2.45763 6.58575 2.40074 6.56301 2.34384L6.31975 1.89431C6.2856 1.83313 6.34252 1.76058 6.40935 1.77907L7.93151 2.19163H7.9358C7.93864 2.19163 7.94003 2.19304 7.94148 2.19304L8.14204 2.24852L8.36254 2.3111L8.44361 2.33387V1.42914C8.44361 0.992399 8.79357 0.638184 9.22606 0.638184C9.44226 0.638184 9.6386 0.726368 9.77942 0.87006C9.92023 1.01375 10.0084 1.21006 10.0084 1.42914V2.77203L10.1706 2.81753C10.1834 2.82181 10.1963 2.8275 10.2076 2.83603C10.2474 2.86591 10.3043 2.91003 10.3769 2.96406C10.4338 3.0096 10.495 3.06508 10.5689 3.12197C10.7155 3.24006 10.8904 3.39227 11.0825 3.56723C11.1337 3.61135 11.1835 3.65686 11.229 3.7024C11.4765 3.93283 11.7539 4.20314 12.0185 4.50188C12.0925 4.58578 12.165 4.67114 12.239 4.76077C12.313 4.85181 12.3913 4.94144 12.4595 5.03108C12.5491 5.15056 12.6458 5.27431 12.7298 5.40378C12.7696 5.46495 12.8152 5.52754 12.8536 5.5887C12.9617 5.75231 13.057 5.9216 13.148 6.09086C13.1865 6.16911 13.2263 6.25446 13.2604 6.3384C13.3614 6.56458 13.4411 6.79504 13.4923 7.0255C13.508 7.07529 13.5193 7.12935 13.525 7.17772V7.18908C13.5421 7.25739 13.5478 7.32994 13.5535 7.40391C13.5762 7.64005 13.5649 7.87619 13.5137 8.11372C13.4923 8.2148 13.4639 8.31006 13.4297 8.41107C13.3955 8.50778 13.3614 8.60879 13.3173 8.70412C13.232 8.90184 13.1309 9.09957 13.0115 9.28455C12.9731 9.35281 12.9275 9.42537 12.882 9.49363C12.8322 9.56618 12.7811 9.63451 12.7355 9.70132C12.6729 9.78668 12.606 9.87634 12.5378 9.95595C12.4766 10.0399 12.414 10.1238 12.3457 10.1978C12.2504 10.3102 12.1594 10.4169 12.064 10.5194C12.0072 10.5862 11.946 10.6545 11.8834 10.7156C11.8222 10.7839 11.7596 10.8451 11.7027 10.902C11.6074 10.9973 11.5278 11.0713 11.4609 11.1325L11.3044 11.2761C11.2817 11.2961 11.2517 11.3074 11.2205 11.3074H10.0084V12.8623H11.5334C11.8748 12.8623 12.1992 12.7414 12.4609 12.5194C12.5506 12.4412 12.9418 12.1026 13.4041 11.5919C13.4198 11.5748 13.4397 11.562 13.4624 11.5564L17.6746 10.3387C17.7529 10.3159 17.8326 10.3756 17.8326 10.4582Z\" fill=\"black\"/> </g> <defs> <clipPath id=\"clip0_82_9\"> <rect width=\"18\" height=\"15.9231\" fill=\"white\" transform=\"translate(0.484863 0.638184)\"/> </clipPath> </defs> </svg>\n          </div>\n          <div id=\"discord\" class=\"c-circle-button\"\n          onclick=\"window.open('https://discord.gg/XjkkYMWhBr','_blank')\">\n            <svg width=\"19\" height=\"15\" viewBox=\"0 0 19 15\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"> <path d=\"M15.9519 2.00143C14.7848 1.46579 13.5532 1.08385 12.2879 0.865179C12.2764 0.862984 12.2644 0.864489 12.2538 0.869478C12.2433 0.874466 12.2345 0.882683 12.2288 0.892953C12.0608 1.19749 11.9083 1.51031 11.7718 1.83022C10.4079 1.62309 9.02061 1.62309 7.65675 1.83022C7.51965 1.50951 7.36496 1.19662 7.19339 0.892953C7.18751 0.882898 7.17871 0.874862 7.16817 0.869904C7.15763 0.864946 7.14583 0.863299 7.13433 0.865179C5.86936 1.0835 4.63817 1.46546 3.47175 2.00143C3.46171 2.00566 3.45323 2.0129 3.44749 2.02217C1.11417 5.50862 0.475032 8.90929 0.788625 12.2671C0.789521 12.2753 0.792068 12.2833 0.796115 12.2906C0.800162 12.2978 0.805625 12.3042 0.812181 12.3092C2.17091 13.3158 3.69078 14.0841 5.3069 14.5814C5.31831 14.5848 5.33048 14.5847 5.3418 14.5809C5.35311 14.5772 5.36301 14.5702 5.37019 14.5606C5.7172 14.0882 6.02468 13.588 6.28952 13.0651C6.29313 13.0579 6.29519 13.0501 6.29555 13.0421C6.29591 13.0341 6.29457 13.026 6.29162 13.0186C6.28866 13.0111 6.28416 13.0043 6.27841 12.9987C6.27266 12.9931 6.26578 12.9888 6.25823 12.986C5.77328 12.8008 5.30377 12.5774 4.8541 12.318C4.84593 12.3132 4.83907 12.3065 4.83414 12.2984C4.8292 12.2903 4.82632 12.2812 4.82576 12.2718C4.82521 12.2623 4.82699 12.2529 4.83095 12.2442C4.83491 12.2357 4.84093 12.2281 4.84847 12.2224C4.94269 12.1521 5.03725 12.0783 5.12725 12.0037C5.13525 11.9972 5.14491 11.9929 5.15516 11.9916C5.16541 11.9902 5.17584 11.9918 5.18527 11.996C8.131 13.341 11.3204 13.341 14.2313 11.996C14.2408 11.9914 14.2514 11.9897 14.2619 11.991C14.2723 11.9922 14.2822 11.9964 14.2904 12.003C14.3804 12.0772 14.4749 12.1517 14.5717 12.2224C14.5792 12.2281 14.5853 12.2355 14.5893 12.2441C14.5933 12.2527 14.5952 12.262 14.5947 12.2715C14.5942 12.2809 14.5914 12.2902 14.5865 12.2983C14.5817 12.3064 14.5748 12.3132 14.5667 12.318C14.1176 12.5799 13.6472 12.8034 13.1605 12.986C13.1529 12.9889 13.146 12.9933 13.1402 12.999C13.1345 13.0047 13.13 13.0116 13.1272 13.0192C13.1242 13.0268 13.123 13.0349 13.1235 13.043C13.1239 13.0511 13.1261 13.059 13.1299 13.0662C13.3991 13.5862 13.7061 14.0859 14.0485 14.561C14.0554 14.5708 14.0653 14.5781 14.0767 14.582C14.088 14.5858 14.1003 14.586 14.1118 14.5824C15.7301 14.0866 17.252 13.3182 18.6118 12.3103C18.6184 12.3054 18.624 12.2993 18.6281 12.2921C18.6321 12.285 18.6346 12.277 18.6353 12.2688C19.0108 8.38615 18.0068 5.01327 15.974 2.02357C15.9695 2.01382 15.9616 2.00597 15.9519 2.00143ZM6.72898 10.2227C5.84198 10.2227 5.11179 9.4085 5.11179 8.40865C5.11179 7.40881 5.82827 6.59459 6.72898 6.59459C7.63706 6.59459 8.36093 7.41584 8.34617 8.40865C8.34687 9.4085 7.63003 10.2227 6.72898 10.2227ZM12.7101 10.2227C11.8232 10.2227 11.0929 9.4085 11.0929 8.40865C11.0929 7.40881 11.8094 6.59459 12.7101 6.59459C13.6182 6.59459 14.3421 7.41584 14.3273 8.40865C14.3277 9.4085 13.6182 10.2227 12.7101 10.2227Z\" fill=\"black\"/> </svg>\n          </div>  \n        </div>\n        <!-- <ion-icon name=\"menu-outline\" class=\"c-menu\"\n        (click)=\"onToggleMenu($event)\"></ion-icon> -->\n      </div>\n\n      <div class=\"c-header\">\n        <h1>WE ARE CASH COWS</h1>\n        <h2>A 7,777 NFT Collection of 2D Pixel Cows sharing fortune in the Metaverse</h2>\n        <p>It is a degen experiment about sharing the wealth by splitting the creator fees <b>(rewards)</b> earned in the secondary market evenly to every <b>current Cow holder</b>.</p>\n      </div>\n\n      <div class=\"c-action-claim\"\n      *ngIf=\"totalRoyalties > 0\">\n        <button class=\"c-button-primary\"\n        (click)=\"claimRoyalties()\"> \n          Claim Royalties\n        </button>\n        <p>Note : You will claim all the royalty tokens one at a time.</p>\n      </div>\n\n      <div class=\"c-list-nft\">\n        <h2 class=\"total-royalties\">Total Royalties : {{totalRoyalties}}</h2>\n\n        \n        <ion-row *ngIf=\"!chainModel.tokenData\">\n          <ion-col size=\"6\" size-lg=\"3\" size-md=\"3\" size-sm=\"6\"\n          *ngFor=\"let a of [].constructor(12)\"> \n            <ion-skeleton-text   animated  ></ion-skeleton-text>\n          </ion-col>\n        </ion-row>\n\n        <ion-row *ngIf=\"chainModel.tokenData\">\n          <ion-col size=\"6\" size-lg=\"3\" size-md=\"3\" size-sm=\"6\"\n          *ngFor=\"let tokenData of chainModel.tokenData\">\n            <div class=\"c-item-nft\">\n              <img [src]=\"tokenData.image\" alt=\"\">\n              <div class=\"c-desc\"> \n                <h1>{{tokenData.name}}</h1> \n                <p>Royalties : {{tokenData.royalty}} ETH</p>\n              </div>\n            </div>\n          </ion-col>\n        </ion-row>\n      </div>\n\n    </ion-col>\n  </ion-row>\n\n</ion-content>\n";

/***/ })

}]);
//# sourceMappingURL=src_app_royalty-browser_royalty-browser_module_ts.js.map