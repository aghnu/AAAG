import { aag } from './asciiArtGenerator';
import { createHTMLElement } from "./utilities";
import GFE from "./gif_frames_extract_js/GFE";
import VFE from "./VFE";

import "../style/style.scss";

// webpack load stock photos
import stock_0 from "../img/stock_demo/0.gif";
import stock_1 from "../img/stock_demo/1.gif";
import stock_2 from "../img/stock_demo/2.gif";

// globals
const img_temp = createHTMLElement('img', '');
const vid_temp = createHTMLElement('video', '', {loop: true});

const stock_photos = [
    ['Blade-Runner.gif', stock_0],
    ['Blade-Runner-2049.gif', stock_1],
    ['WNFA-Heart.gif', stock_2]
]

const OUT_HEIGHT = 30;
let SUPPORT_VIDEO;

function createHTMLStructure() {

    const app_container = createHTMLElement('div', '', {id: 'app-container'});

    const img_upload = createHTMLElement('label', '', {id: 'img-upload'});
    const img_upload_input = createHTMLElement('input', '', {class: 'upload', type: 'file'});
    const img_upload_prompt = createHTMLElement('p', (SUPPORT_VIDEO) ? 'UPLOAD<br>JPG \\ PNG \\ GIF \\ MP4' : 'UPLOAD<br>JPG \\ PNG \\ GIF', {class: 'prompt'});
    
    const input_prompt = createHTMLElement('p', '', {id: 'input-prompt'});

    const ascii_art_showcase = createHTMLElement('div', '', {id: 'ascii-art-showcase'});

    const footer = createHTMLElement('footer', '', {id: 'site-footer'});
    const footer_info = createHTMLElement('p', 'Aghnu\'s ASCII Art Generator<br>by Gengyuan Huang<br><a target="_blank" href="https://www.aghnu.me">© 2022 AGHNU.ME</a>', {class: 'info'});

    footer.appendChild(footer_info);

    img_upload.appendChild(img_upload_prompt);
    img_upload.appendChild(img_upload_input);

    // append to body
    app_container.appendChild(ascii_art_showcase);
    app_container.appendChild(input_prompt);
    app_container.appendChild(img_upload);
    app_container.appendChild(footer);

    document.body.appendChild(app_container);

    return app_container;
}

function updateShowcaseContainer(artArray) {
    // gen new art
    let rowN = 0;
    let colN = 0;

    const container = createHTMLElement('div', '', {
        class: 'art-container'
    });

    artArray.forEach(row => {
        rowN++;
        colN = 0;
        const ASCIIArtRow = createHTMLElement('div', '', {
            class: 'row'
        });
        container.appendChild(ASCIIArtRow);
        row.forEach(item => {
            colN++;
            const ASCIIChar = createHTMLElement('span', item.char, {
                class: 'char'
            });
            ASCIIChar.style.color = `rgba(${item.rgba[0]},${item.rgba[1]},${item.rgba[2]},${item.rgba[3]/255})`;
            ASCIIArtRow.appendChild(ASCIIChar);
        });
    });    

    return container;
}

function updateASCIIArt(img) {
    const ascii_art_showcase = document.getElementById('ascii-art-showcase');
    const ASCIIArtArray = aag(img, OUT_HEIGHT);

    if (ASCIIArtArray.length !== 0) {
        // clear old art
        ascii_art_showcase.innerHTML = '';
        ascii_art_showcase.appendChild(updateShowcaseContainer(ASCIIArtArray));
    }
}

function updateASCIIArtGif(gifURL, realTime=true) {
    if (realTime) {
        return updateASCIIArtGifRealTime(gifURL);
    } else {
        return updateASCIIArtGifPreRender(gifURL);
    }
}

function updateASCIIArtGifPreRender(gifURL) {
    const ascii_art_showcase = document.getElementById('ascii-art-showcase');
    let timeout = null;
    let play = true;

    GFE(gifURL, (frames) => {
        const frameLen = frames.length;
        let frameIdx = 0;

        // pre-render frames to improve performance
        const framesDOMElements = [];
        frames.forEach((fr)=>{
            const ASCIIArtArray = aag(fr.data, OUT_HEIGHT, true);
            framesDOMElements.push([updateShowcaseContainer(ASCIIArtArray), fr.delay * 10]);
        });

        // play
        const playFrame = () => {
            const currentIdx = frameIdx;
            ascii_art_showcase.innerHTML = '';
            ascii_art_showcase.appendChild(framesDOMElements[currentIdx][0]);
            
            if (play) {
                frameIdx = (frameIdx + 1) % frameLen;
                timeout = setTimeout(playFrame, framesDOMElements[currentIdx][1]);
            };
        }

        playFrame();
    });

    return () => {
        // stop function
        play = false;
        clearTimeout(timeout);
    }
}

function updateASCIIArtGifRealTime(gifURL) {
    const ascii_art_showcase = document.getElementById('ascii-art-showcase');
    let timeout = null;
    let play = true;
    let framesAreGenerated = false;
    let frameIdx = 0;
    const framesDOMElements = [];

    const playFrame = () => {
        const currentIdx = frameIdx;
        ascii_art_showcase.innerHTML = '';
        ascii_art_showcase.appendChild(framesDOMElements[currentIdx][0]);
        
        if (play) {
            frameIdx = (frameIdx + 1) % framesDOMElements.length;
            if ((!framesAreGenerated) && frameIdx === 0) {
                // frame havent been all generated and is the end of the loop
                // repeat the current frame untill frames are all generated or new frame is generated
                frameIdx = currentIdx;
                timeout = setTimeout(playFrame, 50);       // buffer time -> 0.05s;
            } else {
                timeout = setTimeout(playFrame, framesDOMElements[currentIdx][1]);
            }
        };
    }
    
    GFE(gifURL, (fs)=>{framesAreGenerated = true}, (f) => {
        // callback after each frame is generated
        if (play) {
            new Promise(()=>{
                const ASCIIArtArray = aag(f.data, OUT_HEIGHT, true);
                const DOMElements = updateShowcaseContainer(ASCIIArtArray);

                if (framesDOMElements.length === 0) {
                    // if this is the first frame, after frame is generated
                    // start playing
                    // frame will play loop as new frame generated
                    framesDOMElements.push([DOMElements, f.delay * 10]);
                    playFrame();
                } else {
                    framesDOMElements.push([DOMElements, f.delay * 10]);
                }                     
            });
        }
    });

    return () => {
        // stop function
        play = false;
        clearTimeout(timeout);
    }
}

function updateASCIIArtVid(videoEl) {
    const ascii_art_showcase = document.getElementById('ascii-art-showcase');
    let videoEnd = false;
    
    const frameCallback = (frame) => {
        const ASCIIArtArray = aag(frame.data, OUT_HEIGHT, true);
        if (ASCIIArtArray.length !== 0) {
            // clear old art
            ascii_art_showcase.innerHTML = '';
            ascii_art_showcase.appendChild(updateShowcaseContainer(ASCIIArtArray));
        }
    };

    const endConditionCheckFunc = () => {
        return videoEnd;
    };


    VFE.extract(videoEl, 120, frameCallback, endConditionCheckFunc);
    videoEl.play();

    return () => {
        // stop function
        videoEl.pause();
        videoEnd = true;
    }
}

function setup() {
    const img_upload = document.querySelector("#img-upload .upload");
    const extImg = /(\.jpg|\.jpeg|\.png|\.apng|\.svg|\.bmp|\.webp)$/i;
    const extGif = /(\.gif)$/i;
    const extVid = /(\.mp4|\.webm|\.ogg)$/i;
    const filenamePrompt = document.querySelector("#input-prompt");

    // reset image upload
    img_upload.value = '';
    
    let clearupFunc = null;
    const clearup = () => {
        if (clearupFunc) {
            clearupFunc();
        }
        clearupFunc = null;
    }

    const produceOut = (fileURL, fileName=fileURL) => {
        if (extImg.exec(fileName)) {
            clearup();
            img_temp.src = fileURL;
            filenamePrompt.innerHTML = '&lt' + fileName + '&gt';
        } else if (extGif.exec(fileName)) {
            clearup();
            clearupFunc = updateASCIIArtGif(fileURL);
            filenamePrompt.innerHTML = '&lt' + fileName + '&gt';
        } else if (extVid.exec(fileName)) {
            if (SUPPORT_VIDEO) {
                clearup();
                vid_temp.src = fileURL;
                filenamePrompt.innerHTML = '&lt' + fileName + '&gt';                
            } else {
                img_upload.value = '';
                const old_prompt = filenamePrompt.innerHTML;
                filenamePrompt.innerHTML = "browser doesn't support video convertion";
                setTimeout(()=>{
                    filenamePrompt.innerHTML = old_prompt;
                }, 1500);
            }
        } else {
            img_upload.value = '';
            const old_prompt = filenamePrompt.innerHTML;
            filenamePrompt.innerHTML = "format is not supported";
            setTimeout(()=>{
                filenamePrompt.innerHTML = old_prompt;
            }, 1500);
        }
    }

    // upload image, display image
    img_upload.addEventListener("change", (e) => {
        const fileURL =  URL.createObjectURL(e.target.files[0]);
        const fileName = e.target.files[0].name;
        produceOut(fileURL, fileName);
    }, false);

    // when new image shows, get ascii
    img_temp.addEventListener('load', (e) => {
        updateASCIIArt(img_temp);
    });

    vid_temp.addEventListener('loadeddata', (e) => {
        if (vid_temp.readyState >= 2) {
            clearupFunc = updateASCIIArtVid(vid_temp);
        }
    });

    // initial stock photo
    const stock_img = stock_photos[Math.floor(Math.random() * stock_photos.length)];
    produceOut(stock_img[1], stock_img[0]);
}

function main() {

    window.addEventListener('load', () => {
        const loading_prompt = createHTMLElement('p', '', {id: 'loading-prompt'});
        const opencvScript = createHTMLElement('script', '', {src: 'https://www.aghnu.me/static/js/opencv.js', async: true});

        document.body.appendChild(loading_prompt);
        document.head.appendChild(opencvScript);

        let timeInterval;
        let str_idx = 0;
        const loading_prompt_str = [
            'Webpage is loading',
            'Webpage is loading.',
            'Webpage is loading..',
            'Webpage is loading...',
        ];

        loading_prompt.style.visibility = 'visible';
        timeInterval = setInterval(() => {
            loading_prompt.innerHTML = loading_prompt_str[str_idx];
            str_idx = (str_idx + 1) % loading_prompt_str.length;
        }, 500);

        const start = () => {
            const run = () => {
                clearInterval(timeInterval);
                createHTMLStructure().style.visibility = 'visible';
                loading_prompt.style.visibility = 'hidden';    
                setup();                    
            }

            VFE.checkSupport(()=>{
                SUPPORT_VIDEO = true;
                run();
            }, () => {
                SUPPORT_VIDEO = false;
                run();
            }, (frame) => {
                const ASCIIArtArray = aag(frame.data, 1, true);
                if (ASCIIArtArray.length !== 0) {
                    if (ASCIIArtArray[0][0].rgba[0] === 254) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            });
        }
        
        opencvScript.addEventListener('load', () => {
            setTimeout(() => {
                if (cv.getBuildInformation) {
                    start();
                } else {
                    cv['onRuntimeInitialized'] = start;
                }
            }, loading_prompt_str.length * 500);
        });
    })
}



main();
