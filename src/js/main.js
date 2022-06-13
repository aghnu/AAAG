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
    ['Europeana-Collections.gif', stock_2],
]

const OUT_HEIGHT = 35;

function createHTMLStructure() {

    const img_upload = createHTMLElement('label', '', {id: 'img-upload'});
    const img_upload_input = createHTMLElement('input', '', {class: 'upload', type: 'file'});
    const img_upload_prompt = createHTMLElement('p', 'UPLOAD<br>JPG \\ PNG \\ GIF \\ MP4', {class: 'prompt'});

    const input_prompt = createHTMLElement('p', '', {id: 'input-prompt'});

    const ascii_art_showcase = createHTMLElement('div', '', {id: 'ascii-art-showcase'});
    const page_loading_prompt = createHTMLElement('p', '', {id: 'loading-prompt'});

    const footer = createHTMLElement('footer', '', {id: 'site-footer'});
    const footer_info = createHTMLElement('p', 'Aghnu\'s ASCII Art Generator<br>by Gengyuan Huang<br><a target="_blank" href="https://www.aghnu.me">© 2022 AGHNU.ME</a>', {class: 'info'});

    footer.appendChild(footer_info);

    ascii_art_showcase.appendChild(page_loading_prompt);

    img_upload.appendChild(img_upload_prompt);
    img_upload.appendChild(img_upload_input);

    // append to body
    document.body.appendChild(ascii_art_showcase);
    document.body.appendChild(input_prompt);
    document.body.appendChild(img_upload);
    document.body.appendChild(footer);
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


    VFE(videoEl, 120, frameCallback, endConditionCheckFunc);
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
            clearup();
            vid_temp.src = fileURL;
            filenamePrompt.innerHTML = '&lt' + fileName + '&gt';
        } else {
            img_upload.value = '';
            const old_prompt = filenamePrompt.innerHTML;
            filenamePrompt.innerHTML = "format is not supported"
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
        clearupFunc = updateASCIIArtVid(vid_temp);
    });

    // initial stock photo
    const stock_img = stock_photos[Math.floor(Math.random() * stock_photos.length)];
    produceOut(stock_img[1], stock_img[0]);
}

function main() {
    window.addEventListener('load', () => {
        // init structure
        createHTMLStructure();

        // include opencv
        const opencvScript = createHTMLElement('script', '', {
            src: 'https://www.aghnu.me/static/js/opencv.js',
            // src: 'https://docs.opencv.org/4.5.0/opencv.js',
            async: true
        });

        const loading_prompt = document.querySelector('#loading-prompt');
        const loading_prompt_str = [
            'Webpage is loading',
            'Webpage is loading.',
            'Webpage is loading..',
            'Webpage is loading...',
        ]
        let timeInterval;
        let str_idx = 0;

        timeInterval = setInterval(() => {
            loading_prompt.innerHTML = loading_prompt_str[str_idx];
            str_idx = (str_idx + 1) % loading_prompt_str.length;
        }, 500);

        document.head.appendChild(opencvScript);
        opencvScript.addEventListener('load', () => {
            setTimeout(() => {
                clearInterval(timeInterval);
                loading_prompt.style.display = 'none';
                if (cv.getBuildInformation) {
                    setup();
                } else {
                    cv['onRuntimeInitialized'] = setup;
                }
            }, loading_prompt_str.length * 500);
        });
    })
}

main();