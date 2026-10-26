// Only self-contained binary glTF is accepted; imported files never execute HTML.
Pivert.validateGLBRecord = model => {
  if(typeof model.name!=='string'||model.name.length>240||!Number.isFinite(model.size)||model.size>30*1024*1024||typeof model.data!=='string'||!/^data:model\/gltf-binary;base64,[A-Za-z0-9+/]+=*$/.test(model.data)||model.data.length>42*1024*1024)throw Error('Некорректная 3D-модель в резервной копии.');
  const raw=atob(model.data.split(',')[1]);const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));Pivert.checkGLB(bytes.buffer);
};
Pivert.checkGLB = buffer => {
  const view=new DataView(buffer);
  if(buffer.byteLength<20||view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==buffer.byteLength)throw Error('Выберите корректный GLB версии 2.');
  const length=view.getUint32(12,true);
  if(view.getUint32(16,true)!==0x4e4f534a||20+length>buffer.byteLength)throw Error('Повреждённый GLB.');
  const doc=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,length)));
  if([...(doc.buffers||[]),...(doc.images||[])].some(item=>item.uri&&!item.uri.startsWith('data:')))throw Error('Экспортируйте GLB со встроенными текстурами, без внешних файлов.');
};
Pivert.readGLB = async file => {
  if(!/\.glb$/i.test(file.name)||file.size>30*1024*1024)throw Error('Выберите файл GLB размером до 30 МБ.');
  Pivert.checkGLB(await file.arrayBuffer());
  const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve('data:model/gltf-binary;base64,'+reader.result.split(',')[1]);reader.onerror=()=>reject(Error('Не удалось прочитать файл.'));reader.readAsDataURL(file);});
  return {name:file.name,size:file.size,data};
};
Pivert.getGLBDocument = model => `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;overflow:hidden;background:#f1f0e9}canvas{display:block;touch-action:none}</style></head><body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"><\/script>
<script>
try{
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;document.body.append(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#f1f0e9');scene.add(new THREE.HemisphereLight(0xffffff,0x7b8470,1.5));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(4,8,5);scene.add(sun);const fill=new THREE.DirectionalLight(0xffffff,.8);fill.position.set(-5,3,-5);scene.add(fill);
const camera=new THREE.PerspectiveCamera(40,1,.01,10000),controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
new THREE.GLTFLoader().load(${JSON.stringify(model.data)},gltf=>{
scene.add(gltf.scene);const box=new THREE.Box3().setFromObject(gltf.scene),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const radius=Math.max(size.x,size.y,size.z,.1);gltf.scene.position.sub(center);controls.target.set(0,0,0);const distance=radius*1.9;camera.position.set(distance*.8,distance*.55,distance);camera.near=radius/1000;camera.far=radius*100;camera.updateProjectionMatrix();controls.minDistance=radius*.15;controls.maxDistance=radius*12;controls.update();renderer.render(scene,camera);parent.postMessage({type:'pivert-model-ready'},'*');
},undefined,()=>parent.postMessage({type:'pivert-model-error'},'*'));
function loop(){requestAnimationFrame(loop);controls.update();renderer.render(scene,camera);}loop();
}catch(error){parent.postMessage({type:'pivert-model-error'},'*');}
<\/script></body></html>`;
