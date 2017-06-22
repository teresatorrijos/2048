var colors = [
  "#93d2ff",
  "#4ab5ff",
  "#289cef",
  "#2a72a3",
  "#105a86",
  "#00548c",
  "#004777",
  "#002c4a",
  "#000F35",
  "#000921",
  "#009894"
];

var colorAssignment = function(x){
  var i = (Math.log(x)/Math.LN2);
  return colors[i-1];
}
