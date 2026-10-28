const {test}=require('node:test');
const assert=require('node:assert/strict');
const m=require('../extension/models.js');
const skills=require('../extension/skill-model.js');
const fixtures=require('./notmeter-fixtures.json');
const encode=p=>'NOTMETER_STATS_V4:'+Buffer.from(JSON.stringify(p)).toString('base64');
const profile={schema:'notmeter-stat-efficiency-profile-v4',jobName:'검성',...m.defaults()};
function close(actual,expected){assert.ok(Math.abs(actual-expected)<=Math.max(1,Math.abs(expected))*1e-10,`${actual} ≠ ${expected}`);}
test('Lv18 Overhead Slam: per-effect values, outcomes and per-cast expectation',()=>{
  const s={attack:10000,defenseReduction:1000,multiplier:2,criticalFactor:1.5,criticalChance:.5,doubleChance:.2,multiFactor:1.045};
  const a=skills.estimate(s);
  close(a.normal,17485*2);close(a.critical,a.normal*1.5);
  close(a.doubleNormal,a.normal*2);close(a.doubleCritical,a.normal*3);
  close(a.expectedCast,a.normal*1.25*1.2*1.045*2);
  close(skills.estimate(s,'before').normal,(2125+1.636*9000)*2);
  close(skills.estimate({...s,criticalChance:0,doubleChance:0,multiFactor:1}).expectedCast,a.normal*2);
  close(skills.estimate({...s,criticalChance:1,doubleChance:1,multiFactor:1}).expectedCast,a.doubleCritical*2);
  close(skills.estimate({...s,defenseReduction:0}).normal,skills.estimate({...s,defenseReduction:0},'before').normal);
  close(skills.estimate({...s,defenseReduction:1e9}).base,1);
  for(const bad of [{attack:0},{attack:NaN},{attack:Infinity},{defenseReduction:-1},{criticalChance:1.1},{doubleChance:-1}])assert.equal(skills.estimate({...s,...bad}),null);
  assert.equal(skills.estimate(s,'unknown'),null);
});
for(const fixture of fixtures.fixtures)test('NotMeter reference parity: '+fixture.name,()=>{
  const result=m.calculate(fixture.input);assert.ok(result);
  for(const key of ['attack','effective','damage'])close(result.base[key],fixture.expected[key]);
  const keys={attackIncrease:'attackIncreasePercent',damageAmplification:'damageAmplificationPercent',weaponDamageAmplification:'weaponDamageAmplificationPercent',pveDamageAmplification:'pveDamageAmplificationPercent',bossDamageAmplification:'bossDamageAmplificationPercent',criticalDamageAmplification:'criticalDamageAmplificationPercent',perfect:'perfectPercent',hardHit:'hardHitPercent',frontDamageAmplification:'frontDamageAmplificationPercent',backDamageAmplification:'backDamageAmplificationPercent'};
  for(const effect of fixture.expected.effects)close(result.effects.find(e=>e.key===(keys[effect.key]||effect.key)).gain,effect.gain/(['destruction','justice','wisdom'].includes(effect.key)?2:1));
});
test('UTF-8 profile maps both modes and derives Attack without Perfect or weapon boosts',()=>{
  const p={...profile,attack:8000,additionalAttack:400,minimumAttack:1000,maximumAttack:2000,attackIncreasePercent:20,perfectPercent:90,weaponDamageAmplificationPercent:75,hardHitPercent:0,unknownProducerField:{value:123}};
  const decoded=m.decode(encode(p)), a=m.adapt(decoded);
  assert.equal(a.bong.atk,11880);assert.equal(a.bong.wAmp,75);assert.equal(a.bong.smite,0);
  assert.equal(a.notmeter.perfectPercent,90);assert.equal(a.classKey,'검성');
  assert.deepEqual(decoded.unknownProducerField,{value:123});
  assert.ok(a.missingBong.includes('critStat'));assert.ok(a.missingBong.includes('speedNow'));
});
test('missing attack components do not invent an aggregate Attack',()=>{
  const p=m.decode(encode({schema:profile.schema,attack:1000}));
  assert.equal(m.adapt(p).bong.atk,undefined);assert.ok(m.adapt(p).missingBong.includes('atk'));
});
test('malformed, wrong-version, invalid values, and invalid weapon ranges are rejected',()=>{
  for(const value of ['NOTMETER_STATS_V3:e30=','NOTMETER_STATS_V4:???',encode([]),encode({...profile,attack:0}),encode({...profile,perfectPercent:'oops'}),encode({...profile,minimumAttack:5000,maximumAttack:2000}),encode({...profile,hardHitPercent:null})])assert.throws(()=>m.decode(value));
  assert.equal(m.calculate({...m.defaults(),maximumAttack:0}),null);
});
test('Perfect and divine-equivalent option changes affect the adjusted result only',()=>{
  const input={...m.defaults(),perfectPercent:0,hardHitPercent:50};
  const base=m.calculate(input), changed=m.calculate(input,{perfectPercent:20,attackIncreasePercent:1,hardHitPercent:.2});
  close(base.base.damage,changed.base.damage);assert.ok(changed.after.damage>base.base.damage);
  assert.equal(m.calculate(input,{attack:-20000}),null);
});

 test('Research Multi-hit affects core only, caps, and target reductions use separate stages',()=>{
 const s={...m.defaults(),researchEnabled:true,attack:1000,additionalAttack:200,minimumAttack:100,maximumAttack:100,pveAttack:50,bossAttack:50,criticalChancePercent:0};
 const a=m.evaluate(s);close(a.effective,1100*1.02375+300);
 close(m.evaluate(s,{multiHitPercent:81}).effective,1100*1.125+300);
 close(m.evaluate(s,{multiHitPercent:100}).effective,m.evaluate(s,{multiHitPercent:81}).effective);
 close(m.evaluate(s,{additionalAttack:10}).damage-a.damage,10);
 close(m.evaluate({...s,multiHitBasePercent:0,bossDefense:3000,penetration:1000,bossDamageResistancePercent:42.5,damageAmplificationPercent:100}).damage,(1400-200)*1.575);
 close(m.evaluate({...s,researchEnabled:false}).damage,1400);
 close(m.evaluate({...s,multiHitBasePercent:0,bossPerfectResistancePercent:100,perfectPercent:100,maximumAttack:300}).effective,1500);
 assert.equal(m.evaluate({...s,skillCoefficient:0}),null);
 });
