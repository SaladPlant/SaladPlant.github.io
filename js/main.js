Controller.search();

// Input events
window.addEventListener('gc.button.press', updateButton, false);
window.addEventListener('gc.button.hold', updateButton, false);
window.addEventListener('gc.button.release', updateButton, false);
window.addEventListener('gc.analog.change', updateAnalog, false);

window.addEventListener('gc.controller.found', function(event) {
    var controller = event.detail.controller;
    const data = {"Status":"Controller Found"};
    const options = {
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }
    fetch("/api", options).then(response=>{
        console.log(response);
    });
    console.log("Controller found at index " + controller.index + ".");
    console.log("'" + controller.name + "' is ready!");
}, false);

var xlen = 400;
var ylen = 400;



function setup(){
    var centre = {x:xlen/2,y:ylen/2};
    var canvas = document.getElementById("CanvasUI");
    var tiltcanvas = canvas.getContext("2d");
    tiltcanvas.fillStyle = "#000000";
    tiltcanvas.strokeStyle = "#FFFFFF";
    tiltcanvas.fillRect(0,0,xlen+50,ylen);
    tiltcanvas.lineWidth = 1;
    tiltcanvas.beginPath();
    tiltcanvas.arc(centre.x, centre.y, 200, 0, 2 * Math.PI);
    tiltcanvas.moveTo(centre.x-200,centre.y);
    tiltcanvas.lineTo(centre.x+200, centre.y);
    tiltcanvas.stroke();

    canvas = document.getElementById("CanvasUISpeed");
    var speedcanvas = canvas.getContext("2d");
    speedcanvas.fillStyle = "#000000";
    speedcanvas.fillRect(0,0,100,400);

    canvas = document.getElementById("CanvasUIAccel");
    var accelcanvas = canvas.getContext("2d");
    accelcanvas.fillStyle = "#000000";
    accelcanvas.fillRect(0,0,100,400);

    console.log("setup complete");
}
setup()

//Buttons
var Buttons_Pressed = new Array(" ")
var speed = 0;

function updateButton(event){
    var button = event.detail;
    

    if (event.type === 'gc.button.press') {
        if (!(Buttons_Pressed.includes(button.name))){
            Buttons_Pressed.push(button.name);
            document.getElementById("Buttons Pressed").innerHTML = "buttons: " + Buttons_Pressed.toString();
        }
    }

    if (event.type === 'gc.button.hold') {
        //console.log('button.hold');
        //console.log(detail);
        //debugger;
    }

    if (event.type === 'gc.button.release') {
        Buttons_Pressed.pop(button.name);
        document.getElementById("Buttons Pressed").innerHTML = "buttons: " + Buttons_Pressed.toString();
    }


    if (button.name == "RIGHT_SHOULDER_BOTTOM"){
        speed = speed + button.value * 0.05;
    }else if (button.name == "LEFT_SHOULDER_BOTTOM"){
        speed = speed - button.value * 0.05;
    }

    var accel = 0;
    if (button.name == "RIGHT_SHOULDER_BOTTOM"){
        accel = button.value;
    }else if (button.name == "LEFT_SHOULDER_BOTTOM"){
        accel = -button.value;
    }

    speed = Math.max(speed,0);
    speed = Math.min(speed,1);
    var c = document.getElementById("CanvasUISpeed");
    var ctx = c.getContext("2d");
    console.log(button.value);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,100,ylen);
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 400 - 400 * speed);
    ctx.lineTo(100, 400 - 400 * speed);
    ctx.stroke();


    var c = document.getElementById("CanvasUIAccel");
    var ctx = c.getContext("2d");
    console.log(button.value);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,100,ylen);
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 400 - (200 * accel)-200);
    ctx.lineTo(100, 400 - (200 * accel)-200);
    ctx.stroke();


}



// Analog Sticks
 function updateAnalog(event) {
    var stick = event.detail;
    var centre = {x:xlen/2,y:ylen/2};
    var c = document.getElementById("CanvasUI");
    var ctx = c.getContext("2d");

    if (stick.name == "LEFT_ANALOG_STICK") {
        document.getElementById("Left Stick").innerHTML = "left stick: " + stick.position.x + "  "+ -stick.position.y;

        var line_update = calculateLineStart({x:425,y:375},stick.position.x,20,30);
        ctx.fillStyle = "#000000";
        ctx.fillRect(400,350,50,50);
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(line_update.start.y+50, line_update.start.x-50);
        ctx.lineTo(line_update.end.y+50, line_update.end.x-50);
        ctx.stroke();


    }else if (stick.name == "RIGHT_ANALOG_STICK"){
        document.getElementById("Right Stick").innerHTML = "right stick: " + stick.position.x + "  "+ -stick.position.y;
        var line_update = calculateLineStart(centre,stick.position.x,200,90);
        ctx.fillStyle = "#000000";
        ctx.fillRect(0,0,xlen,ylen);
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centre.x, centre.y, 200, 0, 2 * Math.PI);
        ctx.moveTo(line_update.start.x, line_update.start.y);
        ctx.lineTo(line_update.end.x, line_update.end.y);
        ctx.stroke();
    }



    console.log(stick);
}

function calculateLineStart(centre, angle, line_radius, angle_lim){
    angle_lim = toRad(angle_lim);
    var xstart = centre.x - (line_radius * Math.cos(angle * angle_lim));
    var ystart = centre.y - (line_radius * Math.sin(angle * angle_lim));
    var xend = centre.x + (line_radius * Math.cos(angle * angle_lim));
    var yend = centre.y + (line_radius * Math.sin(angle * angle_lim));
    return {start:{x:xstart, y:ystart}, end:{x:xend, y:yend}};
}

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}