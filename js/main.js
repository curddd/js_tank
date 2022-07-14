var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');




var assets_imgs = {}
var file_names = [
    'tank cockpit.png',
    'sky.png',
    'dirt.png',
    'dirt 2.png',
    'base_ui.png',
    'tank_out_1.png',
    'tank_out_2.png',
    'cannon.png'
];

function loadAssets(){

    

    for(var i=0; i<file_names.length; i++){
            
        var img = new Image();
        img.src = 'ass/'+file_names[i];
        assets_imgs[file_names[i]] = img;
        
    }
    

}



/*
scaler: [-1, 1]
tgt_pixels: dimension of cutout size
*/
function textureScaler(width, scaler, tgt_pixels){
    
        
    var ret = scaler * (width/2) + width/2;
    
    if(ret+tgt_pixels > width){
        //console.log("offset plus tgt wider than image width", scaler, ret, tgt_pixels, width)
        ret =  (ret - width/2) % width;
    }
    if(ret < 0){
        ret += width;
        console.log('ret smaller 0')
    }
    

    return ret;
}

function drawWedged(img, ctx, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, divisions=4){

    let pixelSizeX = Math.ceil(dWidth/sWidth);
    let pixelSizeY = Math.ceil(dHeight/sHeight);


    for(let i=1; i<=divisions; i++){
        let divisionHeight = Math.floor(sHeight/divisions);

        //abtasttung
        for(let yi=0; yi<sHeight/i; yi++){
            for(let xi=0; xi<sWidth/i; xi++){
                //quell pixel
                let sourceX = sx+xi*i;
                let sourceY = sy+yi*i;

                //dest pixel
                let destX = dx+xi*pixelSizeX;
                let destY = dy+yi*pixelSizeY;

                ctx.drawImage(img,
                    sourceX, sourceY,
                    1, 1,
                    destX, destY,
                    pixelSizeX*i, pixelSizeY*i
                );


            }
        }

    }


}

function drawInLayers(img, ctx, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, divisions=5){






    let drawnHeight = 0;

    for(let i=0; i<divisions; i++){
        
        //let nsx = sx+(sWidth/divisions)*i;
        let nsx = sx;
        let nsy = sy+(sHeight/divisions)*i;
        //let nsy = sy;
    
        let nsWidth = (sWidth/divisions)*(divisions-i);
        //let nsHeight = (sHeight/divisions)*(divisions-i);
        let nsHeight = (sHeight/divisions);
        
        let ndx = dx;
        //let ndy = dy+(dHeight/divisions)*i;
    
        let ndy = dy + drawnHeight;

        let ndWidth = dWidth;
        //let ndHeight = (dHeight/divisions);
        let ndHeight = dHeight*((i/divisions)**2);
        
        drawnHeight += ndHeight;

        ctx.drawImage(img,
            nsx, nsy,
            nsWidth, nsHeight, 
            ndx, ndy,
            ndWidth, ndHeight
        );
    }


}


var debugObj = {};

function drawOutside(timePassed){

    var skyRatio = 0.5;
    
    var sky_x = textureScaler(assets_imgs['sky.png'].width, (player.view_direction%360)/360, 64);

    ctx.drawImage(assets_imgs['sky.png'], 
        sky_x, 0, 
        64, 32, 
        0, 0, 
        canvas.clientWidth, 150
    )
    


    var dirt_x = textureScaler(assets_imgs['dirt 2.png'].width, (player.view_direction%360)/360, 88);
    var dirt_y = textureScaler(
        assets_imgs['dirt 2.png'].height,
        (player.distanceTraveled % 100)*-0.01, 
        88
    );


    
    /*
    drawInLayers(assets_imgs['dirt 2.png'], ctx,
        dirt_x, dirt_y,
        88, 88, 
        0, canvas.clientHeight*(80/480)+canvas.clientHeight*skyRatio,
        canvas.clientWidth, canvas.clientHeight-(canvas.clientHeight*(80/480)+canvas.clientHeight*skyRatio)
    );
    */
    drawInLayers(assets_imgs['dirt 2.png'], ctx,
        dirt_x, dirt_y,
        88, 88, 
        0, 150,
        canvas.clientWidth, 160
    );


    //player view direction
    let viewDistance = 25;
    
    let fov = 25;

    let objsInView = map.getObjectsInView(player, viewDistance, fov);

    let closeDistance = 15;

    for(let i = 0; i<objsInView.length; i++){

        let obj = objsInView[i];

        let xOffset = 640*(1-obj.edgeRatio);

        //TODO VIEW DIRECTION AND ANIMATION STATE
        //let img = obj.obj[1].animations.front.frames[0][0];
        obj.obj[1].animate(timePassed);
        let img = obj.obj[1].getSprite('test');
        
        let maxPixels = 350;
        let horizonPixelY = 160;

        let imgDim = maxPixels*(1-(obj.viewDistRatio))**2;
        let yOffset = horizonPixelY-(60*(1-(obj.viewDistRatio)));


        if(obj.distZ<closeDistance){
            yOffset -= (1-(obj.distZ/closeDistance))*100;
        }

        ctx.drawImage(img,
            0, 0,
            img.width, img.height,
            xOffset, yOffset,
            imgDim, imgDim
        );
        /*console.log(img,
            0, 0,
            img.width, img.height,
            xOffset, yOffset,
            imgDim, imgDim)
            */
       
    }

}


function drawTankAndUI(){

    //todo screen shake??
    
    if(Math.floor(player.distanceTraveled) % 2 == 0)
        ctx.drawImage(assets_imgs['tank_out_1.png'], 0, 240, 360, 136)
    else
        ctx.drawImage(assets_imgs['tank_out_2.png'], 0, 240, 360, 136)
    
    ctx.drawImage(assets_imgs['cannon.png'], 140, 220, 80, 90)


    ctx.drawImage(assets_imgs['base_ui.png'], 0, 0, 360, 640)


}


function drawRadar(){
    //125 x 65
    //490 x 400

    //let radarMaxX = 129;
    //let radarMaxY = 68;


    let radarMaxX = 200;
    let radarMaxY = 200;

    let radarStartX = 20;
    let radarStartY = 300;

    ctx.fillStyle = '#8c8b56';
    ctx.fillRect(radarStartX, radarStartY, radarMaxX, radarMaxY);


    let radarScaleX = (radarMaxX/map.sizeX);
    let radarScaleY = (radarMaxY/map.sizeY);

    let playerMapX = radarScaleX*player.x;
    let playerMapY = radarScaleY*player.y;

    
    ctx.fillStyle = '#000000';
    ctx.fillRect(radarStartX+playerMapX-5, radarStartY+playerMapY-5, 10, 10);



    let rad = (player.view_direction/360)*2*Math.PI;
    let evX = 10*Math.cos(rad);
    let evY = 10*Math.sin(rad);

    
    ctx.strokeStyle = 'pink';
    ctx.strokeWidth = 3;
    ctx.beginPath();
    ctx.moveTo(radarStartX+playerMapX+evX, radarStartY+playerMapY+evY);
    ctx.lineTo(radarStartX+playerMapX, radarStartY+playerMapY);
    ctx.stroke();


    //game objects

    for(let g_idx in map.gameObjects){
        let obj = map.gameObjects[g_idx];
        
        if(obj.name == 'enemy'){
            
            ctx.strokeStyle = 'red';
        }
        else{
            ctx.strokeStyle = 'green';
        }

        let objX = obj.x*radarScaleX;
        let objY = obj.y*radarScaleY;

        ctx.beginPath();
        ctx.moveTo(radarStartX+objX-3, radarStartY+objY-3);
        ctx.lineTo(radarStartX+objX+3, radarStartY+objY+3);
        ctx.stroke();


        
        ctx.beginPath();
        ctx.moveTo(radarStartX+objX-3, radarStartY+objY+3);
        ctx.lineTo(radarStartX+objX+3, radarStartY+objY-3);
        ctx.stroke();


    }


    //debug cone
    if(debugObj.viewCone){
        ctx.strokeStyle = 'yellow';
        ctx.strokeWidth = 1;

        ctx.beginPath();
        ctx.moveTo(radarStartX+playerMapX, radarStartY+playerMapY);
        ctx.lineTo(radarStartX+radarScaleX*debugObj.viewCone[0].x, radarStartY+debugObj.viewCone[0].y*radarScaleY);
        ctx.stroke();

        
        ctx.beginPath();
        ctx.moveTo(radarStartX+playerMapX, radarStartY+playerMapY);
        ctx.lineTo(radarStartX+debugObj.viewCone[1].x*radarScaleX, radarStartY+debugObj.viewCone[1].y*radarScaleY);
        ctx.stroke();
    }

}

var dirt_offset = 0;
var degree = 0;
var speed = 0;
var then = Date.now();

function game(){


    let now = Date.now();
    let passed = now-then;

    let tick = pollKeys();
    if(false && !tick){
        requestAnimationFrame(game);
        return;
    }

    player.tick(passed);
    map.tick(passed);

    drawOutside(passed);
    drawTankAndUI();
    drawRadar();

    then = now;

    //setTimeout(()=>{
        requestAnimationFrame(game);
    //},500)
    
}

var lastKeyE = null;
function onButtonPress(e){
    lastKeyE = e;
}

function pollKeys(){
    e = lastKeyE;
    
    if(!e){
        return false;
    }
    
    if(e.code == 'ArrowLeft'){
        player.view_direction -= 2.5;
        
    }
    if(e.code == 'ArrowRight'){
        player.view_direction += 2.5;
    }

    if(e.code == 'ArrowUp'){
        player.accelerate(0.025);
        
    }
    if(e.code == 'ArrowDown'){
        player.accelerate(-0.005);
    }
    
    if(e.code == 'Enter'){
        console.log(map);
        console.log(player);
        console.log(player.view_direction);
        console.log(player.velocity);
        
    }
    
    lastKeyE = null;
    return true;
    
}

var map = null;
var player = null;
window.onload = ()=>{
    console.log("loaded");
    loadAssets();

    map = new Map();
    map.generateNew(100,100,20);

    player = new Player(map);



    setTimeout(()=>{

        requestAnimationFrame(game);
    }, 500);
    
    window.onkeydown = onButtonPress;

}

function getRandomInt(min, max){
    return Math.floor(Math.random()*(max-min))+min;
}
