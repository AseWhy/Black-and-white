import { BufferAttribute, BufferGeometry, Color, PerspectiveCamera, Points, PointsMaterial, Scene, WebGLRenderer } from "three";
import { average, decImage, getRect, toDataURL } from "./js/support";

import settings from "./js/support/settings";
import state from "./js/support/state";

import "./css/index.css";

const geometry = new BufferGeometry();
const material = new PointsMaterial();
const gui = document.getElementById("FNGUI") as HTMLCanvasElement;
const guiContext = gui.getContext("2d");
const camera = new PerspectiveCamera(90, 2, window.innerWidth / window.innerHeight, 5000);

const scene = new Scene();
const mesh = new Points(geometry, material);

const renderer = new WebGLRenderer({ 
    antialias: true,
    alpha: true
});

let beginRendering = false;
let frame = null;
let lastGeometryPostion: Float32Array = null;

scene.add(mesh);

document.body.appendChild(renderer.domElement);

function resize() {
    gui.width = window.innerWidth;
    gui.height = window.innerHeight;

    camera.aspect = window.innerWidth / window.innerHeight;

    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", resize);

resize();

function append(geometry: Float32Array, color: string){
    if(lastGeometryPostion == null || geometry.length > lastGeometryPostion.length) {
        mesh.geometry.setAttribute("position", new BufferAttribute(lastGeometryPostion = geometry, 3));
    } else {
        lastGeometryPostion.set(geometry, 0);
        mesh.geometry.setDrawRange(0, geometry.length);
    }

    mesh.material.color = new Color(color);
    mesh.geometry.attributes.position.needsUpdate = true;
}

function render() {
    frame = requestAnimationFrame(render);
    
    camera.position.x = Math.sin(state.deg * (Math.PI / 180)) * settings.radius;
    camera.position.z = Math.cos(state.deg * (Math.PI / 180)) * settings.radius;

    camera.lookAt(mesh.position);

    const text = (lastGeometryPostion?.length ?? 0 / 3) + " particles";

    guiContext.font = "16px d_face";
    guiContext.fillStyle = settings.color;
    guiContext.strokeStyle = settings.color;
    guiContext.clearRect(0, 0, gui.width, gui.height);

    if(settings.avt_show){
        //Left face
        for(let i = 0;i < settings.sound_rect.y;i++){
            guiContext.fillRect(
                gui.width / 2 - settings.img_rect.x / 2,
                gui.height / 2 - settings.img_rect.y / 2 + i * (settings.sound_rect.step.y + 2),
                -state.buffer.y[i],
                settings.sound_rect.step.y
            )
        }

        //Right Face
        for(let i = 0;i < settings.sound_rect.y;i++){
            guiContext.fillRect(
                gui.width / 2 + settings.img_rect.x / 2,
                gui.height / 2 - settings.img_rect.y / 2 + i * (settings.sound_rect.step.y + 2),
                state.buffer.y[i],
                settings.sound_rect.step.y
            )
        }
        
        //Top Face
        for(let i = 0;i < settings.sound_rect.x;i++){
            guiContext.fillRect(
                gui.width / 2 - settings.img_rect.x / 2 + i * (settings.sound_rect.step.x + 2),
                gui.height / 2 - settings.img_rect.y / 2,
                settings.sound_rect.step.x,
                -state.buffer.x[i]
            )
        }

        //Botton Face
        for(let i = 0;i < settings.sound_rect.x;i++){
            guiContext.fillRect(
                gui.width / 2 - settings.img_rect.x / 2 + i * (settings.sound_rect.step.x + 2),
                gui.height / 2 + settings.img_rect.y / 2,
                settings.sound_rect.step.x,
                state.buffer.x[i]
            )
        }
    }

    if(settings.show_rect) {
        guiContext.strokeRect(gui.width / 2 - settings.img_rect.x / 2, gui.height / 2 - settings.img_rect.y / 2, settings.img_rect.x, settings.img_rect.y);
    }

    if(settings.show_a_particles){
        guiContext.clearRect(gui.width / 2 - (guiContext.measureText(text).width / 2) - 4, gui.height / 2 - settings.img_rect.y / 2 + 8, guiContext.measureText(text).width + 8, -150);
        guiContext.fillText(text, gui.width / 2 - (guiContext.measureText(text).width / 2), gui.height / 2 - settings.img_rect.y / 2 + 8);
    }

    if(settings.show_a_time){
        guiContext.font = "28px d_face";
        guiContext.clearRect(gui.width / 2 - (guiContext.measureText(state.time).width / 2) - 4, gui.height / 2 + settings.img_rect.y / 2 - 8, guiContext.measureText(state.time).width + 8, 150);
        guiContext.fillText(state.time, gui.width / 2 - (guiContext.measureText(state.time).width / 2), gui.height / 2 + settings.img_rect.y / 2 + 12);
    }

    if(settings.dynamycs == 2){
        state.deg += settings.rotation_speed;

        if(state.deg > 360){
            state.deg = 0;
        }
    }

    renderer.render(scene, camera);
}

document.addEventListener("mousemove", (data) => {
    if(settings.dynamycs == 1){
        state.deg = 180 + (data.pageX / window.innerWidth) * -40 + 20;
    }
})

function update(){
    if(settings.main_image != 3){
        toDataURL(settings.main_image == 1 ? "./data/blackandwhite01.jpg" : (window.localStorage.m_url != undefined ? window.localStorage.m_url : "./data/blackandwhite01.jpg"), (base64) => {
            let img = new Image();
            img.src = base64;
            img.onload = () => {
                const array = decImage(img);

                append(array, window.localStorage.m_color || "#434343");

                settings.radius = Math.max(img.width, img.height);

                state.deg = 180;

                beginRendering === false ? render() : (()=>{
                    cancelAnimationFrame(frame);
                    render();
                })();

                settings.img_rect = {
                    x: 0x0,
                    y: 0x0
                }

                getRect(renderer.domElement.toDataURL()).then(data => {
                    settings.img_rect = {
                        x: data.x * 1.5,
                        y: data.y * 1.5
                    };

                    settings.sound_rect.step.x = (settings.img_rect.x / settings.sound_rect.x) - 2;
                    settings.sound_rect.step.y = (settings.img_rect.y / settings.sound_rect.y) - 2;
                });
            }
        });
    }
}

let h,m,s,t, max_v = 0;

setInterval(()=>{
    t = new Date();

    h = t.getHours();
    m = t.getMinutes();
    s = t.getSeconds();

    state.time = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}, 500);

globalThis.wallpaperRegisterAudioListener && globalThis.wallpaperRegisterAudioListener(data => {
    max_v = 0;

    for(let i = 0;i < 128;i++){
        if(data[i] > max_v) {
            max_v = data[i];
        }
    }

    for(let i = 0;i < settings.sound_rect.x;i++){
        state.buffer.x[i] = (data[Math.round((i / settings.sound_rect.y) * 128)] / max_v) * 100;

        if(state.smple_buffer.x[i] == undefined) {
            state.smple_buffer.x[i] = [];
        }

        if(state.smple_buffer.x[i].length < settings.avt_smoothing_power){
            state.smple_buffer.x[i].push(state.buffer.x[i]);
        }else if(state.smple_buffer.x[i].length > settings.avt_smoothing_power){
            state.smple_buffer.x[i].splice(0, state.smple_buffer.x[i].length - settings.avt_smoothing_power + 1);
            state.smple_buffer.x[i].push(state.buffer.x[i]);
        }else{
            state.smple_buffer.x[i].splice(0, 1);
            state.smple_buffer.x[i].push(state.buffer.x[i]);
        }

        state.buffer.x[i] = average(state.smple_buffer.x[i]);
    }

    for(let i = 0;i < settings.sound_rect.y;i++){
        state.buffer.y[i] = (data[Math.round((i / settings.sound_rect.y) * 128)] / max_v) * 100;

        if(state.smple_buffer.y[i] == undefined) {
            state.smple_buffer.y[i] = [];
        }

        if(state.smple_buffer.y[i].length < settings.avt_smoothing_power){
            state.smple_buffer.y[i].push(state.buffer.y[i]);
        }else if(state.smple_buffer.y[i].length > settings.avt_smoothing_power){
            state.smple_buffer.y[i].splice(0, state.smple_buffer.y[i].length - settings.avt_smoothing_power + 1);
            state.smple_buffer.y[i].push(state.buffer.y[i]);
        }else{
            state.smple_buffer.y[i].splice(0, 1);
            state.smple_buffer.y[i].push(state.buffer.y[i]);
        }

        state.buffer.y[i] = average(state.smple_buffer.y[i]);
    }
});

globalThis.wallpaperPropertyListener = {
    applyUserProperties: (properties) => {
        if(properties.avt_color){
            let color_F = properties.avt_color.value.split(" ");

            settings.color = `rgb(${(parseFloat(color_F[0])*255)}, ${(parseFloat(color_F[1])*255)}, ${(parseFloat(color_F[2])*255)})`
        }

        if(properties.camera_radius){
            settings.radius = parseInt(properties.camera_radius.value);
        }

        if(properties.avt_show){
            settings.avt_show = properties.avt_show.value
        }

        if(properties.show_rect) {
            settings.show_rect = properties.show_rect.value;
        }

        if(properties.main_color){
            let color_F = properties.main_color.value.split(" ");

            mesh.material.color = new Color(
                parseFloat(color_F[0]),
                parseFloat(color_F[1]),
                parseFloat(color_F[2])
            );

            window.localStorage.m_color = `rgb(${(parseFloat(color_F[0])*255)}, ${(parseFloat(color_F[1])*255)}, ${(parseFloat(color_F[2])*255)})`;
        }

        if(properties.show_a_particles){
            settings.show_a_particles = properties.show_a_particles.value;
        }

        if(properties.show_a_time){
            settings.show_a_time = properties.show_a_time.value;
        }

        if(properties.background_color){
            let color_F = properties.background_color.value.split(" ");

            document.body.style.backgroundColor = `rgb(${(parseFloat(color_F[0])*255)}, ${(parseFloat(color_F[1])*255)}, ${(parseFloat(color_F[2])*255)})`
        }

        if(properties.main_image){
            settings.main_image = properties.main_image.value;

            if(settings.main_image == 3){
                mesh.material.visible = false;
            }else{
                mesh.material.visible = true;
                update();
            }
        }

        if(properties.main_image_data){
            if(properties.main_image_data.value == ""){
                window.localStorage.m_url = undefined;
            }else{
                window.localStorage.m_url = decodeURIComponent("file:///" + properties.main_image_data.value);
            }

            update();
        }

        if(properties.main_image_dynamycs){
            settings.dynamycs = properties.main_image_dynamycs.value;
        }

        if(properties.rotation_offset){
            state.deg = properties.rotation_offset.value;
        }

        if(properties.rotation_speed){
            settings.rotation_speed = properties.rotation_speed.value / 60;
        }
    }
}

update();