/* Fitness and fat-distribution shaping for painted Mirro bodies. MIT. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.MirroMorphology=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const smooth=(a,b,value)=>{const t=clamp((value-a)/(b-a),0,1);return t*t*(3-2*t);};
  const bell=(value,center,radius)=>{const t=Math.abs(value-center)/radius;return t>=1?0:(1-t*t)**2;};
  function getMorphology(options={}){
    const profile=options.profile||{};
    const active=profile.sporty!==undefined||profile.shape!==undefined||options.fitnessTone!==undefined;
    if(!active)return Object.freeze({enabled:false,fitness:1,armScale:1,muscleContrast:1,distribution:'even',bellyProjection:0,hipProjection:0,cacheKey:'reference'});
    const chosen=options.fitnessTone===undefined?Number(profile.sporty===undefined?0:profile.sporty):Number(options.fitnessTone);
    if(!Number.isFinite(chosen))throw new TypeError('Fitness score must be finite');
    const height=Number(options.height===undefined?(profile.height===undefined?175:profile.height):options.height);
    if(!Number.isFinite(height)||height<=0)throw new TypeError('Body height must be positive');
    const shape=profile.shape||(profile.sex==='f'?'hips':'belly');
    if(!['belly','even','hips'].includes(shape))throw new RangeError('Unknown fat distribution');
    const waist=Number(options.measurements&&options.measurements.waist);
    const softness=Number.isFinite(waist)&&waist>0?clamp((waist/height-.45)/.22,0,1):0;
    const fitness=clamp(chosen/50,0,1);
    const armScale=.76+.28*fitness+.04*softness*(1-fitness);
    const muscleContrast=.22+.78*fitness-.03*softness*(1-fitness);
    // These are smooth fullness profiles BETWEEN measurement planes. The
    // measured waist/chest/thigh widths and all vertical coordinates stay put.
    const bellyProjection=shape==='belly'?.085:shape==='hips'?-.025:0;
    const hipProjection=shape==='hips'?.09:shape==='belly'?-.018:0;
    const cacheKey=[fitness.toFixed(3),armScale.toFixed(3),muscleContrast.toFixed(3),shape].join(':');
    return Object.freeze({enabled:true,fitness,armScale,muscleContrast,distribution:shape,bellyProjection,hipProjection,cacheKey});
  }
  function mapX(mapped,x,y,row,options){
    const morph=options.morphology||getMorphology(options);
    if(!morph.enabled||x===0||y<.16)return mapped;
    const sign=x<0?-1:1,ax=Math.abs(x),physical=options.height/998;
    const side=sign<0?row.left:row.right,edge=clamp(side.edge,65,155);
    // The source upper arms sit near x=110..135, reaching x=170 only at
    // the wrist. A wrist-sized pivot left the painted biceps almost unchanged.
    const armCenter=108+70*smooth(.20,.50,y);
    const armMask=smooth(edge*.90,edge*1.20,ax)*smooth(.19,.26,y)*(1-smooth(.48,.55,y));
    const armDelta=(ax-armCenter)*(morph.armScale-1)*armMask*physical;
    const central=1-smooth(edge*.78,edge*1.14,ax);
    const fullness=morph.bellyProjection*bell(y,.445,.055)+morph.hipProjection*bell(y,.535,.060);
    const fullnessDelta=ax*physical*fullness*central;
    return mapped+sign*(armDelta+fullnessDelta);
  }
  function shadeSkin(shade,x,y,options){
    const morph=options.morphology||getMorphology(options);
    if(!morph.enabled)return shade;
    const ax=Math.abs(x);
    // Source skin spans x≈85..190 around the shoulders/arms. Cover the whole
    // exposed limb so an untouched dark inner-biceps edge cannot remain.
    const arms=smooth(65,95,ax)*smooth(.18,.235,y)*(1-smooth(.49,.59,y));
    const legs=smooth(.54,.61,y)*(1-smooth(.88,.94,y))*(1-smooth(125,155,ax));
    const contrast=1-arms*(1-morph.muscleContrast)-legs*(1-(.7+.3*morph.fitness));
    return 1+(shade-1)*clamp(contrast,.32,1);
  }
  return Object.freeze({getMorphology,mapX,shadeSkin});
});
