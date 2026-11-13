/* In-app Mirro companions, growth and props. Not ChatGPT Pets. MIT. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(null);
  else root.MirroCompanions=factory(root);
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const SPECIES=[['dog','Собака','🐶'],['cat','Кіт','🐱'],['hamster','Хом’як','🐹'],['rabbit','Кролик','🐰'],['turtle','Черепаха','🐢'],['parrot','Папуга','🦜']].map(([id,label,emoji])=>Object.freeze({id,label,emoji}));
  const STAGES=[['baby','Малюк',0],['young','Юний',5],['teen','Підліток',15],['adult','Дорослий',30]].map(([id,label,minXp])=>Object.freeze({id,label,minXp}));
  const STAGE_SCALES=[.5,.66,.82,1];
  const KEYS=['species','xp','showBowl','showBed','showHome'];
  const images={},sprites=new Map();let loaded=false;
  function getDefaults(){return {species:'dog',xp:0,showBowl:true,showBed:true,showHome:true};}
  function normalizeState(patch={},base){
    const result=getDefaults();
    for(const source of [base,patch]){
      if(source===undefined)continue;
      if(!source||typeof source!=='object'||Array.isArray(source))throw new Error('Некоректні налаштування улюбленця');
      for(const key of KEYS){
        const value=source[key];if(value===undefined)continue;
        if(key==='species'){
          if(!SPECIES.some(s=>s.id===value))throw new Error('Невідомий улюбленець');
        }else if(key==='xp'){
          if(!Number.isSafeInteger(value)||value<0||value>1000000)throw new Error('Дні турботи мають бути невід’ємним цілим числом');
        }else if(typeof value!=='boolean')throw new Error('Налаштування предмета має бути true або false');
        result[key]=value;
      }
    }
    return result;
  }
  function getStage(xp){
    if(!Number.isSafeInteger(xp)||xp<0)throw new Error('Некоректна кількість днів турботи');
    for(let index=STAGES.length-1;index>=0;index--)if(xp>=STAGES[index].minXp)return index;
    return 0;
  }
  function indexFor(species){return SPECIES.findIndex(s=>s.id===species);}
  function validBox(options){return ['x','y','width','height'].every(key=>Number.isFinite(options[key]))&&options.width>0&&options.height>0;}
  function boundsFor(image,type,row,col){
    const art=root.MirroCompanionArt||{};
    const limits=type==='animals'?(art.animalRows||[0,1/6,2/6,3/6,4/6,5/6,1]):(art.propRows||[0,1/6,2/6,3/6,4/6,5/6,1]);
    const count=type==='animals'?4:3;
    const columns=type==='props'&&art.propColumns?art.propColumns[row]:type==='animals'&&art.animalColumns?art.animalColumns[row]:null;
    const left=columns?Math.round(columns[col]*image.width):Math.floor(col*image.width/count);
    const right=columns?Math.round(columns[col+1]*image.width):Math.floor((col+1)*image.width/count);
    return [left,Math.round(limits[row]*image.height),right-left,Math.round(limits[row+1]*image.height)-Math.round(limits[row]*image.height)];
  }
  function sprite(type,species,column){
    const row=indexFor(species),key=type+species+column;
    if(sprites.has(key))return sprites.get(key);
    const image=images[type],box=boundsFor(image,type,row,column);
    const tile=root.document.createElement('canvas');tile.width=box[2];tile.height=box[3];
    const ctx=tile.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,...box,0,0,tile.width,tile.height);
    const pixels=ctx.getImageData(0,0,tile.width,tile.height).data;
    let left=tile.width,top=tile.height,right=-1,bottom=-1;
    for(let y=0;y<tile.height;y++)for(let x=0;x<tile.width;x++)if(pixels[(y*tile.width+x)*4+3]>32){
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
    if(right<left||bottom<top)return null;
    left=Math.max(0,left-2);top=Math.max(0,top-2);right=Math.min(tile.width-1,right+2);bottom=Math.min(tile.height-1,bottom+2);
    const cropped=root.document.createElement('canvas');cropped.width=right-left+1;cropped.height=bottom-top+1;
    cropped.getContext('2d').drawImage(tile,left,top,cropped.width,cropped.height,0,0,cropped.width,cropped.height);
    sprites.set(key,cropped);return cropped;
  }
  function contain(ctx,image,options,scale=1){
    const fit=Math.min(options.width/image.width,options.height/image.height)*scale;
    const width=image.width*fit,height=image.height*fit;
    ctx.drawImage(image,options.x+(options.width-width)/2,options.y+options.height-height,width,height);
  }
  function drawPet(ctx,options){
    if(!loaded||!ctx||indexFor(options.species)<0||!validBox(options)||!Number.isInteger(options.stage)||options.stage<0||options.stage>3)return false;
    const image=sprite('animals',options.species,options.stage);if(!image)return false;
    const time=Number.isFinite(options.time)?options.time:0;
    if(root.MirroPetMotion&&root.MirroPetRig){
      const sampled=root.MirroPetMotion.sample(options.species,time,{action:options.action,actionStart:options.actionStart,seed:options.seed,reducedMotion:options.reducedMotion});
      const pose=options.reducedMotion?sampled:(options.pose||sampled);
      return root.MirroPetRig.draw(ctx,image,{...options,pose,scale:STAGE_SCALES[options.stage]});
    }
    ctx.save();
    const breath=options.reducedMotion?0:Math.sin(time*1.7)*.004;
    const ground=options.y+options.height;
    ctx.translate(options.x+options.width/2,ground);ctx.scale(1-breath*.25,1+breath);ctx.translate(-options.x-options.width/2,-ground);
    contain(ctx,image,options,STAGE_SCALES[options.stage]);ctx.restore();return true;
  }
  function drawProp(ctx,options){
    const col={bowl:0,bed:1,home:2}[options.kind];
    if(!loaded||!ctx||col===undefined||indexFor(options.species)<0||!validBox(options))return false;
    const image=sprite('props',options.species,col);if(!image)return false;
    ctx.save();contain(ctx,image,options);ctx.restore();return true;
  }
  function draw(ctx,options){
    if(!loaded||!ctx||indexFor(options.species)<0||!validBox(options))return false;
    const {x,y,width:w,height:h,species}=options;
    const common={species,time:options.time,reducedMotion:options.reducedMotion,action:options.action,actionStart:options.actionStart,seed:options.seed,pose:options.pose,forceCPU:options.forceCPU};
    const stage=options.stage===undefined?0:options.stage;
    if(!Number.isInteger(stage)||stage<0||stage>3)return false;
    if(options.showHome!==false)drawProp(ctx,{...common,kind:'home',x:x+w*.55,y:y+h*(species==='parrot'?.40:.17),width:w*.42,height:h*(species==='parrot'?.58:.75)});
    if(options.showBed!==false)drawProp(ctx,{...common,kind:'bed',x:x+w*(species==='hamster'?.025:.15),y:y+h*(species==='hamster'?.24:.70),width:w*(species==='hamster'?.36:.43),height:h*(species==='hamster'?.64:.25)});
    if(options.showPet!==false){
      const parrot=species==='parrot'&&options.showHome!==false;
      const bx=parrot?x+w*.48:x+w*.20,by=parrot?y:y+h*.12,bw=parrot?w*.48:w*.44,bh=parrot?h*.45:h*.78;
      drawPet(ctx,{...common,stage,x:bx,y:by,width:bw,height:bh});
    }
    if(options.showBowl!==false)drawProp(ctx,{...common,kind:'bowl',x:x+w*.025,y:y+h*.79,width:w*.21,height:h*.19});
    return true;
  }

  function mount(canvas,initial={},options={}){
    if(!canvas||typeof canvas.getContext!=='function')throw new Error('Потрібен canvas улюбленця');
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas2D недоступний');
    let state=normalizeState(initial),previewStage=null,destroyed=false,frame=0,last=-Infinity,visible=true,paused=false;
    let clockStart=root.performance.now()/1000,frozenTime=0,action='idle',actionStart=0,decoded=false;
    const reduced=root.matchMedia('(prefers-reduced-motion: reduce)');
    const oldAttrs=Object.fromEntries(['role','aria-label','tabindex'].map(key=>[key,canvas.getAttribute(key)]));
    function clock(){return paused?frozenTime:root.performance.now()/1000-clockStart;}
    function repaint(time=clock()){
      if(destroyed)return;
      const rect=canvas.getBoundingClientRect(),dpr=Math.min(root.devicePixelRatio||1,2);
      const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      ctx.clearRect(0,0,w,h);
      const stage=previewStage===null?getStage(state.xp):previewStage;
      if(!draw(ctx,{...state,stage,x:0,y:0,width:w,height:h,time,action,actionStart,seed:options.seed,reducedMotion:reduced.matches})){
        ctx.fillStyle='#54756b';ctx.font=`${Math.min(w,h)*.22}px sans-serif`;ctx.textAlign='center';ctx.fillText(SPECIES[indexFor(state.species)].emoji,w/2,h*.6);
      }
      canvas.dataset.petSpecies=state.species;canvas.dataset.petStage=String(stage);canvas.dataset.petLoaded=String(loaded);
      canvas.dataset.petAction=action;canvas.dataset.petPaused=String(paused);
      canvas.setAttribute('role',options.interactive===false?'img':'button');canvas.setAttribute('aria-label',`${SPECIES[indexFor(state.species)].label}: ${STAGES[stage].label}${previewStage===null?'':' — попередній перегляд'}${options.interactive===false?'':'. Натисни, щоб привітатися.'}`);
    }
    function active(){return !destroyed&&decoded&&!paused&&!root.document.hidden&&visible&&!reduced.matches;}
    function schedule(){if(!frame&&active())frame=root.requestAnimationFrame(tick);}
    function refresh(){if(!active()&&frame){root.cancelAnimationFrame(frame);frame=0;}repaint();schedule();}
    function tick(now){
      frame=0;
      if(destroyed)return;
      if(active()&&now-last>=1000/30){last=now;repaint();}
      schedule();
    }
    function play(next){
      if(destroyed)throw new Error('Улюбленця вже видалено');
      if(!['idle','happy','eat','sleep'].includes(next))throw new Error('Невідома анімація улюбленця');
      action=next;actionStart=clock();repaint();schedule();
      if(typeof options.onAction==='function')options.onAction({action,species:state.species});
    }
    function tap(){play('happy');}
    function keydown(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();tap();}}
    if(options.interactive!==false){canvas.tabIndex=0;canvas.addEventListener('click',tap);canvas.addEventListener('keydown',keydown);}
    const observer=typeof root.ResizeObserver==='function'?new root.ResizeObserver(()=>repaint()):null;
    const resize=()=>repaint();
    if(observer)observer.observe(canvas);else root.addEventListener('resize',resize);
    const intersection=typeof root.IntersectionObserver==='function'?new root.IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();}):null;
    if(intersection)intersection.observe(canvas);
    reduced.addEventListener('change',refresh);root.document.addEventListener('visibilitychange',refresh);
    repaint();ready.then(()=>{if(!destroyed){decoded=true;refresh();}});
    return {
      ready,
      update(patch){if(destroyed)throw new Error('Улюбленця вже видалено');const previous=state.species;state=normalizeState(patch,state);if(state.species!==previous){action='idle';actionStart=clock();}repaint();return {...state};},
      getState(){return {...state};},
      getPlayback(){return {action,actionStart,time:clock(),paused};},
      play,
      pause(){if(destroyed)return;if(!paused){frozenTime=clock();paused=true;}refresh();},
      resume(){if(destroyed)return;if(paused){clockStart=root.performance.now()/1000-frozenTime;paused=false;}last=-Infinity;refresh();},
      setPreviewStage(stage){if(destroyed)throw new Error('Улюбленця вже видалено');if(stage!==null&&(!Number.isInteger(stage)||stage<0||stage>3))throw new Error('Некоректна стадія росту');previewStage=stage;repaint();},
      draw:repaint,
      destroy(){destroyed=true;root.cancelAnimationFrame(frame);frame=0;if(observer)observer.disconnect();else root.removeEventListener('resize',resize);if(intersection)intersection.disconnect();reduced.removeEventListener('change',refresh);root.document.removeEventListener('visibilitychange',refresh);canvas.removeEventListener('click',tap);canvas.removeEventListener('keydown',keydown);for(const [key,value] of Object.entries(oldAttrs)){if(value===null)canvas.removeAttribute(key);else canvas.setAttribute(key,value);}ctx.clearRect(0,0,canvas.width,canvas.height);},
    };
  }
  const ready=!root?Promise.resolve(false):Promise.all(['animals','props'].map(type=>new Promise(resolve=>{
    const src=root.MirroCompanionArt&&root.MirroCompanionArt[type];if(!src){resolve(false);return;}
    const image=new Image();image.onload=()=>{images[type]=image;resolve(true);};image.onerror=()=>resolve(false);image.src=src;
  }))).then(results=>(loaded=results.every(Boolean)));
  return {SPECIES,STAGES,STAGE_SCALES,getDefaults,normalizeState,getStage,draw,drawPet,drawProp,mount,ready,isReady:()=>loaded};
});
