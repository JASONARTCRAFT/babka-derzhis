/* ---------- audio engine: procedural music + sfx ---------- */
const AU={ctx:null,mus:null,sfx:null,noise:null};
function auInit(){
 if(AU.ctx){if(AU.ctx.state=='suspended')AU.ctx.resume();return}
 try{const C=new(window.AudioContext||window.webkitAudioContext)();AU.ctx=C;
  const comp=C.createDynamicsCompressor();comp.connect(C.destination);
  AU.mus=C.createGain();AU.mus.connect(comp);AU.sfx=C.createGain();AU.sfx.connect(comp);
  const b=C.createBuffer(1,C.sampleRate,C.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.noise=b;
  applyVol();if(MUS.want){const w=MUS.want;MUS.cur=null;music(w)}}catch(e){}}
addEventListener('pointerdown',auInit);addEventListener('keydown',auInit);
function applyVol(){if(!AU.ctx)return;const s=save.set;AU.mus.gain.value=s.musicOn?s.music*.55:0;AU.sfx.gain.value=s.sfxOn?s.sfx:0}
const T=()=>AU.ctx.currentTime;
function osc(type,f,t,d,v,o={}){const C=AU.ctx;if(!C)return;const s=C.createOscillator(),g=C.createGain();s.type=type;s.frequency.setValueAtTime(f,t);
 if(o.f2)s.frequency.exponentialRampToValueAtTime(o.f2,t+d);
 if(o.vib){const l=C.createOscillator(),lg=C.createGain();l.frequency.value=o.vib[0];lg.gain.value=o.vib[1];l.connect(lg).connect(s.frequency);l.start(t);l.stop(t+d+.05)}
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.a||.006));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 let n=s;if(o.filter){const fl=C.createBiquadFilter();fl.type=o.filter;fl.frequency.value=o.ff||1200;fl.Q.value=o.q||1;n.connect(fl);n=fl}
 n.connect(g);let out=g;if(o.pan!=null&&C.createStereoPanner){const p=C.createStereoPanner();p.pan.value=clamp(o.pan,-1,1);g.connect(p);out=p}
 out.connect(o.dest||AU.sfx);s.start(t);s.stop(t+d+.05)}
function noise(t,d,v,o={}){const C=AU.ctx;if(!C)return;const s=C.createBufferSource();s.buffer=AU.noise;const f=C.createBiquadFilter();f.type=o.type||'bandpass';
 f.frequency.setValueAtTime(o.f||1000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+d);f.Q.value=o.q||1;
 const g=C.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.a||.005));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 s.connect(f).connect(g);let out=g;if(o.pan!=null&&C.createStereoPanner){const p=C.createStereoPanner();p.pan.value=clamp(o.pan,-1,1);g.connect(p);out=p}
 out.connect(o.dest||AU.sfx);s.start(t,Math.random()*.5);s.stop(t+d+.05)}

/* ---------- music ---------- */
const NOTE={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
const nf=s=>{const m=s.match(/^([A-G]#?)(\d)$/);return 440*Math.pow(2,((+m[2]+1)*12+NOTE[m[1]]-69)/12)};
const seq=s=>s.trim().split(/\s+/).map(t=>t=='.'?null:nf(t));
const TR={
 menu:{bpm:104,li:'pluck',
  lead:seq('E5 . G5 . C6 . G5 . A5 . G5 . E5 . C5 . F5 . A5 . C6 . A5 . G5 . F5 . D5 . B4 . E5 . G5 . C6 . E6 . D6 . C6 . A5 . E5 . F5 . E5 . D5 . C5 . D5 . B4 . G4 . . .'),
  bass:seq('C3 . G3 . C3 . G3 . A2 . E3 . A2 . E3 . F2 . C3 . F2 . C3 . G2 . D3 . G2 . B2 .'),drums:'k...h...s...h...k...h...s...h.h.'},
 day:{bpm:128,li:'square',
  lead:seq('A4 . C5 . E5 . C5 . A4 . C5 . F5 . E5 . G4 . B4 . D5 . B4 . G#4 . B4 . E5 . D5 . E5 . . A5 G5 . E5 . F5 . . C5 A4 . C5 . D5 . . G5 F5 . D5 . E5 . D5 . C5 . B4 .'),
  bass:seq('A2 . A3 . E3 . A3 . F2 . F3 . C3 . F3 . G2 . G3 . D3 . G3 . E2 . E3 . G#2 . B2 .'),drums:'k.h.s.h.k.k.s.h.'},
 night:{bpm:92,li:'box',
  lead:seq('D5 . F5 . A5 . F5 . A#4 . D5 . F5 . D5 . G4 . A#4 . D5 . A#4 . A4 . C#5 . E5 . A5 .'),
  bass:seq('D2 . . . A2 . . . A#1 . . . F2 . . . G1 . . . D2 . . . A1 . . . C#2 . . .'),drums:'k.......h...s...k.......h..hs...'},
 boss:{bpm:146,li:'square',
  lead:seq('E5 . . E5 G5 . F#5 . E5 . . . B4 . . . E5 . . E5 A#5 . A5 . G5 . F#5 . D#5 . . .'),
  bass:seq('E2 E2 . E2 G2 . E2 . A#2 . A2 . G2 . F#2 .'),drums:'k.hsk.hsk.hsk.ss'},
 garden:{bpm:76,li:'bell',
  lead:seq('E5 . . G5 . . A5 . . . C6 . . . A5 . G5 . . E5 . . D5 . . . . . . . . .'),
  bass:seq('C3 . . . . . . . A2 . . . . . . . F2 . . . . . . . G2 . . . . . . .'),drums:''},
};
const MUS={cur:null,want:null,step:0,next:0,timer:null};
function inst(name,f,t,spb){const dest=AU.mus;
 if(name=='pluck'){osc('triangle',f,t,spb*1.8,.09,{dest});osc('sine',f*2,t,spb*.8,.025,{dest})}
 else if(name=='square')osc('square',f,t,spb*.9,.035,{dest,filter:'lowpass',ff:2400});
 else if(name=='box'){osc('sine',f*2,t,.7,.06,{dest});osc('triangle',f*4,t,.25,.012,{dest})}
 else if(name=='bell'){osc('sine',f,t,1.8,.07,{dest});osc('sine',f*2.01,t,1,.022,{dest})}
 else if(name=='bass')osc('triangle',f,t,spb*1.7,.15,{dest})}
function drum(c,t){const dest=AU.mus;
 if(c=='k')osc('sine',150,t,.16,.35,{f2:40,dest});else if(c=='s')noise(t,.12,.16,{f:1800,dest});else if(c=='h')noise(t,.04,.05,{type:'highpass',f:7000,dest})}
function tick(){const C=AU.ctx;if(!C||!MUS.cur)return;const tr=TR[MUS.cur],spb=60/tr.bpm/2;
 if(MUS.next<C.currentTime-.3)MUS.next=C.currentTime+.05;
 while(MUS.next<C.currentTime+.15){const s=MUS.step,t=MUS.next;
  const a=tr.lead[s%tr.lead.length];if(a)inst(tr.li,a,t,spb);const b=tr.bass[s%tr.bass.length];if(b)inst('bass',b,t,spb);
  if(tr.drums){const d=tr.drums[s%tr.drums.length];if(d!='.')drum(d,t)}
  MUS.next+=spb;MUS.step++}}
function music(name){MUS.want=name;if(!AU.ctx||MUS.cur===name)return;MUS.cur=name;MUS.step=0;MUS.next=AU.ctx.currentTime+.1;if(!MUS.timer)MUS.timer=setInterval(tick,30)}
function stopMusic(){MUS.cur=null;MUS.want=null}

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
 fanfare(){if(!AU.ctx)return;const t=T();[[392,0,.12],[523,.12,.12],[659,.24,.12],[784,.36,.12],[659,.5,.12],[1046,.64,.7]].forEach(([f,d,l])=>{osc('square',f,t+d,l,.05,{filter:'lowpass',ff:3000});osc('triangle',f,t+d,l+.1,.07)});[0,.36,.64].forEach(d=>drum('k',t+d))},
 reveal(){if(!AU.ctx)return;const t=T();[1046,1318,1568,2093,2637].forEach((f,i)=>osc('sine',f,t+i*.07,.6,.06))},
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
