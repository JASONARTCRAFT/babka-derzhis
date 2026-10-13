/* ---------- audio engine ---------- */
const AU={ctx:null,mus:null,sfx:null,noise:null,rev:null};
function makeIR(C,sec){const len=C.sampleRate*sec|0,b=C.createBuffer(2,len,C.sampleRate);
 for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.4)*(i<C.sampleRate*.012?i/(C.sampleRate*.012):1)}return b}
function auInit(){
 if(AU.ctx){if(AU.ctx.state=='suspended')AU.ctx.resume();return}
 try{const C=new(window.AudioContext||window.webkitAudioContext)();AU.ctx=C;
  const comp=C.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(C.destination);
  AU.rev=C.createConvolver();AU.rev.buffer=makeIR(C,2.6);const wet=C.createGain();wet.gain.value=.32;AU.rev.connect(wet).connect(comp);
  AU.mus=C.createGain();AU.mus.connect(comp);const ms=C.createGain();ms.gain.value=.55;AU.mus.connect(ms).connect(AU.rev);
  AU.sfx=C.createGain();AU.sfx.connect(comp);const ss=C.createGain();ss.gain.value=.12;AU.sfx.connect(ss).connect(AU.rev);
  const b=C.createBuffer(1,C.sampleRate,C.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.noise=b;
  applyVol();if(MUS.want){const w=MUS.want;MUS.cur=null;music(w,MUS.mode)}}catch(e){}}
addEventListener('pointerdown',auInit);addEventListener('keydown',auInit);
function applyVol(){if(!AU.ctx)return;const s=save.set;AU.mus.gain.value=s.musicOn?s.music*1.25:0;AU.sfx.gain.value=s.sfxOn?s.sfx:0}
const T=()=>AU.ctx.currentTime;
function osc(type,f,t,d,v,o={}){const C=AU.ctx;if(!C)return;const s=C.createOscillator(),g=C.createGain();s.type=type;s.frequency.setValueAtTime(f,t);
 if(o.f2)s.frequency.exponentialRampToValueAtTime(o.f2,t+d);
 if(o.vib){const l=C.createOscillator(),lg=C.createGain();l.frequency.value=o.vib[0];lg.gain.value=o.vib[1];l.connect(lg).connect(s.frequency);l.start(t);l.stop(t+d+.05)}
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(v,.0002),t+(o.a||.006));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 let n=s;if(o.filter){const fl=C.createBiquadFilter();fl.type=o.filter;fl.frequency.value=o.ff||1200;fl.Q.value=o.q||1;n.connect(fl);n=fl}
 n.connect(g);let out=g;if(o.pan!=null&&C.createStereoPanner){const p=C.createStereoPanner();p.pan.value=clamp(o.pan,-1,1);g.connect(p);out=p}
 out.connect(o.dest||AU.sfx);s.start(t);s.stop(t+d+.05)}
function noise(t,d,v,o={}){const C=AU.ctx;if(!C)return;const s=C.createBufferSource();s.buffer=AU.noise;const f=C.createBiquadFilter();f.type=o.type||'bandpass';
 f.frequency.setValueAtTime(o.f||1000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+d);f.Q.value=o.q||1;
 const g=C.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(v,.0002),t+(o.a||.005));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 s.connect(f).connect(g);let out=g;if(o.pan!=null&&C.createStereoPanner){const p=C.createStereoPanner();p.pan.value=clamp(o.pan,-1,1);g.connect(p);out=p}
 out.connect(o.dest||AU.sfx);s.start(t,Math.random()*.5);s.stop(t+d+.05)}

/* ---------- instruments (all synthesized) ---------- */
const mf=m=>440*Math.pow(2,(m-69)/12);
const NOTE={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
const nm=s=>{const m=s.match(/^([A-G][#b]?)(\d)$/);return(+m[2]+1)*12+NOTE[m[1]]};
const toks=s=>s.trim().split(/\s+/).map(t=>t=='.'?null:nm(t));
function piano(m,t,dur,vel,dest,pan=0){const C=AU.ctx,f=mf(m),out=C.createGain();out.gain.value=vel*.11;
 if(C.createStereoPanner){const p=C.createStereoPanner();p.pan.value=clamp((m-64)/40+pan,-.7,.7);out.connect(p);p.connect(dest||AU.mus)}else out.connect(dest||AU.mus);
 const B=.0004,dec=2.6*Math.sqrt(262/f),rel=.1,bright=.6+vel*.6,end=t+dur+rel*7;
 const np=MUS.cur=='game'&&MUS.I>.5?4:7;for(let n=1;n<=np;n++){const fn=f*n*Math.sqrt(1+B*n*n);if(fn>11000)break;
  const o=C.createOscillator(),gn=C.createGain(),a=(n==1?1:n==2?.6:n==3?.33:.42/(n*n))*(n>2?bright:1),Tn=dec/Math.pow(n,.75);
  o.frequency.value=fn*(n==1?1.0007:1);gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(a,t+.004);gn.gain.setTargetAtTime(0,t+.004,Tn*.32);gn.gain.setTargetAtTime(0,t+dur,rel);
  o.connect(gn).connect(out);o.start(t);o.stop(end)}
 const o2=C.createOscillator(),g2=C.createGain();o2.frequency.value=f*.9993;g2.gain.setValueAtTime(0,t);g2.gain.linearRampToValueAtTime(.55,t+.004);g2.gain.setTargetAtTime(0,t+.004,dec*.4);g2.gain.setTargetAtTime(0,t+dur,rel);o2.connect(g2).connect(out);o2.start(t);o2.stop(end);
 const s=C.createBufferSource(),bf=C.createBiquadFilter(),hg=C.createGain();s.buffer=AU.noise;bf.type='bandpass';bf.frequency.value=Math.min(f*5,6000);bf.Q.value=1.2;
 hg.gain.setValueAtTime(vel*.5,t);hg.gain.exponentialRampToValueAtTime(.0001,t+.035);s.connect(bf).connect(hg).connect(out);s.start(t,Math.random()*.5);s.stop(t+.05)}
function organ(m,t,dur,v){const C=AU.ctx,f=mf(m),g=C.createGain(),lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.025);g.gain.setValueAtTime(v,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+.07);
 const trem=C.createOscillator(),tg=C.createGain();trem.frequency.value=6.6;tg.gain.value=v*.3;trem.connect(tg).connect(g.gain);
 [[1,1,'sine'],[2,.55,'sine'],[3,.25,'sine'],[4,.2,'sine'],[1,.12,'square']].forEach(([k,a,ty])=>{const o=C.createOscillator(),og=C.createGain();o.type=ty;o.frequency.value=f*k;
  const vb=C.createOscillator(),vg=C.createGain();vb.frequency.value=6.6;vg.gain.value=f*k*.004;vb.connect(vg).connect(o.frequency);og.gain.value=a;o.connect(og).connect(lp);o.start(t);o.stop(t+dur+.1);vb.start(t);vb.stop(t+dur+.1)});
 lp.connect(g).connect(AU.mus);trem.start(t);trem.stop(t+dur+.1)}
function xylo(m,t,v){const f=mf(m);osc('sine',f,t,.32,v,{dest:AU.mus,a:.002});osc('sine',f*3.93,t,.09,v*.35,{dest:AU.mus,a:.002});noise(t,.02,v*.4,{f:f*4,q:2,dest:AU.mus})}
function glock(m,t,v){const f=mf(m);osc('sine',f,t,1.1,v,{dest:AU.mus,a:.002});osc('sine',f*2.76,t,.4,v*.25,{dest:AU.mus,a:.002})}
function tuba(m,t,dur,v){const f=mf(m);osc('sawtooth',f*.96,t,dur,v,{f2:f,a:.025,filter:'lowpass',ff:520,dest:AU.mus});osc('sine',f,t,dur,v*.8,{a:.02,dest:AU.mus})}
const DR={
 k:(t,v=1)=>osc('sine',140,t,.18,.42*v,{f2:42,dest:AU.mus}),
 s:(t,v=1)=>{noise(t,.14,.2*v,{f:2200,q:.8,dest:AU.mus});osc('triangle',190,t,.08,.12*v,{f2:150,dest:AU.mus})},
 h:(t,v=1)=>noise(t,.045,.06*v,{type:'highpass',f:8000,dest:AU.mus}),
 w:(t,v=1,hi)=>{osc('sine',hi?1250:880,t,.07,.16*v,{a:.001,dest:AU.mus});noise(t,.02,.08*v,{f:hi?2500:1800,q:4,dest:AU.mus})},
 cb:(t,v=1)=>{osc('square',560,t,.25,.035*v,{filter:'bandpass',ff:800,q:2,dest:AU.mus});osc('square',845,t,.25,.035*v,{filter:'bandpass',ff:800,q:2,dest:AU.mus})},
 cr:(t,v=1)=>{noise(t,1.6,.16*v,{type:'highpass',f:5000,dest:AU.mus});noise(t,.9,.08*v,{f:9000,q:.6,dest:AU.mus})},
 tp:(t,m,v=1)=>{const f=mf(m);osc('sine',f*1.03,t,.9,.3*v,{f2:f,dest:AU.mus});noise(t,.08,.06*v,{type:'lowpass',f:400,dest:AU.mus})},
 sw:(t,up,v=1)=>osc('sine',up?520:1500,t,.5,.07*v,{f2:up?1600:480,vib:[9,25],dest:AU.mus}),
 hk:(t,v=1)=>{osc('sawtooth',340,t,.22,.06*v,{f2:300,filter:'bandpass',ff:900,q:3,dest:AU.mus});osc('square',382,t,.22,.04*v,{f2:338,filter:'bandpass',ff:900,q:3,dest:AU.mus})}};

/* ---------- music ---------- */
const CH={Dm:[50,[0,3,7]],Dm6:[50,[0,3,7,9]],Gm:[43,[0,3,7]],Bb7:[46,[0,4,7,10]],Bb:[46,[0,4,7]],C:[48,[0,4,7]],C7:[48,[0,4,7,10]],A7:[45,[0,4,7,10]],D7:[50,[0,4,7,10]],G7:[43,[0,4,7,10]],F:[41,[0,4,7]],Fm:[41,[0,3,7]],Cm:[48,[0,3,7]],Ab:[44,[0,4,7,10]],
 Cmaj7:[48,[0,4,7,11]],Am7:[45,[0,3,7,10]],Fmaj7:[41,[0,4,7,11]],G6:[43,[0,4,7,9]],Em7:[40,[0,3,7,10]],Dm7:[50,[0,3,7,10]],G7s:[43,[0,5,7,10]]};
const SONG={
 calm:{chords:['Cmaj7','Am7','Fmaj7','G6','Em7','Am7','Dm7','G7s'],
  mel:['E5 . . . G5 . E5 .','C5 . . . . . B4 .','A4 . . C5 . . F5 .','E5 . . . D5 . . .','G5 . . . B5 . G5 .','E5 . . . . . D5 .','C5 . . D5 . . F5 .','E5 . . . D5 . . .'].map(toks)},
 A:{chords:['C','A7','D7','G7','C','C7','F','G7'],
  mel:['E5 G5 . E5 C5 . G4 .','C#5 E5 . C#5 A4 . E4 .','F#5 A5 . F#5 D5 . C5 .','B4 D5 F5 . G5 . . .','E5 . E5 F5 G5 . E5 .','Bb4 C5 E5 G5 Bb5 . G5 .','A5 . F5 . Ab5 . F5 .','G5 F5 D5 B4 C5 . . .'].map(toks)},
 B:{chords:['Cm','Cm','Ab','G7','Cm','Fm','Ab','G7'],
  mel:['C5 Eb5 G5 Eb5 C5 Eb5 G5 Eb5','C6 . Bb5 G5 Ab5 G5 F5 Eb5','C5 Eb5 Ab5 Eb5 C5 Eb5 Ab5 C6','B5 . G5 . F5 . D5 B4','C5 C5 Eb5 C5 G5 G5 Eb5 G5','Ab5 G5 F5 Eb5 D5 C5 B4 C5','Eb5 F5 G5 Ab5 B5 . . .','G5 F#5 G5 F#5 G5 . B4 .'].map(toks)}};
const MUS={cur:null,want:null,mode:'day',step:0,next:0,timer:null,I:0,target:0,force:null,bpm:110,sec:'A'};
function voicing(name,lo,hi){const[r,iv]=CH[name];const out=[];iv.forEach(i=>{let m=r+i;while(m<lo)m+=12;while(m>hi)m-=12;out.push(m)});return out.sort((a,b)=>a-b)}
function noteLen(arr,i){let n=1;while(i+n<arr.length&&arr[i+n]==null)n++;return n}
const hum=()=>(Math.random()-.5)*.012;
const TRK={
 calm:{step(s,t){const slow=MUS.cur=='garden',sp=60/(slow?62:74)/2,bar=Math.floor(s/8)%8,st=s%8,sg=SONG.calm,ch=CH[sg.chords[bar]],r=ch[0]-12,iv=ch[1];
  const third=iv[1],arp=[r,r+7,r+12,r+12+third,r+19,r+12+third,r+12,r+7];
  piano(arp[st],t+hum(),sp*3.2,.32+Math.random()*.08,AU.mus);
  if(st==0)piano(r-12>=28?r-12:r,t,sp*7,.28,AU.mus);
  const m=sg.mel[bar][st];if(m){const L=noteLen(sg.mel[bar],st);piano(m+(slow?0:0),t+hum()+.01,sp*L*1.1,.5+Math.random()*.1,AU.mus);if(slow)glock(m+12,t,.03)}
  return sp}},
 game:{step(s,t){const bar=Math.floor(s/16),st=s%16;
  if(st==0){const tg=MUS.force!=null?MUS.force:MUS.target;MUS.I+=(tg-MUS.I)*(tg>MUS.I?.45:.22);MUS.bpm=lerp(104,156,Math.pow(MUS.I,1.15));
   if(bar%4==0){const ns=MUS.mode!='day'?'B':(MUS.I>.55?'B':'A');if(ns!=MUS.sec&&MUS.I>.45)DR.cr(t,.8);MUS.sec=ns}}
  const I=MUS.I,sp=60/MUS.bpm/4,Lv=(th,w=.12)=>clamp((I-th)/w,0,1),sg=SONG[MUS.sec],bi=bar%8,cn=sg.chords[bi],[root]=CH[cn];
  const bass=root-12>=31?root-12:root,low=MUS.sec=='B'&&I<.35;
  if(st==0||st==8){const bn=st==0?bass:bass+7;piano(bn,t+hum(),sp*3,.42+I*.15);if(Lv(.2)>0)tuba(bn,t,sp*2.6,.11*Lv(.2))}
  if(st==4||st==12){const v=voicing(cn,55,68);v.forEach((m,k)=>piano(m,t+k*.004+hum(),low?sp*.6:sp*1.6,.3+I*.12))}
  if(I>.55&&(st==6||st==14)){voicing(cn,60,72).forEach(m=>piano(m,t,sp*.7,.22*Lv(.55)))}
  if(st%2==0){const mel=sg.mel[bi],k=st/2,m=mel[k];if(m){const L=noteLen(mel,k)*2;
   piano(m,t+hum(),sp*L*(low?.5:.95),.45+I*.25);
   if(Lv(.35)>0)organ(m,t,sp*L*.92,.045*Lv(.35));
   if(Lv(.6)>0)xylo(m+12,t,.07*Lv(.6));
   if(I<.3&&MUS.sec=='A'&&k%2==0)glock(m+12,t,.02)}}
  if(Lv(.5)>0&&st==0)organ(voicing(cn,52,64)[0],t,sp*15,.018*Lv(.5));
  if(Lv(.2)>0&&st%4==2)DR.w(t,.7*Lv(.2),st==6||st==14);
  if(Lv(.3)>0&&st%2==0)DR.h(t,.7*Lv(.3)*(st%4==2?1:.6));
  if(Lv(.4)>0){if(st==0||st==8||(I>.7&&st==10))DR.k(t,Lv(.4));if(st==4||st==12)DR.s(t,.8*Lv(.4))}
  if(Lv(.65)>0&&(st==6||st==14))DR.cb(t,Lv(.65));
  if(Lv(.6)>0&&bar%4==3&&st>=12)DR.s(t,.35+.15*(st-12)*Lv(.6));
  if(Lv(.8)>0&&bar%2==0&&st==0)DR.cr(t,.6*Lv(.8));
  if(Lv(.75)>0&&bi==7&&st>=8)DR.tp(t,43,.4*Lv(.75));
  if(Lv(.7)>0&&bar%4==1&&st==8)DR.sw(t,bar%8==1,Lv(.7));
  if(Lv(.85)>0&&bar%2==1&&st==14&&Math.random()<.6)DR.hk(t,Lv(.85));
  if(Lv(.7)>0&&bar%2==1&&st>=12){const nx=sg.mel[(bi+1)%8][0]||72;xylo(nx+12-(16-st),t,.06*Lv(.7))}
  return sp}}};

/* ---------- main theme: sly cat-noir swing ---------- */
function pizz(m,t,d,v){const f=mf(m);osc('triangle',f,t,Math.min(d,.5),v,{a:.004,filter:'lowpass',ff:900,dest:AU.mus});osc('sine',f,t,Math.min(d,.6),v*.9,{a:.004,dest:AU.mus});noise(t,.03,v*.25,{f:f*3,q:2,dest:AU.mus})}
function whistle(m,t,d,v){const C=AU.ctx,f=mf(m),o=C.createOscillator(),g=C.createGain(),vb=C.createOscillator(),vg=C.createGain();
 o.type='sine';o.frequency.setValueAtTime(f*.97,t);o.frequency.exponentialRampToValueAtTime(f,t+.05);vb.frequency.value=5.8;vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.012,t+.25);vb.connect(vg).connect(o.frequency);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.03);g.gain.setValueAtTime(v*.85,t+Math.max(.04,d-.05));g.gain.linearRampToValueAtTime(0,t+d+.04);
 o.connect(g).connect(AU.mus);o.start(t);o.stop(t+d+.1);vb.start(t);vb.stop(t+d+.1);noise(t,Math.min(d,.3),v*.08,{type:'highpass',f:4000,dest:AU.mus})}
function trumpet(m,t,d,v){const C=AU.ctx,f=mf(m),o=C.createOscillator(),bp=C.createBiquadFilter(),lp=C.createBiquadFilter(),g=C.createGain(),vb=C.createOscillator(),vg=C.createGain();
 o.type='sawtooth';o.frequency.value=f;vb.frequency.value=5.5;vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.008,t+.2);vb.connect(vg).connect(o.frequency);
 bp.type='bandpass';bp.frequency.value=1300;bp.Q.value=2.2;lp.type='lowpass';lp.frequency.setValueAtTime(800,t);lp.frequency.linearRampToValueAtTime(2600,t+.08);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.035);g.gain.setValueAtTime(v*.8,t+Math.max(.05,d-.05));g.gain.linearRampToValueAtTime(0,t+d+.05);
 o.connect(bp).connect(lp).connect(g).connect(AU.mus);o.start(t);o.stop(t+d+.1);vb.start(t);vb.stop(t+d+.1)}
function vibes(m,t,v){const f=mf(m),C=AU.ctx,g=C.createGain(),tr=C.createOscillator(),tg=C.createGain();tr.frequency.value=5;tg.gain.value=v*.35;tr.connect(tg).connect(g.gain);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+1.6);
 [[1,1],[4,.12],[10,.03]].forEach(([k,a])=>{const o=C.createOscillator(),og=C.createGain();o.frequency.value=f*k;og.gain.setValueAtTime(a,t);og.gain.exponentialRampToValueAtTime(.0001,t+(k>1?.3:1.6));o.connect(og).connect(g);o.start(t);o.stop(t+1.7)});
 g.connect(AU.mus);tr.start(t);tr.stop(t+1.7)}
const DR2={snap:(t,v=1)=>{noise(t,.035,.22*v,{f:2600,q:3,dest:AU.mus});osc('sine',1800,t,.02,.05*v,{dest:AU.mus})},
 brush:(t,v=1)=>noise(t,.11,.04*v,{type:'highpass',f:3200,dest:AU.mus}),
 ride:(t,v=1)=>{noise(t,.35,.05*v,{type:'highpass',f:6500,dest:AU.mus});osc('sine',4200,t,.25,.008*v,{dest:AU.mus})},
 meow:(t,v=1)=>{osc('sawtooth',880,t,.55,.05*v,{f2:560,filter:'bandpass',ff:1300,q:2.5,vib:[7,18],dest:AU.mus});osc('sawtooth',1320,t,.3,.015*v,{f2:900,filter:'bandpass',ff:2400,q:3,dest:AU.mus})}};
const THEME={bpm:118,intro:['Dm6','Dm6','Dm6','A7'],secs:[
 {k:'A',ch:['Dm','Dm','Gm','Gm','Dm','Bb7','A7','Dm'],mel:['D5 . F5 A5 . G#5 A5 .','D6 . . C6 A5 . F5 .','G5 . Bb5 D6 . C#6 D6 .','G6 . . F6 D6 . Bb5 .','A5 . F5 D5 . F5 A5 .','Ab5 . G5 F5 D5 . Bb4 .','C#5 E5 G5 Bb5 A5 . E5 .','D5 . . . . . . .']},
 {k:'A2',ch:['Dm','Dm','Gm','Gm','Dm','Bb7','A7','Dm'],mel:['D5 . F5 A5 . G#5 A5 .','D6 . . C6 A5 . F5 .','G5 . Bb5 D6 . C#6 D6 .','G6 . . F6 D6 . Bb5 .','A5 . F5 D5 . F5 A5 .','Ab5 . G5 F5 D5 . Bb4 .','C#5 E5 G5 Bb5 A5 G5 F5 E5','D5 . A4 . D5 . . .']},
 {k:'B',ch:['F','F','Bb','Bb','Gm','C7','A7','A7'],mel:['A5 . C6 . A5 F5 . .','G5 A5 C6 D6 C6 . A5 .','Bb5 . D6 . Bb5 F5 . .','A5 Bb5 D6 F6 D6 . Bb5 .','G5 . Bb5 . D6 . G6 .','E6 . D6 C6 Bb5 . G5 .','A5 . C#6 E6 G6 . F6 E6','C#6 . . . A5 . . .']},
 {k:'A3',ch:['Dm','Dm','Gm','Gm','Dm','Bb7','A7','Dm'],mel:['D5 . F5 A5 . G#5 A5 .','D6 . . C6 A5 . F5 .','G5 . Bb5 D6 . C#6 D6 .','G6 . . F6 D6 . Bb5 .','A5 . F5 D5 . F5 A5 .','Ab5 . G5 F5 D5 . Bb4 .','C#5 E5 G5 Bb5 A5 G5 F5 E5','D5 . A4 . D5 . . .']}]};
THEME.secs.forEach(sc=>sc.mel=sc.mel.map(toks));
function walk(cn,next,q){const[r0,iv]=CH[cn];let r=r0;while(r>47)r-=12;while(r<36)r+=12;let nr=CH[next][0];while(nr>47)nr-=12;while(nr<36)nr+=12;
 return[r,r+iv[1],r+7,nr+(q%2?-1:1)][q]}
TRK.theme={step(s,t){const beat=60/THEME.bpm,st=s%8,sw=st%2==0?beat*.64:beat*.36,bar=Math.floor(s/8),intro=bar<4,
 b=intro?bar:(bar-4)%32,sec=intro?null:THEME.secs[Math.floor(b/8)],bi=intro?bar:b%8,cn=intro?THEME.intro[bar]:sec.ch[bi],
 nx=intro?(bar<3?THEME.intro[bar+1]:'Dm'):(bi<7?sec.ch[bi+1]:THEME.secs[(Math.floor(b/8)+1)%4].ch[0]),k=sec?sec.k:'I',full=k=='A3';
 if(st%2==0)pizz(walk(cn,nx,st/2),t+hum()*.5,beat*.9,.2+(st==0?.04:0));
 if(st==2||st==6)DR2.snap(t,k=='B'?.7:1);
 if(k=='B'){if(st!=1&&st!=5)DR2.ride(t,st%2?.6:1)}else if(!intro||bar>=2)DR2.brush(t,st%2?.6:1);
 if(full&&(st==0||st==4))DR.k(t,.45);
 if(!intro||bar>=2){if(st==0||st==3)voicing(cn,57,70).forEach((m,i)=>vibes(m,t+i*.006,st==0?.035:.028))}
 if(k=='B'&&st==0)organ(voicing(cn,53,65)[0],t,beat*3.8,.016);
 if(sec){const mel=sec.mel[bi],m=mel[st];if(m){let L=1;while(st+L<8&&mel[st+L]==null)L++;const d=Math.min(L*beat*.5,beat*2.2);
   if(k=='A')whistle(m,t,d*.95,.07);
   else if(k=='A2'){trumpet(m-12,t,d*.9,.06);if(bi>=6)xylo(m+12,t,.04)}
   else if(k=='B'){piano(m,t,d,.5);whistle(m,t,d*.9,.03)}
   else{whistle(m,t,d*.95,.06);trumpet(m-12,t,d*.9,.045);if(bi>=6)xylo(m+12,t,.05)}}
  if(k!='B'&&bi==7&&st==4)DR2.meow(t,1);
  if(bi==7&&st==7&&k=='B')DR.cr(t,.5)}
 if(intro&&bar==3&&st==6)DR2.meow(t,.8);
 if(!intro&&k!='B'&&(bi==1||bi==3)&&st==5&&Math.random()<.6)piano(voicing(cn,62,76)[2]||74,t,beat*.4,.35);
 return sw}};
function tick(){const C=AU.ctx;if(!C||!MUS.cur)return;if(MUS.next<C.currentTime-.3)MUS.next=C.currentTime+.05;
 const tr=MUS.cur=='game'?TRK.game:MUS.cur=='menu'?TRK.theme:TRK.calm;while(MUS.next<C.currentTime+.15){const d=tr.step(MUS.step,MUS.next);MUS.next+=d;MUS.step++}}
function music(name,mode){if(['day','night','boss'].includes(name)){mode=name;name='game'}
 MUS.want=name;if(mode)MUS.mode=mode;if(!AU.ctx||MUS.cur===name)return;
 MUS.cur=name;MUS.step=0;MUS.next=AU.ctx.currentTime+.12;if(name=='game'){MUS.I=.05;MUS.sec=MUS.mode=='day'?'A':'B'}if(!MUS.timer)MUS.timer=setInterval(tick,25)}
function stopMusic(){MUS.cur=null;MUS.want=null}
function setMusicIntensity(v){MUS.target=clamp(v,0,1)}
