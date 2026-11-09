const cultureExportRoot=new URL('../',document.currentScript.src);
(()=>{'use strict';let sequence=0;
async function init(){
 const form=document.getElementById('culture-form');if(!form||form.dataset.ready)return;form.dataset.ready='true';
 const language=document.documentElement.lang.slice(0,2),lang=['fr','pt','es'].includes(language)?language:'fr';let all;
 try{const r=await fetch(new URL('assets/culture-copy.json',cultureExportRoot),{cache:'no-store'});if(!r.ok)throw Error();all=await r.json();}catch{return;}
 if(!form.isConnected)return;const t=all[lang],$=id=>document.getElementById('culture-'+id),input=$('input'),result=$('result'),status=$('status');let content='',active=false,controller=null,ready=false;
 const market=$('market');market.value=lang==='fr'?'pt-PT':'fr-FR';
 function message(s,error=false){status.textContent=s;status.classList.toggle('culture-error',error);}
 function invalidate(){sequence++;controller?.abort();controller=null;active=false;$('adapt').disabled=!ready;result.hidden=true;content='';message(ready?'':t.offline);$('count').textContent=input.value.length+' / 3 000';}
 const node=(tag,text,cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
 function show(body){
  const out=$('output');out.replaceChildren();
  const assessment=node('section','');assessment.append(node('h4',t.assessment),node('p',body.assessment));out.append(assessment);
  const tone=node('section','','culture-tone-result');tone.append(node('h4',t.toneTitle),node('p',body.recommendedTone,'culture-recommended-tone'),node('p',body.toneReason));out.append(tone);
  out.append(node('h4',t.suggestion),node('pre',body.adapted),node('h4',t.changesTitle));
  const changes=node('div','','culture-changes');body.changes.forEach(c=>{const card=node('article','','culture-change');card.append(node('p',t.originalLabel,'culture-change-label'),node('blockquote',c.original||t.added),node('p',t.suggestedLabel,'culture-change-label'),node('blockquote',c.suggested),node('p',t.reasonLabel,'culture-change-label'),node('p',c.reason));changes.append(card);});out.append(changes);
  const caution=node('aside','','culture-caution');caution.append(node('h4',t.cautionTitle),node('p',body.caution));out.append(caution);
  content=[t.result,t.assessment,body.assessment,t.toneTitle,body.recommendedTone,body.toneReason,t.suggestion,body.adapted,t.changesTitle,...body.changes.map(c=>[t.originalLabel+': '+(c.original||t.added),t.suggestedLabel+': '+c.suggested,t.reasonLabel+': '+c.reason].join('\n')),t.cautionTitle,body.caution].join('\n\n');
  result.hidden=false;result.focus({preventScroll:true});result.scrollIntoView({behavior:'smooth',block:'start'});
 }
 function valid(){if(input.value.trim().length<20||input.value.trim().length>3000){message(t.required,true);input.focus();return false;}return true;}
 for(const id of ['input','source','market','context','tone','details'])$(id).addEventListener(id==='input'||id==='details'?'input':'change',invalidate);
 $('sample').addEventListener('click',()=>{invalidate();input.value=t.sampleText;$('source').value=lang;$('count').textContent=input.value.length+' / 3 000';input.focus();});
 $('clear').addEventListener('click',()=>{invalidate();form.reset();market.value=lang==='fr'?'pt-PT':'fr-FR';input.value='';$('count').textContent='0 / 3 000';input.focus();});
 async function copy(text,success){try{await navigator.clipboard.writeText(text);message(success);}catch{const helper=node('textarea',text);helper.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(helper);helper.select();let ok=false;try{ok=document.execCommand('copy');}catch{}helper.remove();message(ok?success:t.copyFail,!ok);}}
 $('copy').addEventListener('click',()=>copy(content,t.copied));$('share').addEventListener('click',()=>copy(location.origin+'/'+lang+'/outil-communication/',t.shared));
 function brief(){return ['onebyonecx',t.source+': '+$('source').selectedOptions[0].textContent,t.market+': '+market.selectedOptions[0].textContent,t.context+': '+$('context').selectedOptions[0].textContent,t.tone+': '+$('tone').selectedOptions[0].textContent,$('details').value,t.text+':',input.value,content].join('\n\n');}
 $('download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([brief()],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='OneByOne-CX-adaptation-'+lang+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 $('human').addEventListener('click',e=>{const target=document.getElementById('message');if(target){target.value=brief();return;}e.preventDefault();sessionStorage.setItem('onebyone-review-brief',brief());location.href=new URL(lang+'/index.html#contact',cultureExportRoot).href;});
 form.addEventListener('submit',async e=>{e.preventDefault();if(!valid()||active)return;if(!ready){message(t.offline,true);return;}if(!$('consent').checked){message(t.needConsent,true);return;}
  active=true;$('adapt').disabled=true;result.hidden=true;content='';message(t.wait);const id=++sequence;controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),35000);
  try{const r=await fetch('/api/culture-adapter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:input.value.trim(),sourceLang:$('source').value,market:market.value,context:Number($('context').value),tone:Number($('tone').value),details:$('details').value,lang,consent:true}),signal:controller.signal});const body=await r.json();if(id!==sequence)return;if(!r.ok){message(r.status===429?t.rateError:t.error,true);return;}show(body);message('');}
  catch{if(id===sequence)message(t.error,true);}finally{clearTimeout(timeout);if(id===sequence){active=false;$('adapt').disabled=!ready;}}
 });
 try{const r=await fetch('/api/culture-adapter/config',{cache:'no-store'}),cfg=await r.json();ready=r.ok&&cfg.enabled===true;if(ready){$('consent').closest('label').hidden=false;$('adapt').disabled=false;$('availability').textContent=t.available;}}catch{/* No fake AI response when the provider is unavailable. */}
}
function restore(){const textarea=document.getElementById('message'),brief=sessionStorage.getItem('onebyone-review-brief');if(textarea&&brief){textarea.value=brief;sessionStorage.removeItem('onebyone-review-brief');}}
init();restore();window.addEventListener('hashchange',()=>{init();restore();});
})();
