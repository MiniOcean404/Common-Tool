"use strict";(self.webpackChunkgame_camp_2d=self.webpackChunkgame_camp_2d||[]).push([[83],{390:function(n,t,e){e.d(t,{aU:function(){return r},cP:function(){return v},lX:function(){return c}});var r,a=e(7462);!function(n){n.Pop="POP",n.Push="PUSH",n.Replace="REPLACE"}(r||(r={}));var u=function(n){return n};var o="beforeunload",i="popstate";function c(n){void 0===n&&(n={});var t=n.window,e=void 0===t?document.defaultView:t,c=e.history;function p(){var n=e.location,t=n.pathname,r=n.search,a=n.hash,o=c.state||{};return[o.idx,u({pathname:t,search:r,hash:a,state:o.usr||null,key:o.key||"default"})]}var d=null;e.addEventListener(i,(function(){if(d)P.call(d),d=null;else{var n=r.Pop,t=p(),e=t[0],a=t[1];if(P.length){if(null!=e){var u=k-e;u&&(d={action:n,location:a,retry:function(){_(-1*u)}},_(u))}}else L(n)}}));var g=r.Pop,m=p(),k=m[0],y=m[1],b=s(),P=s();function w(n){return"string"===typeof n?n:h(n)}function E(n,t){return void 0===t&&(t=null),u((0,a.Z)({pathname:y.pathname,hash:"",search:""},"string"===typeof n?v(n):n,{state:t,key:l()}))}function x(n,t){return[{usr:n.state,key:n.key,idx:t},w(n)]}function S(n,t,e){return!P.length||(P.call({action:n,location:t,retry:e}),!1)}function L(n){g=n;var t=p();k=t[0],y=t[1],b.call({action:g,location:y})}function _(n){c.go(n)}null==k&&(k=0,c.replaceState((0,a.Z)({},c.state,{idx:k}),""));var A={get action(){return g},get location(){return y},createHref:w,push:function n(t,a){var u=r.Push,o=E(t,a);if(S(u,o,(function(){n(t,a)}))){var i=x(o,k+1),f=i[0],s=i[1];try{c.pushState(f,"",s)}catch(l){e.location.assign(s)}L(u)}},replace:function n(t,e){var a=r.Replace,u=E(t,e);if(S(a,u,(function(){n(t,e)}))){var o=x(u,k),i=o[0],f=o[1];c.replaceState(i,"",f),L(a)}},go:_,back:function(){_(-1)},forward:function(){_(1)},listen:function(n){return b.push(n)},block:function(n){var t=P.push(n);return 1===P.length&&e.addEventListener(o,f),function(){t(),P.length||e.removeEventListener(o,f)}}};return A}function f(n){n.preventDefault(),n.returnValue=""}function s(){var n=[];return{get length(){return n.length},push:function(t){return n.push(t),function(){n=n.filter((function(n){return n!==t}))}},call:function(t){n.forEach((function(n){return n&&n(t)}))}}}function l(){return Math.random().toString(36).substr(2,8)}function h(n){var t=n.pathname,e=void 0===t?"/":t,r=n.search,a=void 0===r?"":r,u=n.hash,o=void 0===u?"":u;return a&&"?"!==a&&(e+="?"===a.charAt(0)?a:"?"+a),o&&"#"!==o&&(e+="#"===o.charAt(0)?o:"#"+o),e}function v(n){var t={};if(n){var e=n.indexOf("#");e>=0&&(t.hash=n.substr(e),n=n.substr(0,e));var r=n.indexOf("?");r>=0&&(t.search=n.substr(r),n=n.substr(0,r)),n&&(t.pathname=n)}return t}}}]);