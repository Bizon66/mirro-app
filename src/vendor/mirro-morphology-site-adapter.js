/* Connect existing profile choices to the existing preview/save flow. MIT. */
(function(){
  'use strict';
  if(window.MirroMorphologySiteAdapter)return;
  let installed=false,stopped=false,timer=0,tries=0,originalPreview=null,wrappedPreview=null;
  const controls=[];
  let resolveReady;const ready=new Promise(resolve=>{resolveReady=resolve;});
  function preview(){
    if(typeof window.profPreview==='function')window.profPreview();
  }
  function install(){
    if(installed)return true;
    if(typeof window.profPreview!=='function'||!document.getElementById('pShape')||!document.getElementById('pSporty'))return false;
    originalPreview=window.profPreview;
    const previous=originalPreview;
    wrappedPreview=function(){
      const select=document.getElementById('pShape');
      let source=null,hadShape=false,oldShape;
      try{
        if(select&&['belly','even','hips'].includes(select.value)&&typeof draft==='object'&&draft){
          source=draft;hadShape=Object.hasOwn(source,'shape');oldShape=source.shape;
          // Native Save can make draft === D.profile until the form reopens.
          // Stage only for this synchronous preview, then restore that object.
          source.shape=select.value;
        }
        return previous.apply(this,arguments);
      }finally{
        if(source){if(hadShape)source.shape=oldShape;else delete source.shape;}
      }
    };
    window.profPreview=wrappedPreview;
    for(const id of ['pShape','pSporty']){
      const node=document.getElementById(id);node.addEventListener('input',preview);node.addEventListener('change',preview);controls.push(node);
    }
    installed=true;resolveReady(true);return true;
  }
  function wait(){if(stopped||install())return;if(++tries>=300){resolveReady(false);return;}timer=setTimeout(wait,50);}
  function uninstall(){
    stopped=true;clearTimeout(timer);
    for(const node of controls){node.removeEventListener('input',preview);node.removeEventListener('change',preview);}controls.length=0;
    if(window.profPreview===wrappedPreview)window.profPreview=originalPreview;
    installed=false;resolveReady(false);
  }
  window.MirroMorphologySiteAdapter={ready,install,uninstall,isInstalled:()=>installed};wait();
})();
