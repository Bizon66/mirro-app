/* Local mesh animation of Mirro companion art. Canvas2D fallback; MIT. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(null);
  else root.MirroPetRig=factory(root);
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
  const bell=(x,y,cx,cy,rx,ry)=>Math.exp(-2*((x-cx)**2/rx**2+(y-cy)**2/ry**2));
  // Eye landmarks are measured on each original atlas cell, before alpha trim.
  const BOUNDS={dog:[[54,146,200,297],[297,93,468,296],[535,51,735,296],[780,10,1010,296]],cat:[[58,426,190,568],[287,371,457,567],[528,342,712,565],[783,306,985,565]],hamster:[[59,685,185,819],[290,642,446,819],[529,606,702,819],[772,573,977,816]],rabbit:[[62,938,185,1096],[292,890,450,1096],[534,850,705,1097],[783,821,980,1097]],turtle:[[53,1204,192,1296],[268,1174,447,1296],[497,1147,713,1295],[746,1113,1007,1296]],parrot:[[58,1409,173,1527],[274,1374,443,1527],[498,1344,719,1528],[755,1309,1008,1527]]};
  const EYES={dog:[[[79,174,4],[114,180,6]],[[328,121,4],[364,124,6]],[[567,77,4],[602,80,7]],[[813,31,4],[849,37,7]]],cat:[[[77,480,5],[113,482,7]],[[309,429,6],[348,434,8]],[[550,398,6],[589,403,8]],[[800,363,7],[837,367,9]]],hamster:[[[84,721,4],[118,726,6]],[[323,685,4],[360,689,7]],[[567,650,5],[610,656,8]],[[822,623,5],[870,627,9]]],rabbit:[[[79,1008,3],[114,1012,6]],[[309,971,3],[350,977,7]],[[554,938,3],[595,942,8]],[[805,910,3],[845,915,8]]],turtle:[[[58,1227,3],[91,1227,7]],[[274,1200,3],[312,1200,8]],[[503,1176,3],[546,1177,9]],[[752,1153,3],[797,1156,10]]],parrot:[[[99,1438,6]],[[316,1407,7]],[[548,1378,8]],[[807,1340,9]]]};
  const CONFIG={
    dog:{head:[.32,.43,.63],ears:[[.16,.16],[.59,.19]],tail:[.72,.85,.68],paws:[[.24,.88],[.40,.91]],mouth:[.26,.36]},
    cat:{head:[.31,.40,.65],ears:[[.18,.13],[.56,.13]],tail:[.78,.84,.73],paws:[[.23,.91],[.40,.93]],mouth:[.24,.43]},
    hamster:{head:[.42,.48,.95],ears:[[.21,.16],[.68,.17]],paws:[[.37,.69],[.56,.69]],mouth:[.34,.45]},
    rabbit:{head:[.28,.57,.59],ears:[[.26,.29],[.46,.30]],paws:[[.20,.92],[.38,.93]],mouth:[.22,.60]},
    turtle:{head:[.27,.58,.41],paws:[[.20,.89],[.49,.91]],mouth:[.16,.60]},
    parrot:{head:[.20,.39,.42],tail:[.60,.80,.55],paws:[[.30,.93],[.48,.93]],mouth:[.10,.31],wing:[.47,.48]},
  };
  let gpu=null,unavailable=false;
  const lids=new WeakMap();
  function landmarks(species,stage){
    if(!Object.hasOwn(CONFIG,species)||!Number.isInteger(stage)||stage<0||stage>3)throw new RangeError('Invalid pet rig');
    const b=BOUNDS[species][stage],w=b[2]-b[0]+4,h=b[3]-b[1]+4;
    const rig=Object.fromEntries(Object.entries(CONFIG[species]).map(([key,value])=>[key,value.map(item=>Array.isArray(item)?item.slice():item)]));
    return {...rig,eyes:EYES[species][stage].map(([x,y,r])=>[(x-b[0]+2)/w,(y-b[1]+2)/h,r/w,r/h])};
  }
  function rotate(x,y,pivot,angle,weight,aspect){
    const dx=(x-pivot[0])*aspect,dy=y-pivot[1],a=angle*weight,c=Math.cos(a),s=Math.sin(a);
    return [pivot[0]+(dx*c-dy*s)/aspect,pivot[1]+dx*s+dy*c];
  }
  function point(x,y,rig,pose,aspect=1){
    let p=[x,y];
    if(rig.tail){
      const t=rig.tail,weight=smooth(t[2],t[2]+.17,x)*(rig.wing?smooth(.6,.8,y):1);
      p=rotate(...p,t,pose.tailAngle||0,weight,aspect);
    }
    if(rig.ears)for(let i=0;i<rig.ears.length;i++){
      const e=rig.ears[i],weight=bell(x,y,e[0],e[1]-.1,.16,.24)*(1-smooth(e[1],e[1]+.14,y));
      p=rotate(...p,e,(pose.earAngle||0)*(i===0?1:-1),weight,aspect);
    }
    if(rig.wing){const v=rig.wing;p=rotate(...p,v,pose.wing||0,bell(x,y,.57,.63,.26,.29),aspect);}
    const h=rig.head,headWeight=(1-smooth(h[1]-.07,h[1]+.15,y))*(1-smooth(h[2],h[2]+.15,x));
    p=rotate(...p,h,pose.headAngle||0,headWeight,aspect);
    if(rig.paws)for(let i=0;i<rig.paws.length;i++){
      const paw=rig.paws[i],v=(pose.paw||0)*bell(x,y,...paw,.12,.12);
      p[1]-=v*.18;p[0]+=v*.08*(i===0?-1:1);
    }
    if(rig.mouth)p[1]+=(pose.mouth||0)*.018*bell(x,y,...rig.mouth,.12,.09);
    p[1]=1+(p[1]-1)*(pose.bodyScaleY===undefined?1:pose.bodyScaleY)+(pose.bodyY||0)-(pose.hop||0)*.09;
    return p;
  }
  function canvas(w,h){const c=root.document.createElement('canvas');c.width=w;c.height=h;return c;}
  function eyelids(image,rig,blink){
    const step=Math.round(clamp(blink||0,0,1)*12);if(!step)return {image,revision:0};
    let entry=lids.get(image);
    if(!entry){
      const c=canvas(image.width,image.height),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
      const pixels=ctx.getImageData(0,0,c.width,c.height).data;
      const colors=rig.eyes.map(([x,y,rx,ry])=>{
        const sx=clamp(Math.round(x*c.width),0,c.width-1),sy=clamp(Math.round((y-ry*1.65)*c.height),0,c.height-1),i=(sy*c.width+sx)*4;
        return [pixels[i],pixels[i+1],pixels[i+2]];
      });
      entry={canvas:c,ctx,colors,step:-1};lids.set(image,entry);
    }
    if(entry.step!==step){
      const ctx=entry.ctx,w=image.width,h=image.height,amount=step/12;
      ctx.clearRect(0,0,w,h);ctx.drawImage(image,0,0);
      rig.eyes.forEach(([x,y,rx,ry],index)=>{
        x*=w;y*=h;rx*=w*1.12;ry*=h*1.18;
        const color=entry.colors[index],opening=ry*(1-amount);
        ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.clip();
        const gradient=ctx.createLinearGradient(0,y-ry,0,y+ry);
        gradient.addColorStop(0,`rgb(${color.map(v=>Math.round(v*.92)).join(',')})`);gradient.addColorStop(1,`rgb(${color.join(',')})`);ctx.fillStyle=gradient;
        ctx.fillRect(x-rx-1,y-ry-1,rx*2+2,ry-opening+1);ctx.fillRect(x-rx-1,y+opening,rx*2+2,ry-opening+1);
        if(amount>.75){ctx.beginPath();ctx.moveTo(x-rx*.78,y);ctx.quadraticCurveTo(x,y+ry*.18,x+rx*.78,y);ctx.strokeStyle=`rgba(35,29,22,${(amount-.75)*3})`;ctx.lineWidth=Math.max(.6,rx*.14);ctx.stroke();}
        ctx.restore();
      });entry.step=step;
    }
    return {image:entry.canvas,revision:step};
  }
  function makeGPU(){
    if(unavailable||!root)return null;if(gpu&&!gpu.gl.isContextLost())return gpu;
    try{
      const c=canvas(1,1),gl=c.getContext('webgl',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true,antialias:true});if(!gl)throw new Error('No WebGL');
      const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
      const program=gl.createProgram();
      gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 aPosition;attribute vec2 aUV;varying vec2 uv;void main(){gl_Position=vec4(aPosition,0.,1.);uv=aUV;}'));
      gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 uv;uniform sampler2D image;void main(){gl_FragColor=texture2D(image,uv);}'));
      gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Pet shader link failed');
      gpu={canvas:c,gl,program,buffer:gl.createBuffer(),position:gl.getAttribLocation(program,'aPosition'),uv:gl.getAttribLocation(program,'aUV'),textures:new Map()};return gpu;
    }catch(_){unavailable=true;return null;}
  }
  function mesh(image,rig,pose,columns=18,rows=24){
    const points=[],aspect=image.width/image.height;
    for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++)points.push(point(x/columns,y/rows,rig,pose,aspect));
    const triangles=[];
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const a=y*(columns+1)+x,b=a+1,c=a+columns+1,d=c+1;
      triangles.push([a,b,c],[b,d,c]);
    }
    return {points,triangles,columns,rows};
  }
  function gpuDraw(ctx,image,rig,pose,box,original){
    const g=makeGPU();if(!g)return false;
    const gl=g.gl,pad=32,w=image.width+pad*2,h=image.height+pad*2;
    if(g.canvas.width!==w||g.canvas.height!==h){g.canvas.width=w;g.canvas.height=h;}
    const m=mesh(image,rig,pose),data=new Float32Array(m.triangles.length*12);let offset=0;
    for(const triangle of m.triangles)for(const i of triangle){const p=m.points[i];data[offset++]=(p[0]*image.width+pad)/w*2-1;data[offset++]=1-(p[1]*image.height+pad)/h*2;data[offset++]=(i%(m.columns+1))/m.columns;data[offset++]=Math.floor(i/(m.columns+1))/m.rows;}
    gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(g.program);
    gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);
    for(const [attribute,size,start] of [[g.position,2,0],[g.uv,2,8]]){gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,size,gl.FLOAT,false,16,start);}
    let tex=g.textures.get(original);
    if(!tex){tex={texture:gl.createTexture(),revision:-1,source:null};g.textures.set(original,tex);}
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex.texture);
    if(tex.source!==image){
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);tex.source=image;
    }else if(image!==original)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,data.length/4);
    ctx.drawImage(g.canvas,box.x-pad*box.scale,box.y-pad*box.scale,w*box.scale,h*box.scale);return true;
  }
  function cpuDraw(ctx,image,rig,pose,box){
    const m=mesh(image,rig,pose,12,18),w=image.width,h=image.height;
    for(const tri of m.triangles){
      const src=tri.map(i=>[(i%(m.columns+1))/m.columns*w,Math.floor(i/(m.columns+1))/m.rows*h]);
      const dst=tri.map(i=>[box.x+m.points[i][0]*w*box.scale,box.y+m.points[i][1]*h*box.scale]);
      const [a,b,c]=src,[p,q,r]=dst,d=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(d)<1e-8)continue;
      const aa=((q[0]-p[0])*(c[1]-a[1])-(r[0]-p[0])*(b[1]-a[1]))/d,bb=((q[1]-p[1])*(c[1]-a[1])-(r[1]-p[1])*(b[1]-a[1]))/d;
      const cc=((r[0]-p[0])*(b[0]-a[0])-(q[0]-p[0])*(c[0]-a[0]))/d,dd=((r[1]-p[1])*(b[0]-a[0])-(q[1]-p[1])*(c[0]-a[0]))/d;
      // Expand only the clip, preserving the affine texture mapping. Adjacent
      // Canvas2D antialiased edges otherwise leave a visible triangular grid.
      const center=[(p[0]+q[0]+r[0])/3,(p[1]+q[1]+r[1])/3],matrix=ctx.getTransform();
      const overlap=.7/Math.max(.1,Math.hypot(matrix.a,matrix.b),Math.hypot(matrix.c,matrix.d));
      const clip=dst.map(([x,y])=>{const dx=x-center[0],dy=y-center[1],length=Math.hypot(dx,dy)||1;return [x+dx/length*overlap,y+dy/length*overlap];});
      ctx.save();ctx.beginPath();clip.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();ctx.transform(aa,bb,cc,dd,p[0]-aa*a[0]-cc*a[1],p[1]-bb*a[0]-dd*a[1]);ctx.drawImage(image,0,0);ctx.restore();
    }
  }
  function draw(ctx,image,options){
    if(!root||!ctx||!image)return false;
    const rig=landmarks(options.species,options.stage),pose=options.pose||{},scale=Math.min(options.width/image.width,options.height/image.height)*(options.scale===undefined?1:options.scale);
    const box={x:options.x+(options.width-image.width*scale)/2,y:options.y+options.height-image.height*scale,scale};
    const texture=eyelids(image,rig,pose.blink);
    if(!options.forceCPU&&gpuDraw(ctx,texture.image,rig,pose,box,image))return true;
    cpuDraw(ctx,texture.image,rig,pose,box);return true;
  }
  function destroy(){if(gpu){for(const v of gpu.textures.values())gpu.gl.deleteTexture(v.texture);gpu.gl.deleteBuffer(gpu.buffer);gpu.gl.deleteProgram(gpu.program);gpu.gl.getExtension('WEBGL_lose_context')?.loseContext();}gpu=null;unavailable=false;}
  return {landmarks,point,draw,destroy};
});
