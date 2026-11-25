(() => {
  'use strict';
  const m=AionStats,$=id=>document.getElementById(id),key='aion-stats:v1';
  let profile=null;
  const combatNumbers = ['crit', 'uptime', 'partyDouble', 'doubleResist'];
  const scenarioIds = [...combatNumbers, 'direction', 'skill', 'skill-level', 'skill-variant', 'split-chain'];
  const percent=k=>k.endsWith('Percent');
  const baseSkill = code => Object.keys(m.chains).find(base => m.chains[base] === code) || code;
  let displayedSkill = '';
  function showSkillOptions(selection) {
    const split = $('split-chain').checked;
    $('skill').replaceChildren(new Option('General stat estimate', ''));
    for (const [code, skill] of Object.entries(m.skills)) {
      const followup = !split && m.skills[m.chains[code]];
      if (!split && Object.values(m.chains).includes(code)) continue;
      const label = followup ? `${skill.name} + ${followup.name}` : skill.name;
      $('skill').add(new Option(label, code));
    }
    $('skill').value = selection;
    if (!$('skill').value) $('skill').value = '';
  }
  for(const [k,label] of Object.entries(m.fields)){
    const option=document.createElement('option');option.value=k;option.textContent=label;$('upgrade-stat').append(option);
  }
  $('upgrade-stat').value='additionalAttack';
  function showSkill(useImportedLevel, variantIndex = '0') {
    const code = $('skill').value;
    const skill = m.skills[code];
    displayedSkill = code;
    $('skill-level-field').hidden = !skill;
    $('skill-variant-field').hidden = !skill || skill.variants.length < 2;
    const select = $('skill-variant');
    select.replaceChildren();
    if (skill) {
      if (useImportedLevel) {
        const level = Array.isArray(profile?.skills) && profile.skills.find(entry => String(entry?.code) === baseSkill(code))?.level;
        $('skill-level').value = Number.isInteger(level) && level >= 1 && level <= 40 ? level : 20;
      }
      skill.variants.forEach((variant, index) => select.add(new Option(variant.name, String(index))));
      select.value = skill.variants[variantIndex] ? variantIndex : '0';
    }
    showSkillNote();
  }
  function showSkillNote() {
    const code = $('skill').value;
    const variant = m.skills[code]?.variants[$('skill-variant').value];
    $('skill-note').hidden = !variant;
    $('crit').disabled = !!variant?.guaranteedCrit;
    if (!variant) return;
    let note = 'Ranks upgrades for the selected PvE damage component.';
    if (variant.guaranteedCrit) note = 'This specialty uses 100% crit chance.';
    if (!$('split-chain').checked && m.chains[code]) {
      note = 'Both skills use the same level and specialty.';
      if (variant.guaranteedCrit) note += ' Both use 100% crit chance.';
    }
    if (code === '11100000') note = 'Main hit only. Set effective crit chance for your specialty.';
    if (code === '11800000') note = 'Ranks damage per proc. Proc frequency and buff uptime are separate.';
    $('skill-note').textContent = note;
  }
  function settings(){
    for(const id of combatNumbers)if(!$(id).disabled&&(!$(id).checkValidity()||$(id).value===''))throw Error('Check '+$(id).parentElement.firstChild.textContent.trim()+'.');
    return {crit:Number($('crit').value),direction:$('direction').value,uptime:Number($('uptime').value),partyDouble:Number($('partyDouble').value),doubleResist:Number($('doubleResist').value), skill:$('skill').value, skillLevel:Number($('skill-level').value), skillVariant:Number($('skill-variant').value), split:$('split-chain').checked};
  }
  function save(){try{localStorage.setItem(key,JSON.stringify({profile,scenario:Object.fromEntries(scenarioIds.map(id=>[id,id==='split-chain'?$(id).checked:$(id).value]))}));}catch{$('status').textContent='Browser storage unavailable. Your current inputs still work.';}}
  function showStats(){
    $('stats').replaceChildren();if(!profile)return;
    for(const [k,label] of Object.entries(m.fields)){
      const el=document.createElement('label');el.textContent=label;
      const input=document.createElement('input');input.type='number';input.min='0';input.step='any';input.value=profile[k];input.dataset.stat=k;
      input.addEventListener('change',()=>{
        if(input.value===''||!input.checkValidity())return;
        const next=Number(input.value),difference=next-profile[k];
        if(m.divine[k])profile[m.divine[k]]+=difference*.1;
        profile[k]=next;showStats();render();save();
      });el.append(input);$('stats').append(el);
    }
  }
  function render(){
    if(!profile)return;
    try{
      const c=settings(),rank=m.rank(profile,c),max=Math.max(...rank.map(r=>r.gain),.001);
      $('sheet').textContent='Displayed Attack ≈ '+Math.floor(m.calculate(profile,c).sheet).toLocaleString();
      $('rankings').replaceChildren();
      for(const r of rank){
        const row=document.createElement('div');row.className='row'+(r.gain===0?' zero':'');
        const label=document.createElement('div');label.className='label';label.textContent=m.fields[r.key];
        const detail=document.createElement('small');detail.textContent='+'+r.amount+(percent(r.key)?' percentage point':m.divine[r.key]?' point':'');label.append(detail);
        const track=document.createElement('div');track.className='track';const fill=document.createElement('div');fill.className='fill';fill.style.width=Math.max(0,r.gain/max*100)+'%';track.append(fill);
        const gain=document.createElement('span');gain.className='gain';gain.textContent='+'+r.gain.toFixed(3)+'%';row.append(label,track,gain);$('rankings').append(row);
      }
      try{
        const amount=Number($('upgrade-amount').value);if($('upgrade-amount').value==='')throw Error('Enter an upgrade amount.');
        const r=m.compare(profile,c,{[$('upgrade-stat').value]:amount});
        $('upgrade-result').textContent=(r.gain>=0?'+':'')+r.gain.toFixed(3)+'%';
        const small=document.createElement('small');small.textContent='Estimated damage change';$('upgrade-result').append(small);
      }catch(e){$('upgrade-result').textContent=e.message;}
    }catch(e){$('rankings').textContent=e.message;$('upgrade-result').textContent='Check your stats and combat settings.';}
  }
  $('import').addEventListener('click',()=>{
    try{profile=m.decode($('paste').value);showSkill(true, $('skill-variant').value);showStats();render();save();$('status').className='';$('status').textContent='Stats imported. Review your skill level and combat settings.';$('paste').value='';}
    catch(e){$('status').className='error';$('status').textContent=e.message;}
  });
  scenarioIds.forEach(id=>$(id).addEventListener('input',()=>{
    if(id==='crit'&&Number($('crit').value)>100)$('crit').value=100;
    if (id === 'skill') {
      const sameChain = baseSkill(displayedSkill) === baseSkill($('skill').value);
      showSkill(!sameChain, sameChain ? $('skill-variant').value : '0');
    }
    if (id === 'split-chain') {
      const selection = $('skill').value;
      const variant = $('skill-variant').value;
      showSkillOptions($('split-chain').checked ? selection : baseSkill(selection));
      showSkill(false, variant);
    }
    if (id === 'skill-variant') showSkillNote();
    render();save();
  }));
  ['upgrade-stat','upgrade-amount'].forEach(id=>$(id).addEventListener('input',render));
  $('reset').addEventListener('click',()=>{try{localStorage.removeItem(key);}catch{}location.reload();});
  showSkillOptions('');
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    $('split-chain').checked = saved?.scenario?.['split-chain'] === true;
    const selection = saved?.scenario?.skill || '';
    showSkillOptions(selection);
    for (const id of scenarioIds) {
      if (!['skill', 'skill-variant', 'split-chain'].includes(id) && saved?.scenario?.[id] !== undefined) $(id).value = saved.scenario[id];
    }
    if (Number($('crit').value) > 100) $('crit').value = 100;
    showSkill(false, saved?.scenario?.['skill-variant']);
    if (saved?.profile) {
      profile = m.decode('NOTMETER_STATS_V4:' + btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(saved.profile)))));
      showStats();
      render();
      $('status').textContent = 'Restored your last stats.';
    }
  } catch { profile = null; }
})();
