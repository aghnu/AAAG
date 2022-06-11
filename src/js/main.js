import {
    aag
} from './asciiArtGenerator';
import {
    createHTMLElement
} from "./utilities";
import GFE from "./gif_frames_extract_js/GFE";

import "../style/style.scss";
import lena from "../img/lena.jpg";


// globals
const img_temp = createHTMLElement('img', '', {
    id: 'img-temp'
});

function createHTMLStructure() {
    const img_upload = createHTMLElement('input', '', {
        id: 'img-upload',
        type: 'file'
    });
    const ascii_art_showcase = createHTMLElement('div', '', {
        id: 'ascii-art-showcase'
    });

    document.body.appendChild(img_upload);
    document.body.appendChild(ascii_art_showcase);
}

function fileValidation(inputEl) {

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
    const ASCIIArtArray = aag(img, 75);

    if (ASCIIArtArray.length !== 0) {
        // clear old art
        ascii_art_showcase.innerHTML = '';
        ascii_art_showcase.appendChild(updateShowcaseContainer(ASCIIArtArray));
    }
}

function updateASCIIArtGif(gifURL) {
    const ascii_art_showcase = document.getElementById('ascii-art-showcase');

    GFE(gifURL, (frames) => {
        const frameLen = frames.length;
        let frameIdx = 0;

        const playFrame = () => {
            const currentIdx = frameIdx;
            const ASCIIArtArray = aag(frames[currentIdx].data, 100, true);
            if (ASCIIArtArray.length !== 0) {
                // clear old art
                ascii_art_showcase.innerHTML = '';
                ascii_art_showcase.appendChild(updateShowcaseContainer(ASCIIArtArray));
            }
            
            frameIdx = (frameIdx + 1) % frameLen;
            setTimeout(playFrame, frames[currentIdx].delay * 10);
        }

        playFrame();
    });
}

function setup() {
    const img_upload = document.getElementById("img-upload");

    // upload image, display image
    img_upload.addEventListener("change", (e) => {
        const filePath = img_upload.value; 
        const extImg = /(\.jpg|\.jpeg|\.png)$/i;
        const extGif = /(\.gif)$/i;

        if (extImg.exec(filePath)) {
            img_temp.src = URL.createObjectURL(e.target.files[0]);
        } else if (extGif.exec(filePath)) {
            updateASCIIArtGif(URL.createObjectURL(e.target.files[0]));
        } else {
            img_upload.value = '';
        }



    }, false);

    // when new image shows, get ascii
    img_temp.addEventListener('load', (e) => {
        updateASCIIArt(img_temp);
    });

    // initial stock photo
    img_temp.src = lena;
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