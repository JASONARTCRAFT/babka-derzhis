'use strict';
/* ---------- helpers ---------- */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,pick=a=>a[Math.random()*a.length|0];
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function el(x,cx,cy,rx,ry,c){x.fillStyle=c;x.beginPath();x.ellipse(cx,cy,Math.abs(rx),Math.abs(ry),0,0,7);x.fill()}
function rr(x,X,Y,w,h,r,c){x.fillStyle=c;x.beginPath();if(x.roundRect)x.roundRect(X,Y,w,h,r);else x.rect(X,Y,w,h);x.fill()}
function poly(x,c,...p){x.fillStyle=c;x.beginPath();x.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)x.lineTo(p[i],p[i+1]);x.closePath();x.fill()}
function ln(x,c,w,...p){x.strokeStyle=c;x.lineWidth=w;x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)x.lineTo(p[i],p[i+1]);x.stroke()}
function ring(x,cx,cy,r,c,w){x.strokeStyle=c;x.lineWidth=w;x.beginPath();x.arc(cx,cy,r,0,7);x.stroke()}
function lgrad(x,x0,y0,x1,y1,st){const g=x.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>g.addColorStop(o,c));return g}
function rgrad(x,cx,cy,r0,r1,st){const g=x.createRadialGradient(cx,cy,r0,cx,cy,r1);st.forEach(([o,c])=>g.addColorStop(o,c));return g}
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- save ---------- */
const DEF={lvl:0,stars:[],seen:{},kills:0,leaves:0,shop:{},garden:{pots:[{slot:0,p:null},{slot:1,p:null}],seeds:{catnip:1},known:{catnip:1},can:{uses:2,max:2,until:0},fert:1,cdLv:0},intro:false,won:{},perks:{},bp:{},deck:null,all:false,
 set:{music:.6,sfx:.8,musicOn:true,sfxOn:true}};
let save=JSON.parse(JSON.stringify(DEF));
try{const d=JSON.parse(localStorage.getItem('babka-v3'));if(d){Object.assign(save,d);save.set=Object.assign({},DEF.set,d.set||{})}}catch(e){}
function persist(){try{localStorage.setItem('babka-v3',JSON.stringify(save))}catch(e){}}
