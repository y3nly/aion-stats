/* UI adapters only. Bongbong's original calc(), snap(), and render() remain authoritative. */
(() => {
  'use strict';
  const model=globalThis.StatModels, $=id=>document.getElementById(id);
  const store={get(k,fallback){try{return JSON.parse(localStorage.getItem('aion_stats_'+k))??fallback;}catch{return fallback;}},set(k,v){try{localStorage.setItem('aion_stats_'+k,JSON.stringify(v));return true;}catch{return false;}}};
  let locale=store.get('language','en'), mode=store.get('mode','bongbong');
  if(!['en','ko'].includes(locale))locale='en';
  if(!['bongbong','notmeter'].includes(mode))mode='bongbong';
  const copy={
    crafting:['Crafting','제작'],stats:['Stats','스탯'],original:['Original calculator ↗','원본 계산기 ↗'],language:['Language','언어'],
    importTitle:['Paste stats from NotMeter','NotMeter 스탯 붙여넣기'],
    importHelp:['Paste “Copy My Stats” once to populate both calculators. Each mode keeps its own edits and calculations.','“내 스탯 복사”를 한 번 붙여넣으면 두 계산기에 적용됩니다. 이후 수정값과 계산은 모드별로 유지됩니다.'],
    pasteLabel:['NotMeter stat export','NotMeter 스탯 내보내기'],importButton:['Import into both modes','두 모드에 가져오기'],
    importDetails:['Imported values and remaining inputs','가져온 값과 남은 입력 항목'],
    bongDesc:['Original formulas · normal and guaranteed critical skills','원본 공식 · 일반/확정 치명 스킬'],
    nmDesc:['NotMeter-based · optional research model','NotMeter 공식 · 세부 공격 수치'],
    imported:['Imported','가져옴'],derived:['Derived','환산값'],
    retained:['Kept value','기존 값'],manual:['Edited','직접 수정'],
    empty:['Enter stat','직접 입력'],
    valid:['Imported into both modes. Review the remaining fields below.','두 모드에 적용했습니다. 아래 미제공 항목을 확인하세요.'],
    invalid:['Import failed. Paste a valid NotMeter V4 stat export. Existing inputs were preserved.','가져오기 실패. 유효한 NotMeter V4 스탯을 붙여넣으세요. 기존 입력은 유지됩니다.'],
    nothing:['Paste your stats or enter them below to begin.','스탯을 붙여넣거나 아래에 직접 입력하세요.'],
    needStats:['Enter or import your character stats to see results.','캐릭터 스탯을 입력하거나 가져오면 결과가 표시됩니다.'],
    needSpeed:['Enter your Combat Speed to check thresholds.','전투속도를 입력하면 구간을 확인할 수 있습니다.'],
    storage:['Imported for this visit; browser storage is unavailable.','이번 방문에 적용됨 · 브라우저 저장소를 사용할 수 없습니다.'],
    speedNote:['Bongbong Combat Speed reference · thresholds only; no DPS gain is calculated. Scroll and buff settings are independent of either damage model.','Bongbong 전투속도 참고 · 구간만 표시하며 DPS 증가율은 계산하지 않습니다. 주문서와 버프는 피해 계산과 별개입니다.'],
    baseline:['Current stats','현재 스탯'],scenario:['Combat assumptions','전투 조건'],
    delta:['Option changes to compare','비교할 옵션 증가량'],deltaHelp:['Enter the gains or losses from an equipment change. These affect the comparison only.','장비 변경으로 증가/감소하는 값을 입력하세요. 비교 결과에만 적용됩니다.'],
    ranking:['Stat efficiency ranking','스탯 투자 효율'],expected:['DPH','기대 피해'],after:['New DPH','옵션 변경 후'],gain:['Damage gain','피해 증가율'],
    attack:['Reconstructed character-window Attack','환산 캐릭터 창 공격력'],
    method:['NotMeter-based attack model with Global divine growth (0.1pp per point). Enable the research model for Multi-hit, racial boost, skill scaling, and estimated target mitigation. Missing new stats require manual entry; zero is an explicit initial assumption.','NotMeter 기반 공격 모델과 글로벌 주신 성장(포인트당 0.1%p). 연구 모델은 다단 히트, 종족 증폭, 스킬 배율 및 대상 추정을 추가합니다. 미제공 신규 스탯은 직접 입력하며 초기 0은 가정입니다.'],
    critHelp:['Critical chance is a manual combat assumption; the current documented paste fields do not supply it. Imported divine stats are already reflected in the copied percentages; changing divine points applies only the difference from that imported baseline.','치명타 발동률은 직접 설정하는 전투 조건입니다. 현재 확인된 내보내기 필드에는 포함되지 않습니다. 주신 스탯은 복사된 비율에 이미 반영되어 있으므로 변경 시 가져온 기준 대비 차이만 적용됩니다.'],
    invalidCalc:['Enter valid attack values (Max Attack ≥ Min Attack) and combat assumptions to calculate.','유효한 공격 수치(최대 ≥ 최소)와 전투 조건을 입력하세요.'],
    save1:['Save as 1','1번 저장'],save2:['Save as 2','2번 저장'],load1:['Load 1','1번 불러오기'],load2:['Load 2','2번 불러오기'],compare:['Compare 1 ↔ 2','1번 ↔ 2번 비교'],
    saved:['Setup saved on this device.','이 기기에 저장했습니다.'],loaded:['Setup loaded.','저장값을 불러왔습니다.'],missingSlots:['Save both NotMeter setups first.','NotMeter 1번과 2번을 먼저 저장하세요.'],missingSlot:['No setup saved in this slot.','이 슬롯에 저장된 값이 없습니다.'],
    clear:['Clear option changes','옵션 증가량 초기화'],direction:['Attack direction','공격 방향'],none:['None','없음'],front:['Front','전방'],back:['Back','후방'],
    unknown:['Unmapped export fields (preserved locally)','미연결 내보내기 필드 (로컬 보관)'],
    manualTitle:['Remaining Bongbong inputs','Bongbong 미제공 항목'],nmMissing:['Remaining NotMeter fields','NotMeter 미제공 항목'],
    applied:['Bongbong imported / derived fields','Bongbong 가져온/환산 항목'],nmApplied:['NotMeter imported fields','NotMeter 가져온 항목'],
  };
  const c=k=>copy[k]?.[locale==='ko'?1:0]??k;
  const name=k=>model.fields[k]?.[locale==='ko'?1:0]??k;
  const shortNames={multiHitPercent:'Multi-hit',penetration:'Penetration',raceDamageAmplificationPercent:'Racial Boost',power:'Might',destruction:'Destruction',justice:'Justice',wisdom:'Wisdom',attack:'Attack',additionalAttack:'Attack Bonus',minimumAttack:'Min Attack',maximumAttack:'Max Attack',pveAttack:'PvE Attack',bossAttack:'Boss Attack',attackIncreasePercent:'Attack Increase',damageAmplificationPercent:'Damage Boost',weaponDamageAmplificationPercent:'Weapon Boost',pveDamageAmplificationPercent:'PvE Boost',bossDamageAmplificationPercent:'Boss Boost',criticalDamageAmplificationPercent:'Crit Boost',perfectPercent:'Perfect Chance',hardHitPercent:'Double Chance',frontDamageAmplificationPercent:'Front Boost',backDamageAmplificationPercent:'Back Boost'};
  const chartName=k=>locale==='en'?(shortNames[k]??name(k)):name(k).replace(/ %$/,'');
  const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const normalize=s=>s.replace(/\s+/g,' ').trim();
  const catalog=globalThis.StatsTranslations;
  const keys=Object.keys(catalog).sort((a,b)=>b.length-a.length);
  const pattern=new RegExp(keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
  function english(s){const exact=catalog[normalize(s)];return exact===undefined?s.replace(pattern,k=>catalog[k]):s.match(/^\s*/)[0]+exact+s.match(/\s*$/)[0];}
  const originals=new WeakMap();
  function translate(root=document.body){
    const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    for(let node; (node=walk.nextNode());){
      if(node.parentElement.closest('script,style,[data-owned],#notmeter-mode,#cmtList,textarea'))continue;
      let record=originals.get(node);
      if(!record || node.data!==record.output)record={source:node.data};
      let output=locale==='en'?english(record.source):record.source;
      if(locale==='en' && output!==record.source){
        if(node.previousSibling && /[A-Za-z0-9]/.test(output[0]||'') && /\S$/.test(node.previousSibling.textContent))output=' '+output;
        if(node.nextSibling && /[A-Za-z0-9%)]$/.test(output) && /^\S/.test(node.nextSibling.textContent))output+=' ';
      }
      if(output!==node.data)node.data=output;
      record.output=output;originals.set(node,record);
    }
    document.documentElement.lang=locale;
    document.title=locale==='en'?'AION 2 Stat Efficiency Calculator':'아이온2 스탯 효율 계산기';
  }
  const originalAlert=window.alert.bind(window);
  window.alert=s=>originalAlert(locale==='en'?english(String(s)):s);
  let observing=false;
  const observer=new MutationObserver(()=>{if(observing)return;observer.disconnect();translate();observe();});
  function observe(){observer.observe(document.body,{subtree:true,childList:true,characterData:true});}

  let nm=Object.assign(model.defaults(),store.get('nm',{}));
  let divine=store.get('divine',Object.fromEntries(['power','destruction','justice','wisdom'].map(k=>[k,nm[k]])));
  let deltas=store.get('deltas',{}), origins=store.get('origins',{bong:{},notmeter:{}}), imported=store.get('profile',null);
  let report=imported?model.adapt(imported):null, importState=imported?'valid':'nothing';
  // Replace the old inherited resistance assumption; keep explicit scenario edits.
  if(!origins.notmeter.bossHardHitResistancePercent && nm.bossHardHitResistancePercent===30)nm.bossHardHitResistancePercent=0;
  // Older visits may have persisted examples alongside a single edited field.
  // Preserve imports and actual edits; empty the inherited examples, including crit chance.
  for(const key of [...model.baseline,'criticalChancePercent']){
    const origin=origins.notmeter[key];
    if(origin==='retainedDefault' || origin==='empty' || (!origin && !(report && key in report.notmeter)))nm[key]=null;
    if(origin==='retainedDefault')origins.notmeter[key]='empty';
  }
  const nmHost=$('notmeter-mode');
  nmHost.dataset.owned='';
  const deltaKeys=model.baseline.concat(['multiHitPercent','penetration','raceDamageAmplificationPercent']).filter(k=>!['power','destruction','justice','wisdom'].includes(k));
  function group(title,keys,prefix,values){
    return '<section class="panel"><h2>'+esc(c(title))+'</h2><div class="fields">'+keys.map(k=>'<div class="f"><label for="'+prefix+k+'">'+esc(name(k))+'</label><input type="number" step="any" id="'+prefix+k+'" data-field="'+k+'" data-kind="'+prefix+'" value="'+esc(Number.isFinite(values[k])?values[k]:'')+'"></div>').join('')+'</div></section>';
  }
  function researchPanel(){
    const en=locale==='en';
    return '<section class="panel"><h2>'+(en?'Multi-hit & target estimates':'다단 히트 및 대상 추정')+'</h2><label><input id="nm-research" type="checkbox" '+(nm.researchEnabled?'checked':'')+'> '+(en?'Enable research model':'연구 모델 사용')+'</label><p class="nm-note">'+(en?'Assumptions: 19% hidden Multi-hit chance; 1–4 extra strikes, each +5% Core Attack (12.5% average per proc). Bonus/PvE/Boss Attack and skill flat damage are excluded. Boss presets are KR-based estimates, unverified for Global. Defense is raw rating (3,000 means 300 reduction before Penetration). Coefficient 1 / flat 0 compares generic hits; enter skill values for skill-specific efficiency.':'가정: 기본 다단 히트 19%, 1~4회 각 핵심 공격력 +5% (발동당 평균 12.5%). 추가/PvE/보스 공격력 및 스킬 고정 피해 제외. 보스는 KR 기반 추정값이며 글로벌 미검증. 방어력 3,000은 관통 전 피해 감소 300. 계수 1/고정 피해 0은 일반 비교용입니다.')+'</p><div class="fields"><div class="f"><label for="nm-preset">'+(en?'Target estimate':'대상 추정')+'</label><select id="nm-preset"><option value="">'+(en?'Custom':'직접 설정')+'</option>'+model.presets.map(p=>'<option value="'+p.id+'" '+(nm.bossPreset===p.id?'selected':'')+'>'+esc(p.name)+'</option>').join('')+'</select></div><button id="nm-back-recommend" class="compare-btn">'+(en?'Use suggested back uptime':'권장 후방 비율 적용')+'</button></div><p class="nm-note" id="nm-preset-note"></p></section>'+group('scenario',model.researchKeys,'nm-',nm);
  }
  function makeNm(){
    nmHost.innerHTML=researchPanel()+group('baseline',model.baseline,'nm-',nm)+group('scenario',model.scenario,'nm-',nm)+
      '<section class="panel"><div class="f"><label for="nm-direction">'+c('direction')+'</label><select id="nm-direction">'+['none','front','back'].map(k=>'<option value="'+k+'"'+(nm.attackType===k?' selected':'')+'>'+c(k)+'</option>').join('')+'</select></div><p class="nm-note">'+c('critHelp')+'</p><p class="nm-note">'+c('method')+' <a href="https://notmeter.com/?view=stat-efficiency" target="_blank" rel="noopener">NotMeter ↗</a></p></section>'+
      '<section class="panel"><h2>'+c('delta')+'</h2><p class="nm-note">'+c('deltaHelp')+'</p><div class="fields nm-delta">'+deltaKeys.map(k=>'<div class="f"><label for="delta-'+k+'">'+esc(name(k))+'</label><input type="number" step="any" id="delta-'+k+'" data-field="'+k+'" data-kind="delta-" placeholder="0" value="'+esc(deltas[k]??'')+'"></div>').join('')+'</div><button id="nm-clear" class="compare-btn">'+c('clear')+'</button></section>'+
      '<div id="nm-output" aria-live="polite"></div><section class="panel"><h2>'+c('compare')+'</h2><div class="nm-slots">'+['save1','load1','save2','load2','compare'].map(k=>'<button class="compare-btn" id="nm-'+k+'">'+c(k)+'</button>').join('')+'</div><p id="nm-slot-status" class="nm-status" role="status"></p><div id="nm-comparison"></div></section>';
    renderNm();
  }
  function effective(s=nm,b=divine){
    return {...s,attackIncreasePercent:s.attackIncreasePercent+(s.power-b.power)*.1+(s.destruction-b.destruction)*.1,
      perfectPercent:s.perfectPercent+(s.justice-b.justice)*.1,hardHitPercent:s.hardHitPercent+(s.wisdom-b.wisdom)*.1};
  }
  function fmt(n){return n.toLocaleString(locale==='en'?'en-US':'ko-KR',{maximumFractionDigits:2});}
  function gain(n){return (n>=0?'+':'')+n.toFixed(2)+'%';}
  function renderNm(){
    const out=$('nm-output'), option={...deltas};
    const preset=model.presets.find(p=>p.id===nm.bossPreset);
    $('nm-preset-note').textContent=preset?(locale==='en'?'Suggested back uptime: ':'권장 후방 비율: ')+(preset.recommendedBackAttackRate*100)+'%'+(preset.minAccuracyNoParry?(locale==='en'?' · Accuracy 1,500 is an unverified note; parry is not modeled.':' · 명중 1,500은 미검증 참고값이며 무기 방어는 계산하지 않습니다.'):''):'';
    $('nm-back-recommend').disabled=!preset;
    option.attackIncreasePercent=(option.attackIncreasePercent??0)+(nm.power-divine.power)*.1+(nm.destruction-divine.destruction)*.1;
    option.perfectPercent=(option.perfectPercent??0)+(nm.justice-divine.justice)*.1;
    option.hardHitPercent=(option.hardHitPercent??0)+(nm.wisdom-divine.wisdom)*.1;
    const result=model.calculate(nm,option);
    if(!result){out.innerHTML='<p class="nm-status">'+c(model.baseline.some(k=>nm[k]===null)?'needStats':'invalidCalc')+'</p>';return;}
    const cards=[['expected',fmt(result.base.damage)],['after',fmt(result.after.damage)],['gain',gain(result.gain)]];
    const max=Math.max(...result.effects.map(r=>r.gain),.001);
    out.innerHTML='<div class="nm-cards">'+cards.map(([k,v])=>'<div class="card"><div class="lbl">'+c(k)+'</div><div class="val">'+v+'</div></div>').join('')+'</div><p class="nm-note">'+c('attack')+': '+fmt(result.base.attack)+'</p><section class="panel eff"><h2>'+c('ranking')+'</h2>'+result.effects.map((r,i)=>'<div class="bar-row'+(i===0?' top':'')+'"><span class="name">'+esc(chartName(r.key))+' +'+r.amount+(!['power','destruction','justice','wisdom',...['attack','additionalAttack','minimumAttack','maximumAttack','pveAttack','bossAttack','penetration']].includes(r.key)?'pp':'')+'</span><div class="track"><div class="fill" style="width:'+Math.max(0,r.gain/max*100)+'%;background:var(--'+(i===0?'green':'purple')+')"></div></div><span class="num">'+gain(r.gain)+'</span></div>').join('')+'</section>';
  }
  function persistNm(){store.set('nm',nm);store.set('divine',divine);store.set('deltas',deltas);}
  nmHost.addEventListener('input',e=>{
    const field=e.target.dataset.field;if(!field)return;
    if(['bossDefense','bossPerfectResistancePercent','bossDamageResistancePercent','bossHardHitResistancePercent'].includes(field)){nm.bossPreset='';$('nm-preset').value='';}
    const value=e.target.value===''?null:Number(e.target.value);
    if(e.target.dataset.kind==='nm-'){nm[field]=value;origins.notmeter[field]='manual';}else if(value===null)delete deltas[field];else deltas[field]=value;
    renderNm();persistNm();store.set('origins',origins);markOrigins();
  });
  nmHost.addEventListener('change',e=>{
    if(e.target.id==='nm-research'){nm.researchEnabled=e.target.checked;renderNm();persistNm();return;}
    if(e.target.id==='nm-preset'){const p=model.presets.find(p=>p.id===e.target.value);nm.bossPreset=e.target.value;if(p){for(const k of ['bossDefense','bossDamageResistancePercent','bossHardHitResistancePercent','bossPerfectResistancePercent'])nm[k]=p[k];nm.researchEnabled=true;origins.notmeter.bossHardHitResistancePercent='manual';store.set('origins',origins);}makeNm();persistNm();return;}
    if(e.target.id==='nm-direction'){nm.attackType=e.target.value;renderNm();persistNm();}});
  nmHost.addEventListener('click',e=>{
    const id=e.target.id;
    if(id==='nm-back-recommend'){const p=model.presets.find(p=>p.id===nm.bossPreset);if(p){nm.backAttackRatePercent=p.recommendedBackAttackRate*100;makeNm();persistNm();}return;}
    if(id==='nm-clear'){deltas={};makeNm();persistNm();return;}
    const match=id.match(/^nm-(save|load)([12])$/);
    if(match){
      const slot=match[2];
      if(match[1]==='save'){
        if(!model.calculate(effective())){$('nm-slot-status').textContent=c('invalidCalc');return;}
        const ok=store.set('nm_slot_'+slot,{nm,divine});$('nm-slot-status').textContent=c(ok?'saved':'storage');
      }else{
        const data=store.get('nm_slot_'+slot,null);
        if(!data){$('nm-slot-status').textContent=c('missingSlot');return;}
        nm={...model.researchDefaults,...data.nm};divine=data.divine;for(const k of model.baseline)origins.notmeter[k]='manual';makeNm();persistNm();store.set('origins',origins);markOrigins();$('nm-slot-status').textContent=c('loaded');
      }
    }
    if(id==='nm-compare'){
      const a=store.get('nm_slot_1',null),b=store.get('nm_slot_2',null);
      if(!a||!b){$('nm-slot-status').textContent=c('missingSlots');return;}
      // Compare saved character stats under the current shared NotMeter combat assumptions.
      const current=Object.fromEntries([...model.scenario,...model.researchKeys.filter(k=>!['multiHitPercent','penetration','raceDamageAmplificationPercent'].includes(k)),'researchEnabled','attackType'].map(k=>[k,nm[k]]));
      const aa=model.calculate(effective({...a.nm,...current},a.divine)),bb=model.calculate(effective({...b.nm,...current},b.divine));
      if(!aa||!bb){$('nm-slot-status').textContent=c('invalidCalc');return;}
      $('nm-comparison').innerHTML='<div class="compare-card">1: '+fmt(aa.base.damage)+' → 2: '+fmt(bb.base.damage)+'<div class="gain">'+gain((bb.base.damage/aa.base.damage-1)*100)+'</div></div>';
    }
  });
  const bongIds=[...M,...E].map(f=>f[0]).concat(['preset','dir','dirRate','isPve','buffSupport','buffGuardian','speedClass','speedNow','speedScroll','speedClassBuff','speedPartyBuff','speedExtra']);
  function collectBong(){return Object.fromEntries(bongIds.map(id=>[id,$(id).type==='checkbox'?$(id).checked:$(id).value]));}
  function restoreBong(data){
    if(!data)return;
    if(data.speedClass && model.classes[data.speedClass]){$('speedClass').value=data.speedClass;populateSpeedBuffs();}
    for(const id of bongIds)if(id!=='speedClass' && Object.hasOwn(data,id)){
      if($(id).type==='checkbox')$(id).checked=!!data[id];else $(id).value=data[id];
    }
    render();renderSpeed();
  }
  const originalRender=render, originalRenderSpeed=renderSpeed;
  render=function(){
    originalRender();
    const ready=M.every(([id])=>$(id).value!=='' && Number.isFinite(Number($(id).value)));
    for(const id of ['saveCompare1','saveCompare2'])$(id).disabled=!ready;
    if(ready)return;
    for(const id of ['outBase','outDmgNormal','outDmgGuaranteed','outMultNormal','outMultGuaranteed','outCritNormal','outCritGuaranteed'])$(id).textContent='—';
    for(const id of ['effNormal','effGuaranteed'])$(id).innerHTML='<p class="nm-note" data-owned>'+c('needStats')+'</p>';
  };
  renderSpeed=function(){
    originalRenderSpeed();
    if($('speedNow').value!=='')return;
    for(const id of ['speedBaseOut','speedAfterOut','speedNewOut'])$(id).textContent='—';
    for(const id of ['speedNextOut','speedScrollOut','speedBreakdown'])$(id).textContent='';
    $('speedCaps').innerHTML='<p class="nm-note" data-owned>'+c('needSpeed')+'</p>';
  };
  restoreBong(store.get('bong',null));
  let explicitlySaved=null;
  try{explicitlySaved=JSON.parse(localStorage.getItem(MY_STATS_STORAGE_KEY));}catch{}
  for(const key of [...M.map(f=>f[0]),'speedNow']){
    const origin=origins.bong[key];
    const explicitlySavedKey=key==='speedNow'?explicitlySaved?.speed?.[key]:explicitlySaved?.mine?.[key];
    if(origin==='retainedDefault' || origin==='empty' || (!origin && explicitlySavedKey===undefined && !(report && key in report.bong)))$(key).value='';
    if(origin==='retainedDefault')origins.bong[key]='empty';
  }
  render();renderSpeed();
  document.addEventListener('input',e=>{
    if(!bongIds.includes(e.target.id))return;
    origins.bong[e.target.id]='manual';store.set('origins',origins);store.set('bong',collectBong());render();renderSpeed();markOrigins();
  });
  document.addEventListener('change',e=>{if(bongIds.includes(e.target.id))store.set('bong',collectBong());});
  // Upstream buttons mutate inputs without dispatching input events.
  for(const id of ['reset','loadMyStats','loadCompare1','loadCompare2'])$(id).addEventListener('click',()=>{
    if(id==='reset'){
      for(const [key] of M)$(key).value='';
      $('speedNow').value='';
    }
    for(const k of [...M.map(f=>f[0]),'speedNow'])origins.bong[k]='manual';
    store.set('origins',origins);store.set('bong',collectBong());render();renderSpeed();markOrigins();
  });
  function bongName(k){if(k==='speedNow')return locale==='en'?'Combat Speed':'전투속도';const f=M.find(f=>f[0]===k);return f?(locale==='en'?english(f[1]):f[1]):k;}
  function markOrigins(){
    for(const [which,map] of Object.entries(origins))for(const [key,origin] of Object.entries(map)){
      const el=$(which==='bong'?key:'nm-'+key);if(!el)continue;
      const parent=el.closest('.f');if(!parent)continue;
      parent.classList.toggle('imported-field',['imported','derived'].includes(origin));parent.classList.toggle('retained-field',origin.startsWith('retained')||origin==='empty');
      let note=parent.querySelector('.import-origin');if(!note){note=document.createElement('small');note.className='import-origin';note.dataset.owned='';parent.append(note);}note.textContent=c(origin);
    }
  }
  function showReport(){
    $('stats-import-status').textContent=c(importState);
    $('import-details').hidden=!report;if(!report)return;
    const area=$('stats-import-details');area.replaceChildren();
    const rows=[['applied',Object.keys(report.bong).map(bongName)],['manualTitle',report.missingBong.map(bongName)],['nmApplied',Object.keys(report.notmeter).map(name)],['nmMissing',report.missingNotmeter.map(name)]];
    const known=new Set(['schema','jobName',...model.baseline]);
    const unknown=Object.keys(imported).filter(k=>!known.has(k));if(unknown.length)rows.push(['unknown',unknown]);
    for(const [label,values] of rows){const p=document.createElement('p');p.textContent=c(label)+': '+(values.join(', ')||c('none'));area.append(p);}
  }
  function importStats(){
    let p,adapted;
    try{p=model.decode($('stats-paste').value);adapted=model.adapt(p);}catch{importState='invalid';showReport();return;}
    // All parsing/mapping finishes before either model changes.
    for(const [id,value] of Object.entries(adapted.bong))$(id).value=value;
    if(adapted.classKey && $('speedClass').value!==adapted.classKey){$('speedClass').value=adapted.classKey;populateSpeedBuffs();}
    Object.assign(nm,adapted.notmeter);
    for(const key of ['power','destruction','justice','wisdom'])divine[key]=nm[key];
    origins={bong:{},notmeter:Object.fromEntries(model.scenario.filter(k=>origins.notmeter[k]).map(k=>[k,origins.notmeter[k]]))};
    for(const k of [...M.map(f=>f[0]),'speedNow'])origins.bong[k]=k in adapted.bong?(k==='atk'?'derived':'imported'):($(k).value===''?'empty':'retained');
    for(const k of model.baseline)origins.notmeter[k]=k in adapted.notmeter?'imported':(nm[k]===null?'empty':'retained');
    imported=p;report=adapted;importState='valid';
    const saved=store.set('profile',p);store.set('origins',origins);store.set('bong',collectBong());persistNm();
    if(!saved)importState='storage';
    render();renderSpeed();makeNm();markOrigins();showReport();translate();
  }
  $('stats-import').addEventListener('click',importStats);
  function setMode(value){
    mode=value;store.set('mode',mode);$('bongbong-mode').hidden=mode!=='bongbong';nmHost.hidden=mode!=='notmeter';
    document.querySelectorAll('.bongbong-notes').forEach(el=>el.hidden=mode!=='bongbong');
    for(const key of ['bongbong','notmeter'])$('mode-'+key).setAttribute('aria-pressed',String(key===mode));
    $('model-description').textContent=c(mode==='bongbong'?'bongDesc':'nmDesc');
  }
  for(const key of ['bongbong','notmeter'])$('mode-'+key).addEventListener('click',()=>setMode(key));
  const speedNote=document.createElement('p');speedNote.className='reference-note';speedNote.dataset.owned='';document.querySelector('.speed-panel').prepend(speedNote);
  function setLanguage(value){
    observer.disconnect();observing=true;locale=value;store.set('language',locale);$('stats-language').value=locale;
    document.querySelectorAll('[data-copy]').forEach(el=>{el.dataset.owned='';el.textContent=c(el.dataset.copy);});
    for(const id of ['stats-import-status','stats-import-details','model-description'])$(id).dataset.owned='';
    speedNote.textContent=c('speedNote');makeNm();markOrigins();showReport();setMode(mode);render();renderSpeed();translate();observing=false;observe();
  }
  $('stats-language').addEventListener('change',e=>setLanguage(e.target.value));
  setLanguage(locale);
  // Exposed read-only diagnostics for compatibility checks and source update reviews.
  globalThis.StatsExtension={english,importStats,untranslated(){
    const result=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    for(let n;(n=w.nextNode());)if(/[가-힣]/.test(n.data) && n.parentElement.getClientRects().length && !n.parentElement.closest('script,style,select,[data-owned],#notmeter-mode') && !n.data.includes('unconfirmed') && !n.data.includes('쑈') && !n.data.includes('최**'))result.push(n.data);
    return [...new Set(result)];
  }};
})();
