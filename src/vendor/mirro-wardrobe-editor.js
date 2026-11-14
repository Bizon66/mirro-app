/* Native Mirro profile options for the additional fitted clothing. MIT. */
(function(root){
  'use strict';
  if(root.MirroWardrobeEditor)return;
  const labels={jacket:['Кофта на блискавці','Mikina na zip','Zip jacket'],sweatshirt:['Світшот','Mikina','Sweatshirt'],leggings:['Легінси','Legíny','Leggings']};
  let installed=false,stopped=false,timer=0,tries=0,observer=null,originalRender=null,renderWrapper=null;
  const added=[],inputs=[];let resolveReady;
  const ready=new Promise(resolve=>{resolveReady=resolve;});
  function source(){try{return typeof draft==='object'&&draft?draft:typeof P==='function'?P():null;}catch(_){return null;}}
  function profile(){try{return typeof P==='function'?P():null;}catch(_){return null;}}
  function language(){return {uk:0,cs:1,en:2}[root.document.documentElement.lang]||0;}
  function option(select,id){
    let node=[...select.options].find(item=>item.value===id);
    if(!node){node=root.document.createElement('option');node.value=id;node.dataset.mirroWardrobe='true';select.append(node);added.push(node);}
    node.textContent=labels[id][language()];
    node.disabled=!root.MirroWardrobeExtra?.isReady();return node;
  }
  function sync(restore=false,fromProfile=false){
    const top=root.document.getElementById('pShirtStyle'),pants=root.document.getElementById('pPants'),sex=root.document.getElementById('pSex');
    if(!top||!pants||!sex)return;
    const saved=fromProfile?profile():source(),appearance=(fromProfile?saved?.sex:sex.value||saved?.sex)==='f'?'female':'male';
    const desiredTop=restore&&saved?.shirtStyle?saved.shirtStyle:top.value;
    const desiredPants=restore&&saved?.pants?saved.pants:pants.value;
    option(top,'jacket');option(top,'sweatshirt');
    let leggings=[...pants.options].find(item=>item.value==='leggings');
    if(appearance==='female')leggings=option(pants,'leggings');else if(leggings?.dataset.mirroWardrobe)leggings.remove();
    if([...top.options].some(item=>item.value===desiredTop))top.value=desiredTop;
    if([...pants.options].some(item=>item.value===desiredPants))pants.value=desiredPants;
    else if(desiredPants==='leggings')pants.value='joggers';
  }
  function onSex(){sync();}
  function install(){
    if(installed)return true;
    if(stopped||!root.MirroWardrobeExtra||typeof root.renderProfile!=='function'||!root.document.getElementById('pShirtStyle'))return false;
    originalRender=root.renderProfile;
    renderWrapper=function(){sync(false,true);const result=originalRender.apply(this,arguments);sync(true);return result;};
    root.renderProfile=renderWrapper;
    const sex=root.document.getElementById('pSex');sex.addEventListener('input',onSex,true);inputs.push(sex);
    if(typeof root.MutationObserver==='function'){
      observer=new root.MutationObserver(()=>sync());observer.observe(root.document.documentElement,{attributes:true,attributeFilter:['lang']});
    }
    installed=true;sync(true,true);
    Promise.resolve(root.MirroWardrobeExtra.ready).then(()=>{
      if(!installed||stopped)return;sync();
      try{
        if(typeof curTab!=='undefined'&&curTab==='tabProfile'&&typeof profPreview==='function')profPreview();
        else if(typeof AV_STATE!=='undefined'&&AV_STATE&&typeof drawAvatar==='function')drawAvatar(AV_STATE.w,AV_STATE.tone);
      }catch(_){/* The existing host redraws when a profile becomes available. */}
    });
    resolveReady(true);return true;
  }
  function wait(){if(stopped||install())return;if(++tries>=300){resolveReady(false);return;}timer=root.setTimeout(wait,50);}
  function uninstall(){
    stopped=true;root.clearTimeout(timer);observer?.disconnect();observer=null;
    for(const node of inputs)node.removeEventListener('input',onSex,true);inputs.length=0;
    if(root.renderProfile===renderWrapper)root.renderProfile=originalRender;
    for(const node of added)node.remove();added.length=0;installed=false;resolveReady(false);
  }
  root.MirroWardrobeEditor={ready,install,uninstall,isInstalled:()=>installed,sync};wait();
})(typeof globalThis!=='undefined'?globalThis:this);
