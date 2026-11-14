/* Fitted, detailed accessory layers for the existing Mirro body. MIT. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(null);
  else root.MirroAccessories=factory(root);
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const ITEMS=Object.freeze([
    ['headphones','headphones','Навушники'],['headband','headband','Спортивна пов’язка'],
    ['bandana','acc_bandana','Бандана на шию'],['towel','acc_towel','Спортивний рушник'],
    ['waistbag','acc_waistbag','Поясна сумка'],['crossbody','acc_crossbody','Сумка через плече'],
    ['wristbands','acc_wristbands','Напульсники'],['watch','watch','Смартгодинник'],['bottle','acc_bottle','Пляшка для води'],
  ].map(([kind,id,label])=>Object.freeze({kind,id,label})));
  const sprites=new Map();let atlas=null,loaded=false;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
  function getCatalog(appearance='male'){
    if(!['male','female'].includes(appearance))throw new RangeError('Unknown accessory appearance');
    return ITEMS.map(item=>({...item,appearance}));
  }
  function canvas(w,h){const c=root.document.createElement('canvas');c.width=w;c.height=h;return c;}
  function sprite(appearance,kind,part){
    const key=[appearance,kind,part||''].join(':');if(sprites.has(key))return sprites.get(key);
    const supplied=root.MirroAccessoryArt?.frames?.[appearance]?.[kind];
    const box=part?supplied?.parts?.[part]:supplied;if(!box)return null;
    const c=canvas(box.width,box.height),ctx=c.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(atlas,box.x,box.y,box.width,box.height,0,0,c.width,c.height);
    const data=ctx.getImageData(0,0,c.width,c.height),pixels=data.data,n=c.width*c.height;
    // Remove disconnected alpha-matte flecks, preserving the actual white
    // headphone housing and lavender fabric. No chroma tinting of the art.
    for(let i=0;i<n;i++){
      const p=i*4,r=pixels[p],g=pixels[p+1],b=pixels[p+2];
      const neon=(r>g*1.9&&b>g*1.8&&r+b>300)||(g>r*2&&g>b*1.7&&g>170)||(b>r*2.2&&b>g*1.9&&b>180);
      if(pixels[p+3]<145||neon)pixels[p+3]=0;
    }
    const labels=new Int32Array(n),queue=new Int32Array(n),sizes=[0];let count=0;
    for(let start=0;start<n;start++)if(!labels[start]&&pixels[start*4+3]){
      count++;let read=0,write=1;queue[0]=start;labels[start]=count;
      while(read<write){
        const i=queue[read++],x=i%c.width;
        for(const j of [x?i-1:-1,x<c.width-1?i+1:-1,i-c.width,i+c.width])if(j>=0&&j<n&&!labels[j]&&pixels[j*4+3]){labels[j]=count;queue[write++]=j;}
      }
      sizes[count]=write;
    }
    const biggest=Math.max(0,...sizes),minimum=biggest*.035;
    for(let i=0;i<n;i++)if(sizes[labels[i]]<minimum)pixels[i*4+3]=0;
    ctx.putImageData(data,0,0);sprites.set(key,c);return c;
  }
  function drawRect(ctx,image,x,y,w,h){if(!image||!(w>0&&h>0))return false;ctx.drawImage(image,x,y,w,h);return true;}
  function headGeometry(options){
    const q=Number(options.halfHeight),cx=Number(options.cx),cy=Number(options.cy);
    if(![q,cx,cy].every(Number.isFinite)||q<=0)throw new TypeError('Invalid accessory head geometry');
    // Painted faces keep a fixed aspect; the old BMI-dependent vector head
    // width must not push headphones or the sweatband away from the ears.
    return {q,x:cx,y:cy,face:q*.78};
  }
  function drawHeadphones(ctx,options){
    if(!loaded||!ctx)return false;
    const g=headGeometry(options),image=sprite(options.appearance||'male','headphones');if(!image)return false;
    const width=g.face*3.05,x=g.x-width/2;
    ctx.save();
    // The face is in front of the inside of the ear cups. This occlusion also
    // keeps product-view padding from covering the eyes or beard.
    ctx.beginPath();ctx.rect(x-2,g.y-g.q*1.5,width+4,g.q*2.4);
    ctx.ellipse(g.x,g.y+g.q*.08,g.face*.88,g.q*.86,0,0,Math.PI*2);
    ctx.clip('evenodd');
    // Preserve the high arch while shortening the product-view ear cups to
    // actual ear height; the transparent center leaves eyes and face clear.
    ctx.drawImage(image,0,0,image.width,image.height*.54,x,g.y-g.q*1.28,width,g.q*1.16);
    const cupW=g.q*.69,cupH=g.q*.92;
    for(const sign of [-1,1]){
      const sx=sign<0?0:image.width*.52;
      ctx.drawImage(image,sx,image.height*.44,image.width*.48,image.height*.56,
        g.x+sign*g.face*1.22-cupW/2,g.y-g.q*.35,cupW,cupH);
    }
    ctx.restore();
    return true;
  }
  function drawHeadband(ctx,options){
    if(!loaded||!ctx)return false;
    const g=headGeometry(options),image=sprite(options.appearance||'male','headband');
    return drawRect(ctx,image,g.x-g.face*1.02,g.y-g.q*.67,g.face*2.04,g.q*.35);
  }
  function geometry(input){
    if(!input||!Number.isFinite(input.height)||!Number.isFinite(input.scale)||input.height<=0||input.scale<=0)throw new TypeError('Invalid accessory body geometry');
    const body=root&&root.MirroBody,options=body?body.normalizeOptions(input):input;
    const h=options.height*options.scale,appearance=options.appearance||(options.profile?.sex==='f'?'female':'male');
    const ratios=body?body.measurementRatios(options):{shoulders:1,waist:1,belly:1,hips:1};
    options.ratios=ratios;
    const side={edge:115,legCenter:70},row={left:side,right:side};
    const point=(x,y)=>body?body.mapSourcePoint(x,y,row,options):[options.center+x*options.height/998*options.scale,options.ground-(1012-y*1024)/998*h];
    const left=point(-176,.535),leftPalm=point(-180,.57),right=point(options.wave>0?190:176,options.wave>0?.235:.535);
    return {options,h,appearance,ratios,point,left,right,leftPalm};
  }
  function handLayer(g,side){
    const body=root.MirroBody,layer=body?.getLastLayer?.();if(!layer)return null;
    const raised=side==='right'&&g.options.wave>0,anchor=side==='left'?g.left:g.right;
    const width=g.h*.11,height=g.h*(raised?.14:.15),x=anchor[0]-width/2,y=anchor[1]-height*(raised?.8:.35);
    const sx=layer.width/g.options.targetWidth,sy=layer.height/g.options.targetHeight;
    const c=canvas(Math.ceil(width*sx),Math.ceil(height*sy)),ctx=c.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(layer,x*sx,y*sy,c.width,c.height,0,0,c.width,c.height);
    const data=ctx.getImageData(0,0,c.width,c.height),p=data.data;let left=c.width,top=c.height,right=-1,bottom=-1;
    for(let i=0;i<c.width*c.height;i++){
      const n=i*4,r=p[n],green=p[n+1],b=p[n+2],warm=p[n+3]>220&&r>green*1.035&&r>b*1.075;
      if(!warm){p[n+3]=0;continue;}const px=i%c.width,py=Math.floor(i/c.width);left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);
    }
    ctx.putImageData(data,0,0);if(right<left)return null;
    const tip=raised?y+top/sy:y+bottom/sy;
    const wristY=raised?tip+g.h*.070:tip-g.h*.055;
    let sum=0,weight=0;
    for(let py=top;py<=bottom;py++)for(let px=left;px<=right;px++)if(p[(py*c.width+px)*4+3]&&Math.abs(y+py/sy-(raised?tip+g.h*.035:tip-g.h*.022))<g.h*.025){sum+=x+px/sx;weight++;}
    return {canvas:c,x,y,width,height,wrist:[weight?sum/weight:anchor[0],wristY],palm:[weight?sum/weight:anchor[0],raised?tip+g.h*.035:tip-g.h*.023]};
  }
  function restoreHand(ctx,hand,box){
    if(!hand)return;
    ctx.save();if(box){ctx.beginPath();ctx.rect(box.x,box.y,box.width,box.height);ctx.clip();}
    ctx.drawImage(hand.canvas,hand.x,hand.y,hand.width,hand.height);ctx.restore();
  }
  function drawWatch(ctx,options){
    if(!loaded||!ctx)return false;
    const last=root.MirroBody?.getLastOptions?.();
    let x=options.x,y=options.y,h=Math.max(7,options.size*2.5);
    if(last){const g=geometry(last),hand=handLayer(g,'left');[x,y]=hand?.wrist||g.left;h=g.h*.052;}
    return drawRect(ctx,sprite(options.appearance||'male','watch'),x-h*.32,y-h*.52,h*.64,h);
  }
  function drawStrap(ctx,start,end,width,female){
    const [x1,y1]=start,[x2,y2]=end,dx=x2-x1,dy=y2-y1,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
    ctx.save();
    const grad=ctx.createLinearGradient(x1-nx*width/2,y1-ny*width/2,x1+nx*width/2,y1+ny*width/2);
    grad.addColorStop(0,female?'#8e806d':'#171a20');grad.addColorStop(.3,female?'#d4c5ad':'#4e525b');grad.addColorStop(.7,female?'#b9aa92':'#343841');grad.addColorStop(1,female?'#817564':'#171a20');
    ctx.lineWidth=width;ctx.strokeStyle=grad;ctx.lineCap='butt';ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo((x1+x2)/2+dx*.035,(y1+y2)/2,x2,y2);ctx.stroke();
    ctx.strokeStyle=female?'rgba(245,237,215,.55)':'rgba(194,200,208,.38)';ctx.lineWidth=Math.max(.45,width*.08);ctx.setLineDash([1.4,1.8]);
    for(const sign of [-1,1]){ctx.beginPath();ctx.moveTo(x1+nx*width*.33*sign,y1+ny*width*.33*sign);ctx.lineTo(x2+nx*width*.33*sign,y2+ny*width*.33*sign);ctx.stroke();}
    ctx.restore();
  }
  function drawBodyAccessories(ctx,input){
    if(!loaded||!ctx)return false;
    const g=geometry(input),{h,appearance,ratios,options}=g,kind=input.accessory;
    if(!ITEMS.some(item=>item.kind===kind))return false;
    const image=sprite(appearance,kind);if(!image)return false;
    const cx=options.center,ground=options.ground;
    ctx.save();
    try{
      if(kind==='bandana'){
        const w=h*.205*(.6+.4*ratios.shoulders);drawRect(ctx,image,cx-w*.44,ground-h*.88,w,h*.147);
      }else if(kind==='towel'){
        const w=h*.30*(.65+.35*ratios.shoulders);drawRect(ctx,image,cx-w/2,ground-h*.86,w,h*.285);
      }else if(kind==='waistbag'){
        const w=h*.255*ratios.waist;
        drawRect(ctx,image,cx-w/2,ground-h*.572,w,h*.113);
      }else if(kind==='crossbody'){
        const female=appearance==='female',side=female?1:-1,w=h*.145,bagX=cx+side*h*.115*ratios.hips-w/2,bagY=ground-h*.54;
        const hand=handLayer(g,side<0?'left':'right');
        const shoulder=g.point(-side*102,.205),attach=[bagX+w*(female?.38:.65),bagY+h*.018];
        drawStrap(ctx,shoulder,attach,h*.018,female);
        const sx=female?image.width*.30:0,sy=image.height*(female?.48:.36),sw=image.width*(female?.70:.79),sh=image.height*(female?.52:.64);
        ctx.drawImage(image,sx,sy,sw,sh,bagX,bagY,w,h*.15);
        restoreHand(ctx,hand,{x:bagX,y:bagY,width:w,height:h*.15});
      }else if(kind==='wristbands'){
        for(const [side,part]of [['left','left'],['right','right']]){
          const hand=handLayer(g,side),anchor=hand?.wrist||(side==='left'?g.left:g.right),w=h*.043,height=h*.033;
          ctx.save();ctx.translate(...anchor);if(side==='right'&&options.wave>0)ctx.rotate(-.25);
          drawRect(ctx,sprite(appearance,'wristbands',part),-w/2,-height/2,w,height);ctx.restore();
        }
      }else if(kind==='bottle'){
        const hand=handLayer(g,'left'),palm=hand?.palm||g.leftPalm,w=h*.045,height=h*.158;
        drawRect(ctx,image,palm[0]-w*.70,palm[1]-height*.23,w,height);
        restoreHand(ctx,hand,{x:palm[0]-w*.70,y:palm[1]-height*.23,width:w,height});
      }else return false;
      return true;
    }finally{ctx.restore();}
  }
  const ready=!root?Promise.resolve(false):new Promise(resolve=>{
    const src=root.MirroAccessoryArt?.atlas;if(!src){resolve(false);return;}
    const image=new Image();image.onload=()=>{atlas=image;loaded=true;resolve(true);};image.onerror=()=>resolve(false);image.src=src;
  });
  return {ITEMS,getCatalog,geometry,drawHeadphones,drawHeadband,drawWatch,drawBodyAccessories,ready,isReady:()=>loaded};
});
