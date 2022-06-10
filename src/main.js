import { aag } from './asciiArtGenerator';
import { createHTMLElement } from "./utilities";
import "./style/style.scss";
import lena from "./img/lena.jpg";

function createHTMLStructure() {
    const img_src = createHTMLElement('img', '', {id: 'img-src'});
    const img_upload = createHTMLElement('input', '', {id: 'img-upload', type: 'file'});
    const ascii_art_showcase = createHTMLElement('div', '', {id: 'ascii-art-showcase'});

    document.body.appendChild(img_src);
    document.body.appendChild(img_upload);
    document.body.appendChild(ascii_art_showcase);
}

function updateASCIIArt(img) {
    const ascii_art_showcase = document.getElementById('ascii-art-showcase');
    const ASCIIArtArray = aag(img, 75);

    if (ASCIIArtArray.length !== 0) {
        // clear old art
        ascii_art_showcase.innerHTML = '';
        
        // gen new art

        let rowN = 0;
        let colN = 0;

        ASCIIArtArray.forEach(row => {
            rowN++;
            colN = 0;
            const ASCIIArtRow = createHTMLElement('div', '', {class: 'row'});
            ascii_art_showcase.appendChild(ASCIIArtRow);
            row.forEach(item => {
                colN++;
                const ASCIIChar = createHTMLElement('span', item.char, {class: 'char'});
                ASCIIChar.style.color = `rgba(${item.rgba[0]},${item.rgba[1]},${item.rgba[2]},${item.rgba[3]/255})`;
                ASCIIArtRow.appendChild(ASCIIChar);
            });
        });   
    }

}

function setup() {
    const img_src = document.getElementById("img-src")
    const img_upload = document.getElementById("img-upload");

    // upload image, display image
    img_upload.addEventListener("change", (e) => {
        img_src.src = URL.createObjectURL(e.target.files[0]);
    }, false);

    // when new image shows, get ascii
    img_src.addEventListener('load', (e) => {
        updateASCIIArt(img_src);
    });

    // initial stock photo
    img_src.src = lena;
}

function main() {
    window.addEventListener('load', () => {
        // init structure
        createHTMLStructure();
        
        // include opencv
        const opencvScript = createHTMLElement('script', '', {src: 'https://docs.opencv.org/4.5.0/opencv.js', async: true});
        document.head.appendChild(opencvScript);
        opencvScript.addEventListener('load', () => {
            if (cv.getBuildInformation) {
                setup();
            } else {
                cv['onRuntimeInitialized']=setup;              
            }
        });
    })
}

main();