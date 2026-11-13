/* Mirro change: soft hair/skin recolouring. */
/* Layered Mirro head compositor. No dependencies; MIT. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(null);
  else root.MirroAppearance = factory(root);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';
  const HAIRSTYLES = {
    male: [['buzz','Їжачок'],['crop','Коротка'],['side-part','На бік'],['fringe','З чубчиком'],['quiff','Квіф'],['slick-back','Назад'],['curly','Кучері'],['long','Довга'],['bun','Пучок']].map(([id,label])=>({id,label})),
    female: [['pixie','Піксі'],['bob','Боб'],['lob','Каре'],['waves','Хвилі'],['ponytail','Хвіст'],['bun','Пучок'],['braid','Коса'],['braids','Дві коси'],['curls','Кучері']].map(([id,label])=>({id,label})),
  };
  const HAIR_COLORS = [
    ['black','Чорний','#232326'],['brown','Каштановий','#70442b'],['chestnut','Рудуватий','#a3552d'],
    ['blonde','Блонд','#d9b87b'],['grey','Сивий','#aab0b6'],['white','Сріблястий','#deddd6'],['rose','Рожевий','#bd6b91'],
  ].map(([id,label,value])=>({id,label,value}));
  const EYE_COLORS = [
    ['brown','Карі','#80522f'],['blue','Блакитні','#4c95cf'],['green','Зелені','#69904d'],['grey','Сірі','#8a9ca6'],['hazel','Горіхові','#a3914b'],
  ].map(([id,label,value])=>({id,label,value}));
  const BEARD_STYLES = [['none','Без бороди'],['stubble','Щетина'],['short','Коротка'],['full','Борода'],['moustache','Вуса'],['both','Борода й вуса']].map(([id,label])=>({id,label}));
  const KEYS = ['hairStyle','hairColor','eyeColor','beardStyle','beardColor'];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function kind(appearance) { if(!HAIRSTYLES[appearance]) throw new Error('Невідомий варіант персонажа'); return appearance; }
  function color(value) {
    if(typeof value!=='string'||!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) throw new Error('Колір має бути у форматі #RRGGBB');
    value=value.toLowerCase();
    return value.length===4?'#'+[...value.slice(1)].map(c=>c+c).join(''):value;
  }
  function getDefaults(appearance='male') {
    kind(appearance);
    return {hairStyle:appearance==='male'?'quiff':'ponytail',hairColor:'#70442b',eyeColor:'#80522f',beardStyle:appearance==='male'?'full':'none',beardColor:'#70442b'};
  }
  function normalizeCustomization(patch={},appearance='male',base) {
    kind(appearance);
    if(!patch||typeof patch!=='object'||Array.isArray(patch)) throw new Error('Некоректні налаштування зовнішності');
    const result={...getDefaults(appearance)};
    for(const source of [base,patch]) {
      if(source===undefined) continue;
      if(!source||typeof source!=='object'||Array.isArray(source)) throw new Error('Некоректні налаштування зовнішності');
      for(const key of KEYS) {
        if(source[key]===undefined) continue;
        if(key.endsWith('Color')) result[key]=color(source[key]);
        else if(key==='hairStyle') {
          if(!HAIRSTYLES[appearance].some(style=>style.id===source[key])) throw new Error('Невідома зачіска');
          result[key]=source[key];
        } else {
          if(!BEARD_STYLES.some(style=>style.id===source[key])) throw new Error('Невідома борода');
          result[key]=source[key];
        }
      }
    }
    if(appearance==='female') result.beardStyle='none';
    return result;
  }

  // Measured iris landmarks from the generated atlas. Registration keeps the
  // eyes and nose stationary while switching between all nine hairstyles.
  const EYES = {
    male: [[.3992,.6058,.4253],[.3974,.6041,.4259],[.3964,.6011,.4253],[.4049,.6058,.4292],[.3993,.6051,.4285],[.3984,.6007,.4282],[.4047,.6058,.4286],[.4027,.6027,.4290],[.3986,.6016,.4278]],
    female: [[.4546,.6390,.3936],[.4125,.6011,.3915],[.3824,.5714,.3896],[.4575,.6401,.3853],[.4260,.6066,.3863],[.3873,.5680,.3993],[.4629,.6448,.3375],[.4173,.6018,.3368],[.3911,.5726,.3380]],
  };
  const SIZE=512;
  const images={};
  const rawCache=new Map(), composedCache=new Map();
  const beardCache=new Map();
  let loaded=false;
  function canvas() { const c=root.document.createElement('canvas');c.width=c.height=SIZE;return c; }
  function rgb(hex) { return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)); }
  function getHeadLandmarks(appearance='male',style) {
    kind(appearance);
    return {eyeY:.42,chinY:appearance==='male'?.755:.715,faceHalfWidth:.24,centerX:.5,faceCenterX:.5,leftEyeX:.4,rightEyeX:.6,necklineY:.93};
  }
  function getRawHead(appearance,style) {
    const key=appearance+style;
    if(rawCache.has(key)) return rawCache.get(key);
    const index=HAIRSTYLES[appearance].findIndex(s=>s.id===style);
    const image=images[appearance];
    const cw=image.width/3,ch=image.height/3;
    const [lx,rx,ey]=EYES[appearance][index];
    const scale=(SIZE*.2)/(cw*(rx-lx));
    const center=(lx+rx)/2*cw;
    const out=canvas(),ctx=out.getContext('2d',{willReadFrequently:true});
    // First isolate the source cell to avoid adjacent portraits when shifted.
    const tile=root.document.createElement('canvas');tile.width=cw;tile.height=ch;
    tile.getContext('2d').drawImage(image,index%3*cw,Math.floor(index/3)*ch,cw,ch,0,0,cw,ch);
    ctx.drawImage(tile,SIZE*.5-center*scale,SIZE*.42-ey*ch*scale,cw*scale,ch*scale);
    const data=ctx.getImageData(0,0,SIZE,SIZE);
    const hair=new Uint8Array(SIZE*SIZE), skin=new Uint8Array(SIZE*SIZE);
    for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++) {
      const pos=y*SIZE+x,i=pos*4,r=data.data[i],g=data.data[i+1],b=data.data[i+2];
      if(data.data[i+3]<10) continue;
      const nx=x/SIZE,ny=y/SIZE,dx=Math.abs(nx-.5);
      const warm=r>g*1.08&&g>b*1.03;
      const dark=r<185&&g<145&&b<115;
      const above=ny<.33||(ny<.395&&r<115&&g<85);
      const faceBoundary=ny<.62?.235:.20;
      const outside=dx>faceBoundary&&ny<.99;
      const ears=dx>.21&&dx<.30&&ny>.40&&ny<.61;
      if(warm&&dark&&(above||(outside&&!ears))) hair[pos]=255;
      else if(warm&&ny>.29&&ny<.94&&dx<.3) skin[pos]=255;
    }
    const result={out,data,hair,skin};rawCache.set(key,result);return result;
  }

  function beard(ctx,custom) {
    if(custom.beardStyle==='none') return;
    if(images.beards) {
      const type=custom.beardStyle;
      const key=type+custom.beardColor;
      let sprite=beardCache.get(key);
      if(!sprite) {
        const index=type==='stubble'?0:type==='short'?1:type==='moustache'?3:2;
        const atlas=images.beards,cw=atlas.width/2,ch=atlas.height/2;
        const tile=root.document.createElement('canvas');tile.width=cw;tile.height=ch;
        const tc=tile.getContext('2d',{willReadFrequently:true});
        tc.drawImage(atlas,index%2*cw,Math.floor(index/2)*ch,cw,ch,0,0,cw,ch);
        const data=tc.getImageData(0,0,cw,ch),target=rgb(custom.beardColor);
        let left=cw,top=ch,right=0,bottom=0;
        for(let y=0;y<ch;y++)for(let x=0;x<cw;x++) {
          const i=(y*cw+x)*4;
          if(data.data[i+3]<16)continue;
          left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
          const lum=(data.data[i]*.2126+data.data[i+1]*.7152+data.data[i+2]*.0722)/255;
          const shade=clamp((lum+.04)/.33,.20,1.9);
          for(let k=0;k<3;k++)data.data[i+k]=clamp(target[k]*shade,0,255);
        }
        tc.putImageData(data,0,0);
        const out=canvas(),oc=out.getContext('2d');
        if(type==='moustache')oc.drawImage(tile,left,top,right-left+1,bottom-top+1,SIZE*.37,SIZE*.576,SIZE*.26,SIZE*.060);
        else {
          oc.globalAlpha=type==='stubble'?.56:.92;
          oc.drawImage(tile,left,top,right-left+1,bottom-top+1,SIZE*.268,SIZE*.459,SIZE*.464,SIZE*(type==='full'||type==='both'?.33:.31));
          if(type==='full') {
            // The legacy enum distinguishes beard-only from beard+moustache.
            oc.globalCompositeOperation='destination-out';
            oc.beginPath();oc.ellipse(SIZE*.5,SIZE*.594,SIZE*.127,SIZE*.031,0,0,Math.PI*2);oc.fill();
          }
        }
        sprite=out;
        if(beardCache.size>16)beardCache.delete(beardCache.keys().next().value);
        beardCache.set(key,out);
      }
      ctx.drawImage(sprite,0,0);return;
    }
    const type=custom.beardStyle,stubble=type==='stubble';
    const c=rgb(custom.beardColor),S=SIZE;
    const faceHair=type!=='moustache';
    const full=type==='full'||type==='both';
    ctx.save();ctx.scale(S,S);
    const path=new Path2D();
    if(faceHair) {
      const bottom=full?.795:.765;
      path.moveTo(.281,.535);path.bezierCurveTo(.32,.575,.37,.595,.407,.615);
      path.quadraticCurveTo(.5,.655,.593,.615);path.bezierCurveTo(.63,.595,.68,.575,.719,.535);
      path.lineTo(.707,.665);path.quadraticCurveTo(.65,bottom,.5,bottom);
      path.quadraticCurveTo(.35,bottom,.293,.665);path.closePath();
      path.ellipse(.5,.644,.112,.033,0,0,Math.PI*2,true);
    }
    if(type==='both'||type==='moustache'||type==='short'||stubble) {
      path.moveTo(.378,.618);path.quadraticCurveTo(.409,.584,.476,.589);
      path.quadraticCurveTo(.5,.602,.524,.589);path.quadraticCurveTo(.591,.584,.622,.618);
      path.quadraticCurveTo(.55,.625,.5,.613);path.quadraticCurveTo(.45,.625,.378,.618);path.closePath();
    }
    ctx.clip(path,'evenodd');
    const grad=ctx.createLinearGradient(.3,.54,.65,.81);
    grad.addColorStop(0,`rgb(${c.map(v=>Math.round(v*.63)).join(',')})`);
    grad.addColorStop(.45,custom.beardColor);
    grad.addColorStop(1,`rgb(${c.map(v=>Math.round(v*.52)).join(',')})`);
    ctx.globalAlpha=stubble?.22:.82;ctx.fillStyle=grad;ctx.fillRect(.25,.53,.5,.3);
    let seed=47;
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    ctx.globalAlpha=stubble?.32:.54;
    for(let i=0;i<(stubble?2000:3400);i++) {
      const x=.27+random()*.46,y=.54+random()*.27;
      const light=.6+random()*.85;
      ctx.strokeStyle=`rgb(${c.map(v=>Math.round(clamp(v*light,0,255))).join(',')})`;
      ctx.lineWidth=(.45+random()*.55)/S;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+(x-.5)*.009,y+.002,x+(x-.5)*.018,y+(stubble?.003:.009+random()*.009));ctx.stroke();
    }
    ctx.restore();
  }

  function paintEyes(ctx,eyeColor,appearance,blink) {
    const S=SIZE,cy=.425*S,rx=(appearance==='female'?.019:.014)*S,ry=rx*.9;
    const c=rgb(eyeColor);
    for(const x of [.4,.6]) {
      const cx=x*S;
      ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.clip();
      ctx.globalCompositeOperation='color';ctx.fillStyle=eyeColor;ctx.fillRect(cx-rx,cy-ry,rx*2,ry*2);
      ctx.globalCompositeOperation='source-over';
      ctx.globalAlpha=.24;const iris=ctx.createRadialGradient(cx,cy,rx*.3,cx,cy,rx);
      iris.addColorStop(0,`rgb(${c.join(',')})`);iris.addColorStop(.78,eyeColor);iris.addColorStop(1,'#18232a');
      ctx.fillStyle=iris;ctx.fillRect(cx-rx,cy-ry,rx*2,ry*2);
      ctx.globalAlpha=1;ctx.fillStyle='#18201e';ctx.beginPath();ctx.ellipse(cx,cy,rx*.36,ry*.7,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ffffffd9';ctx.beginPath();ctx.arc(cx-rx*.25,cy-ry*.3,rx*.19,0,Math.PI*2);ctx.fill();ctx.restore();
      if(blink>.01) {
        // Close the eyelid over the iris and eye whites, preserving eyebrows.
        const w=S*.041,h=S*(appearance==='female'?.023:.016);
        const close=clamp(blink,0,1);
        ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,w,h,0,0,Math.PI*2);ctx.clip();
        const sample=ctx.getImageData(Math.round(cx),Math.round(cy-h-5),1,1).data;
        const grad=ctx.createLinearGradient(0,cy-h,0,cy+h);
        grad.addColorStop(0,`rgb(${sample[0]},${sample[1]},${sample[2]})`);
        grad.addColorStop(1,`rgb(${sample[0]*.87},${sample[1]*.82},${sample[2]*.8})`);
        ctx.fillStyle=grad;ctx.fillRect(cx-w,cy-h,w*2,h*2*close);
        ctx.strokeStyle='#664238';ctx.lineWidth=1.4;ctx.beginPath();
        ctx.moveTo(cx-w,cy-h+h*2*close);ctx.quadraticCurveTo(cx,cy+h*close,cx+w,cy-h+h*2*close);ctx.stroke();ctx.restore();
      }
    }
  }

  function getHeadCanvas(appearance='male',patch={},options={}) {
    if(!loaded) return null;
    const custom=normalizeCustomization(patch,appearance);
    const blink=Math.round(clamp(Number(options.blink)||0,0,1)*4)/4;
    const skinColor=options.skinColor?color(options.skinColor):'';
    const key=JSON.stringify([appearance,custom,skinColor,blink]);
    if(composedCache.has(key)) return composedCache.get(key);
    const raw=getRawHead(appearance,custom.hairStyle),out=canvas(),ctx=out.getContext('2d',{willReadFrequently:true});
    const data=new ImageData(new Uint8ClampedArray(raw.data.data),SIZE,SIZE);
    const hairColor=rgb(custom.hairColor),skinTarget=skinColor?rgb(skinColor):null;
    for(let pos=0;pos<SIZE*SIZE;pos++) {
      const i=pos*4,r=data.data[i],g=data.data[i+1],b=data.data[i+2];
      const lum=(r*.2126+g*.7152+b*.0722)/255;
      // Remove the blue shirt using ORIGINAL pixels, before hair tinting.
      // This keeps blue custom hair intact and preserves the host's clothing.
      if(pos/SIZE/SIZE>.70&&b>r*1.18&&b>g*1.12) {
        data.data[i+3]=0;
      } else if(r>g*1.08&&g>b*1.03) {
        // Mirro change: hair vs skin by brightness with a soft blend (the original split by fixed boxes,
        // which left rectangular patches around female faces)
        const t=raw.hair[pos]||raw.skin[pos]?clamp((lum-.30)/.20,0,1):1;   // 0 = hair, 1 = skin
        const hs=clamp((lum+.055)/.265,.19,2.3),ss=clamp((lum+.10)/.68,.3,1.4);
        for(let k=0;k<3;k++){const hv=hairColor[k]*hs,sv=skinTarget?skinTarget[k]*ss:data.data[i+k];data.data[i+k]=clamp(hv+(sv-hv)*t,0,255);}
      }
    }
    ctx.putImageData(data,0,0);
    if(appearance==='male')beard(ctx,custom);
    paintEyes(ctx,custom.eyeColor,appearance,blink);
    // Hide the shirt portion in the reusable head so existing clothes survive.
    // Hair at the sides is retained, including long cuts and braids.
    ctx.globalCompositeOperation='destination-out';
    const fade=ctx.createLinearGradient(0,SIZE*.85,0,SIZE*.95);
    fade.addColorStop(0,'#0000');fade.addColorStop(1,'#000');
    ctx.fillStyle=fade;ctx.fillRect(SIZE*.24,SIZE*.85,SIZE*.52,SIZE*.15);
    ctx.globalCompositeOperation='source-over';
    // Bounded cache: custom color sliders cannot retain unbounded image buffers.
    if(composedCache.size>=28)composedCache.delete(composedCache.keys().next().value);
    composedCache.set(key,out);return out;
  }

  const ready = !root ? Promise.resolve(false) : Promise.all(['male','female','beards'].map(appearance=>new Promise(resolve=>{
    const src=root.MirroAppearanceArt&&root.MirroAppearanceArt[appearance];
    if(!src){resolve(false);return;}
    const image=new Image();image.onload=()=>{images[appearance]=image;resolve(true);};image.onerror=()=>resolve(false);image.src=src;
  }))).then(results=>(loaded=results.every(Boolean)));

  return {HAIRSTYLES,HAIR_COLORS,EYE_COLORS,BEARD_STYLES,getDefaults,normalizeCustomization,
    ready,isReady:()=>loaded,getHeadCanvas,getHeadLandmarks};
});
