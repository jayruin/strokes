var p=t=>{let e=/[-]?\d+(?:\.\d+)?/gu;return t.match(e)?.map(r=>parseFloat(r))??[]};var l=async t=>{let e=await fetch(t,{cache:"no-store"});if(!e.ok)throw new Error(`Unexpected HTTP response status code ${e.status}.`);return e};var u="image/svg+xml";var m=t=>async e=>{let r=`https://cdn.jsdelivr.net/gh/parsimonhi/animCJK/${t}/${e}.svg`;return await l(r)},f=t=>t instanceof CSSStyleRule,w="http://www.w3.org/1999/xlink",d=async t=>{let e=await t.text(),r=new DOMParser().parseFromString(e,u),n=r.querySelector("svg")?.getAttribute("viewBox");if(n===null||typeof n>"u")throw new Error("Cannot get viewBox.");let i=Array.from(r.querySelector("style")?.sheet?.cssRules??[]).filter(f).map(o=>parseFloat(o.style.strokeWidth)).find(o=>!isNaN(o)&&isFinite(o));if(typeof i>"u")throw new Error("Cannot get strokeWidth.");return{strokes:Array.from(r.querySelectorAll("path[clip-path]")).sort((o,a)=>{let[s,g]=[o,a].map(h=>{let c=h.getAttribute("clip-path");if(c===null)throw new Error("Cannot get clip-path.");return p(c)[1]});return s-g}).map(o=>{let a=o.getAttribute("d");if(a===null)throw new Error("Cannot get strokePath.");let s=r.getElementById(r.getElementById((o.getAttribute("clip-path")??"").replace("url","").replace("(","").replace(")","").replace("#",""))?.querySelector("use")?.getAttributeNS(w,"href")?.replace("#","")??"")?.getAttribute("d");if(s===null||typeof s>"u")throw new Error("Cannot get clipPath.");return{clipPath:s,strokePath:a,strokeWidth:i}}),transform:null,viewBox:n}};var q="ja-animcjk",A=m("svgsJa");export{d as parser,A as requester,q as source};
