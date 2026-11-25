/* Independent NotMeter stat-efficiency model, adapted for Global.
   Reference: notmeter.com/assets/stat-efficiency-calculator.js (2026-10-26).
   Estimates relative damage for a selected skill hit or a generic hit. */
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
  // Globals: Steam build 26909920, SkillEffect and SkillEffectLv PvE main damage rows.
  // Each variant has a coefficient and its flat damage at levels 1 through 40.
  const skills = {
    11170000: {name: "Overhead Slam", variants: [
      {name: "Specialty 4, guaranteed crit", coefficient: 1.636, guaranteedCrit: true, flat: [
          174, 247, 321, 431, 566, 726, 861, 996, 1131, 1266,
          1425, 1560, 1658, 1732, 1830, 1928, 2027, 2125, 2198, 2272,
          2346, 2419, 2493, 2566, 2640, 2714, 2787, 2861, 2934, 3008,
          3082, 3155, 3229, 3303, 3376, 3450, 3523, 3597, 3671, 3744
      ]},
      {name: "Base damage", coefficient: 1.636, flat: [
          174, 247, 321, 431, 566, 726, 861, 996, 1131, 1266,
          1425, 1560, 1658, 1732, 1830, 1928, 2027, 2125, 2198, 2272,
          2346, 2419, 2493, 2566, 2640, 2714, 2787, 2861, 2934, 3008,
          3082, 3155, 3229, 3303, 3376, 3450, 3523, 3597, 3671, 3744
      ]}
    ]},
    11440000: {name: "Upward Strike", variants: [
      {name: "Specialty 4, guaranteed crit", coefficient: 1.717, guaranteedCrit: true, flat: [
          182, 260, 337, 453, 594, 762, 904, 1045, 1187, 1328,
          1496, 1638, 1741, 1818, 1921, 2024, 2127, 2230, 2307, 2384,
          2462, 2539, 2616, 2693, 2771, 2848, 2925, 3003, 3080, 3157,
          3234, 3312, 3389, 3466, 3543, 3621, 3698, 3775, 3852, 3930
      ]},
      {name: "Base damage", coefficient: 1.717, flat: [
          182, 260, 337, 453, 594, 762, 904, 1045, 1187, 1328,
          1496, 1638, 1741, 1818, 1921, 2024, 2127, 2230, 2307, 2384,
          2462, 2539, 2616, 2693, 2771, 2848, 2925, 3003, 3080, 3157,
          3234, 3312, 3389, 3466, 3543, 3621, 3698, 3775, 3852, 3930
      ]}
    ]},
    11420000: {name: "Smashing Blow", variants: [
      {name: "Specialty 4, 1 target", coefficient: 0.945, flat: [
          83, 125, 168, 210, 274, 352, 444, 522, 600, 678,
          756, 848, 926, 983, 1025, 1082, 1139, 1195, 1252, 1295,
          1337, 1380, 1422, 1465, 1507, 1550, 1592, 1635, 1677, 1720,
          1762, 1805, 1847, 1890, 1932, 1975, 2018, 2060, 2103, 2145
      ]},
      {name: "Specialty 4, 2 targets", coefficient: 0.92, flat: [
          81, 122, 164, 205, 267, 343, 433, 509, 585, 661,
          737, 826, 902, 957, 999, 1054, 1109, 1164, 1220, 1261,
          1302, 1344, 1385, 1427, 1468, 1509, 1551, 1592, 1634, 1675,
          1716, 1758, 1799, 1841, 1882, 1923, 1965, 2006, 2048, 2089
      ]},
      {name: "Specialty 4, 3 targets", coefficient: 0.8945, flat: [
          80, 120, 160, 200, 261, 334, 422, 495, 569, 643,
          717, 804, 878, 932, 972, 1025, 1079, 1133, 1186, 1227,
          1267, 1307, 1347, 1388, 1428, 1468, 1508, 1549, 1589, 1629,
          1669, 1710, 1750, 1790, 1830, 1871, 1911, 1951, 1992, 2032
      ]},
      {name: "Specialty 4, 4 targets", coefficient: 0.869, flat: [
          78, 117, 156, 195, 254, 326, 410, 482, 554, 625,
          697, 782, 854, 906, 945, 997, 1049, 1101, 1153, 1192,
          1232, 1271, 1310, 1349, 1388, 1427, 1466, 1505, 1544, 1583,
          1623, 1662, 1701, 1740, 1779, 1818, 1857, 1896, 1935, 1975
      ]},
      {name: "Base damage", coefficient: 0.845, flat: [
          76, 114, 153, 191, 248, 317, 400, 469, 539, 609,
          679, 761, 831, 881, 919, 970, 1021, 1071, 1122, 1160,
          1198, 1236, 1274, 1312, 1350, 1388, 1426, 1464, 1502, 1540,
          1578, 1616, 1655, 1693, 1731, 1769, 1807, 1845, 1883, 1921
      ]}
    ]},
    11010000: {name: "Rending Blow", variants: [
      {name: "Specialty 4, 1 target", coefficient: 0.8325, flat: [
          76, 113, 151, 188, 244, 313, 394, 463, 531, 600,
          669, 750, 819, 869, 906, 956, 1006, 1056, 1106, 1143,
          1181, 1218, 1256, 1293, 1331, 1368, 1406, 1443, 1481, 1518,
          1555, 1593, 1630, 1668, 1705, 1743, 1780, 1818, 1855, 1893
      ]},
      {name: "Specialty 4, 2 targets", coefficient: 0.81, flat: [
          74, 111, 147, 184, 238, 305, 384, 451, 518, 585,
          651, 730, 797, 846, 882, 931, 979, 1028, 1077, 1113,
          1150, 1186, 1222, 1259, 1295, 1332, 1368, 1405, 1441, 1478,
          1514, 1551, 1587, 1623, 1660, 1696, 1733, 1769, 1806, 1842
      ]},
      {name: "Specialty 4, 3 targets", coefficient: 0.7875, flat: [
          73, 108, 144, 179, 232, 297, 374, 439, 504, 569,
          634, 711, 776, 823, 858, 906, 953, 1000, 1047, 1083,
          1118, 1154, 1189, 1225, 1260, 1296, 1331, 1366, 1402, 1437,
          1473, 1508, 1544, 1579, 1614, 1650, 1685, 1721, 1756, 1792
      ]},
      {name: "Specialty 4, 4 targets", coefficient: 0.765, flat: [
          72, 106, 140, 175, 226, 290, 364, 427, 490, 553,
          617, 691, 754, 800, 835, 881, 926, 972, 1018, 1053,
          1087, 1122, 1156, 1190, 1225, 1259, 1294, 1328, 1362, 1397,
          1431, 1466, 1500, 1535, 1569, 1603, 1638, 1672, 1707, 1741
      ]},
      {name: "Base damage", coefficient: 0.7425, flat: [
          70, 104, 137, 170, 221, 282, 354, 415, 477, 538,
          599, 672, 733, 777, 811, 855, 900, 944, 989, 1022,
          1056, 1089, 1123, 1156, 1189, 1223, 1256, 1290, 1323, 1357,
          1390, 1423, 1457, 1490, 1524, 1557, 1590, 1624, 1657, 1691
      ]}
    ]},
    11100000: {name: "Ruinous Blow", variants: [
      {name: "Main hit", coefficient: 6.89, flat: [
          2387, 3059, 3627, 4196, 4764, 5332, 6004, 6573, 6986, 7296,
          7709, 8123, 8536, 8950, 9260, 9570, 9880, 10190, 10500, 10810,
          11120, 11430, 11740, 12050, 12360, 12670, 12980, 13290, 13600, 13910,
          14220, 14531, 14841, 15151, 15461, 15771, 16081, 16391, 16701, 17011
      ]}
    ]},
    11800000: {name: "Murderous Burst", variants: [
      {name: "Standard proc", coefficient: 0.78, flat: [
          539, 603, 679, 744, 790, 826, 872, 919, 966, 1013,
          1048, 1083, 1118, 1153, 1188, 1223, 1258, 1294, 1329, 1364,
          1399, 1434, 1469, 1504, 1539, 1574, 1609, 1645, 1680, 1715,
          1750, 1785, 1820, 1855, 1890, 1925, 1960, 1996, 2031, 2066
      ]},
      {name: "Stronger proc", coefficient: 1.17, flat: [
          809, 905, 1019, 1116, 1186, 1239, 1309, 1379, 1449, 1519,
          1572, 1625, 1677, 1730, 1783, 1835, 1888, 1941, 1993, 2046,
          2098, 2151, 2204, 2256, 2309, 2362, 2414, 2467, 2520, 2572,
          2625, 2678, 2730, 2783, 2836, 2888, 2941, 2994, 3046, 3099
      ]}
    ]}
  };

  const chains = {11170000: '11440000', 11010000: '11420000'};

  function skillDamage(code, level, variantIndex) {
    if (!Object.hasOwn(skills, code) || !Number.isInteger(level) || level < 1 || level > 40) {
      throw Error('Select a skill level from 1 to 40.');
    }
    const variant = skills[code].variants[variantIndex];
    if (!variant) throw Error('Select a skill variant.');
    return {coefficient: variant.coefficient, flat: variant.flat[level - 1], guaranteedCrit: variant.guaranteedCrit};
  }
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
    const critBoost = .5 + v.criticalDamageAmplificationPercent / 100;
    const effectiveCrit = cap(c.crit, 100) / 100;
    function expectedSkill(code, level, variant) {
      const skill = skillDamage(code, level, variant);
      const chance = skill.guaranteedCrit ? 1 : effectiveCrit;
      return (effective * skill.coefficient + skill.flat) * (1 + chance * critBoost);
    }
    let expected = c.skill ? expectedSkill(c.skill, c.skillLevel, c.skillVariant) : effective * (1 + effectiveCrit * critBoost);
    const followup = !c.split && chains[c.skill];
    if (followup) expected += expectedSkill(followup, c.skillLevel, c.skillVariant);
    const double=1+cap(v.hardHitPercent+c.partyDouble-c.doubleResist)/100;
    const direction=c.direction==='none'?1:1+cap(c.uptime)/100*v[c.direction+'DamageAmplificationPercent']/100;
    return {damage:expected*boost*double*direction,sheet:(v.attack+average+v.additionalAttack)*increase};
  }
  function compare(s,c,delta){const before=calculate(s,c),after=calculate(s,c,delta);return {before,after,gain:100*(after.damage/before.damage-1)};}
  function rank(s,c){
    const rows = [];
    for (const key of Object.keys(fields)) {
      let amount = flat.includes(key) ? 10 : 1;
      if (key === 'minimumAttack') amount = Math.min(amount, s.maximumAttack - s.minimumAttack);
      if (amount > 0) rows.push({key, amount, ...compare(s, c, {[key]: amount})});
    }
    return rows.sort((a,b)=>b.gain-a.gain);
  }
  const api={fields,flat,divine,skills,chains,decode,calculate,compare,rank};root.AionStats=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
