/* Pure, time-based motion for Mirro's in-app companions. MIT. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.MirroPetMotion=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const SPECIES=Object.freeze(['dog','cat','hamster','rabbit','turtle','parrot']);
  const DURATIONS=Object.freeze({happy:1.8,eat:2.4});
  const NEUTRAL=Object.freeze({
    headAngle:0,earAngle:0,tailAngle:0,bodyY:0,bodyScaleY:1,
    blink:0,paw:0,wing:0,mouth:0,hop:0,
  });
  const BLINK_PERIOD=Object.freeze({dog:4.3,cat:4.8,hamster:3.8,rabbit:4.5,turtle:7.4,parrot:4.1});
  const TAU=Math.PI*2;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const smooth=value=>{const x=clamp(value,0,1);return x*x*(3-2*x);};
  const modulo=(value,period)=>((value%period)+period)%period;
  // The bounded seed hash avoids overflow for any finite seed.
  function seedPhase(seed){
    const hash=Math.sin((seed%1000003)*12.9898)*43758.5453;
    return hash-Math.floor(hash);
  }
  function wave(time,hz,phase){return Math.sin(modulo(time,1/hz)*TAU*hz+phase);}
  function pulse(time,center,halfWidth){return 1-smooth(Math.abs(time-center)/halfWidth);}
  function idle(species,time,phase){
    const p={...NEUTRAL},a=phase*TAU;
    p.blink=pulse(modulo(time+phase*BLINK_PERIOD[species],BLINK_PERIOD[species]),.16,.085);
    p.bodyScaleY=1+.004*wave(time,.3,a);
    p.bodyY=.0015*wave(time,.3,a);
    switch(species){
      case 'dog':
        p.headAngle=.025*wave(time,.29,a+.6);
        p.earAngle=.035*wave(time,.68,a);
        p.tailAngle=.16*wave(time,1.55,a);
        p.paw=.012*wave(time,.43,a);
        break;
      case 'cat':
        p.headAngle=.018*wave(time,.2,a);
        // A slow tail sweep and a brief, deterministic ear twitch.
        p.tailAngle=.12*wave(time,.31,a+.8);
        p.earAngle=.07*pulse(modulo(time+phase*6.1,6.1),1.1,.27)*wave(time,3.4,a);
        p.paw=.008*wave(time,.35,a);
        break;
      case 'hamster':
        p.headAngle=.025*wave(time,.62,a);
        p.earAngle=.018*wave(time,1.8,a);
        p.paw=.035*wave(time,1.6,a);
        p.mouth=.025*(1+wave(time,2.2,a));
        p.bodyScaleY=1+.005*wave(time,.52,a);
        break;
      case 'rabbit':
        p.headAngle=.018*wave(time,.26,a);
        p.earAngle=.065*wave(time,.47,a+.5);
        p.paw=.012*wave(time,.4,a);
        p.mouth=.018*(1+wave(time,2.5,a));
        break;
      case 'turtle':
        p.headAngle=.022*wave(time,.12,a);
        p.paw=.018*wave(time,.16,a+.8);
        p.tailAngle=.012*wave(time,.13,a);
        p.bodyY=.0008*wave(time,.15,a);
        p.bodyScaleY=1+.002*wave(time,.17,a);
        break;
      case 'parrot':
        p.headAngle=.04*wave(time,.41,a);
        p.tailAngle=.035*wave(time,.45,a+.8);
        p.wing=.025*wave(time,.32,a);
        p.paw=.01*wave(time,.43,a);
        break;
    }
    return p;
  }
  function sleep(species,time,phase){
    const p={...NEUTRAL},a=phase*TAU;
    const hz=species==='turtle'?.12:.2;
    p.blink=1;
    p.headAngle=species==='parrot'?.09:.045;
    p.bodyScaleY=1+.005*wave(time,hz,a);
    p.bodyY=.001*wave(time,hz,a);
    p.earAngle=species==='rabbit'?-.04:0;
    return p;
  }
  function happy(p,species,time,envelope){
    const fast=wave(time,3.5,0),bounce=Math.pow(Math.max(0,wave(time,2.1,0)),2);
    p.headAngle+=envelope*.075*wave(time,1.7,0);
    p.bodyScaleY+=envelope*.012*wave(time,2.1,0);
    switch(species){
      case 'dog':
        p.tailAngle+=envelope*.38*fast;
        p.earAngle+=envelope*.11*wave(time,2.1,0);
        p.paw+=envelope*.1*bounce;
        p.mouth+=envelope*.4;
        break;
      case 'cat':
        p.tailAngle+=envelope*.2*wave(time,1.1,.5);
        p.earAngle+=envelope*.09*wave(time,1.8,0);
        p.paw+=envelope*.06*bounce;
        break;
      case 'hamster':
        p.paw+=envelope*.18*fast;
        p.earAngle+=envelope*.05*fast;
        p.mouth+=envelope*.15*bounce;
        break;
      case 'rabbit':
        p.earAngle+=envelope*.18*wave(time,2.1,.7);
        p.hop=envelope*.65*bounce;
        p.paw+=envelope*.08*bounce;
        break;
      case 'turtle':
        p.headAngle+=envelope*.055*wave(time,.8,0);
        p.paw+=envelope*.07*wave(time,.9,0);
        p.tailAngle+=envelope*.04*wave(time,1,0);
        break;
      case 'parrot':
        p.wing+=envelope*.5*wave(time,3.6,0);
        p.tailAngle+=envelope*.12*wave(time,1.8,.5);
        p.mouth+=envelope*.25*bounce;
        p.paw+=envelope*.035*bounce;
        break;
    }
  }
  function eat(p,species,time,envelope){
    const hz=species==='turtle'?1.2:species==='hamster'?4:2.7;
    const chew=.5+.5*wave(time,hz,0);
    p.headAngle+=envelope*(.075+.025*wave(time,hz,0));
    p.mouth+=envelope*(.12+.55*chew);
    if(species==='hamster'||species==='rabbit')p.paw+=envelope*(.08+.07*wave(time,hz,.8));
    if(species==='parrot'){
      p.headAngle+=envelope*.07*wave(time,1.6,0);
      p.wing+=envelope*.025*wave(time,1.2,0);
    }
    if(species==='dog'||species==='cat')p.tailAngle+=envelope*.06*wave(time,1.2,0);
  }

  /**
   * Sample one pose without touching the DOM or scheduling frames.
   * Angles are radians; bodyY is a fraction of sprite height; bodyScaleY's
   * neutral value is 1. hop is a separate 0..1 signal, not included in bodyY.
   * time and actionStart use the same seconds-based clock. Finite actions
   * return exactly to the current idle pose at expiry or before actionStart.
   */
  function sample(species,time,options={}){
    if(!SPECIES.includes(species))throw new RangeError('Unknown Mirro pet species: '+species);
    if(!Number.isFinite(time))throw new TypeError('Pet motion time must be finite seconds');
    if(!options||typeof options!=='object'||Array.isArray(options))throw new TypeError('Pet motion options must be an object');
    const action=options.action===undefined?'idle':options.action;
    if(!['idle','happy','eat','sleep'].includes(action))throw new RangeError('Unknown Mirro pet action: '+action);
    const start=options.actionStart===undefined?0:options.actionStart;
    const seed=options.seed===undefined?0:options.seed;
    if(!Number.isFinite(start)||!Number.isFinite(seed))throw new TypeError('Pet actionStart and seed must be finite numbers');
    if(options.reducedMotion===true)return {...NEUTRAL};
    const phase=seedPhase(seed),p=idle(species,time,phase);
    if(action==='idle'||time<start)return p;
    if(action==='sleep')return sleep(species,time,phase);
    const elapsed=time-start,duration=DURATIONS[action];
    // Compare clock positions, avoiding subtraction roundoff at exact expiry.
    if(time>=start+duration)return p;
    const envelope=smooth(elapsed/.16)*smooth((duration-elapsed)/.3);
    if(action==='happy')happy(p,species,elapsed,envelope);
    else eat(p,species,elapsed,envelope);
    p.mouth=clamp(p.mouth,0,1);
    return p;
  }
  return Object.freeze({SPECIES,DURATIONS,NEUTRAL,sample});
});
