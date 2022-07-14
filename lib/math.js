function ptInTriangle(p, p0, p1, p2) {
    var dX = p.x-p2.x;
    var dY = p.y-p2.y;
    var dX21 = p2.x-p1.x;
    var dY12 = p1.y-p2.y;
    var D = dY12*(p0.x-p2.x) + dX21*(p0.y-p2.y);
    var s = dY12*dX + dX21*dY;
    var t = (p2.y-p0.y)*dX + (p0.x-p2.x)*dY;
    if (D<0) return s<=0 && t<=0 && s+t>=D;
    return s>=0 && t>=0 && s+t<=D;
}

function rotateVektor(p,deg){

    deg = ((deg%360)/360) * 2 * Math.PI;
    return {x: p.x*Math.cos(deg)-Math.sin(deg)*p.y,
            y: Math.sin(deg)*p.x+Math.cos(deg)*p.y}
  

}

function vectorDistance(p1, p2){
    return Math.sqrt((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y));
}


function lineIntersection(ptA, ptB, ptC, ptD) {
    // Line AB represented as a1x + b1y = c1
    let a = ptB.y - ptA.y;
    let b = ptA.x - ptB.x;
    let c = a*(ptA.x) + b*(ptA.y);
    // Line CD represented as a2x + b2y = c2
    let a1 = ptD.y - ptC.y;
    let b1 = ptC.x - ptD.x;
    let c1 = a1*(ptC.x)+ b1*(ptC.y);
    let det = a*b1 - a1*b;
    if (det == 0) {
       return null
    } else {
       let x = (b1*c - b*c1)/det;
       let y = (a*c1 - a1*c)/det;
       return {x: x, y: y}
    }
 }