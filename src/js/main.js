import { aag } from './asciiArtGenerator';
import { createHTMLElement } from "./utilities";
import GFE from "./gif_frames_extract_js/GFE";

import "../style/style.scss";

// webpack load stock photos
import stock_0 from "../img/stock_demo/0.gif";
import stock_1 from "../img/stock_demo/1.gif";

// globals
const img_temp = createHTMLElement('img', '', {
    id: 'img-temp'
});
const stock_photos = [
    stock_0, stock_1
]

function createHTMLStructure() {

    const img_upload = createHTMLElement('label', '', {
        id: 'img-upload'
    });
    const img_upload_input = createHTMLElement('input', '', {
        class: 'upload',
        type: 'file'
    });
    const img_upload_prompt = createHTMLElement('p', 'UPLOAD<br>JPG | PNG | GIF', {
        class: 'prompt'
    })
    const ascii_art_showcase = createHTMLElement('div', '', {
        id: 'ascii-art-showcase'
    });

    const footer = createHTMLElement('footer', '', {id: 'site-footer'});
    const footer_info = createHTMLElement('p', 'Aghnu\'s ASCII Art Generator<br>by Gengyuan Huang', {class: 'info'});

    footer.appendChild(footer_info);

    img_upload.appendChild(img_upload_prompt);
    img_upload.appendChild(img_upload_input);

    // append to body
    document.body.appendChild(ascii_art_showcase);
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
    const ASCIIArtArray = aag(img, 35);

    if (ASCIIArtArray.length !== 0) {
        // clear old art
        ascii_art_showcase.innerHTML = '';
        ascii_art_showcase.appendChild(updateShowcaseContainer(ASCIIArtArray));
    }
}

function updateASCIIArtGif(gifURL) {
    const ascii_art_showcase = document.getElementById('ascii-art-showcase');
    let timeout = null;
    let play = true;

    GFE(gifURL, (frames) => {
        const frameLen = frames.length;
        let frameIdx = 0;

        // pre-render frames to improve performance
        const framesDOMElements = [];
        frames.forEach((fr)=>{
            const ASCIIArtArray = aag(fr.data, 35, true);
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

function setup() {
    const img_upload = document.querySelector("#img-upload .upload");
    const extImg = /(\.jpg|\.jpeg|\.png)$/i;
    const extGif = /(\.gif)$/i;
    
    let clearupFunc = null;
    const clearup = () => {
        if (clearupFunc) {
            clearupFunc();
        }
        clearupFunc = null;
    }

    // upload image, display image
    img_upload.addEventListener("change", (e) => {
        const filePath = img_upload.value; 


        if (extImg.exec(filePath)) {
            clearup();
            img_temp.src = URL.createObjectURL(e.target.files[0]);
        } else if (extGif.exec(filePath)) {
            clearup();
            clearupFunc = updateASCIIArtGif(URL.createObjectURL(e.target.files[0]));
        } else {
            img_upload.value = '';
        }

    }, false);

    // when new image shows, get ascii
    img_temp.addEventListener('load', (e) => {
        updateASCIIArt(img_temp);
    });

    // initial stock photo
    const stock_url = stock_photos[Math.floor(Math.random() * stock_photos.length)];
    if (extImg.exec(stock_url)) {
        clearup();
        img_temp.src = stock_url;
    } else if (extGif.exec(stock_url)) {
        clearup();
        img_temp.src = stock_url;
        clearupFunc = updateASCIIArtGif(stock_url);
    }
}

function main() {
    window.addEventListener('load', () => {
        // init structure
        createHTMLStructure();

        // include opencv
        const opencvScript = createHTMLElement('script', '', {
            src: 'https://docs.opencv.org/4.5.0/opencv.js',
            async: true
        });
        document.head.appendChild(opencvScript);
        opencvScript.addEventListener('load', () => {
            if (cv.getBuildInformation) {
                setup();
            } else {
                cv['onRuntimeInitialized'] = setup;
            }
        });
    })
}

main();