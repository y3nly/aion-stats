/* Independent NotMeter stat-efficiency model, adapted for Global.
   Reference: notmeter.com/assets/stat-efficiency-calculator.js (2026-10-26).
   Estimates relative damage; no rotation, skill damage, defense or multi-hit model. */
(function(root){
  'use strict';
  const fields={
    attack:'Equipment Attack',additionalAttack:'Additional Attack',minimumAttack:'Weapon Min Attack',maximumAttack:'Weapon Max Attack',
    pveAttack:'PvE Attack',bossAttack:'Boss Attack',attackIncreasePercent:'Attack Increase %',
    damageAmplificationPercent:'Damage Boost %',weaponDamageAmplificationPercent:'Weapon Damage Boost %',
    pveDamageAmplificationPercent:'PvE Damage Boost %',bossDamageAmplificationPercent:'Boss Damage Boost %',
    criticalDamageAmplificationPercent:'Crit Damage Boost %',perfectPercent:'Perfect Chance %',hardHitPercent:'Double Chance %',
    frontDamageAmplificationPercent:'Front Damage Boost %',backDamageAmplificationPercent:'Back Damage Boost %',
    power:'Might',destruction:'Destruction',justice:'Justice',wisdom:'Wisdom'
  };
  const divine={power:'attackIncreasePercent',destruction:'attackIncreasePercent',justice:'perfectPercent',wisdom:'hardHitPercent'};
  const flat=['attack','additionalAttack','minimumAttack','maximumAttack','pveAttack','bossAttack'];
  const cap=(n,max=100)=>Math.max(0,Math.min(max,n));
  function decode(text){
    text=String(text).trim();
    if(text.length>1000000||!text.startsWith('NOTMETER_STATS_V4:'))throw Error('Paste a Notmeter V4 stat export.');
    let p;
    try{p=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(text.slice(18)),c=>c.charCodeAt(0))));}
    catch{throw Error('The stat export could not be decoded. Copy it again from Notmeter.');}
    if(!p||p.schema!=='notmeter-stat-efficiency-profile-v4')throw Error('This export is not Notmeter V4.');
    for(const k of Object.keys(fields))if(!Number.isFinite(p[k])||p[k]<0||p[k]>1e8)throw Error('Missing or invalid '+fields[k]+'.');
    if(p.attack<=0||p.minimumAttack>p.maximumAttack)throw Error('Check the equipped attack and weapon range.');
    return p;
  }
  function calculate(s,c,delta={}){
    const v={...s};
    for(const [k,n] of Object.entries(delta)){
      if(!Number.isFinite(n)||!(k in fields))throw Error('Invalid upgrade.');
      const target=divine[k]||k;v[target]+=n*(divine[k] ? 0.1 : 1);
    }
    if(Object.keys(fields).some(k=>!Number.isFinite(v[k])||v[k]<0)||v.minimumAttack>v.maximumAttack)throw Error('Upgrade produces invalid stats.');
    const average=(v.minimumAttack+v.maximumAttack)/2;
    const roll=average+cap(v.perfectPercent)/100*(v.maximumAttack-average);
    const increase=1+v.attackIncreasePercent/100;
    const effective=((v.attack+roll)*(1+v.weaponDamageAmplificationPercent/100)+v.additionalAttack)*increase+v.pveAttack+v.bossAttack;
    const boost=1+(v.damageAmplificationPercent+v.pveDamageAmplificationPercent+v.bossDamageAmplificationPercent)/100;
    const crit=1+cap(c.crit,100)/100*(.5+v.criticalDamageAmplificationPercent/100);
    const double=1+cap(v.hardHitPercent+c.partyDouble-c.doubleResist)/100;
    const direction=c.direction==='none'?1:1+cap(c.uptime)/100*v[c.direction+'DamageAmplificationPercent']/100;
    return {damage:effective*boost*crit*double*direction,sheet:(v.attack+average+v.additionalAttack)*increase};
  }
  function compare(s,c,delta){const before=calculate(s,c),after=calculate(s,c,delta);return {before,after,gain:100*(after.damage/before.damage-1)};}
  function rank(s,c){return Object.keys(fields).map(key=>{const amount=flat.includes(key)?10:1;return {key,amount,...compare(s,c,{[key]:amount})};}).sort((a,b)=>b.gain-a.gain);}
  const api={fields,flat,divine,decode,calculate,compare,rank};root.AionStats=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
