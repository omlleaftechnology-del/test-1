// Local WebGL architectural renderer: depth, soft directional shadows,
// anti-aliased procedural materials and view-dependent glazing.
Pivert.createModelRenderer = (canvas) => {
  const gl=canvas.getContext('webgl',{antialias:true,alpha:false,depth:true});
  if(!gl)return null;
  const derivatives=!!gl.getExtension('OES_standard_derivatives');
  const lightCode=`
    vec3 sun=normalize(vec3(-0.55,0.85,0.65));
    vec3 lightRight=normalize(vec3(0.65,0.0,0.55));
    vec3 lightUp=normalize(cross(sun,lightRight));
    vec3 center=p-vec3(0.0,3.0,0.0);
    vec4 lightPosition=vec4(dot(center,lightRight)/14.0,dot(center,lightUp)/14.0,-dot(center,sun)/22.0,1.0);
  `;
  const vertexSource=`
    attribute vec3 aPosition,aNormal,aColor;
    attribute float aMaterial;
    uniform vec2 uSize;
    uniform float uAngle,uPitch,uScale;
    varying vec3 vWorld,vNormal,vColor;
    varying float vMaterial;
    varying vec4 vShadow;
    void main(){
      vec3 p=aPosition;
      ${lightCode}
      vShadow=lightPosition;
      vWorld=p;vNormal=aNormal;vColor=aColor;vMaterial=aMaterial;
      float ca=cos(uAngle),sa=sin(uAngle),cp=cos(uPitch),sp=sin(uPitch);
      p-=vec3(0.0,3.0,0.0);
      float rx=p.x*ca+p.z*sa,rz=-p.x*sa+p.z*ca;
      float sy=p.y*cp-rz*sp,depth=p.y*sp+rz*cp;
      float w=1.0-depth/30.0;
      gl_Position=vec4(rx*2.0*uScale/uSize.x,sy*2.0*uScale/uSize.y+0.04*w,-depth/40.0,w);
    }`;
  const fragmentSource=`${derivatives?'#extension GL_OES_standard_derivatives : enable':''}
    precision highp float;
    varying vec3 vWorld,vNormal,vColor;
    varying float vMaterial;
    varying vec4 vShadow;
    uniform sampler2D uShadowMap;
    uniform vec3 uCamera;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
    float aa(float x){return ${derivatives?'max(fwidth(x),0.008)':'0.025'};}
    float joint(float coordinate,float thickness){float d=min(fract(coordinate),1.0-fract(coordinate));return 1.0-smoothstep(thickness,thickness+aa(coordinate),d);}
    float shadow(){
      vec3 q=vShadow.xyz*.5+.5;
      if(q.x<0.0||q.x>1.0||q.y<0.0||q.y>1.0)return 1.0;
      float visibility=0.0;
      vec3 sun=normalize(vec3(-.55,.85,.65));
      float bias=max(.00065,.0017*(1.0-max(dot(normalize(vNormal),sun),0.0)));
      for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
        vec2 enc=texture2D(uShadowMap,q.xy+vec2(float(x),float(y))/2048.0).rg;
        float depth=enc.x+enc.y/255.0;
        visibility+=q.z-bias<=depth?1.0:0.0;
      }
      return visibility/9.0;
    }
    void main(){
      vec3 n=normalize(vNormal),p=vWorld/.45;
      vec3 view=normalize(uCamera-vWorld);
      vec3 sun=normalize(vec3(-.55,.85,.65));
      vec3 base=vColor;
      float u=abs(n.x)>.5?p.z:p.x;
      vec2 facade=vec2(u,p.y);
      float specular=0.0;
      if(vMaterial>.5&&vMaterial<1.5){
        float lines=joint(p.y/.18,.022);
        base*=1.0-lines*.12;
        base*=.98+.025*noise(facade*7.0);
      }else if(vMaterial<2.5&&vMaterial>1.5){
        float plank=joint(u/.20,.018);
        float grain=noise(vec2(u*28.0,p.y*.9))*.65+noise(vec2(u*62.0,p.y*2.5))*.35;
        base*=.87+.22*grain-plank*.14;
      }else if(vMaterial<3.5&&vMaterial>2.5){
        float row=floor(p.y/.09),brickU=u/.28+mod(row,2.0)*.5;
        float mortar=max(joint(p.y/.09,.045),joint(brickU,.028));
        float variation=hash(vec2(floor(brickU),row));
        base*=.89+variation*.18;
        base=mix(base,vec3(.46,.46,.43),mortar*.55);
      }else if(vMaterial<4.5&&vMaterial>3.5){
        vec3 reflection=reflect(-view,n);
        float sky=clamp(reflection.y*.7+.6,0.0,1.0);
        float fresnel=.12+.70*pow(1.0-max(dot(n,view),0.0),4.0);
        float curtain=.5+.5*sin(u*18.0);
        vec3 interior=mix(vec3(.20,.24,.23),vec3(.48,.44,.34),curtain*.30);
        vec3 skyColor=mix(vec3(.30,.40,.40),vec3(.76,.85,.88),sky);
        base=mix(interior,skyColor,.40+fresnel*.48);
        specular=pow(max(dot(reflect(-sun,n),view),0.0),90.0)*.65;
      }else if(vMaterial<5.5&&vMaterial>4.5){
        vec2 uv=p.xz*vec2(3.0,5.0);
        float row=floor(uv.y),seams=joint(uv.y,.025);
        float tile=hash(vec2(floor(uv.x+mod(row,2.0)*.5),row));
        base*=.82+.18*tile-seams*.08;
      }else if(vMaterial<6.5&&vMaterial>5.5){
        float grass=noise(p.xz*9.0)*.5+noise(p.xz*2.5)*.5;
        base*=.87+.20*grass;
      }else if(vMaterial<7.5&&vMaterial>6.5){
        base*=.96+.06*noise(p.xz*25.0);
        base*=1.0-max(joint(p.x/1.0,.006),joint(p.z/1.0,.006))*.08;
      }else if(vMaterial<8.5&&vMaterial>7.5){
        base*=.82+.27*noise(p.xz*8.0+p.xy*3.0);
      }
      float sunLight=max(dot(n,sun),0.0);
      float skyLight=.33+.10*max(n.y,0.0);
      float visibility=shadow();
      float ambientOcclusion=mix(.82,1.0,smoothstep(0.0,.5,vWorld.y));
      vec3 linear=pow(max(base,vec3(.01)),vec3(2.2));
      vec3 light=vec3(.86,.92,1.0)*skyLight+vec3(1.0,.94,.81)*sunLight*visibility*.82;
      if(vMaterial>3.5&&vMaterial<4.5)light=mix(light,vec3(.88),.6);
      vec3 color=pow(max(linear*light*ambientOcclusion+specular*visibility,vec3(0.0)),vec3(1.0/2.2));
      gl_FragColor=vec4(color,1.0);
    }`;
  const shadowVertex=`attribute vec3 aPosition;void main(){vec3 p=aPosition;${lightCode}gl_Position=lightPosition;}`;
  const shadowFragment=`precision highp float;void main(){vec2 e=fract(gl_FragCoord.z*vec2(1.0,255.0));e.x-=e.y/255.0;gl_FragColor=vec4(e,0.0,1.0);}`;
  const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
  const link=(vs,fs)=>{const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;};
  const program=link(vertexSource,fragmentSource),shadowProgram=link(shadowVertex,shadowFragment);
  const buffer=gl.createBuffer(),uniforms=Object.fromEntries(['uSize','uAngle','uPitch','uScale','uShadowMap','uCamera'].map(n=>[n,gl.getUniformLocation(program,n)]));
  const shadowSize=Math.min(2048,gl.getParameter(gl.MAX_TEXTURE_SIZE));
  const shadowTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,shadowTexture);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,shadowSize,shadowSize,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const depth=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,shadowSize,shadowSize);
  const framebuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,shadowTexture,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Shadow framebuffer unavailable');
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  let vertices=0;
  const materialFor=(color)=>({
    '#d0c9b7':1,'#bebbb0':1,'#b49170':2,'#505655':3,'#9d6550':3,
    '#8faeb8':4,'#8aa9af':4,'#779ca5':4,'#606765':5,
    '#afbd9e':6,'#83966e':6,'#c8c4b7':7,'#92968f':7,
    '#627849':8,'#718352':8,'#82935d':8
  }[color]||0);
  function bindAttributes(p){
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    [['aPosition',3,0],['aNormal',3,12],['aColor',3,24],['aMaterial',1,36]].forEach(([name,size,offset])=>{
      const loc=gl.getAttribLocation(p,name);if(loc<0)return;
      gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,40,offset);
    });
  }
  function renderShadow(){
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.viewport(0,0,shadowSize,shadowSize);
    gl.clearColor(1,1,1,1);gl.clearDepth(1);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LESS);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(shadowProgram);bindAttributes(shadowProgram);gl.drawArrays(gl.TRIANGLES,0,vertices);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  }
  function setGeometry(polygons){
    const data=[];
    const floor={points:[[-13,-.14,-14],[13,-.14,-14],[13,-.14,14],[-13,-.14,14]],color:'#afbd9e',normalSign:-1};
    for(const polygon of [floor,...polygons]){
      const p=polygon.points,a=p[1].map((v,i)=>v-p[0][i]),b=p[2].map((v,i)=>v-p[0][i]);
      const n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],length=Math.hypot(...n);if(length<1e-9)continue;
      const normal=n.map(v=>v/length*(polygon.normalSign||1));
      const color=polygon.color.slice(1).match(/../g).map(v=>parseInt(v,16)/255),material=materialFor(polygon.color);
      for(let i=1;i<p.length-1;i++)for(const v of [p[0],p[i],p[i+1]])data.push(...v,...normal,...color,material);
    }
    vertices=data.length/10;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);renderShadow();
  }
  function draw({angle,pitch,zoom}){
    const width=canvas.clientWidth||700,height=canvas.clientHeight||500,ratio=Math.min(window.devicePixelRatio||1,2);
    const w=Math.round(width*ratio),h=Math.round(height*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.clearColor(.90,.94,.96,1);gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LESS);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);bindAttributes(program);
    gl.uniform2f(uniforms.uSize,width,height);gl.uniform1f(uniforms.uAngle,angle);gl.uniform1f(uniforms.uPitch,pitch);gl.uniform1f(uniforms.uScale,Math.min(width/18,height/12)*zoom);
    gl.uniform3f(uniforms.uCamera,-Math.sin(angle)*Math.cos(pitch)*30,3+Math.sin(pitch)*30,Math.cos(angle)*Math.cos(pitch)*30);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,shadowTexture);gl.uniform1i(uniforms.uShadowMap,0);gl.drawArrays(gl.TRIANGLES,0,vertices);
  }
  return {setGeometry,draw};
};
