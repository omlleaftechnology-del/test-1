// Exterior mesh based on sheets A200, A201, A302, A320 and A400.
// Metres; key overall dimensions follow the drawings. Details simplified.
Pivert.buildFoucault = () => {
  const mesh = [], unit = .45;
  function face(points,color,shade=1) {
    mesh.push({points:points.map(p=>p.map(v=>v*unit)),color,shade});
  }
  function box(x,y,z,w,h,d,color) {
    const v=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];
    [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]].forEach((a,i)=>{face(a.map(n=>v[n]),color,[.76,1,.67,1.08,.88,.85][i]);mesh[mesh.length-1].normalSign=-1;});
  }
  const W=16.44,L=33.99,H=10.40,x0=-W/2,z0=-L/2;
  const colors={beige:'#d0c9b7',white:'#eff0e7',wood:'#b49170',masonry:'#505655',glass:'#8faeb8',roof:'#606765'};
  box(x0,-.12,z0,W,.32,L,'#a4a59c');
  box(x0,.2,z0,W,H-.2,L,colors.beige);
  // White vertical strips, wood panels and horizontal fibre-cement courses.
  for(const x of [x0+.1,x0+4.3,x0+8.9,x0+14.8]) {
    box(x,.22,L/2+.012,.9,H-.22,.045,colors.white);
    box(x,.22,-L/2-.057,.9,H-.22,.045,colors.white);
  }
  box(-2.4,.22,L/2+.07,3.5,H-.22,.055,colors.wood);
  box(3.8,.22,-L/2-.13,3.4,H-.22,.055,colors.wood);
  // Smooth facade surfaces avoid subpixel striping while orbiting.
  // Window frames, glass panes and mullions on end elevations.
  function endWindow(x,y,z,w,h,front=true) {
    const sign=front?1:-1;
    box(x-.055,y-.055,z,w+.11,h+.11,.075,colors.white);
    box(x,y,z+(front?.08:-.027),w,h,.025,colors.glass);
    box(x+w*.49,y,z+(front?.108:-.04),.035,h,.013,colors.white);
    box(x-.08,y-.085,z+(front?.035:-.07),w+.16,.055,.17,'#dedfd6');
    box(x,y+h*.52,z+(front?.111:-.045),w,.025,.018,colors.white);
  }
  function sideWindow(x,y,z,w,h,right=true) {
    box(x,y-.055,z-.055,.075,h+.11,w+.11,colors.white);
    const edge=x+(right?.08:-.026);
    box(edge,y,z,.023,h,w,colors.glass);
    box(edge+(right?.026:-.015),y,z+w*.49,.012,h,.035,colors.white);
    box(x-.02,y-.085,z-.08,.16,.055,w+.16,'#dedfd6');
    box(edge+(right?.026:-.015),y+h*.52,z,.018,.025,w,colors.white);
  }
  const floors=[1.905,4.858,7.811];
  floors.forEach((floor,i)=>{
    [-1.0,2.1,5.0].forEach(x=>endWindow(x,floor+.8,L/2+.18,1.52,1.22));
    [-5.5,-2.0,1.0,4.0].forEach(x=>endWindow(x,floor+.8,-L/2-.22,1.52,1.22,false));
    [-14.4,-10.6,-6.8,-2.1,2.3,6.3,10.2,13.7].forEach(z=>{
      sideWindow(W/2+.04,floor+.8,z,1.52,1.22,true);
      sideWindow(-W/2-.12,floor+.8,z,1.52,1.22,false);
    });
  });
  [-1.0,2.1,5.0].forEach(x=>endWindow(x,.16,L/2+.18,1.52,.95));
  [-14.4,-10.6,-6.8,2.3,6.3,10.2,13.7].forEach(z=>{
    sideWindow(W/2+.04,.16,z,1.52,.95,true);
    sideWindow(-W/2-.12,.16,z,1.52,.95,false);
  });
  // Front balcony stack set in a dark masonry bay.
  box(-6.6,.2,L/2+.16,3.4,H-.2,.12,colors.masonry);
  function frontBalcony(y) {
    endWindow(-6.15,y+.15,L/2+.33,2.2,2.03);
    box(-6.7,y,L/2+.3,3.55,.15,1.9,'#b7bbb1');
    for(let x=-6.65;x<-3.15;x+=.17)box(x,y+.16,L/2+2.14,.026,1.06,.026,colors.white);
    box(-6.73,y+1.19,L/2+2.12,3.6,.045,.045,colors.white);
    for(const x of [-6.7,-3.17]) {
      box(x,y+.15,L/2+.35,.04,1.08,1.8,colors.white);
      for(let z=L/2+.4;z<L/2+2.1;z+=.17)box(x,y+.16,z,.026,1.05,.026,colors.white);
    }
  }
  floors.forEach(frontBalcony);frontBalcony(.02);
  // Long elevation balconies: three stacks on left, one on right.
  function sideStack(z,right) {
    const x=right?W/2:-W/2-.13,sign=right?1:-1;
    box(right?x:x-.1,.2,z-.05,.15,H-.2,3.5,colors.masonry);
    [.05,...floors].forEach(y=>{
      sideWindow(right?x+.18:x-.28,y+.15,z+.6,2.1,2.03,right);
      const left=right?x+.2:x-2.0;
      box(left,y,z-.08,1.9,.15,3.65,'#b5b9af');
      const edge=right?left+1.85:left;
      box(edge,y+1.18,z-.08,.045,.045,3.65,colors.white);
      for(let zz=z;zz<z+3.55;zz+=.17)box(edge,y+.15,zz,.026,1.06,.026,colors.white);
      for(const zz of [z-.08,z+3.53])box(left,y+1.18,zz,1.9,.045,.045,colors.white);
    });
  }
  [-15.4,-6.2,4.8].forEach(z=>sideStack(z,false));sideStack(-1.9,true);
  // Entry doors at two stair cores, as on A201.
  [-9.2,6.2].forEach(z=>{
    box(W/2+.14,.16,z,.1,2.03,.92,colors.white);
    box(W/2+.25,.45,z+.1,.018,1.5,.7,colors.glass);
    box(W/2+.1,.03,z-.25,1.1,.13,1.5,'#a8aa9e');
  });
  // Hipped roof, pitch 3.5:12; ridge and eaves from elevation A400.
  const over=.48, half=W/2+over, length=L/2+over, ridge=H+3.045;
  const a=[-half,H,length],b=[half,H,length],c=[half,H,-length],d=[-half,H,-length];
  const r1=[0,ridge,length-half],r2=[0,ridge,-length+half];
  face([a,b,r1],colors.roof,.95);face([b,c,r2,r1],colors.roof,.76);
  face([c,d,r2],colors.roof,.7);face([d,a,r1,r2],colors.roof,.9);
  // White fascia around eaves.
  box(-half,H-.12,-length,half*2,.18,.12,colors.white);
  box(-half,H-.12,length-.12,half*2,.18,.12,colors.white);
  box(-half,H-.12,-length,.12,.18,length*2,colors.white);
  box(half-.12,H-.12,-length,.12,.18,length*2,colors.white);
  // Gables over balcony stacks; main roof intersections simplified.
  function gable(x,y,z,width,depth,side=false) {
    const peak=y+width*.146;
    if(!side){
      face([[x,y,z],[x+width,y,z],[x+width/2,peak,z]],colors.white);
      face([[x,y,z],[x+width/2,peak,z],[x+width/2,peak,z-depth],[x,y,z-depth]],colors.roof,.88);
      face([[x+width,y,z],[x+width/2,peak,z],[x+width/2,peak,z-depth],[x+width,y,z-depth]],colors.roof,.78);
    } else {
      face([[x,y,z],[x,y,z+width],[x,peak,z+width/2]],colors.white,.9);
      face([[x,y,z],[x,peak,z+width/2],[x+depth,peak,z+width/2],[x+depth,y,z]],colors.roof,.8);
      face([[x,y,z+width],[x,peak,z+width/2],[x+depth,peak,z+width/2],[x+depth,y,z+width]],colors.roof,.9);
    }
  }
  gable(-6.9,H,L/2+2.4,3.95,3.5);
  [-15.5,-6.3,4.7].forEach(z=>gable(-W/2-2.2,H,z,3.9,3.4,true));
  // Roof ventilation stacks.
  [-10,-3,5,12].forEach(z=>{
    box(-.4,ridge-.5,z,.65,.65,.65,'#555c59');
    box(-.48,ridge+.15,z-.08,.81,.14,.81,'#454c49');
  });
  // Presentation landscaping, separate from measured architectural geometry.
  box(-11,-.16,-20,22,.08,40,'#83966e');
  box(-10,-.065,19,20,.055,3.3,'#92968f');
  box(-10,-.06,-19.8,20,.05,2.2,'#92968f');
  box(-9.8,-.052,-18,.95,.04,37,'#c8c4b7');
  box(9.0,-.052,-18,.95,.04,37,'#c8c4b7');
  box(-7.5,-.048,18.6,15,.045,.65,'#c8c4b7');
  // Walk from the front balcony and side entrances.
  box(-6.8,-.048,18.4,3.9,.045,3.0,'#c8c4b7');
  for(const z of [-9.2,6.2])box(8.4,-.048,z-.3,1.3,.045,1.6,'#c8c4b7');
  function ellipsoid(cx,cy,cz,rx,ry,rz,color) {
    const rings=7,slices=12;
    const point=(i,j)=>{let a=Math.PI*i/rings,b=2*Math.PI*j/slices;return[cx+rx*Math.sin(a)*Math.cos(b),cy+ry*Math.cos(a),cz+rz*Math.sin(a)*Math.sin(b)];};
    for(let i=0;i<rings;i++)for(let j=0;j<slices;j++) {
      face([point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)],color);
      mesh[mesh.length-1].normalSign=-1;
    }
  }
  for(const x of [-8.8,8.8])for(let z=-14.8;z<17;z+=3.3) {
    // Low clipped shrubs leave all basement glazing visible.
    ellipsoid(x,.28,z,.38,.34,.55,'#627849');
  }
  for(const [x,z] of [[-10,-17.5],[10,17],[-10,15.5]]) {
    box(x-.13,.02,z-.13,.26,2.1,.26,'#78664f');
    ellipsoid(x,2.6,z,1.15,1.35,1.1,'#718352');
    ellipsoid(x-.5,2.2,z+.4,.8,.85,.8,'#82935d');
  }
  // Slim facade luminaires and a small entrance plaque.
  for(const z of [-9.4,6.0]) {
    box(W/2+.15,2.35,z,.16,.3,.11,'#383f3c');
    box(W/2+.31,2.4,z+.015,.015,.19,.08,'#e8d2a0');
  }
  box(-2.65,2.0,L/2+.18,.68,.27,.07,'#4a514b');
  return mesh;
};
