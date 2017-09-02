mathbox = mathBox({
  plugins: ["core", "controls", "cursor"],
  controls: {
    klass: THREE.OrbitControls
  }
});
three = mathbox.three;

three.camera.position.set(2.3, 1, 2);
three.renderer.setClearColor(new THREE.Color(0xffffff), 1.0);

view = mathbox.cartesian({
  range: [[-6, 6], [-1, 1], [-1, 1]],
  scale: [6, 1, 1]
});

var a = 1,
  b = 1;
var valMax = 5
var xMin = -valMax,
  xMax = valMax,
  yMin = -valMax,
  yMax = valMax,
  zMin = -valMax,
  zMax = valMax;
view = mathbox.cartesian({
  range: [[xMin, xMax], [yMin, yMax], [zMin, zMax]],
  scale: [2, 1, 2]
  // eulerOrder: ""xzy,
});
// axes
var xAxis = view.axis({ axis: 1, width: 8, detail: 40, color: "red" });
var xScale = view.scale({ axis: 1, divide: 10, nice: true, zero: true });
var xTicks = view.ticks({ width: 5, size: 15, color: "red", zBias: 2 });
var xFormat = view.format({
  digits: 2,
  font: "Arial",
  weight: "bold",
  style: "normal",
  source: xScale
});
var xTicksLabel = view.label({
  color: "red",
  zIndex: 0,
  offset: [0, -20],
  points: xScale,
  text: xFormat
});

var yAxis = view.axis({ axis: 3, width: 8, detail: 40, color: "green" });
var yScale = view.scale({ axis: 3, divide: 5, nice: true, zero: false });
var yTicks = view.ticks({ width: 5, size: 15, color: "green", zBias: 2 });
var yFormat = view.format({
  digits: 2,
  font: "Arial",
  weight: "bold",
  style: "normal",
  source: yScale
});
var yTicksLabel = view.label({
  color: "green",
  zIndex: 0,
  offset: [0, 0],
  points: yScale,
  text: yFormat
});

var zAxis = view.axis({ axis: 2, width: 8, detail: 40, color: "blue" });
var zScale = view.scale({ axis: 2, divide: 5, nice: true, zero: false });
var zTicks = view.ticks({ width: 5, size: 15, color: "blue", zBias: 2 });
var zFormat = view.format({
  digits: 2,
  font: "Arial",
  weight: "bold",
  style: "normal",
  source: zScale
});
var zTicksLabel = view.label({
  color: "blue",
  zIndex: 0,
  offset: [0, 0],
  points: zScale,
  text: zFormat
});

view.grid({ axes: [1, 3], width: 2, divideX: 20, divideY: 20, opacity: 0.25 });

var nPoints = 7;

var pData = view.volume({
  height:nPoints,
  width:nPoints,
  depth:nPoints,
  expr: function(emit, x, y,z, i, j,k, t) {
    emit(x, y, z);
  }
});

var pGraph = view.point({
  points:pData,
  color:"rgb(30,10,150)",
  size:10,
});
// var pMesh = view.surface({
//   points:pData,
//   fill:false,
//   lineX:true,
//   lineY:true,
//   color:"rgb(100,50,210)",
//   opacity:0.5,
// })

var mat = [
  [1,0,-0.5],
  [0,1,0.1],
  [0.5,0,1],
];
var matMult = function(x,y,z,m){
  var dest = [0,0,0];
  for (var i=0; i < m.length; i++){
      var w = m[i];
      dest[i] = w[0]*x+w[1]*y+w[2]*z;
  }
  return dest;
}
var vData = view.volume({
  height:nPoints,
  width:nPoints,
  depth:nPoints,
  items:2,
  expr: function(emit, x, y,z, i, j,k, t) {
    var dest = matMult(x,y,z,mat);
    emit(x, y, z);
    emit(dest[0],dest[1],dest[2]);
  }
});
var vSize = 4;
var vVisible = false;
var animeStep = 0.0;
var vGraph = view.vector({
  points:vData,
  size:vSize,
  end:true,
  visible:vVisible,
});
var gui = new dat.GUI();
gui.add(this,"vSize").onChange(
function(){
  vGraph.set("size",vSize);
});
gui.add(this,"animeStep",0.0,1.0).step(0.01).onChange(
function(){
  var tempMat = [
    [0,0,0],
    [0,0,0],
    [0,0,0],
  ];
  var invS = 1.0 - animeStep;
  for (var i=0;i<3;i++){
    for (var j =0;j<3;j++){
      tempMat[i][j] = mat[i][j] * animeStep;
    }
    tempMat[i][i] += invS;
  }
  pData.set("expr",function(emit, x, y,z, i, j,k, t) {
    var dest = matMult(x,y,z,tempMat);
    emit(dest[0],dest[1],dest[2]);
  });
  // pGraph.set("points",pData);
});
gui.add(this,"vVisible").onChange(function(){
  vGraph.set("visible",vVisible);
});
// register the grid component
Vue.component("demo-grid", {
  template: "#grid-template",
  props: {
    data: Array
  },
  data: function() { 
    return {
    downPos: 0,
    oldVal: 0,
    onHold: false,
    cCell: null,
  }},
    methods:{
    mDown: function (cell,event){
      if (event) event.preventDefault()
      this.downPos = event.clientX;
      this.onHold = true;
      this.cCell = cell;
      this.oldVal = cell.val;
    },
    mUp: function(event){
      this.onHold = false;
      this.cCell.hover = false;
    },
    mOver: function(cell,event){
      if (!this.onHold){
        cell.hover = true;
      }
    },
    mLeave: function(cell,event){
      if (!this.onHold){
        cell.hover = false;
      }
    },
    mMove: function(event){
    if (this.onHold){
        var delta = this.downPos - event.clientX;
        var newVal = this.oldVal + delta*-0.1;
        var ri = this.cCell.ri;
        var ci = this.cCell.ci;
        mat[ri][ci] = newVal;
        this.cCell.val = newVal;
      }
    }
  }
});
// bootstrap the demo
var grid = [];
for (var i =0;i<mat.length;i++){
  var r = [];
  var mr = mat[i];
  for (var j = 0;j<mr.length;j++){
    r.push({
      ri:i,
      ci:j,
      val:mr[j],
      hover:false
    });
  }
  grid.push(r);
}
var demo = new Vue({
  el: "#demo",
  data: {
    gridData: grid
  },

});
