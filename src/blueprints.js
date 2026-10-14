/* ---------- granddaughter's blueprints ----------
 After a won level the granddaughter brings 3 blueprints; the player keeps 1. Each one changes how a device works. */
const BLUEPRINTS={
 ballPierce:{u:'ball',n:'Мяч навылет',d:'Мяч пробивает первого кота и летит дальше.'},
 wheelGold:{u:'wheel',n:'Золотая жила',d:'Колесо иногда роняет золотую монету.'},
 sprLong:{u:'spr',n:'Ледяная вода',d:'Мокрые коты сохнут вдвое дольше.'},
 shockChain:{u:'shock',n:'Длинная искра',d:'Ток бьёт ещё и по соседним рядам вполсилы.'},
 fenceThorns:{u:'fence',n:'Колючая когтеточка',d:'Кот, который её грызёт, сам получает урон.'},
 cucReload:{u:'cuc',n:'Пружина с возвратом',d:'Огурец не пропадает, а через 10 с снова готов.'},
 yarnLong:{u:'yarn',n:'Бесконечная нитка',d:'Клубок держит котов 8 секунд.'},
 mineBig:{u:'mine',n:'Двойная килька',d:'Взрыв кильки задевает соседние клетки.'}};
const bp=k=>!!(save.bp&&save.bp[k])||!!(S&&S.survBp&&S.survBp[k]);
function bpOffers(i){const have=new Set([...(L[Math.min(i+1,L.length-1)].cards||[]),...(L[i].cards||[])]),R=rng(i*71+(save.kills|0));
 return Object.keys(BLUEPRINTS).filter(k=>!bp(k)&&have.has(BLUEPRINTS[k].u)).sort(()=>R()-.5).slice(0,3)}
function bpThen(i,next){save.bpAsk=save.bpAsk||{};const offers=bpOffers(i);if(i<1||save.bpAsk[i]||!offers.length)return next();
 save.bpAsk[i]=1;persist();
 const card=k=>`<div class="bp"><canvas width="120" height="96" data-k="${BLUEPRINTS[k].u}"></canvas><b>${BLUEPRINTS[k].n}</b><span>${BLUEPRINTS[k].d}</span></div>`;
 overlay(`<div class="tag">Чертежи внучки</div><div class="gift"><canvas class="gd" width="180" height="270" data-gd="1"></canvas><div class="say"><p class="bubble">Бабуль, выбирай один — соберу к следующей улице!</p></div></div><div class="bps">${offers.map(card).join('')}</div>`,
  offers.map(k=>[BLUEPRINTS[k].n,()=>{save.bp=save.bp||{};save.bp[k]=1;persist();SFX.reveal();next()}]),'wide')}
