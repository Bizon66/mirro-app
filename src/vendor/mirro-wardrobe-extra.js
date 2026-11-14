/* Additional fitted Mirro clothing. Registered body art, no scene loop. MIT. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(null);
  else root.MirroWardrobeExtra=factory(root);
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const WIDTH=768,HEIGHT=1024,CENTER=384;
  const BASE_TOPS=Object.freeze(['tshirt','tank','polo','longsleeve','hoodie','jersey']);
  const TOPS=Object.freeze([...BASE_TOPS,'jacket','sweatshirt']);
  const PANTS=Object.freeze(['shorts','joggers','jeans','leggings']);
  const FRAME_KEYS=Object.freeze(['maleJacketNeutral','maleJacketWave','maleSweatshirtNeutral','maleSweatshirtWave','femaleJacketNeutral','femaleJacketWave','femaleSweatshirtNeutral','femaleSweatshirtWave','femaleLeggingsNeutral','femaleLeggingsWave']);
  const frames=new Map(),fittedUppers=new Map();let image=null,loaded=false;
  function validate(appearance,top,pants){
    if(!['male','female'].includes(appearance))throw new RangeError('Unknown wardrobe appearance');
    if(!TOPS.includes(top)||!PANTS.includes(pants)||appearance==='male'&&pants==='leggings')throw new RangeError('Unsupported fitted outfit');
  }
  function supports(top,pants,appearance='male'){
    return ['male','female'].includes(appearance)&&TOPS.includes(top)&&PANTS.includes(pants)&&!(appearance==='male'&&pants==='leggings');
  }
  function needsExtra(top,pants){return top==='jacket'||top==='sweatshirt'||pants==='leggings';}
  function getBaseOutfit(top,pants,appearance='male'){
    validate(appearance,top,pants);
    return {top:top==='jacket'||top==='sweatshirt'?'longsleeve':top,pants:pants==='leggings'?'joggers':pants};
  }
  function getFrameKeys(top,pants,appearance='male',pose=0){
    validate(appearance,top,pants);
    if(pose!==0&&pose!==1)throw new RangeError('Wardrobe pose must be neutral or raised');
    const suffix=pose?'Wave':'Neutral',keys={upper:null,lower:null};
    if(top==='jacket'||top==='sweatshirt')keys.upper=appearance+(top==='jacket'?'Jacket':'Sweatshirt')+suffix;
    if(pants==='leggings')keys.lower='femaleLeggings'+suffix;
    return keys;
  }
  function canvas(){const c=root.document.createElement('canvas');c.width=WIDTH;c.height=HEIGHT;return c;}
  function trim(){while(frames.size>4)frames.delete(frames.keys().next().value);}
  function registeredFrame(key){
    if(frames.has(key))return frames.get(key);
    const art=root.MirroWardrobeExtraArt||{},supplied=art.frames&&art.frames[key],index=FRAME_KEYS.indexOf(key);
    if(index<0)throw new Error('Missing wardrobe frame: '+key);
    const box=supplied||{x:index%2*image.width/2,y:Math.floor(index/2)*image.height/5,width:image.width/2,height:image.height/5};
    const tile=root.document.createElement('canvas');tile.width=Math.round(box.width);tile.height=Math.round(box.height);
    const tc=tile.getContext('2d',{willReadFrequently:true});tc.drawImage(image,box.x,box.y,box.width,box.height,0,0,tile.width,tile.height);
    const source=tc.getImageData(0,0,tile.width,tile.height).data;
    const middle=Number.isFinite(box.centerX)?box.centerX:tile.width/2;
    let top=Number.isFinite(box.top)?box.top:tile.height,bottom=Number.isFinite(box.bottom)?box.bottom:0;
    for(let y=0;y<tile.height;y++)for(let x=0;x<tile.width;x++){
      const i=(y*tile.width+x)*4;if(source[i+3]<=80)continue;
      if(!Number.isFinite(box.bottom))bottom=Math.max(bottom,y);
      // Register the bald head, not the raised fingertips beside it.
      if(!Number.isFinite(box.top)&&Math.abs(x-middle)<tile.width*.16&&y<tile.height*.34&&source[i]>source[i+1]*1.07&&source[i]>source[i+2]*1.2)top=Math.min(top,y);
    }
    if(!(bottom>top+20))throw new Error('Wardrobe art has no registered body: '+key);
    const scale=998/(bottom-top),out=canvas(),ctx=out.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(tile,CENTER-middle*scale,14-top*scale,tile.width*scale,tile.height*scale);
    const data=ctx.getImageData(0,0,WIDTH,HEIGHT);
    for(let i=0;i<data.data.length;i+=4){
      const x=i/4%WIDTH,y=Math.floor(i/4/WIDTH),r=data.data[i],g=data.data[i+1],b=data.data[i+2];
      if(data.data[i+3]<80||(y<HEIGHT*.125&&Math.abs(x-CENTER)<WIDTH*.11&&!(b>r*1.18&&b>g*1.12)))data.data[i+3]=0;
    }
    ctx.putImageData(data,0,0);const result={canvas:out,data};frames.set(key,result);trim();return result;
  }
  function centralBounds(pixels,y){
    const intervals=[];let start=-1;
    for(let x=0;x<WIDTH;x++){
      const solid=pixels[(y*WIDTH+x)*4+3]>48;
      if(solid&&start<0)start=x;
      if((!solid||x===WIDTH-1)&&start>=0){
        const end=solid&&x===WIDTH-1?x:x-1,center=(start+end)/2;
        if(end-start>8&&Math.abs(center-CENTER)<125)intervals.push([start,end]);start=-1;
      }
    }
    if(!intervals.length)return [CENTER-140,CENTER+140];
    return [Math.max(0,Math.min(...intervals.map(i=>i[0]))-2),Math.min(WIDTH-1,Math.max(...intervals.map(i=>i[1]))+2)];
  }
  function shirtHem(pixels){
    let last=Math.round(HEIGHT*.49),seen=false,gap=0;
    for(let y=Math.round(HEIGHT*.43);y<HEIGHT*.555;y++){
      let royalBlue=0;
      for(let x=CENTER-115;x<CENTER+115;x++){
        const i=(y*WIDTH+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
        if(pixels[i+3]>128&&b>115&&b-r>50&&b-g>45)royalBlue++;
      }
      if(royalBlue>12){last=y+2;seen=true;gap=0;}
      // Denim may have isolated blue highlights farther down. The garment's
      // first continuous lower edge is its hem, not the last blue trouser pixel.
      else if(seen&&++gap>=4)break;
    }
    return last;
  }
  function copyPixel(target,source,index){target[index]=source[index];target[index+1]=source[index+1];target[index+2]=source[index+2];target[index+3]=source[index+3];}
  function upperAtHem(key,basePixels){
    const targetHem=shirtHem(basePixels),cacheKey=key+':'+targetHem;
    if(fittedUppers.has(cacheKey))return fittedUppers.get(cacheKey);
    const source=registeredFrame(key).data.data,sourceHem=shirtHem(source),pixels=new Uint8ClampedArray(source);
    // Generated garments have slightly different lengths. Register the ribbed
    // hem to the selected trousers instead of cutting every outfit at y=.5.
    // The collar stays fixed and the small vertical offset eases out along
    // the cuffs, so matching hands remain attached to their own sleeves.
    const neck=128,end=Math.round(HEIGHT*.64),delta=sourceHem-targetHem;
    const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
    if(delta)for(let y=neck;y<end;y++){
      const sourceY=y<=targetHem?neck+(y-neck)*(sourceHem-neck)/(targetHem-neck):y+delta*(1-smooth((y-targetHem)/(end-targetHem)));
      const top=Math.max(0,Math.min(HEIGHT-1,Math.floor(sourceY))),bottom=Math.min(HEIGHT-1,top+1),fraction=sourceY-top;
      for(let x=0;x<WIDTH;x++){
        const a=(top*WIDTH+x)*4,b=(bottom*WIDTH+x)*4,out=(y*WIDTH+x)*4,alpha=source[a+3]*(1-fraction)+source[b+3]*fraction;
        for(let c=0;c<3;c++)pixels[out+c]=alpha?(source[a+c]*source[a+3]*(1-fraction)+source[b+c]*source[b+3]*fraction)/alpha:0;
        pixels[out+3]=alpha;
      }
    }
    const result={pixels,hem:targetHem};fittedUppers.set(cacheKey,result);while(fittedUppers.size>6)fittedUppers.delete(fittedUppers.keys().next().value);return result;
  }
  function compose(base,options,pose=0){
    const {appearance,top,pants}=options;validate(appearance,top,pants);
    if(!needsExtra(top,pants))return base;
    if(!root||!loaded)return null;
    if(!base||base.width!==WIDTH||base.height!==HEIGHT)throw new Error('Additional wardrobe requires a registered 768×1024 body');
    const keys=getFrameKeys(top,pants,appearance,pose),out=canvas(),ctx=out.getContext('2d',{willReadFrequently:true});ctx.drawImage(base,0,0);
    const data=ctx.getImageData(0,0,WIDTH,HEIGHT),pixels=data.data;
    if(keys.upper){
      const fitted=upperAtHem(keys.upper,pixels),upper=fitted.pixels;
      for(let y=0;y<fitted.hem;y++)pixels.set(upper.subarray(y*WIDTH*4,(y+1)*WIDTH*4),y*WIDTH*4);
      for(let y=fitted.hem;y<HEIGHT*.64;y++){
        const [left,right]=centralBounds(pixels,y);
        for(let x=0;x<WIDTH;x++)if(x<left||x>right){
          const i=(y*WIDTH+x)*4,r=upper[i],g=upper[i+1],b=upper[i+2];
          // Keep the selected trousers. Below the hem, only the new cuffs and
          // hands belong to the upper layer; its source joggers do not.
          const skin=r>g*1.07&&r>b*1.20,cloth=b>100&&b-r>35&&b-g>25;
          if(skin||cloth||Math.abs(x-CENTER)>145)copyPixel(pixels,upper,i);else pixels[i+3]=0;
        }
      }
    }
    if(keys.lower){
      const lower=registeredFrame(keys.lower).data.data,start=shirtHem(pixels);
      for(let y=start;y<HEIGHT;y++){
        const a=centralBounds(pixels,y),b=centralBounds(lower,y);
        const left=y<HEIGHT*.64?Math.min(a[0],b[0]):0,right=y<HEIGHT*.64?Math.max(a[1],b[1]):WIDTH-1;
        for(let x=left;x<=right;x++)copyPixel(pixels,lower,(y*WIDTH+x)*4);
      }
    }
    ctx.putImageData(data,0,0);return out;
  }
  function destroy(){frames.clear();fittedUppers.clear();}
  const ready=!root?Promise.resolve(false):new Promise(resolve=>{
    const art=root.MirroWardrobeExtraArt,src=art&&(art.atlas||art.image);
    if(!src){resolve(false);return;}
    image=new Image();image.onload=()=>{loaded=true;resolve(true);};image.onerror=()=>resolve(false);image.src=src;
  });
  return {TOPS,PANTS,BASE_TOPS,FRAME_KEYS,supports,needsExtra,getBaseOutfit,getFrameKeys,compose,ready,isReady:()=>loaded,destroy};
});
