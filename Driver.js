/**
 *  Tanner Bailey
 *  Programming Assignment 5
 *  Due 11/13/2020
 *
 *  Applies lighting via specular, diffuse, and ambient components to work from lab 4
 */

"use strict";

var canvas;
var webgl;

//Lab 4 Info
var rotationRate               = 0;
var rotationLocation;
var deltaRotationRate          = 0.01;
var rotationOn = false;
var orbitRate                  = 0;
var orbitLocation;
var deltaOrbitRate             =  0.3;
var orbitOn = false;
var distanceFromOrigin         = 0.2;
var distanceFromOriginLocation;

var eye  = vec3(0.75, 1.5, 10.0);
var at   = vec3(0.0, 0.0, 0.0);
var up   = vec3(0.0, 1.0, 0.0);

var near = 0.1;
var far  = 20.0;
var fovy = 60.0;
var aspect = 1.0;

var modelViewMat, projectionMat;
var modelViewMatLoc, projectionMatLoc;

var vertexPositions = [
    vec4(0.0  , 0.75, 0.4 , 1.0),    // vertex 0
    vec4(0.25 , 0.75, -0.3, 1.0),    // vertex 1
    vec4(0.0  , 1.0 , 0.0 , 1.0),    // vertex 2
    vec4(-0.25, 0.75, 0.0 , 1.0),    // vertex 3
];

var vertexColors = [
    vec4(1.0, 0.0, 0.0, 1.0),    // vertex #0 color
    vec4(0.0, 1.0, 0.0, 1.0),    // vertex #1 color
    vec4(0.0, 0.0, 1.0, 1.0),    // vertex #2 color
    vec4(1.0, 0.5, 0.0, 1.0)     // vertex #3 color
];

var pointsArray = [];
var colorsArray = [];
var normalsArray = [];

mytriangle(3, 1, 0);
mytriangle(0, 1, 2);
mytriangle(3, 2, 1);
mytriangle(2, 3, 0);

function rotationControl() {
    rotationOn = !rotationOn;
}

function orbitControl(){
    orbitOn = !orbitOn;
}

//New material for light 1 added here

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

//Light 2
var lightSpecular2     = vec4(0.0, 0.0, 0.7, 1.0);
var lightPosition2     = vec4(1.0, 0.0, 3.0, 1.0);
var lightPositionLoc2;
var shininess2         = 150.0;
var shininess2Loc;
var materialSpecular2  = vec4(0.0, 0.4, 0.4, 1.0);
var specularProduct2   = mult(lightSpecular2, materialSpecular2);
var specularProduct2Loc;

var light2Status = 0.0;
var light2StatusLoc;

function specularControl(){
    if(light2Status == 0.0){
        light2Status = 1.0;
    }
    else{
        light2Status = 0.0;
    }
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    webgl = WebGLUtils.setupWebGL( canvas );
    if ( !webgl ) { alert( "WebGL isn't available" ); }

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

    rotationLocation           = webgl.getUniformLocation(program,"rotationRate");
    orbitLocation              = webgl.getUniformLocation(program, "orbitRate");
    distanceFromOriginLocation = webgl.getUniformLocation(program, "distanceFromOrigin")
    projectionMatLoc           = webgl.getUniformLocation(program,"projectionMat");
    modelViewMatLoc            = webgl.getUniformLocation(program,"modelViewMat");

    //Light1 information
    ambientProductLoc          = webgl.getUniformLocation(program,"ambientProduct");
    diffuseProductLoc          = webgl.getUniformLocation(program,"diffuseProduct");
    specularProductLoc         = webgl.getUniformLocation(program,"specularProduct");
    lightPositionLoc           = webgl.getUniformLocation(program, "lightPosition");
    shininessLoc               = webgl.getUniformLocation(program, "shininess");

    //Light two information
    specularProduct2Loc         = webgl.getUniformLocation(program,"ambientProduct2");
    lightPositionLoc2           = webgl.getUniformLocation(program, "lightPosition2");
    shininess2Loc               = webgl.getUniformLocation(program, "shininess2");
    light2StatusLoc             = webgl.getUniformLocation(program, "light2Status");

    document.getElementById("RotateButton").onclick = rotationControl;
    document.getElementById("OrbitButton").onclick = orbitControl;
    document.getElementById("SpecularButton").onclick = specularControl;

    render();
};

function render()
{
    webgl.clear( webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    if(rotationOn) {
        rotationRate = IncrementClamp(rotationRate, deltaRotationRate, 2.0 * Math.PI);
    }
    if(orbitOn){
        orbitRate    = IncrementClamp(orbitRate, deltaOrbitRate, 2.0 * Math.PI);
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

    webgl.uniform4fv(specularProduct2Loc, specularProduct2);
    webgl.uniform4fv(lightPositionLoc2, lightPosition2);
    webgl.uniform1f(shininess2Loc, shininess2);
    webgl.uniform1f(light2StatusLoc, light2Status);
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

function mytriangle(aa, bb, cc)
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

    return;

}