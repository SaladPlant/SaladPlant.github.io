var tilt_UI = document.getElementById("CanvasUITilt");
var speed_UI = document.getElementById("CanvasUISpeed");
var acceleration_UI = document.getElementById("CanvasUIAccel");
var vel = 0;
var Buttons_Pressed = new Array(" ")

_main();

function _main(){
    //Get Controller
    Controller.search();

    // Input events
    window.addEventListener('gc.button.press', updateButton, false);
    window.addEventListener('gc.button.hold', updateButton, false);
    window.addEventListener('gc.button.release', updateButton, false);
    window.addEventListener('gc.analog.change', updateAnalog, false);

    //------------------------------------------------------------------Controller Found Status------------------------------------------------------------------
    window.addEventListener('gc.controller.found', function(event) {
        var controller = event.detail.controller;
        console.log("Controller found at index " + controller.index + ".");
        console.log("'" + controller.name + "' is ready!");
        setup()
    }, false);
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------

}


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

    if((button.name == "RIGHT_SHOULDER_BOTTOM") || (button.name =="LEFT_SHOULDER_BOTTOM")){
        vel = updateSpeedAndAccelerationUI({speed:speed_UI,acceleration:acceleration_UI},button,vel);
    }

}

 function updateAnalog(event) {
    var stick = event.detail;
    updateTiltUI(tilt_UI,stick);
}

function setup(){
    // var tilt_UI = document.getElementById("CanvasUITilt");
    // var speed_UI = document.getElementById("CanvasUISpeed");
    // var acceleration_UI = document.getElementById("CanvasUIAccel");

    //UI
    updateTiltUI(tilt_UI);
    updateSpeedAndAccelerationUI({speed:speed_UI,acceleration:acceleration_UI});

    console.log("Setup Complete");
}

function refreshCanvas(canvas,startx=0,starty=0,xbound=0,ybound=0){
    if (canvas.getContext){
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000000";
        ctx.fillRect(0+startx,0+starty,canvas.width-xbound,canvas.height-ybound);
    }
}

function updateTiltUI(canvas, stick=null){
    
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;

    //roll UI variables
    var rollUIwidth = canvas.width - (canvas.width-canvas.height);
    var rollUIheight = canvas.height;
    var rollcentre = {x:rollUIwidth/2, y:rollUIheight/2};
    var rollUIradius = 200;

    //pitch UI variables
    var pitchUIwidth = canvas.width-canvas.height;
    var pitchUIheight = canvas.width-canvas.height;
    var pitchcentre = {y: (rollUIwidth + pitchUIwidth/2), x: (rollUIheight - pitchUIheight/2)}; //flipped to make line vertical
    var pitchUIradius = 20;

    if (stick){
        if(stick.name == "RIGHT_ANALOG_STICK"){
            document.getElementById("Right Stick").innerHTML = "right stick: " + stick.position.x + "  "+ -stick.position.y;
            refreshCanvas(canvas,0,0,pitchUIwidth,0);

            var roll_line_points = calculateLinePoints(rollcentre, stick.position.x, rollUIradius, 90);

            ctx.beginPath();
            ctx.arc(rollcentre.x, rollcentre.y, rollUIradius, 0, 2 * Math.PI);
            ctx.moveTo(roll_line_points.start.x, roll_line_points.start.y);
            ctx.lineTo(roll_line_points.end.x, roll_line_points.end.y);
            ctx.stroke();

        }else if(stick.name == "LEFT_ANALOG_STICK"){
            document.getElementById("Left Stick").innerHTML = "left stick: " + stick.position.x + "  "+ -stick.position.y;
            refreshCanvas(canvas,rollUIwidth,rollUIheight-pitchUIheight,canvas.height,canvas.height-(canvas.width-canvas.height));
            var pitch_line_points = calculateLinePoints(pitchcentre, stick.position.x, pitchUIradius, 30);

            ctx.beginPath();
            ctx.arc(pitchcentre.y, pitchcentre.x, pitchUIradius, 0, 2 * Math.PI);
            ctx.moveTo(pitch_line_points.start.y, pitch_line_points.start.x);
            ctx.lineTo(pitch_line_points.end.y, pitch_line_points.end.x);
            ctx.stroke();
        }

    }else{
        refreshCanvas(canvas,0,0,pitchUIwidth,0);
        refreshCanvas(canvas,rollUIwidth,rollUIheight-pitchUIheight,canvas.height,canvas.height-(canvas.width-canvas.height));

        ctx.beginPath();
        ctx.moveTo(rollcentre.x+rollUIradius, rollcentre.y);
        ctx.arc(rollcentre.x, rollcentre.y, rollUIradius, 0, 2 * Math.PI);
        ctx.moveTo(pitchcentre.y+pitchUIradius, pitchcentre.x);
        ctx.arc(pitchcentre.y, pitchcentre.x, pitchUIradius, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

function updateSpeedAndAccelerationUI(canvas, button=null, currentspeed=0){
    var acceleration = 0;

    var canvaswidth = canvas.speed.width;
    var canvasheight = canvas.speed.height;
    var canvascentre = canvas.acceleration.height/2;
    

    if (button){
        if (button.name == "RIGHT_SHOULDER_BOTTOM"){
            currentspeed += button.value * 0.05;
            acceleration = button.value;
        }else if (button.name == "LEFT_SHOULDER_BOTTOM"){
            currentspeed -= button.value * 0.05;
            acceleration = -button.value;
        }
        console.log(acceleration);

        currentspeed = Math.max(currentspeed,0);
        currentspeed = Math.min(currentspeed,1);

        var ctx = canvas.speed.getContext("2d");
        //console.log(button.value);
        refreshCanvas(canvas.speed);
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(0, canvasheight - canvasheight * currentspeed);
        ctx.lineTo(canvaswidth, canvasheight - canvasheight * currentspeed);
        ctx.stroke();

        var ctx = canvas.acceleration.getContext("2d");
        //console.log(button.value);
        refreshCanvas(canvas.acceleration);
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(0, canvasheight - (canvascentre * acceleration)-canvascentre);
        ctx.lineTo(canvaswidth, canvasheight - (canvascentre * acceleration)-canvascentre);
        ctx.stroke();
    }else{
        currentspeed = 0
        acceleration = 0

        var ctx = canvas.speed.getContext("2d");
        //console.log(button.value);
        refreshCanvas(canvas.speed);
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(0, canvasheight - canvasheight * currentspeed);
        ctx.lineTo(canvaswidth, canvasheight - canvasheight * currentspeed);
        ctx.stroke();

        var ctx = canvas.acceleration.getContext("2d");
        //console.log(button.value);
        refreshCanvas(canvas.acceleration);
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(0, canvasheight - (canvascentre * acceleration)-canvascentre);
        ctx.lineTo(canvaswidth, canvasheight - (canvascentre * acceleration)-canvascentre);
        ctx.stroke();
    }

    return currentspeed;
}



function calculateLinePoints(centre, angle_multiplier , line_radius, angle_lim){
    angle_lim = toRad(angle_lim);
    var xstart = centre.x - (line_radius * Math.cos(angle_multiplier * angle_lim));
    var ystart = centre.y - (line_radius * Math.sin(angle_multiplier * angle_lim));
    var xend = centre.x + (line_radius * Math.cos(angle_multiplier * angle_lim));
    var yend = centre.y + (line_radius * Math.sin(angle_multiplier * angle_lim));
    return {start:{x:xstart, y:ystart}, end:{x:xend, y:yend}};
}

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}