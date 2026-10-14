/* ---------- survival: «Ночная смена» ----------
 Endless waves on all 5 lanes, night street, every 5 waves a blueprint pick. Record = highest wave reached. */
const SURV_UNLOCK=5;
function beginSurvival(){const top=L[Math.max(save.lvl,SURV_UNLOCK)]||L[L.length-1],last=L[L.length-1];
 const lv={n:'Ночная смена',sub:'Волны без конца. Сколько продержится бабка?',rows:5,start:250,slots:Math.min(8,top.cards.length+(save.shop.mine?1:0)),
  cards:top.cards,ab:top.ab||[],shovel:true,night:1,cross:last.cross,pipes:last.pipes,poles:last.poles,swarm:[2,4],w:[],
  doors:[{c:13,s:'t'},{c:19,s:'t'},{c:15,s:'b'},{c:20,s:'b'}]};
 beginLevel(L.length-1,lv)}
function survPool(w){const all=['cat','kit','fat','box','basin','ath','vac','mom','lead','skate','swim','ghost','robo','owner'];return all.slice(0,Math.min(all.length,3+Math.floor(w/1.5)))}
function survStep(){if(S.phase!='play'||S.spawns.length||S.enemies.length>2)return;
 if(S.nextWave>S.t)return;S.wave++;S.lv.hpm=1+S.wave*.07;
 const pool=survPool(S.wave),n=3+Math.floor(S.wave*1.4),R=rng(S.wave*131+7);
 for(let k=0;k<n;k++){const type=pool[Math.floor(R()*pool.length)];S.spawns.push({t:S.t+1+k*Math.max(.6,1.8-S.wave*.06),type,d:Math.floor(R()*S.lv.doors.length),r:Math.floor(R()*S.rows)})}
 if(S.wave%10==0)S.spawns.push({t:S.t+n*.8,type:'boss',d:0,r:2});
 S.total+=S.spawns.length;S.nextWave=S.t+n*1.2+10;
 if(S.wave>1&&(S.wave-1)%5==0)survPerk()}
function survPerk(){const offers=Object.keys(BLUEPRINTS).filter(k=>!(S.survBp||{})[k]&&!bp(k)&&S.lv.cards.includes(BLUEPRINTS[k].u)).sort(()=>Math.random()-.5).slice(0,3);if(!offers.length)return;
 const card=k=>`<div class="bp"><canvas width="120" height="96" data-k="${BLUEPRINTS[k].u}"></canvas><b>${BLUEPRINTS[k].n}</b><span>${BLUEPRINTS[k].d}</span></div>`;
 overlay(`<div class="tag">Ночная смена · волна ${S.wave}</div><h2>Чертёж на эту смену</h2><div class="bps">${offers.map(card).join('')}</div>`,
  offers.map(k=>[BLUEPRINTS[k].n,()=>{S.survBp=S.survBp||{};S.survBp[k]=1;SFX.reveal()}]),'wide')}
function survLose(){const w=S.wave,best=Math.max(save.survBest||0,w),rec=w>(save.survBest||0);save.survBest=best;persist();
 setTimeout(()=>overlay(`<div class="tag">Ночная смена</div><h2>Продержались до волны ${w}</h2><canvas class="big" width="300" height="260" data-g="shock"></canvas><p>${rec?'Новый рекорд!':'Рекорд: волна '+best+'.'}</p>`,
  [['Ещё смену',beginSurvival],['Меню',toMenu,'alt']]),1100)}
