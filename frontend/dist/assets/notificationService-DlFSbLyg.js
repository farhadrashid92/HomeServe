import{c as r,a as o}from"./index-B77BuYkm.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=r("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=r("Save",[["path",{d:"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",key:"1owoqh"}],["polyline",{points:"17 21 17 13 7 13 7 21",key:"1md35c"}],["polyline",{points:"7 3 7 8 15 8",key:"8nz8an"}]]);function c(s){const i="=".repeat((4-s.length%4)%4),n=(s+i).replace(/\-/g,"+").replace(/_/g,"/"),a=window.atob(n),t=new Uint8Array(a.length);for(let e=0;e<a.length;++e)t[e]=a.charCodeAt(e);return t}const y=async()=>{if(!("serviceWorker"in navigator)||!("PushManager"in window))throw new Error("Push messaging is not supported by your device browser.");if(await Notification.requestPermission()!=="granted")throw new Error("Notification permission denied by user.");const i=await navigator.serviceWorker.ready,a=(await o.get("/notifications/vapid-key")).data.publicKey,t=c(a);let e=await i.pushManager.getSubscription();return e&&await e.unsubscribe(),e=await i.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:t}),await o.post("/notifications/subscribe",{subscription:e}),!0};export{u as B,l as S,y as e};
