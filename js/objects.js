

var enemy1 = JSON.stringify({

    animations: {
        idle:{
            front: [
                ["enemy tank 1 front 1.png", 150],
                ["enemy tank 1 front 2.png", 150],
                ["enemy tank 1 front 3.png", 150],
                ["enemy tank 1 front 4.png", 150],
            ],
            back: [
                ["enemy tank 1 front 1.png", 150],
                ["enemy tank 1 front 2.png", 150],
                ["enemy tank 1 front 3.png", 150],
                ["enemy tank 1 front 4.png", 150],
            ],
            right: [
                ["enemy tank 1 front 1.png", 150],
                ["enemy tank 1 front 2.png", 150],
                ["enemy tank 1 front 3.png", 150],
                ["enemy tank 1 front 4.png", 150],
            ],
            left: [
                ["enemy tank 1 front 1.png", 150],
                ["enemy tank 1 front 2.png", 150],
                ["enemy tank 1 front 3.png", 150],
                ["enemy tank 1 front 4.png", 150],
            ]
        }
    },



    //uesless
    hit_chance: 0.25,
    damage: 20,
    health: 100,

    //used
    hitbox: 3
});



var tree1 = JSON.stringify({

    animations: {
        'idle': {
            front: [
                ["tree1_1.png", 225],
                ["tree1_2.png", 225],
                ["tree1_3.png", 225],
            ],
        }
    },

    health: 25,

    destructable: true,

    hitbox: 1
});