/* Minimal QR Code encoder (byte mode, ECC level M, versions 1-10). No dependencies. */
const QR=(()=>{
const ECC=[0,10,16,26,18,24,16,18,22,22,26],BLK=[0,1,1,1,2,2,4,4,4,5,5];
const EXP=new Array(512),LOG=new Array(256);
{let x=1;for(let i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11d}for(let i=255;i<512;i++)EXP[i]=EXP[i-255]}
const mul=(a,b)=>a&&b?EXP[LOG[a]+LOG[b]]:0;
function rs(data,n){let g=[1];for(let i=0;i<n;i++){const next=new Array(g.length+1).fill(0);g.forEach((c,j)=>{next[j]^=c;next[j+1]^=mul(c,EXP[i])});g=next}
 const r=new Array(n).fill(0);for(const b of data){const f=b^r.shift();r.push(0);for(let i=0;i<n;i++)r[i]^=mul(g[i+1],f)}return r}
const rawModules=v=>{let r=(16*v+128)*v+64;if(v>=2){const a=Math.floor(v/7)+2;r-=(25*a-10)*a-55;if(v>=7)r-=36}return r};
function utf8(s){return Array.from(new TextEncoder().encode(s))}
function make(text){
 const bytes=utf8(text);let ver=0;
 for(let v=1;v<=10;v++){const cap=Math.floor(rawModules(v)/8)-ECC[v]*BLK[v];const need=4+(v<10?8:16)+bytes.length*8;if(Math.ceil(need/8)<=cap){ver=v;break}}
 if(!ver)throw new Error('網址過長，無法產生 QR Code');
 const size=ver*4+17,cap=Math.floor(rawModules(ver)/8)-ECC[ver]*BLK[ver];
 const bits=[];const put=(val,len)=>{for(let i=len-1;i>=0;i--)bits.push((val>>>i)&1)};
 put(4,4);put(bytes.length,ver<10?8:16);bytes.forEach(b=>put(b,8));
 put(0,Math.min(4,cap*8-bits.length));while(bits.length%8)bits.push(0);
 const data=[];for(let i=0;i<bits.length;i+=8)data.push(parseInt(bits.slice(i,i+8).join(''),2));
 for(let p=0xec;data.length<cap;p^=0xec^0x11)data.push(p);
 const nb=BLK[ver],raw=Math.floor(rawModules(ver)/8),short=nb-raw%nb,sl=Math.floor(raw/nb),el=ECC[ver],blocks=[];
 for(let i=0,k=0;i<nb;i++){const d=data.slice(k,k+sl-el+(i<short?0:1));k+=d.length;const e=rs(d,el);if(i<short)d.push(0);blocks.push(d.concat(e))}
 const all=[];for(let i=0;i<blocks[0].length;i++)blocks.forEach((b,j)=>{if(i!==sl-el||j>=short)all.push(b[i])});
 const mod=Array.from({length:size},()=>new Array(size).fill(false)),fn=Array.from({length:size},()=>new Array(size).fill(false));
 const set=(x,y,c)=>{mod[y][x]=c;fn[y][x]=true};
 for(let i=0;i<size;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
 for(const [cx,cy] of [[3,3],[size-4,3],[3,size-4]])for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=cx+dx,y=cy+dy;if(x>=0&&y>=0&&x<size&&y<size){const d=Math.max(Math.abs(dx),Math.abs(dy));set(x,y,d!==2&&d!==4)}}
 if(ver>1){const n=Math.floor(ver/7)+2,step=ver===32?26:Math.ceil((ver*4+4)/(n*2-2))*2,pos=[6];for(let p=size-7;pos.length<n;p-=step)pos.splice(1,0,p);
  pos.forEach((cy,i)=>pos.forEach((cx,j)=>{if((i===0&&j===0)||(i===0&&j===n-1)||(i===n-1&&j===0))return;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(cx+dx,cy+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}))}
 const formatCells=[];for(let i=0;i<=14;i++)formatCells.push(i);
 const drawFormat=m=>{let rem=m;for(let i=0;i<10;i++)rem=(rem<<1)^((rem>>9)*0x537);const f=((m<<10)|rem)^0x5412,b=i=>((f>>i)&1)!==0;
  for(let i=0;i<=5;i++)set(8,i,b(i));set(8,7,b(6));set(8,8,b(7));set(7,8,b(8));for(let i=9;i<15;i++)set(14-i,8,b(i));
  for(let i=0;i<8;i++)set(size-1-i,8,b(i));for(let i=8;i<15;i++)set(8,size-15+i,b(i));set(8,size-8,true)};
 drawFormat(0);
 if(ver>=7){let rem=ver;for(let i=0;i<12;i++)rem=(rem<<1)^((rem>>11)*0x1f25);const v=(ver<<12)|rem;for(let i=0;i<18;i++){const c=((v>>i)&1)!==0,a=size-11+i%3,b=Math.floor(i/3);set(a,b,c);set(b,a,c)}}
 let k=0;for(let right=size-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<size;vert++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?size-1-vert:vert;if(!fn[y][x]&&k<all.length*8){mod[y][x]=((all[k>>3]>>(7-(k&7)))&1)!==0;k++}}}
 const maskFn=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
 const apply=m=>{for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!fn[y][x]&&maskFn[m](x,y))mod[y][x]=!mod[y][x]};
 const penalty=()=>{let p=0;const line=g=>{let run=1;for(let i=1;i<size;i++){if(g(i)===g(i-1)){run++;if(run===5)p+=3;else if(run>5)p++}else run=1}};
  for(let y=0;y<size;y++)line(i=>mod[y][i]);for(let x=0;x<size;x++)line(i=>mod[i][x]);
  for(let y=0;y<size-1;y++)for(let x=0;x<size-1;x++){const c=mod[y][x];if(c===mod[y][x+1]&&c===mod[y+1][x]&&c===mod[y+1][x+1])p+=3}
  let dark=0;mod.forEach(r=>r.forEach(c=>{if(c)dark++}));p+=Math.floor(Math.abs(dark*20-size*size*10)/(size*size))*10;return p};
 let best=0,bestScore=Infinity;
 for(let m=0;m<8;m++){apply(m);drawFormat(m);const s=penalty();if(s<bestScore){bestScore=s;best=m}apply(m)}
 apply(best);drawFormat(best);
 return {size,modules:mod}
}
function toCanvas(text,{scale=8,margin=4,label=''}={}){
 const {size,modules}=make(text),qr=(size+margin*2)*scale,extra=label?scale*5:0,c=document.createElement('canvas');
 c.width=qr;c.height=qr+extra;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.fillStyle='#000';
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(modules[y][x])g.fillRect((x+margin)*scale,(y+margin)*scale,scale,scale);
 if(label){g.fillStyle='#173d34';g.font=`bold ${Math.round(scale*2)}px sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(label,qr/2,qr+extra/2-scale*.8,qr-scale*2)}
 return c}
return {make,toCanvas}
})();
if(typeof module!=='undefined')module.exports=QR;
