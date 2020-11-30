/**
 *  Tanner Bailey, Warren Jernigan, and Ben Sauberman
 *  Computer Science 363 - Computer Graphics: Final Project
 *  Due 12/11/2020 @ 5 PM
 */

"use strict";

var canvas;
var webgl;

alert("You're so close to finally getting past all of Bowser's evil minions and saving Princess Toadstool!");
alert("All that stands between you and the princess is a lone Goomba!");
alert("Use the buttons provided at your disposal to jump over the Goomba and reunite with the Princess!");
alert("REMEMBER: Use the 'Save the Princess' button only when you are past the Goomba and with the Princess; otherwise, you won't truly be the hero of the Mushroom Kingdom!");

//Create frustum information
var eye  = vec3(0.75, 1.5, 10.0);
var at   = vec3(0.0, 0.0, 0.0);
var up   = vec3(0.0, 1.0, 0.0);

var near = 0.1;
var far  = 20.0;
var fovy = 60.0;
var aspect = 1.0;


//Things needed for shaders
var pointsArray  = [];
var colorsArray  = [];
var normalsArray = [];
var typesArray   = [];

var modelViewMat, projectionMat;
var modelViewMatLoc, projectionMatLoc;

//Create all the colors needed for each of the character models
var vertexColors = [
    vec4(1.0, 0.0, 0.0, 1.0),    // vertex #0 color
    vec4(0.0, 1.0, 0.0, 1.0),    // vertex #1 color
    vec4(0.0, 0.0, 1.0, 1.0),    // vertex #2 color
    vec4(1.0, 0.5, 0.0, 1.0)     // vertex #3 color
];

//Create all the vertices associated with Mario's initial locations (Mario is type 0)
var vertexPositions = [
    vec4(0.0  , 0.75, 0.4 , 1.0),    // vertex 0
    vec4(0.25 , 0.75, -0.3, 1.0),    // vertex 1
    vec4(0.0  , 1.0 , 0.0 , 1.0),    // vertex 2
    vec4(-0.25, 0.75, 0.0 , 1.0),    // vertex 3
];

//Use myTriangle to create Mario's character model
mytriangle(3, 1, 0, 0);
mytriangle(0, 1, 2, 0);
mytriangle(3, 2, 1, 0);
mytriangle(2, 3, 0, 0);

//Create all the vertices associated with the Goomba's initial locations (Goomba is type 1)
//Use myTriangle to create Goomba's character model

//Create all the vertices associated with the Peach's initial locations (Peach is type 2)
//Use myTriangle to create Peach's character model

var runRate = 0.0;
var deltaRunRate = 0.1;
var runLocation;
//Control the variable that indicates if Mario is running or not
var runOn = false;
function runControl() {
    runOn = !runOn;
}

var jumpRate = 0.0;
var deltaJumpRate = 0.1;
var jumpLocation;
//Control the variable that indicates if Mario is jumping or not
var jumpOn = false;
function jumpControl() {
    jumpOn = !jumpOn;
}

//Control the variable that indicates if the player wants to save the Princess
var saveOn = false;
function saveControl() {
    saveOn = !saveOn;
}

//Create the light we want to use
var lightAmbient      = vec4(0.7, 0.0, 0.0, 1.0);
var lightDiffuse      = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular     = vec4(1.0, 1.0, 1.0, 1.0);
var lightPosition     = vec4(0.0, -2.0, 0.0, 1.0);
var lightPositionLoc;
var shininess         = 100.0;
var shininessLoc;

var materialAmbient   = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse   = vec4(0.4, 0.8, 0.4, 1.0);
var materialSpecular  = vec4(0.0, 0.4, 0.4, 1.0);

var ambientProduct  = mult(lightAmbient, materialAmbient);
var diffuseProduct  = mult(lightDiffuse, materialDiffuse);
var specularProduct = mult(lightSpecular, materialSpecular);

var ambientProductLoc, diffuseProductLoc, specularProductLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    webgl = WebGLUtils.setupWebGL( canvas );
    if ( !webgl ) {
        alert( "WebGL isn't available" );
    }
    // set up aspect ratio for frustum
    aspect = canvas.width / canvas.height;
    webgl.viewport( 0, 0, canvas.width, canvas.height );
    webgl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    webgl.enable(webgl.DEPTH_TEST);

    var program = initShaders( webgl, "vertex-shader", "fragment-shader" );
    webgl.useProgram( program );

    var vBuffer = webgl.createBuffer();
    webgl.bindBuffer( webgl.ARRAY_BUFFER, vBuffer );
    webgl.bufferData( webgl.ARRAY_BUFFER, flatten(pointsArray), webgl.STATIC_DRAW );
    var vPositionLOC = webgl.getAttribLocation( program, "vertexPosition" );
    webgl.vertexAttribPointer( vPositionLOC, 4, webgl.FLOAT, false, 0, 0 );
    webgl.enableVertexAttribArray( vPositionLOC );
    var cBuffer = webgl.createBuffer();
    webgl.bindBuffer( webgl.ARRAY_BUFFER, cBuffer );
    webgl.bufferData( webgl.ARRAY_BUFFER, flatten(colorsArray), webgl.STATIC_DRAW );
    var vColorLOC = webgl.getAttribLocation( program, "vertexColor" );
    webgl.vertexAttribPointer( vColorLOC, 4, webgl.FLOAT, false, 0, 0 );
    webgl.enableVertexAttribArray( vColorLOC );
    var nBuffer = webgl.createBuffer();
    webgl.bindBuffer( webgl.ARRAY_BUFFER, nBuffer );
    webgl.bufferData( webgl.ARRAY_BUFFER, flatten(normalsArray), webgl.STATIC_DRAW );
    var nNormalLOC = webgl.getAttribLocation( program, "vertexNormal");
    webgl.vertexAttribPointer( nNormalLOC, 4, webgl.FLOAT, false, 0, 0 );
    webgl.enableVertexAttribArray( nNormalLOC );

    projectionMatLoc           = webgl.getUniformLocation(program,"projectionMat");
    modelViewMatLoc            = webgl.getUniformLocation(program,"modelViewMat");

    runLocation                = webgl.getUniformLocation(program, "runRate");
    jumpLocation               = webgl.getUniformLocation(program, "jumpRate");

    //Light information
    ambientProductLoc          = webgl.getUniformLocation(program,"ambientProduct");
    diffuseProductLoc          = webgl.getUniformLocation(program,"diffuseProduct");
    specularProductLoc         = webgl.getUniformLocation(program,"specularProduct");
    lightPositionLoc           = webgl.getUniformLocation(program, "lightPosition");
    shininessLoc               = webgl.getUniformLocation(program, "shininess");

    document.getElementById("RunButton").onclick = runControl;
    document.getElementById("JumpButton").onclick = jumpControl;
    document.getElementById("SaveButton").onclick = saveControl;

    render();
};

function render()
{
    webgl.clear( webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    if(runOn) {
        runRate = IncrementClamp(runRate, deltaRunRate, 2.0 * Math.PI);
    }
    if(jumpOn){
        jumpRate    = IncrementClamp(jumpRate, deltaJumpRate, 2.0 * Math.PI);
    }
    webgl.uniform1f(rotationLocation, rotationRate);

    modelViewMat       = lookAt(eye,at,up);
    projectionMat      = perspective(fovy, aspect, near, far);
    webgl.uniformMatrix4fv( modelViewMatLoc, false,
        flatten(modelViewMat) );
    webgl.uniformMatrix4fv( projectionMatLoc, false,
        flatten(projectionMat) );

    webgl.uniform4fv(ambientProductLoc, ambientProduct);
    webgl.uniform4fv(diffuseProductLoc, diffuseProduct);
    webgl.uniform4fv(specularProductLoc, specularProduct);
    webgl.uniform4fv(lightPositionLoc, lightPosition);
    webgl.uniform1f(shininessLoc, shininess)

    webgl.drawArrays(webgl.TRIANGLES, 0, pointsArray.length);

    requestAnimFrame( render );
}

// Utility function to increment a variable and clamp
function IncrementClamp(x, dx, upper){
    var newX = x+dx;
    if (newX > upper){
        return newX-upper;
    }
    return newX;
}

function mytriangle(aa, bb, cc, tt)
{

    var vertexA = vertexPositions[aa];
    var vertexB = vertexPositions[bb];
    var vertexC = vertexPositions[cc];

    pointsArray.push(vertexA);
    pointsArray.push(vertexB);
    pointsArray.push(vertexC);

    colorsArray.push(vertexColors[aa]);
    colorsArray.push(vertexColors[bb]);
    colorsArray.push(vertexColors[cc]);

    var vector1 = subtract(vertexB, vertexA);
    var vector2 = subtract(vertexC, vertexA);
    var normal  = normalize(cross(vector1, vector2));

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    typesArray.push(tt);

    return;

}