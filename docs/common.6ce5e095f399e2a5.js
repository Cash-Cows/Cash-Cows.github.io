"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[8592],{7160:(y,w,d)=>{d.d(w,{c:()=>c});var u=d(2361),g=d(7683),h=d(3139);const c=(i,n)=>{let e,t;const o=(a,v,f)=>{if("undefined"==typeof document)return;const m=document.elementFromPoint(a,v);m&&n(m)?m!==e&&(l(),s(m,f)):l()},s=(a,v)=>{e=a,t||(t=e);const f=e;(0,u.c)(()=>f.classList.add("ion-activated")),v()},l=(a=!1)=>{if(!e)return;const v=e;(0,u.c)(()=>v.classList.remove("ion-activated")),a&&t!==e&&e.click(),e=void 0};return(0,h.createGesture)({el:i,gestureName:"buttonActiveDrag",threshold:0,onStart:a=>o(a.currentX,a.currentY,g.a),onMove:a=>o(a.currentX,a.currentY,g.b),onEnd:()=>{l(!0),(0,g.h)(),t=void 0}})}},8685:(y,w,d)=>{d.d(w,{g:()=>u});const u=(n,e,t,o,s)=>h(n[1],e[1],t[1],o[1],s).map(l=>g(n[0],e[0],t[0],o[0],l)),g=(n,e,t,o,s)=>s*(3*e*Math.pow(s-1,2)+s*(-3*t*s+3*t+o*s))-n*Math.pow(s-1,3),h=(n,e,t,o,s)=>i((o-=s)-3*(t-=s)+3*(e-=s)-(n-=s),3*t-6*e+3*n,3*e-3*n,n).filter(a=>a>=0&&a<=1),i=(n,e,t,o)=>{if(0===n)return((n,e,t)=>{const o=e*e-4*n*t;return o<0?[]:[(-e+Math.sqrt(o))/(2*n),(-e-Math.sqrt(o))/(2*n)]})(e,t,o);const s=(3*(t/=n)-(e/=n)*e)/3,l=(2*e*e*e-9*e*t+27*(o/=n))/27;if(0===s)return[Math.pow(-l,1/3)];if(0===l)return[Math.sqrt(-s),-Math.sqrt(-s)];const a=Math.pow(l/2,2)+Math.pow(s/3,3);if(0===a)return[Math.pow(l/2,.5)-e/3];if(a>0)return[Math.pow(-l/2+Math.sqrt(a),1/3)-Math.pow(l/2+Math.sqrt(a),1/3)-e/3];const v=Math.sqrt(Math.pow(-s/3,3)),f=Math.acos(-l/(2*Math.sqrt(Math.pow(-s/3,3)))),m=2*Math.pow(v,1/3);return[m*Math.cos(f/3)-e/3,m*Math.cos((f+2*Math.PI)/3)-e/3,m*Math.cos((f+4*Math.PI)/3)-e/3]}},5062:(y,w,d)=>{d.d(w,{i:()=>u});const u=g=>g&&""!==g.dir?"rtl"===g.dir.toLowerCase():"rtl"===(null==document?void 0:document.dir.toLowerCase())},1112:(y,w,d)=>{d.r(w),d.d(w,{startFocusVisible:()=>c});const u="ion-focused",h=["Tab","ArrowDown","Space","Escape"," ","Shift","Enter","ArrowLeft","ArrowRight","ArrowUp","Home","End"],c=i=>{let n=[],e=!0;const t=i?i.shadowRoot:document,o=i||document.body,s=p=>{n.forEach(_=>_.classList.remove(u)),p.forEach(_=>_.classList.add(u)),n=p},l=()=>{e=!1,s([])},a=p=>{e=h.includes(p.key),e||s([])},v=p=>{if(e&&p.composedPath){const _=p.composedPath().filter(E=>!!E.classList&&E.classList.contains("ion-focusable"));s(_)}},f=()=>{t.activeElement===o&&s([])};return t.addEventListener("keydown",a),t.addEventListener("focusin",v),t.addEventListener("focusout",f),t.addEventListener("touchstart",l),t.addEventListener("mousedown",l),{destroy:()=>{t.removeEventListener("keydown",a),t.removeEventListener("focusin",v),t.removeEventListener("focusout",f),t.removeEventListener("touchstart",l),t.removeEventListener("mousedown",l)},setFocus:s}}},1878:(y,w,d)=>{d.d(w,{C:()=>i,a:()=>h,d:()=>c});var u=d(5861),g=d(3756);const h=function(){var n=(0,u.Z)(function*(e,t,o,s,l,a){var v;if(e)return e.attachViewToDom(t,o,l,s);if(!(a||"string"==typeof o||o instanceof HTMLElement))throw new Error("framework delegate is missing");const f="string"==typeof o?null===(v=t.ownerDocument)||void 0===v?void 0:v.createElement(o):o;return s&&s.forEach(m=>f.classList.add(m)),l&&Object.assign(f,l),t.appendChild(f),yield new Promise(m=>(0,g.c)(f,m)),f});return function(t,o,s,l,a,v){return n.apply(this,arguments)}}(),c=(n,e)=>{if(e){if(n)return n.removeViewFromDom(e.parentElement,e);e.remove()}return Promise.resolve()},i=()=>{let n,e;return{attachViewToDom:function(){var s=(0,u.Z)(function*(l,a,v={},f=[]){var m,p;if(n=l,a){const E="string"==typeof a?null===(m=n.ownerDocument)||void 0===m?void 0:m.createElement(a):a;f.forEach(r=>E.classList.add(r)),Object.assign(E,v),n.appendChild(E),yield new Promise(r=>(0,g.c)(E,r))}else if(n.children.length>0){const E=null===(p=n.ownerDocument)||void 0===p?void 0:p.createElement("div");f.forEach(r=>E.classList.add(r)),E.append(...n.children),n.appendChild(E)}const _=document.querySelector("ion-app")||document.body;return e=document.createComment("ionic teleport"),n.parentNode.insertBefore(e,n),_.appendChild(n),n});return function(a,v){return s.apply(this,arguments)}}(),removeViewFromDom:()=>(n&&e&&(e.parentNode.insertBefore(n,e),e.remove()),Promise.resolve())}}},7683:(y,w,d)=>{d.d(w,{a:()=>h,b:()=>c,c:()=>g,d:()=>n,h:()=>i});const u={getEngine(){var e;const t=window;return t.TapticEngine||(null===(e=t.Capacitor)||void 0===e?void 0:e.isPluginAvailable("Haptics"))&&t.Capacitor.Plugins.Haptics},available(){return!!this.getEngine()},isCordova:()=>!!window.TapticEngine,isCapacitor:()=>!!window.Capacitor,impact(e){const t=this.getEngine();if(!t)return;const o=this.isCapacitor()?e.style.toUpperCase():e.style;t.impact({style:o})},notification(e){const t=this.getEngine();if(!t)return;const o=this.isCapacitor()?e.style.toUpperCase():e.style;t.notification({style:o})},selection(){this.impact({style:"light"})},selectionStart(){const e=this.getEngine();!e||(this.isCapacitor()?e.selectionStart():e.gestureSelectionStart())},selectionChanged(){const e=this.getEngine();!e||(this.isCapacitor()?e.selectionChanged():e.gestureSelectionChanged())},selectionEnd(){const e=this.getEngine();!e||(this.isCapacitor()?e.selectionEnd():e.gestureSelectionEnd())}},g=()=>{u.selection()},h=()=>{u.selectionStart()},c=()=>{u.selectionChanged()},i=()=>{u.selectionEnd()},n=e=>{u.impact(e)}},7351:(y,w,d)=>{d.d(w,{a:()=>s,b:()=>v,f:()=>l,g:()=>o,p:()=>f,s:()=>a});var u=d(5861),g=d(3756),h=d(7208);const i="ion-content",n=".ion-content-scroll-host",e=`${i}, ${n}`,t=m=>m&&"ION-CONTENT"===m.tagName,o=function(){var m=(0,u.Z)(function*(p){return t(p)?(yield new Promise(_=>(0,g.c)(p,_)),p.getScrollElement()):p});return function(_){return m.apply(this,arguments)}}(),s=m=>m.querySelector(n)||m.querySelector(e),l=m=>m.closest(e),a=(m,p)=>t(m)?m.scrollToTop(p):Promise.resolve(m.scrollTo({top:0,left:0,behavior:p>0?"smooth":"auto"})),v=(m,p,_,E)=>t(m)?m.scrollByPoint(p,_,E):Promise.resolve(m.scrollBy({top:_,left:p,behavior:E>0?"smooth":"auto"})),f=m=>(0,h.a)(m,i)},7208:(y,w,d)=>{d.d(w,{a:()=>h,b:()=>g,p:()=>u});const u=c=>console.warn(`[Ionic Warning]: ${c}`),g=(c,...i)=>console.error(`[Ionic Error]: ${c}`,...i),h=(c,...i)=>console.error(`<${c.tagName.toLowerCase()}> must be used inside ${i.join(" or ")}.`)},8439:(y,w,d)=>{d.d(w,{s:()=>u});const u=t=>{try{if(t instanceof class e{constructor(o){this.value=o}})return t.value;if(!c()||"string"!=typeof t||""===t)return t;const o=document.createDocumentFragment(),s=document.createElement("div");o.appendChild(s),s.innerHTML=t,n.forEach(f=>{const m=o.querySelectorAll(f);for(let p=m.length-1;p>=0;p--){const _=m[p];_.parentNode?_.parentNode.removeChild(_):o.removeChild(_);const E=h(_);for(let r=0;r<E.length;r++)g(E[r])}});const l=h(o);for(let f=0;f<l.length;f++)g(l[f]);const a=document.createElement("div");a.appendChild(o);const v=a.querySelector("div");return null!==v?v.innerHTML:a.innerHTML}catch(o){return console.error(o),""}},g=t=>{if(t.nodeType&&1!==t.nodeType)return;for(let s=t.attributes.length-1;s>=0;s--){const l=t.attributes.item(s),a=l.name;if(!i.includes(a.toLowerCase())){t.removeAttribute(a);continue}const v=l.value;null!=v&&v.toLowerCase().includes("javascript:")&&t.removeAttribute(a)}const o=h(t);for(let s=0;s<o.length;s++)g(o[s])},h=t=>null!=t.children?t.children:t.childNodes,c=()=>{var t;const o=window,s=null===(t=null==o?void 0:o.Ionic)||void 0===t?void 0:t.config;return!s||(s.get?s.get("sanitizerEnabled",!0):!0===s.sanitizerEnabled||void 0===s.sanitizerEnabled)},i=["class","id","href","src","name","slot"],n=["script","style","iframe","meta","link","object","embed"]},8117:(y,w,d)=>{d.d(w,{a:()=>u,b:()=>l,c:()=>n,d:()=>a,e:()=>r,f:()=>h,g:()=>g,h:()=>_,i:()=>e,j:()=>o,k:()=>v,l:()=>t,m:()=>i,n:()=>c,o:()=>s,p:()=>f,q:()=>m,r:()=>p,s:()=>E});const u="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Arrow Back</title><path stroke-linecap='square' stroke-miterlimit='10' stroke-width='48' d='M244 400L100 256l144-144M120 256h292' class='ionicon-fill-none'/></svg>",g="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Arrow Down</title><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M112 268l144 144 144-144M256 392V100' class='ionicon-fill-none'/></svg>",h="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Caret Back</title><path d='M368 64L144 256l224 192V64z'/></svg>",c="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Caret Down</title><path d='M64 144l192 224 192-224H64z'/></svg>",i="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Caret Up</title><path d='M448 368L256 144 64 368h384z'/></svg>",n="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Chevron Back</title><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M328 112L184 256l144 144' class='ionicon-fill-none'/></svg>",e="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Chevron Down</title><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M112 184l144 144 144-144' class='ionicon-fill-none'/></svg>",t="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Chevron Forward</title><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M184 112l144 144-144 144' class='ionicon-fill-none'/></svg>",o="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Chevron Forward</title><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M184 112l144 144-144 144' class='ionicon-fill-none'/></svg>",s="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Close</title><path d='M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z'/></svg>",l="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Close Circle</title><path d='M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm75.31 260.69a16 16 0 11-22.62 22.62L256 278.63l-52.69 52.68a16 16 0 01-22.62-22.62L233.37 256l-52.68-52.69a16 16 0 0122.62-22.62L256 233.37l52.69-52.68a16 16 0 0122.62 22.62L278.63 256z'/></svg>",a="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Close</title><path d='M400 145.49L366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49z'/></svg>",v="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Ellipsis Horizontal</title><circle cx='256' cy='256' r='48'/><circle cx='416' cy='256' r='48'/><circle cx='96' cy='256' r='48'/></svg>",f="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Menu</title><path stroke-linecap='round' stroke-miterlimit='10' d='M80 160h352M80 256h352M80 352h352' class='ionicon-fill-none ionicon-stroke-width'/></svg>",m="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Menu</title><path d='M64 384h384v-42.67H64zm0-106.67h384v-42.66H64zM64 128v42.67h384V128z'/></svg>",p="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Reorder Three</title><path stroke-linecap='round' stroke-linejoin='round' d='M96 256h320M96 176h320M96 336h320' class='ionicon-fill-none ionicon-stroke-width'/></svg>",_="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Reorder Two</title><path stroke-linecap='square' stroke-linejoin='round' stroke-width='44' d='M118 304h276M118 208h276' class='ionicon-fill-none'/></svg>",E="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Search</title><path d='M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z' stroke-miterlimit='10' class='ionicon-fill-none ionicon-stroke-width'/><path stroke-linecap='round' stroke-miterlimit='10' d='M338.29 338.29L448 448' class='ionicon-fill-none ionicon-stroke-width'/></svg>",r="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Search</title><path d='M464 428L339.92 303.9a160.48 160.48 0 0030.72-94.58C370.64 120.37 298.27 48 209.32 48S48 120.37 48 209.32s72.37 161.32 161.32 161.32a160.48 160.48 0 0094.58-30.72L428 464zM209.32 319.69a110.38 110.38 0 11110.37-110.37 110.5 110.5 0 01-110.37 110.37z'/></svg>"},1316:(y,w,d)=>{d.r(w),d.d(w,{KEYBOARD_DID_CLOSE:()=>g,KEYBOARD_DID_OPEN:()=>u,copyVisualViewport:()=>E,keyboardDidClose:()=>f,keyboardDidOpen:()=>a,keyboardDidResize:()=>v,resetKeyboardAssist:()=>e,setKeyboardClose:()=>l,setKeyboardOpen:()=>s,startKeyboardAssist:()=>t,trackViewportChanges:()=>_});const u="ionKeyboardDidShow",g="ionKeyboardDidHide";let c={},i={},n=!1;const e=()=>{c={},i={},n=!1},t=r=>{o(r),r.visualViewport&&(i=E(r.visualViewport),r.visualViewport.onresize=()=>{_(r),a()||v(r)?s(r):f(r)&&l(r)})},o=r=>{r.addEventListener("keyboardDidShow",C=>s(r,C)),r.addEventListener("keyboardDidHide",()=>l(r))},s=(r,C)=>{m(r,C),n=!0},l=r=>{p(r),n=!1},a=()=>!n&&c.width===i.width&&(c.height-i.height)*i.scale>150,v=r=>n&&!f(r),f=r=>n&&i.height===r.innerHeight,m=(r,C)=>{const D=new CustomEvent(u,{detail:{keyboardHeight:C?C.keyboardHeight:r.innerHeight-i.height}});r.dispatchEvent(D)},p=r=>{const C=new CustomEvent(g);r.dispatchEvent(C)},_=r=>{c=Object.assign({},i),i=E(r.visualViewport)},E=r=>({width:Math.round(r.width),height:Math.round(r.height),offsetTop:r.offsetTop,offsetLeft:r.offsetLeft,pageTop:r.pageTop,pageLeft:r.pageLeft,scale:r.scale})},7741:(y,w,d)=>{d.d(w,{S:()=>g});const g={bubbles:{dur:1e3,circles:9,fn:(h,c,i)=>{const n=h*c/i-h+"ms",e=2*Math.PI*c/i;return{r:5,style:{top:9*Math.sin(e)+"px",left:9*Math.cos(e)+"px","animation-delay":n}}}},circles:{dur:1e3,circles:8,fn:(h,c,i)=>{const n=c/i,e=h*n-h+"ms",t=2*Math.PI*n;return{r:5,style:{top:9*Math.sin(t)+"px",left:9*Math.cos(t)+"px","animation-delay":e}}}},circular:{dur:1400,elmDuration:!0,circles:1,fn:()=>({r:20,cx:48,cy:48,fill:"none",viewBox:"24 24 48 48",transform:"translate(0,0)",style:{}})},crescent:{dur:750,circles:1,fn:()=>({r:26,style:{}})},dots:{dur:750,circles:3,fn:(h,c)=>({r:6,style:{left:9-9*c+"px","animation-delay":-110*c+"ms"}})},lines:{dur:1e3,lines:8,fn:(h,c,i)=>({y1:14,y2:26,style:{transform:`rotate(${360/i*c+(c<i/2?180:-180)}deg)`,"animation-delay":h*c/i-h+"ms"}})},"lines-small":{dur:1e3,lines:8,fn:(h,c,i)=>({y1:12,y2:20,style:{transform:`rotate(${360/i*c+(c<i/2?180:-180)}deg)`,"animation-delay":h*c/i-h+"ms"}})},"lines-sharp":{dur:1e3,lines:12,fn:(h,c,i)=>({y1:17,y2:29,style:{transform:`rotate(${30*c+(c<6?180:-180)}deg)`,"animation-delay":h*c/i-h+"ms"}})},"lines-sharp-small":{dur:1e3,lines:12,fn:(h,c,i)=>({y1:12,y2:20,style:{transform:`rotate(${30*c+(c<6?180:-180)}deg)`,"animation-delay":h*c/i-h+"ms"}})}}},6546:(y,w,d)=>{d.r(w),d.d(w,{createSwipeBackGesture:()=>i});var u=d(3756),g=d(5062),h=d(3139);d(3509);const i=(n,e,t,o,s)=>{const l=n.ownerDocument.defaultView,a=(0,g.i)(n),f=r=>a?-r.deltaX:r.deltaX;return(0,h.createGesture)({el:n,gestureName:"goback-swipe",gesturePriority:40,threshold:10,canStart:r=>(r=>{const{startX:M}=r;return a?M>=l.innerWidth-50:M<=50})(r)&&e(),onStart:t,onMove:r=>{const M=f(r)/l.innerWidth;o(M)},onEnd:r=>{const C=f(r),M=l.innerWidth,D=C/M,O=(r=>a?-r.velocityX:r.velocityX)(r),T=O>=0&&(O>.2||C>M/2),b=(T?1-D:D)*M;let L=0;if(b>5){const x=b/Math.abs(O);L=Math.min(x,540)}s(T,D<=0?.01:(0,u.l)(0,D,.9999),L)}})}},2854:(y,w,d)=>{d.d(w,{c:()=>h,g:()=>i,h:()=>g,o:()=>e});var u=d(5861);const g=(t,o)=>null!==o.closest(t),h=(t,o)=>"string"==typeof t&&t.length>0?Object.assign({"ion-color":!0,[`ion-color-${t}`]:!0},o):o,i=t=>{const o={};return(t=>void 0!==t?(Array.isArray(t)?t:t.split(" ")).filter(s=>null!=s).map(s=>s.trim()).filter(s=>""!==s):[])(t).forEach(s=>o[s]=!0),o},n=/^[a-z][a-z0-9+\-.]*:/,e=function(){var t=(0,u.Z)(function*(o,s,l,a){if(null!=o&&"#"!==o[0]&&!n.test(o)){const v=document.querySelector("ion-router");if(v)return null!=s&&s.preventDefault(),v.push(o,l,a)}return!1});return function(s,l,a,v){return t.apply(this,arguments)}}()},9570:(y,w,d)=>{d.d(w,{c:()=>i});var u=d(655),g=d(2340),h=d(2096),c=d(5649);let i=(()=>{class n{constructor(t,o){this.alertController=t,this.loadingController=o,this.ethereum=window.ethereum,this.config=g.N.configchain,this.isConnected=!1,this.ethereum.on("accountsChanged",s=>(0,u.mG)(this,void 0,void 0,function*(){window.location.reload()})),this.ethereum.on("chainChanged",()=>{window.location.reload()}),this.ethereum.on("close",s=>{console.log("Errorethereum",s)}),console.log(this.ethereum),this.init()}init(){return(0,u.mG)(this,void 0,void 0,function*(){this.web3=new Web3(this.ethereum);let t="";t=g.N.production?"/assets/abi.json":"/assets/testabi.json";const s=yield(yield fetch(t,{headers:{"Content-Type":"application/json",Accept:"application/json"}})).json();this.contract=new this.web3.eth.Contract(s,this.config.CONTRACT_ADDRESS);let a="";a=g.N.production?"/assets/RoyaltyForAllAbi.json":"/assets/testRoyaltyForAllAbi.json";const f=yield(yield fetch(a,{headers:{"Content-Type":"application/json",Accept:"application/json"}})).json();this.contractRoyalty=new this.web3.eth.Contract(f,this.config.CONTRACT_ADDRESS_ROYALTY),console.log("contractRoyalty",this.contractRoyalty)})}connect(){return(0,u.mG)(this,void 0,void 0,function*(){return new Promise((t,o)=>(0,u.mG)(this,void 0,void 0,function*(){const s=this.ethereum&&this.ethereum.isMetaMask,l=yield this.ethereum.request({method:"net_version"});if(!s)return this.errorAlert("Install Metamask."),void o({});if(console.log("connect",l,this.config.NETWORK.ID),l!=this.config.NETWORK.ID)return this.errorAlert(`Please, change the network to ${this.config.NETWORK.NAME}.`),this.switchChain(),void o({});const a=yield this.web3.eth.getAccounts();this.setAccount(0==a.length?yield this.getAccount():a[0]),console.log(this.contract),t({})}))})}setAccount(t){return(0,u.mG)(this,void 0,void 0,function*(){this.userAddress=t,this.userAddress&&(this.isConnected=!0),console.log(this.userAddress)})}getAccount(){return(0,u.mG)(this,void 0,void 0,function*(){return new Promise(t=>(0,u.mG)(this,void 0,void 0,function*(){const o=yield this.ethereum.request({method:"eth_requestAccounts"});t(o[0])}))})}errorAlert(t){return(0,u.mG)(this,void 0,void 0,function*(){yield(yield this.alertController.create({message:t+' Please<a href="https://discord.gg/XjkkYMWhBr" target="_blank"> contact</a> the developer for more information..',backdropDismiss:!1,buttons:[{text:"Ok",handler:()=>(0,u.mG)(this,void 0,void 0,function*(){window.location.reload()})}]})).present()})}switchChain(){return(0,u.mG)(this,void 0,void 0,function*(){try{yield this.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:"0x"+this.config.NETWORK.ID.toString(16)}]})}catch(t){if(console.log("switchEthereumChain e",t),4902===t.code)try{yield this.ethereum.request({method:"wallet_addEthereumChain",params:[{chainId:"0x"+this.config.NETWORK.ID.toString(16),chainName:this.config.NETWORK.NAME,nativeCurrency:{name:this.config.NETWORK.SYMBOL,symbol:this.config.NETWORK.SYMBOL,decimals:18},rpcUrls:[this.config.NETWORK.RPCURL],blockExplorerUrls:[this.config.NETWORK.blockExplorerUrls]}]})}catch(o){console.log("switchEthereumChain addError",o),console.error(o)}}})}toHex(t){for(var o="",s=0;s<t.length;s++)o+=t.charCodeAt(s).toString(16);return o}}return n.\u0275fac=function(t){return new(t||n)(h.LFG(c.Br),h.LFG(c.HT))},n.\u0275prov=h.Yz7({token:n,factory:n.\u0275fac,providedIn:"root"}),n})()},3911:(y,w,d)=>{d.d(w,{D:()=>c});var u=d(655),g=d(2096),h=d(5649);let c=(()=>{class i{constructor(e,t){this.alertController=e,this.toastController=t}presentToast(e,t=6e3){return(0,u.mG)(this,void 0,void 0,function*(){(yield this.toastController.create({message:e,color:"primary",duration:t})).present()})}errorToast(e,t){return(0,u.mG)(this,void 0,void 0,function*(){(yield this.toastController.create({message:e,color:"danger",duration:t||6e3})).present()})}warningToast(e,t){return(0,u.mG)(this,void 0,void 0,function*(){(yield this.toastController.create({message:e,color:"warning",duration:t||6e3})).present()})}errorAlert(e){return(0,u.mG)(this,void 0,void 0,function*(){yield(yield this.alertController.create({message:e+' Please<a href="https://discord.gg/XHfd5JVtae" target="_blank"> contact</a> the developer for more information..',backdropDismiss:!1,buttons:[{text:"Ok",handler:()=>(0,u.mG)(this,void 0,void 0,function*(){window.location.reload()})}]})).present()})}}return i.\u0275fac=function(e){return new(e||i)(g.LFG(h.Br),g.LFG(h.yF))},i.\u0275prov=g.Yz7({token:i,factory:i.\u0275fac,providedIn:"root"}),i})()}}]);