/* ---------- sfx ---------- */
let lastPop=0;
const SFX={
 coin(gold){if(!AU.ctx)return;const t=T();if(gold)[1046,1318,1568,2093].forEach((f,i)=>osc('sine',f,t+i*.05,.25,.07));else{osc('sine',1500,t,.08,.07);osc('sine',2000,t+.05,.15,.06)}},
 place(){if(!AU.ctx)return;const t=T();osc('triangle',220,t,.14,.22,{f2:90});noise(t,.1,.08,{f:500})},
 pop(){if(!AU.ctx)return;const n=performance.now();if(n-lastPop<70)return;lastPop=n;const t=T();osc('square',420,t,.05,.03,{f2:200});noise(t,.04,.04,{f:2500})},
 thwack(){if(!AU.ctx)return;noise(T(),.06,.07,{f:900,q:2})},
 splash(){if(!AU.ctx)return;noise(T(),.28,.07,{f:900,f2:2600,q:.7})},
 zap(lv){if(!AU.ctx)return;const t=T();noise(t,.2,lv>1?.14:.09,{type:'highpass',f:3000});osc('sawtooth',lv>1?180:420,t,.22,lv>1?.07:.05,{f2:lv>1?50:110,vib:[70,90]});if(lv>1){osc('square',90,t,.3,.05,{vib:[45,40]});osc('sine',1800,t,.15,.03,{f2:3000})}},
 clang(pan){if(!AU.ctx)return;const t=T();osc('square',1240,t,.3,.04,{f2:980,pan});osc('triangle',1870,t,.35,.035,{pan});osc('sine',520,t,.4,.04,{pan})},
 boom(){if(!AU.ctx)return;const t=T();noise(t,.7,.45,{type:'lowpass',f:900,f2:60});osc('sine',100,t,.6,.45,{f2:28})},
 crunch(){if(!AU.ctx)return;noise(T(),.12,.12,{f:500,q:1.5})},
 die(){if(!AU.ctx)return;const t=T();osc('sine',620,t,.3,.06,{f2:160});noise(t,.2,.05,{f:1200,f2:300})},
 mower(){if(!AU.ctx)return;const t=T();noise(t,1.4,.18,{type:'lowpass',f:320});osc('sawtooth',62,t,1.4,.07,{vib:[28,12]})},
 horn(k){if(!AU.ctx)return;const t=T(),f=k=='truck'?175:440;osc('square',f,t,.4,.06);osc('square',f*1.26,t,.4,.05);noise(t,1,.06,{type:'lowpass',f:400})},
 bad(){if(!AU.ctx)return;osc('sawtooth',140,T(),.2,.06,{f2:80})},
 fanfare(){if(!AU.ctx)return;const t=T();[[67,0,.1],[72,.11,.1],[76,.22,.1],[79,.33,.1],[76,.46,.1],[84,.6,.9]].forEach(([m,d,l])=>{xylo(m+12,t+d,.12);organ(m,t+d,l,.05);piano(m-12,t+d,l,.5)});
  DR.k(t);DR.s(t+.33);DR.k(t+.6);DR.cr(t+.6,.9);DR.tp(t+.6,36,.6)},
 reveal(){if(!AU.ctx)return;const t=T();[72,76,79,84,88].forEach((m,i)=>glock(m+12,t+i*.07,.06))},
 ominous(){if(!AU.ctx)return;const t=T();osc('sawtooth',73,t,1.8,.13,{filter:'lowpass',ff:420});osc('sawtooth',103.8,t,1.8,.11,{filter:'lowpass',ff:420});noise(t,1.6,.12,{type:'lowpass',f:220});osc('sine',1108,t+.25,1.3,.03,{vib:[6,25]})},
 lose(){if(!AU.ctx)return;const t=T();[196,185,175,165].forEach((f,i)=>osc('sawtooth',f,t+i*.42,i==3?1.2:.38,.07,{filter:'lowpass',ff:900,vib:i==3?[6,8]:null}))},
 siren(){if(!AU.ctx)return;osc('sawtooth',320,T(),1.6,.05,{vib:[3,130],filter:'lowpass',ff:1600})},
 sting(){if(!AU.ctx)return;const t=T();noise(t,.9,.2,{type:'lowpass',f:320});osc('sawtooth',82,t,.9,.08,{vib:[28,18]});osc('sine',41,t,.9,.15)},
 plant(){if(!AU.ctx)return;const t=T();osc('sine',523,t,.15,.06);osc('sine',784,t+.08,.2,.05)},
 leaf(){if(!AU.ctx)return;const t=T();osc('sine',1568,t,.3,.05);osc('sine',2349,t+.06,.35,.04)},
 suck(){if(!AU.ctx)return;noise(T(),.7,.15,{f:300,f2:2400,q:2})},
 click(){if(!AU.ctx)return;osc('triangle',660,T(),.06,.06)},
};
function voice(type,pan=0,vol=1){if(!AU.ctx)return;const t=T(),v=vol,o={pan};
 switch(type){
 case 'kit':osc('sawtooth',1150,t,.25,.035*v,{f2:850,filter:'bandpass',ff:1600,q:2,pan});break;
 case 'fat':osc('sawtooth',330,t,.85,.06*v,{f2:210,filter:'bandpass',ff:600,q:2,pan});break;
 case 'ath':osc('square',520,t,.12,.025*v,{f2:900,pan});osc('square',720,t+.13,.12,.025*v,{f2:1100,pan});break;
 case 'vac':noise(t,.9,.06*v,{type:'lowpass',f:500,pan});osc('sawtooth',120,t,.9,.02*v,o);break;
 case 'mom':osc('sawtooth',700,t,.3,.04*v,{f2:900,filter:'bandpass',ff:1200,q:2,pan});osc('sawtooth',900,t+.3,.35,.04*v,{f2:600,filter:'bandpass',ff:1200,q:2,pan});break;
 case 'lead':osc('sawtooth',260,t,1.1,.07*v,{f2:170,filter:'bandpass',ff:700,q:2,vib:[8,15],pan});break;
 case 'skate':noise(t,.6,.05*v,{f:2500,q:3,pan});break;
 case 'swim':osc('sine',300,t,.15,.08*v,{f2:900,pan});osc('sine',260,t+.16,.15,.06*v,{f2:800,pan});break;
 case 'ghost':osc('sine',380,t,1.5,.06*v,{f2:290,vib:[5,25],pan});break;
 case 'robo':[660,440,880].forEach((f,i)=>osc('square',f,t+i*.12,.1,.022*v,o));break;
 case 'basin':SFX.clang(pan);break;
 case 'owner':osc('sine',150,t,1.2,.08*v,{f2:118,vib:[3,8],pan});break;
 case 'boss':noise(t,1.6,.16*v,{type:'lowpass',f:400,pan});osc('sawtooth',68,t,1.6,.08*v,{vib:[6,10],pan});break;
 case 'box':noise(t,.3,.05*v,{f:400,q:2,pan});break;
 default:osc('sawtooth',650,t,.45,.05*v,{f2:420,filter:'bandpass',ff:1100,q:2,pan})}}
