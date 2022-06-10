import { createHTMLElement } from './utilities';

// NOTE: needs to require opencv.js
// https://docs.opencv.org/4.5.0/opencv.js

export function aag(img, width) {
    const ASCIIStr = "@QB#NgWM8RDHdOKq9$6khEPXwmeZaoS2yjufF]}{tx1zv7lciL/\\|?*>r^;:_\"~,'.-` ";

    const result = [];

    // load image
    const src = cv.imread(img);
    const srcRatio = src.rows / src.cols;

    // calc new size
    const dstWidth = width;                                          // requested width
    const dstHeight = Math.floor(srcRatio * dstWidth * 0.55);          // width of the font ~= 0.5 * height of the font

    // resize image
    const dstSize = new cv.Size(dstWidth, dstHeight);
    const dst = new cv.Mat();
    cv.resize(src, dst, dstSize,0,0,cv.INTER_AREA);

    // get grayscale image
    const dstGray = new cv.Mat();
    cv.cvtColor(dst, dstGray, cv.COLOR_RGBA2GRAY, 0);
    cv.equalizeHist(dstGray, dstGray);

    // generating ASCII Art
    if (dst.isContinuous() && dstGray.isContinuous()) {
        for (let row = 0; row < dst.rows; row++) {
            const resultRow = [];
            result.push(resultRow);
            for (let col = 0; col < dst.cols; col++) {
                const R = dst.data[row * dst.cols * dst.channels() + col * dst.channels()];
                const G = dst.data[row * dst.cols * dst.channels() + col * dst.channels() + 1];
                const B = dst.data[row * dst.cols * dst.channels() + col * dst.channels() + 2];
                const A = dst.data[row * dst.cols * dst.channels() + col * dst.channels() + 3];
                
                const brightness = dstGray.data[row * dstGray.cols * dstGray.channels() + col * dstGray.channels()];
                
                const charOut = ASCIIStr[(ASCIIStr.length - 1) -  Math.floor((brightness/255) * (ASCIIStr.length - 1))];
                const rgbaOut = [R, G, B, A]
                resultRow.push({
                    char: charOut === ' ' ? '&nbsp' : charOut,
                    rgba: rgbaOut,
                });
            }
        }        
    }

    // clean mem
    src.delete();
    dst.delete();
    dstGray.delete();

    return result;
}