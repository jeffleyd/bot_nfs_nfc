// Get pixel color under the mouse.
var robot = require("robotjs");

// Get mouse position.
var mouse = robot.getMousePos();

setInterval(function() {
    console.log(mouse);    
}, 5000);
