class GameObject{
    name;

    x;
    y;
    view_direction;


    animations;

    //todo look?
    stateQueue;

    constructor(x, y, details){
        this.x = x;
        this.y = y;   

        
        this.animations = {};
        for(let state_idx in details.animations){
            this.animations[state_idx] = new Animation(details.animations[state_idx]);
        }

        



    }

    tick(timePassed){
        
    }

    animate(timePassed){
        
        this.animations[this.stateQueue[0][0]].animate(timePassed);
    }
    
    getSprite(playerDirection){
        //todo get relative view direction from player direction

        let direction = 'front';

        return this.animations[this.stateQueue[0][0]].getDirectionSprite(direction);

    }

}

class Animation{

    frames = {};
    frame_count;
    frame_idx;

    frame_time;

    constructor(frames){

        this.frame_idx = 0;


        for(let dir_idx in frames){
            this.frames[dir_idx] = [];
            for(let i=0; i<frames[dir_idx].length; i++){
                let img = new Image();
                img.src = 'ass/'+frames[dir_idx][i][0];
                this.frames[dir_idx].push([img, frames[dir_idx][i][1]]);
            }
            this.frame_time = this.frames[dir_idx][0][1];
            this.frame_count = this.frames[dir_idx].length;
        }

        return this;

    }

    animate(timeLeftToProcess){
        
        if(this.frame_time>timeLeftToProcess){
            this.frame_time -= timeLeftToProcess;
            timeLeftToProcess = 0;
        }
        else{
            
            let anyDir = Object.keys(this.frames)[0]

            while(timeLeftToProcess>0){
                timeLeftToProcess -= this.frames[anyDir][this.frame_idx][1];

                this.frame_idx = (this.frame_idx+1) % this.frame_count;
                this.frame_time = this.frames[anyDir][this.frame_idx][1];

        
            }

        }

        


    }

    getDirectionSprite(direction){
        
        return this.frames[direction][this.frame_idx][0];
    }

}

class Enemy extends GameObject{

    constructor(details, x, y){
        details = JSON.parse(details);

        super(x,y, details);

        delete details.animations;

        Object.assign(this,details)

        this.stateQueue = [['idle',-1]];

        return this;
    }

}

class Landschaft extends GameObject{

    constructor(details, x, y){
        details = JSON.parse(details);
        
        super(x,y,details);
        
        delete details.animations;

        Object.assign(this, details);

        this.stateQueue = [['idle',-1]];

        return this;
    }
    
}



class Map{

    gameObjects;

    sizeX;
    sizeY;

    generateNew(x, y, enemy_count){
        this.sizeX = x;
        this.sizeY = y;


        this.gameObjects = [];
        for(var i=0; i<enemy_count; i++){
            //random enemies generation etc _????
            let enemy = new Enemy(enemy1, Math.random()*x, Math.random()*y);
            enemy.name = 'enemy';
            this.gameObjects.push(enemy);
        }

        
        //todo min distances
        let landschaft = Math.sqrt(x*y)/10;
        for(i = 0; i<(Math.random()*landschaft+landschaft/2); i++){
            let land = new Landschaft(tree1,  Math.random()*x, Math.random()*y);
            land.name = 'land';
            this.gameObjects.push(land);
        }
        
    }

    getGameObjects(){
        return this.gameObjects;
    }

    getObjectsInView(player, distance, fov){
        let p0, p1, p2;

        p0 = {x: player.x, y: player.y};

        let pD = player.getDirectionVector();
    
        let eX = pD.x/(Math.sqrt(pD.x*pD.x+pD.y*pD.y));
        let eY = pD.y/(Math.sqrt(pD.y*pD.y+pD.x*pD.x));

        let pC = {x: eX*distance, y: eY*distance};

        p1 = rotateVektor(pC, fov);
        p2 = rotateVektor(pC, -fov);

        p1 = {x: p1.x+p0.x, y: p1.y+p0.y}
        p2 = {x: p2.x+p0.x, y: p2.y+p0.y}


        

        
        let tmpObj = [];
        for(let i=0; i<this.gameObjects.length; i++){

            for(let xi=-1; xi<=1; xi++){
                for(let yi=-1; yi<=1; yi++){
                    let newGameObj = {}
                    newGameObj.x = this.gameObjects[i].x + this.sizeX*xi;
                    newGameObj.y = this.gameObjects[i].y + this.sizeY*yi;
                    
                    tmpObj.push([newGameObj,this.gameObjects[i]]);
                }
            }

            
            
        }

        
        let found = []
        
        let edgeDist  = vectorDistance(p1, p2);
        let viewDistAdj = Math.sqrt(vectorDistance(p0,p1)
            **2 - (1/4)*(edgeDist**2));


        for(var i=0; i<tmpObj.length; i++){
            let gO = tmpObj[i][0];
            if(ptInTriangle({x: gO.x, y: gO.y}, p0, p1, p2)){

                let obj = tmpObj[i][0];
        
                let objPoint = {x: obj.x, y: obj.y};
                
                let intersection = lineIntersection(p1, p2, 
                    p0, objPoint);
        
                
        
                let objDistX = vectorDistance(intersection, p1);
                let objDistZ = vectorDistance(p0, objPoint);
        
                if(objDistZ > viewDistAdj){
                    continue;
                }

                
                let scale = (objDistZ/viewDistAdj);

                found.push({
                    obj: tmpObj[i], 
                    distZ: objDistZ,
                    distX: objDistX,
                    edgeRatio: objDistX/edgeDist, 
                    viewDistRatio: objDistZ/viewDistAdj,
                    scale: scale
                });

                //animate
                
             
            }
        }


        


        return found.sort((a,b)=> b.distZ - a.distZ);


    }

    tick(timePassed){
        for(let i=0; i<this.gameObjects.length; i++){
            this.gameObjects[i].tick(timePassed);
        }
    }

}

class Player{

    constructor(map){
        this.x = map.sizeX*Math.random()/2;
        this.y = map.sizeY*Math.random()/2;
        this.health = 100;
        
        this.velocity = [0,0];
        this.accel = [0,0]

        this.view_direction = 0;

        this.max_v = 1.5;
        this.map = map;

        this.distanceTraveled = 0;
        
    }

    tick(timePassed){
        
        var dampening = 0.95;
        this.velocity[0] = (this.velocity[0] % this.max_v)*dampening;
        this.velocity[1] = (this.velocity[1] % this.max_v)*dampening;

        

        if(!this.detectCollisions(this.velocity[0], this.velocity[1])){

            this.x += this.velocity[0];
            this.y += this.velocity[1];


            //distance traveled
            this.distanceTraveled += Math.sqrt((this.velocity[0]*this.velocity[0]+this.velocity[1]*this.velocity[1]));

            
            if(this.x>this.map.sizeX){
                
                this.x = this.x - this.map.sizeX;
                
            }
            if(this.y>this.map.sizeY){
                this.y = this.y - this.map.sizeY;
            }
            if(this.x<0){
                
                this.x = this.map.sizeX + this.x;
                
            }
            if(this.y<0){
                this.y = this.map.sizeY + this.y;
            }
        }

    }



    accelerate(val){
    
        let rad = (this.view_direction/360)*2*Math.PI;
            
        this.velocity[0] += (val * Math.cos(rad));
        this.velocity[1] += (val * Math.sin(rad));

    }

    getDirectionVector(){
        let rad = (this.view_direction/360)*2*Math.PI;
        let ret = {x: 1 * Math.cos(rad), y: 1 * Math.sin(rad)};
        return ret;
    }


    detectCollisions(v_x, v_y){

        let x = this.x + this.velocity[0];
        let y = this.y + this.velocity[1];

        let gameObjs = map.getGameObjects();
        for(var i=0; i<gameObjs.length; i++){
            let g = gameObjs[i];
            let hitbox = g.hitbox/2;
            
            if( x>(g.x-hitbox) &&
                x<(g.x+hitbox) && 
                y>(g.y-hitbox) && 
                y<(g.y+hitbox)){
               
                return true;
            }
        }

        return false;

    }


}

