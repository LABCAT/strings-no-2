import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/strings-no-2.ogg";
import midi from "../audio/strings-no-2.mid";

/**
 * Blobs No. 2
 */
const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[7].notes; // Europa - Friendly Keys
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    const noteSet2 = result.tracks[2].notes; // Subtractor - Enoch Pad
                    p.scheduleCueSet(noteSet2, 'executeCueSet2');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        }

        p.noiseMax = 1;

        p.zoff = 0;

        p.ca = 0;
        
        p.cb = 0;

        p.ox = 0;
        
        p.oy = 0;

        p.max = 0;

        p.scaleMultiplier = 4;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.colorMode(p.HSB);
            p.angleMode(p.DEGREES);
            p.background(0, 0, 0);
            p.noFill();
            p.ca = p.color("#0CCBCFAA");
            p.cb = p.color("#FE68B5AA");
            p.ox = p.width / 2;
            p.oy = p.height /2;

            p.max = p.width > p.height ? p.width : p.height ;
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){
                p.stroke(
                    p.lerpColor(p.ca, p.cb, p.abs(p.sin(p.zoff * 100)))
                );
                p.push();
                p.translate(p.ox, p.oy);
                p.scale(1/p.scaleMultiplier);
                p.beginShape();
                for (let t = 0; t < 720; t++) {
                    let xoff = p.map(p.cos(t), -1, 1, 0, p.noiseMax);
                    let yoff = p.map(p.sin(t), -1, 1, 0, p.noiseMax);

                    let n = p.noise(xoff, yoff, p.zoff);

                    let r = p.map(n, 0, 1, 0, p.height * 1.5);
                    let x = r * p.cos(t);
                    let y = r * p.sin(t);
                    p.vertex(x, y);
                }
                p.endShape(p.CLOSE);
                p.scale(p.scaleMultiplier);
                p.translate(-p.ox, -p.oy);

                p.zoff += 0.005;
            }
        }

        p.executeCueSet1 = (note) => {
            const { midi, durationTicks, ticks } = note;
            if(midi < 62 && durationTicks > 30000) {
                console.log(note);
                p.ca = p.color(
                    p.random(0, 360),
                    100,
                    100
                );

                p.cb = p.color(
                    p.random(0, 360),
                    100,
                    100
                );

                if(ticks % 122880 === 0) {
                    p.ox = p.random(
                        p.width / 8,
                        p.width - p.width / 8
                    );

                    p.oy = p.random(
                        p.height / 8,
                        p.height - p.height / 8
                    );
                }
            }
        }

        p.executeCueSet2 = (note) => {
            const { midi, currentCue } = note;
            if(midi < 50) {
                p.background(0, 0, 0, 0.5);
                p.scaleMultiplier = p.scaleMultiplier - 0.2;
                
                if(currentCue > 20) {
                    p.blendMode(p.SCREEN);
                }
            }
        }

        p.hasStarted = false;

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                        if (typeof window.dataLayer !== typeof undefined){
                            window.dataLayer.push(
                                { 
                                    'event': 'play-animation',
                                    'animation': {
                                        'title': document.title,
                                        'location': window.location.href,
                                        'action': 'replaying'
                                    }
                                }
                            );
                        }
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                    if (typeof window.dataLayer !== typeof undefined && !p.hasStarted){
                        window.dataLayer.push(
                            { 
                                'event': 'play-animation',
                                'animation': {
                                    'title': document.title,
                                    'location': window.location.href,
                                    'action': 'start playing'
                                }
                            }
                        );
                        p.hasStarted = false
                    }
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
