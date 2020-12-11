/**
 * Created by Warren Jernigan on 12/10/2020
 * NOTE: includes some code for early peach model, just ignore, run it and the grass
 * texture wil show up
 */
"use strict";

var canvas;
var webgl;

//used to start the transformation of the object
var rotationOn = false;

// variables to enable CPU manipulation of GPU uniform "theta" and uniform "phi"
var theta = 0;
var thetaLoc;
var deltatheta = 0.05;

var phi = 0;
var phiLoc;
var deltaPhi = 0.05;

//variables for change in objects position about the origin
//change x
var distanceXLoc;
var deltaDistanceX = 0.5;

//change y
var distanceYLoc;
var deltaDistanceY = 0.0;

//change z
var distanceZLoc;
var deltaDistanceZ = 0.5;

//change shininess
var shininessLoc;
var deltaShiny = 100.0;

// frustum information
var near = 2.0;
var far = 6.0;
var  fovy = 40.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect; // Viewport aspect ratio (setup once canvas is known)

//texture information
var texSize = 64;
var myTexels = new Uint8Array(4 * texSize * texSize);
var texture;



// uniform matrices for modelview and projection
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

// eye information
var eye = vec3(0.0,0.0,4.0);  // eye position
const at = vec3(0.0, 0.0, 0.0);  //  direction of view
const up = vec3(0.0, 1.0, 0.0);  // up direction

/*
var colorPalette = [
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(109.0/255, 62.0/255, 38.0/255, 1.0)
];*/


// vertices that define the geometry of object
// (all in viewing volume coordinates as homogeneous coordinates)
var vertexPositions = [
    /*
    /////////peach code///////////
    //head
    vec4(0.30,0.0,0.30,1.0),        // vertex #0 position
    vec4(0.30, 0.0, -0.30, 1.0),   // vertex #1 position
    vec4(0.0, 0.47, 0.0, 1.0),    //  vertex #2 position, controls height, peak vertex
    vec4(-0.30, 0.0, 0.30, 1.0),    //  vertex #3 position
    vec4(-0.30, 0.0, -0.30, 1.0),   //vertex 4 position
    vec4(0.0, -0.47, 0.37, 1.0),   //vertex 5 position, controls height down, peak vertex bottom
    vec4(0.35, 0.3, 0.0, 1.0),      //vertex 6 position
    vec4(-0.35, 0.3, 0.0, 1.0),  //vertex 7 position
    vec4(0.0, 0.36, 0.35, 1.0),   //vertex 8 position //big point top face, top forehead
    vec4(0.0, 0.36, -0.35, 1.0),  //vertex 9 position //big point, back face, back of head
    vec4(0.0, -0.3, 0.38, 1.0),  //vertex 10 position //big point, bottom face, bottom chin
    vec4(0.0, -0.3, -0.35, 1.0),    //vertex 11 position
    vec4(-0.30, -0.3, 0.0, 1.0),    //vertex 12 position
    vec4(0.30, -0.3, 0.0, 1.0),      //vertex 13 position
    vec4(0.40, 0.0, 0.0, 1.0),      //vertex 14
    vec4(-0.40, 0.0, 0.0, 1.0),      //vertex 15
    vec4(0.0, 0.0, -0.45, 1.0),      //vertex 16
    vec4(0.0, 0.0, 0.40, 1.0),        //vertex 17
    vec4(0.24, -0.22, 0.26),          //vertex 18
    vec4(-0.24, -0.22, 0.26),        //vertex 19
    //nose
    vec4(0.02, -0.04, 0.35),           //vertex 20, top of nose
    vec4(0.07, -0.22, 0.32),           //vertex 21, right side of nose
    vec4(-0.07, -0.22, 0.32),          //vertex 22, left side of nose
    vec4(0.02, -0.18, 0.44),           //vertex 23, tip of nose
    vec4(-0.02, -0.04, 0.35),          //vertex 24, top of nose
    vec4(-0.02, -0.18, 0.44),            //vertex 25, tip of nose
    //hair
    vec4(0.0, 0.08, 0.374),              //vertex 26, hairline
    vec4(0.1, 0.32, 0.42),             //vertex 27
    vec4(-0.1, 0.32, 0.42),            //vertex 28
    vec4(0.0, 0.48, 0.374),             //vertex 29
    vec4(0.14, 0.22, 0.38),             //vertex 30
    vec4(-0.14, 0.22, 0.38),            //vertex 31
    vec4(0.18, 0.26, 0.22),             //vertex 32,
    vec4(-0.18, 0.26, 0.22),            //vertex 33
    vec4(0.14, 0.46, 0.24),              //vertex 34 right
    vec4(-0.14, 0.46, 0.24),            //vertex 35
    //hair right side
    vec4(0.26, 0.50, 0.16),              //vertex 36
    vec4(0.24, 0.24, 0.14),              //vertex 37
    vec4(0.36, 0.44, 0.14),              //vertex 38
    vec4(0.38, 0.26, 0.14),              //vertex 39
    vec4(0.34, 0.38, 0.1),               //vertex 40
    vec4(0.46, 0.36, 0.04),              //vertex 41
    vec4(0.40, 0.18, 0.0),               //vertex 42
    vec4(0.45, 0.24, -0.12)                //vertex 43 */

    /////background code////////////

    //middle of grass patch
    vec4(0.5, 0.0, 0.0, 1.0), //0
    vec4(0.5, -1.5, 0.0, 1.0), //1
    vec4(-0.5, 0.0, 0.0, 1.0),//2
    vec4(-0.5, -1.5, 0.0, 1.0),//3

    // this was for the cube, don't need so ignore
    vec4(0.5, 0.5, -0.5, 1.0),//4
    vec4(0.5, -0.5, -0.5, 1.0),//5
    vec4(-0.5, 0.5, -0.5, 1.0),//6
    vec4(-0.5, -0.5, -0.5, 1.0), //7

    //left block
    vec4(1.5, 0.0, 0.0, 1.0), //8
    vec4(1.5, -1.5, 0.0, 1.0), //9

    vec4(-1.5, 0.0, 0.0, 1.0), //10
    vec4(-1.5, -1.5, 0.0, 1.0), //11


    /*
    /////sky///////
    vec4(-2.0, -2.0, -1.0, 1.0), //
    vec4(-2.0, 2.0, -1.0, 1.0),  //
    vec4(2.0, 2.0, -1.0, 1.0) ,  //
    vec4(2.0, -2.0, -1.0, 1.0),  //*/



];


// vertex indices for the triangles that make my object
// right hand order (normal vectors point to the outside).
var indices = [
    2, 0, 1,
    2, 3, 1,//top grass

    8, 0, 1,
    8, 9, 1,


    2, 10, 11,
    2, 3, 11,


    /*
    0, 2, 4,
    4, 6, 2,

    0, 1, 5,
    5, 4, 0,

    4, 5, 7,
    7, 6, 4,

    5, 7, 3,
    3, 1, 5,

    3, 7, 2,
    6, 7, 2*/

    /*
    //////////peach code/////////
    ////////head////////
    //bottom
    //chin, front
    3, 10, 17,
    0, 10, 17,
    5, 10, 13,
    5, 10, 12,
    0, 10, 18,
    0, 13, 18,
    5, 10, 18,
    10, 13, 18,
    3, 10, 19,
    3, 12, 19,
    5, 12, 19,
    10, 12, 19,
    //back
    1, 11, 16,
    4, 11, 16,
    5, 11, 13,
    5, 11, 12,
    //left side
    4, 7, 15,
    4, 12, 15,
    4, 11, 12,
    3, 10, 12,
    //right side
    1, 6, 14,
    1, 13, 14,
    1, 11, 13,
    0, 10, 13,

    //top
    //right side of face
    0, 6, 14,
    0, 13, 14,
    1, 6, 9,
    2, 8, 6,
    //
    //left side of face
    3, 7, 15,
    3, 12, 15,
    4, 9, 7,
    2, 7, 8,
    //
    //upper face, front face
    0, 6, 8,
    7, 3, 8,
    3, 8, 17,
    0, 8, 17,
    //
    //back of head
    2, 7, 9,
    2, 6, 9,
    1, 9, 16,
    4, 9, 16,

    ///////nose//////////
    20, 21, 23,
    20, 23, 25,
    20, 25, 24,
    22, 24, 25,
    21, 22, 25,
    21, 25, 23,

    ///////////hair////////////
    26, 27, 28,
    27, 28, 29,
    26, 27, 30, //right
    26, 28, 31,  //left
    27, 30, 32,  //right
    28, 31, 33,  //left
    27, 32, 34, //right
    27, 29, 34, //right
    28, 33, 35,//left
    28, 29, 35, //left
    //left side of hair
    32, 34, 36,
    32, 36, 37,
    36, 37, 38,
    37, 38, 39,
    36, 38, 40,
    38, 40, 41,
    38, 39, 41,
    37, 39, 42,
    39, 41, 42,
    41, 42, 43*/


];

//array stores indices for my triangle to be used
var positionsArray = [];

//array stores the normals of the triangles
var normalsArray = [];

var texcoordsArray = [];


// **************


// define and register callback function to start things off once the html data loads
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    //Button//
    //registers callback for button click, "Start rotation"
    document.getElementById("rButton").onclick = function(event){
        rotationOn = !rotationOn;
    }

    //Sliders//
    //gets slider that changes theta
    document.getElementById("sliderT").onchange = function(event) {
        deltatheta = parseFloat(event.target.value);
    }

    //gets slider that changes phi
    document.getElementById("sliderP").onchange = function(event) {
        deltaPhi = parseFloat(event.target.value);
    }

    //gets slider that changes x position
    document.getElementById("sliderDX").onchange = function(event) {
        deltaDistanceX = parseFloat(event.target.value);
    }

    //gets slider that changes y position
    document.getElementById("sliderDY").onchange = function(event) {
        deltaDistanceY = parseFloat(event.target.value);
    }

    //gets slider that changes z position
    document.getElementById("sliderDZ").onchange = function(event) {
        deltaDistanceZ = parseFloat(event.target.value);
    }

    //gets slider that changes shininess
    document.getElementById("sliderShine").onchange = function(event) {
        deltaShiny = parseFloat(event.target.value);
    }
    //end of sliders//


    webgl = WebGLUtils.setupWebGL( canvas );
    if ( !webgl ) { alert( "WebGL isn't available" ); }

    // set up aspect ratio for frustum
    aspect = canvas.width / canvas.height;

    webgl.viewport( 0, 0, canvas.width, canvas.height );
    webgl.clearColor( 0.0, 0.0, 1.0, 1.0 );//changed color to black so object popped

    // enable hidden surface removal (by default uses LESS)
    webgl.enable(webgl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //  Set webgl context to "program"
    //
    var program = initShaders( webgl, "vertex-shader", "fragment-shader" );
    webgl.useProgram( program );


    // get GPU location of uniforms in <program>
    thetaLoc = webgl.getUniformLocation(program,"theta");
    phiLoc = webgl.getUniformLocation(program,"phi");
    distanceXLoc = webgl.getUniformLocation(program, "distanceX");
    distanceYLoc = webgl.getUniformLocation(program, "distanceY");
    distanceZLoc = webgl.getUniformLocation(program, "distanceZ");
    shininessLoc = webgl.getUniformLocation(program, "shininess");
    projectionMatrixLoc = webgl.getUniformLocation(program,"projectionMatrix");
    modelViewMatrixLoc = webgl.getUniformLocation(program,"modelViewMatrix");

    //calls my triangles and builds the object through the function and uses the indices too do so

    var i;
    //for(i = 0; i < indices.length; i+=3){
    for(i = 0; i < 18; i+=3){
        if( i === 3 || i === 9 || i === 15){
            dirtTriangle(indices[i], indices[i+1], indices[i+2]);
        }
        else {
            grassTriangle(indices[i], indices[i + 1], indices[i + 2]);
        }
    }

    // ******

    // attribute buffers

    //buffers for the normals of the triangles
    var normalsBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER,normalsBuffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, flatten(normalsArray), webgl.STATIC_DRAW);

    var vNormalLOC = webgl.getAttribLocation(program, "vNormal");
    webgl.vertexAttribPointer(vNormalLOC, 4, webgl.FLOAT, false,0, 0);
    webgl.enableVertexAttribArray(vNormalLOC);


    //buffers for the positions of the indices
    var vBuffer = webgl.createBuffer();
    webgl.bindBuffer( webgl.ARRAY_BUFFER, vBuffer );
    webgl.bufferData( webgl.ARRAY_BUFFER, flatten(positionsArray), webgl.STATIC_DRAW );

    var vPositionLOC = webgl.getAttribLocation( program, "vPosition" );
    webgl.vertexAttribPointer( vPositionLOC, 4, webgl.FLOAT, false, 0, 0 );
    webgl.enableVertexAttribArray( vPositionLOC );

    var texcoordsBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, texcoordsBuffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, flatten(texcoordsArray), webgl.STATIC_DRAW);

    var texcoordsLOC = webgl.getAttribLocation(program, "vTexCoord");
    webgl.vertexAttribPointer(texcoordsLOC, 2, webgl.FLOAT, false, 0,0);
    webgl.enableVertexAttribArray(texcoordsLOC);


    //vec4(109.0/255, 62.0/255, 38.0/255, 1.0)


    //grass
    for(var i = 0; i < texSize; ++i){
        for(var j = 0; j < 8; ++j){
            myTexels[4*i*texSize+4*j+0] = 45;
            myTexels[4*i*texSize+4*j+1] = 134;
            myTexels[4*i*texSize+4*j+2] = 65;
            myTexels[4*i*texSize+4*j+3] = 255;
        }
    }
    //makes distribution of grass more even
    for(var i = 0; i < texSize; ++i){
        var k = Math.floor(Math.random()*24);
        for(var j = 0; j < k; ++j){
            myTexels[4*i*texSize+4*j+0] = 45;
            myTexels[4*i*texSize+4*j+1] = 134;
            myTexels[4*i*texSize+4*j+2] = 65;
            myTexels[4*i*texSize+4*j+3] = 255;
        }
    }

    //dirt
    for(var i = 0; i < texSize; ++i){
        for(var j=0; j < texSize; ++j){
            if((myTexels[4*i*texSize+4*j+0] !== 45) && (myTexels[4*i*texSize+4*j+1] !== 134) &&
                (myTexels[4*i*texSize+4*j+2] !== 65) && (myTexels[4*i*texSize+4*j+3] !== 255)){

                myTexels[4 * i * texSize + 4 * j + 0] = 109;
                myTexels[4 * i * texSize + 4 * j + 1] = 62;
                myTexels[4 * i * texSize + 4 * j + 2] = 38;
                myTexels[4 * i * texSize + 4 * j + 3] = 255;
            }
        }
    }


    var texture = webgl.createTexture();
    webgl.bindTexture(webgl.TEXTURE_2D, texture);
    webgl.texImage2D(webgl.TEXTURE_2D,0, webgl.RGBA, texSize, texSize, 0,
        webgl.RGBA, webgl.UNSIGNED_BYTE, myTexels);

    configureTexture();


    render();
};

// **************

// recursive render function -- recursive call is synchronized
// with the screen refresh
function render()
{
    // clear the color buffer and the depth buffer
    webgl.clear( webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    //configureTexture();

    //allows for the sliders to change variables
    if(rotationOn) {
        // compute angle of rotation and pass along to vertex shader
        theta = IncrementClamp(theta, deltatheta, 2.0 * Math.PI);
        phi = IncrementClamp(phi, deltaPhi, 2.0 * Math.PI);

        webgl.uniform1f(distanceXLoc, deltaDistanceX);
        webgl.uniform1f(distanceYLoc, deltaDistanceY);
        webgl.uniform1f(distanceZLoc, deltaDistanceZ);
        webgl.uniform1f(shininessLoc, deltaShiny);

    }

    webgl.uniform1f(thetaLoc, theta);
    webgl.uniform1f(phiLoc, phi);

    // compute modelView and projection matrices
    // and them pass along to vertex shader
    modelViewMatrix =  lookAt(eye,at,up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    webgl.uniformMatrix4fv( modelViewMatrixLoc, false,
        flatten(modelViewMatrix) );
    webgl.uniformMatrix4fv( projectionMatrixLoc, false,
        flatten(projectionMatrix) );


    // drawArrays draws the "triangles" (based on indices)
   webgl.drawArrays(webgl.TRIANGLES, 0, positionsArray.length);

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

function configureTexture(){
    texture = webgl.createTexture();
    webgl.activeTexture(webgl.TEXTURE0);

    webgl.bindTexture(webgl.TEXTURE_2D, texture);

    webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);

    webgl.texImage2D(webgl.TEXTURE_2D,0, webgl.RGBA, texSize, texSize, 0,
        webgl.RGBA, webgl.UNSIGNED_BYTE, myTexels);

    webgl.generateMipmap(webgl.TEXTURE_2D);

    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER,
        webgl.NEAREST_MIPMAP_LINEAR);

    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
}

//builds the 3D object using triangles provided by the indices array, done this way so the normals
//of the triangles can be computed
function grassTriangle(iA, iB, iC){
    var A = vertexPositions[iA];
    var B = vertexPositions[iB];
    var C = vertexPositions[iC];

    //push position of each vertex
    positionsArray.push(A);
    positionsArray.push(B);
    positionsArray.push(C);


    //compute normal vectors for triangle
    var t1 = subtract(B,A);
    var t2 = subtract(C,A);
    var normal = vec4(normalize(cross(t1, t2)));

    //push normals for each vertex
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    texcoordsArray.push(vec2(0.0, 0.2));
    texcoordsArray.push(vec2(0.0, 0.0));
    texcoordsArray.push(vec2(1.0, 0.0));
}

function dirtTriangle(iA, iB, iC){
    var A = vertexPositions[iA];
    var B = vertexPositions[iB];
    var C = vertexPositions[iC];

    //push position of each vertex
    positionsArray.push(A);
    positionsArray.push(B);
    positionsArray.push(C);


    //compute normal vectors for triangle
    var t1 = subtract(B,A);
    var t2 = subtract(C,A);
    var normal = vec4(normalize(cross(t1, t2)));

    //push normals for each vertex
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    texcoordsArray.push(vec2(0.0, 0.2));
    texcoordsArray.push(vec2(1.0, 0.2));
    texcoordsArray.push(vec2(1.0, 0.0));
}