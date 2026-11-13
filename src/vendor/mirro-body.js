/* Detailed wardrobe body for Mirro's existing Canvas2D scene. MIT.
 * No DOM mount or animation loop: the host owns scene time and drawing order.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(null);
  else root.MirroBody=factory(root);
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const TOPS=Object.freeze(['tshirt','tank','polo','longsleeve','hoodie','jersey']);
  const PANTS=Object.freeze(['shorts','joggers','jeans']);
  const SOURCE_W=768,SOURCE_H=1024,CENTER=384,ROWS=192;
  const ANCHORS=Object.freeze([[0,1012/998],[14/1024,1],[1012/1024,0],[1,-12/998]]);
  const SHAPE_KEYS=['shoulders','chest','waist','belly','hips','thigh','knee','calf','ankle','legCenter','arm','neck'];
  const images={},rawCache=new Map(),tintCache=new Map();
  let loaded=false,gpu=null,gpuUnavailable=false,cpu=null,cpuKey='',cpuBaseKey='',cpuStamp=0,serial=0,lastError='';
  const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
  const mix=(a,b,t)=>a+(b-a)*t;
  function smooth(low,high,value){const t=clamp((value-low)/(high-low),0,1);return t*t*(3-2*t);}
  function interpolate(value,anchors){
    if(value<=anchors[0][0])return anchors[0][1];
    for(let index=1;index<anchors.length;index++)if(value<=anchors[index][0]){
      const a=anchors[index-1],b=anchors[index];return mix(a[1],b[1],(value-a[0])/(b[0]-a[0]));
    }
    return anchors[anchors.length-1][1];
  }
  function color(value,fallback){
    if(value===undefined||value===null)value=fallback;
    if(typeof value!=='string'||!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value))throw new Error('Invalid body color');
    return value.length===4?'#'+[...value.slice(1)].map(c=>c+c).join(''):value.toLowerCase();
  }
  function rgb(value){return [1,3,5].map(index=>parseInt(value.slice(index,index+2),16));}
  function normalizeOptions(input){
    if(!input||typeof input!=='object')throw new Error('Missing body options');
    const profile=input.profile||{},appearance=input.appearance||(profile.sex==='f'?'female':'male');
    if(appearance!=='male'&&appearance!=='female')throw new Error('Invalid body appearance');
    const top=profile.shirtStyle||'tshirt',pants=profile.pants||'shorts';
    if(!TOPS.includes(top)||!PANTS.includes(pants))throw new Error('Unsupported outfit');
    const height=Number(input.height===undefined?profile.height:input.height);
    const normalized={...input,profile,appearance,top,pants,height,shape:{...input.shape}};
    for(const key of ['center','ground','scale','height','targetWidth','targetHeight']){
      if(!Number.isFinite(normalized[key]))throw new Error('Invalid body geometry');
    }
    if(height<=0||normalized.scale<=0||normalized.targetWidth<=0||normalized.targetHeight<=0)throw new Error('Invalid body dimensions');
    for(const key of SHAPE_KEYS){
      if(key==='neck'&&normalized.shape[key]===undefined)normalized.shape.neck=height*.04;
      if(!Number.isFinite(normalized.shape[key])||normalized.shape[key]<=0)throw new Error('Invalid body shape');
    }
    normalized.skinColor=color(profile.skin,'#dfae88');
    normalized.shirtColor=color(profile.shirt,'#284fb4');
    normalized.pantsColor=color(input.pantsColor,pants==='jeans'?'#365b86':'#1c2c43');
    normalized.shoeColor=color(input.shoeColor,'#e9edf1');
    normalized.time=Number.isFinite(input.time)?input.time:0;
    normalized.wave=Number.isFinite(input.wave)?Math.max(0,input.wave):0;
    normalized.reducedMotion=!!input.reducedMotion;
    return normalized;
  }
  function outfitIndex(top,pants){
    const column=TOPS.indexOf(top),row=PANTS.indexOf(pants);
    if(column<0||row<0)throw new Error('Unsupported outfit');
    return row*TOPS.length+column;
  }
  function verticalFraction(y){return interpolate(y,ANCHORS);}
  function bodyHalfWidth(y,shape){
    const anchors=[[0,shape.neck],[.13,shape.neck],[.22,shape.shoulders+shape.arm*.35],[.30,shape.chest],[.43,shape.waist],[.47,shape.belly],[.483,Math.max(shape.hips,shape.belly*.96)],[.50,shape.hips],[.65,shape.legCenter+shape.thigh],[1,shape.legCenter+6.5]];
    if(y<=anchors[0][0])return anchors[0][1];
    for(let i=1;i<anchors.length;i++)if(y<=anchors[i][0])return mix(anchors[i-1][1],anchors[i][1],smooth(anchors[i-1][0],anchors[i][0],y));
    return anchors.at(-1)[1];
  }
  function legRadius(y,shape){
    return interpolate(y,[[0,shape.thigh],[.65,shape.thigh],[.76,shape.knee],[.83,shape.calf],[.91,shape.ankle],[.955,6.5],[1,6.5]]);
  }
  function waveEnvelope(wave,reducedMotion=false){
    if(!(wave>0))return 0;
    if(reducedMotion)return 1;
    return clamp(Math.min(5*(2.2-wave),3*wave),0,1);
  }
  // Two poses have different arm silhouettes. Dissolving between them creates
  // two translucent arms, so select one opaque pose and animate its palm.
  function texturePose(wave){return wave>0?1:0;}
  function watchAnchor(options){
    const s=options.shape;
    return {x:options.center-(Math.max(s.waist,s.belly,s.chest,s.hips*.96)+s.arm*.8+1.6)*options.scale,
      y:options.ground-options.height*options.scale*.48-options.scale*2,size:options.scale*s.arm};
  }
  function waveHandPoint(point,x,y,pivot,options){
    const pose=waveEnvelope(options.wave,options.reducedMotion);
    if(options.reducedMotion||pose<=0||x<=65||y>=.29)return point;
    const amount=smooth(65,130,x)*(1-smooth(.22,.29,y));
    if(amount<=0)return point;
    const angle=Math.sin(options.time*9)*.11*pose*amount;
    const dx=point[0]-pivot[0],dy=point[1]-pivot[1],c=Math.cos(angle),s=Math.sin(angle);
    return [pivot[0]+dx*c-dy*s,pivot[1]+dx*s+dy*c];
  }
  // Preserve the atlas's natural anatomy. Girth changes are local deltas from
  // the source body, not the legacy vector avatar's exaggerated silhouette.
  function measurementRatios(options){
    const h=options.height,male=options.appearance!=='female',unit=h/175;
    const reference=male?{shoulders:126,chest:100,waist:84,belly:87.36,thigh:58}:{shoulders:108,chest:94,waist:76,belly:79.04,thigh:58};
    let measured=options.measurements;
    if(!measured){
      // Compatibility with the original integration: undo its explicit
      // exaggeration gains before using those values on photographic art.
      const s=options.shape,base={shoulders:(male?.66:.6)*h,chest:(male?.55:.53)*h,waist:(male?.45:.4)*h,thigh:(male?.31:.33)*h};
      base.belly=base.waist*1.04;
      measured={shoulders:base.shoulders+(s.shoulders*5.7-base.shoulders)/1.3,chest:base.chest+(s.chest*5.5-base.chest)/1.5,waist:base.waist+(s.waist*5.3-base.waist)/1.6,belly:base.belly+(s.belly*5.1-base.belly)/1.8,thigh:base.thigh+(s.thigh*6-base.thigh)/1.5};
    }
    const ratios={};
    for(const key of Object.keys(reference)){
      const value=Number(measured[key]);
      if(!Number.isFinite(value)||value<=0)throw new Error('Invalid body measurement: '+key);
      ratios[key]=clamp(value/(reference[key]*unit),key==='shoulders'?.82:.65,key==='shoulders'?1.35:1.65);
    }
    ratios.hips=clamp(1+(ratios.waist-1)*.35+(ratios.thigh-1)*.40,.75,1.45);
    return ratios;
  }
  function shapeRatio(y,r){
    return interpolate(y,[[0,1],[.135,1],[.205,r.shoulders],[.29,r.chest],[.385,r.waist],[.44,r.belly],[.50,r.hips],[.56,r.hips],[1,1]]);
  }
  function armShift(y,r){
    // Translate the arm as a connected limb. Its cuff and hand retain their
    // original width even when the waist or shoulder measurements change.
    const shoulder=118*(r.shoulders-1),clearance=Math.max(112*(r.chest-1),108*(r.waist-1),108*(r.belly-1));
    const wrist=clamp(Math.max(shoulder*.65,clearance+3*(r.waist-1)),-38,65);
    return interpolate(y,[[0,0],[.14,0],[.225,shoulder],[.34,wrist],[.54,wrist],[1,wrist]]);
  }
  function mapSourceX(x,y,row,options){
    if(x===0)return 0;
    const sign=x<0?-1:1,ax=Math.abs(x),physical=options.height/998;
    if(y<.135)return x*physical;
    const ratios=options.ratios||measurementRatios(options),side=sign<0?row.left:row.right;
    const edge=clamp(side.edge,65,155),ratio=shapeRatio(y,ratios);
    const torso=ax*ratio,arm=ax+armShift(y,ratios);
    const outer=smooth(edge*.78,edge*1.17,ax);
    const upper=mix(torso,arm,outer);
    const sourceCenter=clamp(side.legCenter,50,105);
    const radiusRatio=1+(ratios.thigh-1)*(1-smooth(.69,.94,y));
    const shiftedCenter=sourceCenter*(1+(ratios.hips-1)*.12);
    const leg=shiftedCenter+(ax-sourceCenter)*radiusRatio;
    // Keep the crotch center pinned and let thigh girth taper toward the ankles.
    const lower=mix(ax,leg,smooth(0,sourceCenter*.5,ax));
    const mapped=mix(upper,lower,smooth(.50,.60,y));
    return sign*mapped*physical;
  }
  function mapSourcePoint(x,y,row,options){
    return [options.center+mapSourceX(x,y,row,options)*options.scale,
      options.ground-verticalFraction(y)*options.height*options.scale];
  }
  function canvas(width,height){const value=root.document.createElement('canvas');value.width=width;value.height=height;return value;}
  function trimCache(cache,max){while(cache.size>max)cache.delete(cache.keys().next().value);}
  function frameFor(variant,index,image){
    const art=root.MirroWardrobeArt||{},frames=art.frames&&art.frames[variant];
    const supplied=frames&&frames[index];
    return supplied||{x:index%6*image.width/6,y:Math.floor(index/6)*image.height/3,width:image.width/6,height:image.height/3};
  }
  function normalizeFrame(variant,index){
    const key=variant+index;if(rawCache.has(key))return rawCache.get(key);
    const image=images[variant],frame=frameFor(variant,index,image);
    const tile=canvas(Math.max(1,Math.round(frame.width)),Math.max(1,Math.round(frame.height)));
    const tc=tile.getContext('2d',{willReadFrequently:true});
    tc.drawImage(image,frame.x,frame.y,frame.width,frame.height,0,0,tile.width,tile.height);
    const pixels=tc.getImageData(0,0,tile.width,tile.height).data;
    let top=Number.isFinite(frame.top)?frame.top:tile.height,bottom=Number.isFinite(frame.bottom)?frame.bottom:0;
    const middle=Number.isFinite(frame.centerX)?frame.centerX:tile.width/2;
    if(!Number.isFinite(frame.top)||!Number.isFinite(frame.bottom)){
      for(let y=0;y<tile.height;y++)for(let x=Math.max(0,Math.floor(middle-tile.width*.19));x<Math.min(tile.width,middle+tile.width*.19);x++){
        if(pixels[(y*tile.width+x)*4+3]>64){if(!Number.isFinite(frame.top))top=Math.min(top,y);if(!Number.isFinite(frame.bottom))bottom=Math.max(bottom,y);}
      }
    }
    let center=middle;
    if(!Number.isFinite(frame.centerX)){
      let sum=0,count=0;
      for(let y=Math.ceil(top+tile.height*.025);y<Math.min(tile.height,top+tile.height*.10);y++)for(let x=Math.max(0,Math.floor(middle-tile.width*.25));x<Math.min(tile.width,middle+tile.width*.25);x++)if(pixels[(y*tile.width+x)*4+3]>128){sum+=x;count++;}
      if(count)center=sum/count;
    }
    if(!(bottom>top+10))throw new Error('Empty wardrobe frame');
    const scale=998/(bottom-top),out=canvas(SOURCE_W,SOURCE_H),ctx=out.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(tile,CENTER-center*scale,14-top*scale,tile.width*scale,tile.height*scale);
    // Remove only the central bald head. The waving hand occupies this height
    // outside the center band and must remain visible.
    const data=ctx.getImageData(0,0,SOURCE_W,SOURCE_H);
    for(let index=0;index<data.data.length;index+=4){
      const x=index/4%SOURCE_W,y=Math.floor(index/4/SOURCE_W);
      // Remove the low-alpha studio matte before recoloring or pose blending.
      if(data.data[index+3]<80){data.data[index+3]=0;continue;}
      // A shirt/hood can begin above .18 in these adult-proportion assets.
      // Remove the bald skin, preserving blue fabric and the outboard palm.
      if(y<SOURCE_H*.125&&Math.abs(x-CENTER)<SOURCE_W*.11){
        const r=data.data[index],g=data.data[index+1],b=data.data[index+2];
        if(!(b>r*1.18&&b>g*1.12))data.data[index+3]=0;
      }
    }
    ctx.putImageData(data,0,0);
    const result={canvas:out,data};rawCache.set(key,result);trimCache(rawCache,6);return result;
  }
  function rowIntervals(pixels,y){
    const intervals=[];let start=-1;
    for(let x=0;x<SOURCE_W;x++){
      const opaque=pixels[(y*SOURCE_W+x)*4+3]>48;
      if(opaque&&start<0)start=x;
      if((!opaque||x===SOURCE_W-1)&&start>=0){const end=opaque&&x===SOURCE_W-1?x:x-1;if(end-start>2)intervals.push([start-CENTER,end-CENTER]);start=-1;}
    }
    return intervals;
  }
  function analyzeRows(data){
    // Register a few anatomical landmarks, then interpolate continuously. Raw
    // alpha connectivity changes at sleeves/crotch cannot become row jumps.
    const sample=y=>rowIntervals(data,Math.min(SOURCE_H-1,Math.round(y*(SOURCE_H-1))));
    const centerWidth=y=>{const part=sample(y).find(([a,b])=>a<=0&&b>=0);return part?clamp((part[1]-part[0])/2,35,170):105;};
    const waist=centerWidth(.43),belly=centerWidth(.47),hips=centerWidth(.50);
    const edges=[[0,45],[.16,Math.min(centerWidth(.16),70)],[.18,centerWidth(.18)],[.20,centerWidth(.20)],[.22,centerWidth(.22)],[.25,centerWidth(.25)],[.30,waist*1.04],[.43,waist],[.47,belly],[.50,hips],[.68,hips],[1,hips]];
    const curves={left:{},right:{}};
    for(const [name,sign] of [['left',-1],['right',1]]){
      const armAnchors=[];
      for(const y of [.34,.40,.47,.54,.59]){
        const edge=interpolate(y,edges);
        const parts=sample(y).map(([a,b])=>sign<0?[-b,-a]:[a,b]).filter(([a,b])=>a>edge+3&&b-a>6).sort((a,b)=>a[0]-b[0]);
        const part=parts[0]||[edge+25,edge+65];
        armAnchors.push([y,part[0],(part[0]+part[1])/2,part[1]]);
      }
      const first=armAnchors[0],last=armAnchors.at(-1);
      const arms=[[0,waist*.95,waist*1.12,waist*1.30],[.22,waist*1.02,waist*1.20,waist*1.38],...armAnchors,[1,last[1],last[2],last[3]]];
      const legs=[[0,0,hips*.5,hips],[.50,0,hips*.5,hips]];
      for(const y of [.65,.76,.83,.91,.97,1]){
        const parts=sample(Math.min(.988,y)).map(([a,b])=>sign<0?[-b,-a]:[a,b]).filter(([a,b])=>b>20&&a<145).map(([a,b])=>[Math.max(0,a),b]).sort((a,b)=>a[0]-b[0]);
        const part=parts[0]||[40,105];legs.push([y,part[0],(part[0]+part[1])/2,part[1]]);
      }
      curves[name]={arms,legs};
    }
    const nodes=[-384,-300,-240,-200,-176,-152,-128,-108,-88,-68,-48,-28,-12,0,12,28,48,68,88,108,128,152,176,200,240,300,384];
    const rows=[];
    for(let index=0;index<=ROWS;index++){
      const y=index/ROWS,row={nodes};
      for(const name of ['left','right']){
        const curve=curves[name],edge=interpolate(y,edges);
        const at=(anchors,column)=>interpolate(y,anchors.map(point=>[point[0],point[column]]));
        const inner=Math.max(edge+.1,at(curve.arms,1)),armCenter=Math.max(inner+.1,at(curve.arms,2)),outer=Math.max(armCenter+.1,at(curve.arms,3));
        row[name]={edge,armInner:inner,armCenter,armOuter:outer,legInner:at(curve.legs,1),legCenter:at(curve.legs,2),legOuter:at(curve.legs,3)};
      }
      rows.push(row);
    }
    return rows;
  }
  function tint(raw,options){
    const out=canvas(SOURCE_W,SOURCE_H),ctx=out.getContext('2d');
    const pixels=new ImageData(new Uint8ClampedArray(raw.data.data),SOURCE_W,SOURCE_H);
    const targets={skin:rgb(options.skinColor),shirt:rgb(options.shirtColor),pants:rgb(options.pantsColor),shoe:rgb(options.shoeColor)};
    for(let index=0;index<SOURCE_W*SOURCE_H;index++){
      const i=index*4;if(pixels.data[i+3]<4)continue;
      const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2],y=Math.floor(index/SOURCE_W)/SOURCE_H,x=Math.abs(index%SOURCE_W-CENTER);
      const luminance=(r*.2126+g*.7152+b*.0722)/255;
      const warm=r>g*1.07&&r>b*1.20;
      let semantic=null,shade=1;
      if(y>.91&&luminance>.22&&!warm){semantic='shoe';shade=clamp((luminance+.02)/.85,.20,1.3);}
      else if(warm){semantic='skin';shade=clamp((luminance+.10)/.68,.3,1.4);}
      else if(y<.50||(y<.64&&x>145)){semantic='shirt';shade=clamp((luminance+.025)/.26,.2,2.0);}
      else {semantic='pants';shade=clamp((luminance+.025)/(options.pants==='jeans'?.29:.14),.2,2.1);}
      for(let channel=0;channel<3;channel++)pixels.data[i+channel]=clamp(targets[semantic][channel]*shade,0,255);
    }
    ctx.putImageData(pixels,0,0);return out;
  }
  function texturePair(options){
    const index=outfitIndex(options.top,options.pants);
    const key=JSON.stringify([options.appearance,index,options.skinColor,options.shirtColor,options.pantsColor,options.shoeColor]);
    if(tintCache.has(key))return tintCache.get(key);
    const neutral=normalizeFrame(options.appearance,index),wave=normalizeFrame(options.appearance+'Wave',index);
    const result={key,id:++serial,neutral:tint(neutral,options),wave:tint(wave,options),rows:analyzeRows(neutral.data.data)};
    tintCache.set(key,result);trimCache(tintCache,4);return result;
  }
  function createGPU(){
    const output=canvas(1,1),gl=output.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:true});
    if(!gl)return null;
    function shader(type,source){const result=gl.createShader(type);gl.shaderSource(result,source);gl.compileShader(result);if(!gl.getShaderParameter(result,gl.COMPILE_STATUS))throw new Error('Body shader compilation failed');return result;}
    const vertex=shader(gl.VERTEX_SHADER,'attribute vec2 aPosition;attribute vec2 aUV;varying vec2 vUV;void main(){vUV=aUV;gl_Position=vec4(aPosition,0.0,1.0);}');
    const fragment=shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 vUV;uniform sampler2D uRest;uniform sampler2D uWave;uniform float uPose;void main(){gl_FragColor=mix(texture2D(uRest,vUV),texture2D(uWave,vUV),uPose);}');
    const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Body shader link failed');gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    const position=gl.getAttribLocation(program,'aPosition'),uv=gl.getAttribLocation(program,'aUV');
    gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(position,2,gl.FLOAT,false,16,0);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,16,8);
    const textures=[gl.createTexture(),gl.createTexture()];
    for(let index=0;index<2;index++){
      gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_2D,textures[index]);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    }
    gl.uniform1i(gl.getUniformLocation(program,'uRest'),0);gl.uniform1i(gl.getUniformLocation(program,'uWave'),1);
    const poseUniform=gl.getUniformLocation(program,'uPose');
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
    const state={canvas:output,gl,lost:false,textureId:0,buffer,program,textures,vertex,fragment,poseUniform};
    output.addEventListener('webglcontextlost',event=>{event.preventDefault();state.lost=true;lastError='context-lost';});
    return state;
  }
  function renderGPU(pair,options){
    if(gpuUnavailable)return false;
    if(!gpu){gpu=createGPU();if(!gpu)gpuUnavailable=true;}
    if(!gpu)return false;if(gpu.lost)return null;
    const {gl}=gpu,dpr=Math.min(root.devicePixelRatio||1,2);
    const width=Math.max(1,Math.ceil(options.targetWidth*dpr)),height=Math.max(1,Math.ceil(options.targetHeight*dpr));
    if(gpu.canvas.width!==width||gpu.canvas.height!==height){gpu.canvas.width=width;gpu.canvas.height=height;}
    gl.useProgram(gpu.program);gl.bindBuffer(gl.ARRAY_BUFFER,gpu.buffer);
    if(gpu.textureId!==pair.id){
      for(let index=0;index<2;index++){gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_2D,gpu.textures[index]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,index?pair.wave:pair.neutral);}
      gpu.textureId=pair.id;
    }
    const count=pair.rows[0].nodes.length,stride=count;
    const points=new Float32Array((ROWS+1)*count*4);
    const palmPivot=mapSourcePoint(180,.25,pair.rows[Math.round(ROWS*.25)],options);
    let offset=0;
    for(let row=0;row<=ROWS;row++){
      const y=row/ROWS;
      for(const x of pair.rows[row].nodes){
        const [px,py]=waveHandPoint(mapSourcePoint(x,y,pair.rows[row],options),x,y,palmPivot,options);
        points[offset++]=px/options.targetWidth*2-1;points[offset++]=1-py/options.targetHeight*2;
        points[offset++]=(CENTER+x)/SOURCE_W;points[offset++]=y;
      }
    }
    const vertices=new Float32Array(ROWS*(count-1)*6*4);offset=0;
    for(let row=0;row<ROWS;row++)for(let col=0;col<count-1;col++){
      const a=row*stride+col,b=a+1,c=a+stride,d=c+1;
      for(const index of [a,c,b,b,c,d]){vertices.set(points.subarray(index*4,index*4+4),offset);offset+=4;}
    }
    gl.viewport(0,0,width,height);gl.clear(gl.COLOR_BUFFER_BIT);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);
    gl.uniform1f(gpu.poseUniform,texturePose(options.wave));gl.drawArrays(gl.TRIANGLES,0,vertices.length/4);return gpu.canvas;
  }
  function renderCPU(pair,options){
    const rounded={...options,shape:{...options.shape}};
    for(const key of SHAPE_KEYS)rounded.shape[key]=Math.round(rounded.shape[key]/.4)*.4||options.shape[key];
    const pose=texturePose(options.wave);
    const baseKey=JSON.stringify([pair.id,Math.round(options.center),Math.round(options.ground),options.height,Math.round(options.scale*100),options.targetWidth,options.targetHeight]);
    const key=JSON.stringify([baseKey,rounded.shape,options.ratios,pose]);
    if(cpuKey===key&&cpu)return cpu;
    const now=root.performance.now();
    // Keep software redraws under 8 Hz during a greeting or breathing; the host
    // still composites the cached bitmap at its normal scene frequency.
    if(cpu&&cpuKey&&cpuBaseKey===baseKey&&!options.reducedMotion&&now-cpuStamp<125)return cpu;
    cpu=cpu||canvas(1,1);cpu.width=Math.ceil(options.targetWidth);cpu.height=Math.ceil(options.targetHeight);
    const ctx=cpu.getContext('2d');ctx.clearRect(0,0,cpu.width,cpu.height);
    function layer(image,alpha){
      if(alpha<=0)return;ctx.globalAlpha=alpha;
      for(let row=0;row<ROWS;row++){
        const y=row/ROWS,nextY=(row+1)/ROWS,geometry=pair.rows[row],nodes=geometry.nodes;
        const top=options.ground-verticalFraction(y)*options.height*options.scale;
        const bottom=options.ground-verticalFraction(nextY)*options.height*options.scale;
        for(let col=0;col<nodes.length-1;col++){
          const x1=nodes[col],x2=nodes[col+1];if(x2-x1<.1)continue;
          const left=options.center+mapSourceX(x1,y,geometry,rounded)*options.scale,right=options.center+mapSourceX(x2,y,geometry,rounded)*options.scale;
          if(right<=left||bottom<=top)continue;
          ctx.drawImage(image,CENTER+x1,y*SOURCE_H,x2-x1,(nextY-y)*SOURCE_H,left,top,right-left+.25,bottom-top+.25);
        }
      }
    }
    layer(pose?pair.wave:pair.neutral,1);
    ctx.globalAlpha=1;cpuKey=key;cpuBaseKey=baseKey;cpuStamp=now;return cpu;
  }
  function draw(ctx,input){
    if(!loaded||!ctx||typeof ctx.drawImage!=='function')return false;
    try{
      const options=normalizeOptions(input);options.ratios=measurementRatios(options);const pair=texturePair(options);
      let output=renderGPU(pair,options),renderer='webgl';
      if(output===null)return false; // Context loss: let the native scene draw.
      if(output===false){output=renderCPU(pair,options);renderer='canvas2d';}
      ctx.save();try{ctx.drawImage(output,0,0,options.targetWidth,options.targetHeight);}finally{ctx.restore();}
      lastError='';return {drawn:true,watch:watchAnchor(options),renderer};
    }catch(error){lastError=error.message||'body-render-failed';return false;}
  }
  function destroy(){
    if(gpu&&!gpu.lost){const gl=gpu.gl;for(const texture of gpu.textures)gl.deleteTexture(texture);gl.deleteBuffer(gpu.buffer);gl.deleteProgram(gpu.program);gl.deleteShader(gpu.vertex);gl.deleteShader(gpu.fragment);}
    gpu=null;gpuUnavailable=false;cpu=null;cpuKey='';cpuBaseKey='';rawCache.clear();tintCache.clear();
  }
  const ready=!root?Promise.resolve(false):Promise.all(['male','female','maleWave','femaleWave'].map(variant=>new Promise(resolve=>{
    const src=root.MirroWardrobeArt&&root.MirroWardrobeArt[variant];if(!src){resolve(false);return;}
    const image=new Image();image.onload=()=>{images[variant]=image;resolve(true);};image.onerror=()=>resolve(false);image.src=src;
  }))).then(results=>(loaded=results.every(Boolean)));
  return {TOPS,PANTS,ANCHORS,normalizeOptions,outfitIndex,verticalFraction,bodyHalfWidth,legRadius,measurementRatios,shapeRatio,armShift,waveEnvelope,texturePose,watchAnchor,waveHandPoint,mapSourceX,mapSourcePoint,
    ready,isReady:()=>loaded,draw,destroy,getLastError:()=>lastError};
});
