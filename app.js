(() => {
  'use strict';
  const m=AionStats,$=id=>document.getElementById(id),key='aion-stats:v1';
  let profile=null;
  const scenarioIds=['crit','direction','uptime','partyDouble','doubleResist'];
  const percent=k=>k.endsWith('Percent');
  for(const [k,label] of Object.entries(m.fields)){
    const option=document.createElement('option');option.value=k;option.textContent=label;$('upgrade-stat').append(option);
  }
  $('upgrade-stat').value='additionalAttack';
  function settings(){
    for(const id of scenarioIds.filter(x=>x!=='direction'))if(!$(id).checkValidity()||$(id).value==='')throw Error('Check '+$(id).parentElement.firstChild.textContent.trim()+'.');
    return {boss:true,crit:Number($('crit').value),direction:$('direction').value,uptime:Number($('uptime').value),partyDouble:Number($('partyDouble').value),doubleResist:Number($('doubleResist').value)};
  }
  function save(){try{localStorage.setItem(key,JSON.stringify({profile,scenario:Object.fromEntries(scenarioIds.map(id=>[id,$(id).value]))}));}catch{$('status').textContent='Browser storage unavailable. Your current inputs still work.';}}
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
    try{profile=m.decode($('paste').value);showStats();render();save();$('status').className='';$('status').textContent='Stats imported. Review crit chance and combat settings.';$('paste').value='';}
    catch(e){$('status').className='error';$('status').textContent=e.message;}
  });
  scenarioIds.forEach(id=>$(id).addEventListener('input',()=>{
    if(id==='crit'&&Number($('crit').value)>50)$('crit').value=50;render();save();
  }));
  ['upgrade-stat','upgrade-amount'].forEach(id=>$(id).addEventListener('input',render));
  $('reset').addEventListener('click',()=>{try{localStorage.removeItem(key);}catch{}location.reload();});
  try{const saved=JSON.parse(localStorage.getItem(key));if(saved?.profile){profile=m.decode('NOTMETER_STATS_V4:'+btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(saved.profile)))));for(const id of scenarioIds)if(saved.scenario?.[id]!==undefined)$(id).value=saved.scenario[id];$('crit').value=Math.min(50,Number($('crit').value));showStats();render();$('status').textContent='Restored your last stats.';}}catch{profile=null;}
})();
