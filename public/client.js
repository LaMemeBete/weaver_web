import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

const scene = new THREE.Scene()

const axesHelper = new THREE.AxesHelper( 5 );
//const directionalLight = new THREE.HemisphereLight( 0xffffff, 10 );
//const directionalLight = new THREE.HemisphereLight( 0xffffff, 10000000 );
let light_1 = new THREE.DirectionalLight(0x00ffff, 1);
light_1.position.set(100, 100, 100);
light_1.castShadow = true;
light_1.shadow.mapSize.width = 512;  
light_1.shadow.mapSize.height = 512; 
light_1.shadow.camera.near = 0.5;
light_1.shadow.camera.far = 500

let light_2 = new THREE.DirectionalLight(0xff00ff, 1);
light_2.position.set(100, -100, 100);
light_2.castShadow = true;
light_2.shadow.mapSize.width = 512;  
light_2.shadow.mapSize.height = 512; 
light_2.shadow.camera.near = 0.5;
light_2.shadow.camera.far = 500


let light_3 = new THREE.DirectionalLight(0x00ffff, 1);
light_1.position.set(-100, -200, -100);
light_1.castShadow = true;
light_1.shadow.mapSize.width = 512;  
light_1.shadow.mapSize.height = 512; 
light_1.shadow.camera.near = 0.5;
light_1.shadow.camera.far = 500

let light_4 = new THREE.DirectionalLight(0xff00ff, 1);
light_1.position.set(-200, -100, -100);
light_2.castShadow = true;
light_2.shadow.mapSize.width = 512;  
light_2.shadow.mapSize.height = 512; 
light_2.shadow.camera.near = 0.5;
light_2.shadow.camera.far = 500



//scene.add( axesHelper );
scene.add(light_1);
scene.add(light_2);
scene.add(light_3);
scene.add(light_4);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setClearColor( 0xffffff, 1);
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
})
/*const cube = new THREE.Mesh(geometry, material)
scene.add(cube)*/

window.addEventListener(
    'resize',
    () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    },
    false
)

/*window.addEventListener("click", function(){ 
    const cube_test = new THREE.Mesh(geometry, material)
    scene.add(cube_test)
    cube_test.position.set(5,5,5)
});*/


let socket = new WebSocket("ws://localhost:8001/");

socket.onopen = function(e) {
  /*alert("[open] Connection established");
  alert("Sending to server");
  socket.send("My name is John");*/
};

function create_line(lines, color) {
    const material = new THREE.LineBasicMaterial({
        color: parseInt(color.replace("#","0x"),16)
    });
    const points = [];
    points.push(new THREE.Vector3(parseFloat(lines[0])/10, parseFloat(lines[1])/10, parseFloat(lines[2])/10));
    points.push(new THREE.Vector3(parseFloat(lines[3])/10, parseFloat(lines[4])/10, parseFloat(lines[5])/10));

    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    return cylindricalSegment(new THREE.Vector3(parseFloat(lines[0])/10, parseFloat(lines[1])/10, parseFloat(lines[2])/10),
                              new THREE.Vector3(parseFloat(lines[3])/10, parseFloat(lines[4])/10, parseFloat(lines[5])/10))
    //const lineThree = new THREE.Line( geometry, material );
    //return lineThree;
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.random() * (max - min) + min;
}

function takeScreenshot() {
    // For screenshots to work with WebGL renderer, preserveDrawingBuffer should be set to true.
    // open in new window like this
    var w = window.open('', '');
    w.document.title = "Screenshot";
    //w.document.body.style.backgroundColor = "red";
    var img = new Image();
    img.src = renderer.domElement.toDataURL();
    w.document.body.appendChild(img);

    // download file like this.
    //var a = document.createElement('a');
    //a.href = renderer.domElement.toDataURL().replace("image/png", "image/octet-stream");
    //a.download = 'canvas.png'
    //a.click();
}

function cylindricalSegment(A, B) {
    let radius = randomIntFromInterval(0.001, 0.1);
    radius = 0.1;
    console.log(radius)
    //const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    let material = new THREE.MeshStandardMaterial( {
        color: 0xD3D3D3,
        roughness: 1,
        metalness: 0.2
    } );
    var vec = B.clone(); vec.sub(A);
    var h = vec.length();
    vec.normalize();
    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec);
    var geometry = new THREE.CylinderGeometry(radius, radius, h, 32);
    geometry.translate(0, h / 2, 0);
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.applyQuaternion(quaternion);
    cylinder.position.set(A.x, A.y, A.z);
    return cylinder;
}

socket.onmessage = function(event) {
    var arrayOfLines = event.data.match(/[^\r\n]+/g);
    var dict = {};
    var lines_tmp = []
    arrayOfLines.forEach((element) => {
        var elementArray = element.split(",");
        if (elementArray[7] == 'line') {
            if (!(elementArray[8] in dict)) {
                dict[elementArray[8]] = []
            }
            dict[elementArray[8]].push(elementArray)
        }
    });
    for (var key in dict) {
        if (dict.hasOwnProperty(key)) {
            dict[key].forEach((element) => {
                scene.add(create_line(element, key));
            })            
            renderer.render( scene, camera );
        }
    }
    
};
const stats = Stats()
//document.body.appendChild(stats.dom)

//const gui = new GUI()
//const cubeFolder = gui.addFolder('Cube')
/*cubeFolder.add(cube.scale, 'x', -5, 5)
cubeFolder.add(cube.scale, 'y', -5, 5)
cubeFolder.add(cube.scale, 'z', -5, 5)
cubeFolder.open()*/
//const cameraFolder = gui.addFolder('Camera')
//cameraFolder.add(camera.position, 'z', 0, 10)
//cameraFolder.open()

function animate() {
    requestAnimationFrame(animate)
    /*cube.rotation.x += 0.01
    cube.rotation.y += 0.01*/
    controls.update()
    render()
    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()

/*var intervalId = window.setInterval(function(){
    takeScreenshot()
}, 5000);*/
