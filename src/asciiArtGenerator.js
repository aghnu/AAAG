import cv from './opencv';

export function aag(img, width) {
    // constants
    const ASCIIStr = [
        '@', '&', '%', 
        '#', '(', '/', 
        '*', ',', '.', 
        '&nbsp'
    ];

    const result = [];

    // load image
    const src = cv.imread(img);
    const srcRatio = src.rows / src.cols;

    // calc new size
    const dstWidth = width;                                          // requested width
    const dstHeight = Math.floor(srcRatio * dstWidth * 0.5);          // width of the font ~= 0.5 * height of the font

    // resize image
    const dstSize = new cv.Size(dstWidth, dstHeight);
    const dst = new cv.Mat();
    cv.resize(src, dst, dstSize,0,0,cv.INTER_AREA);

    // cv.imshow('canvas_showcase', dst);

    // generating ASCII Art
    if (dst.isContinuous()) {
        for (let row = 0; row < dst.rows; row++) {
            const resultRow = [];
            result.push(resultRow);
            for (let col = 0; col < dst.cols; col++) {
                const R = dst.data[row * dst.cols * dst.channels() + col * dst.channels()];
                const G = dst.data[row * dst.cols * dst.channels() + col * dst.channels() + 1];
                const B = dst.data[row * dst.cols * dst.channels() + col * dst.channels() + 2];
                const A = dst.data[row * dst.cols * dst.channels() + col * dst.channels() + 3];
                
                const brightness = Math.floor(0.299 * R + 0.587 * G + 0.114 * B);
                
                resultRow.push({
                    char: ASCIIStr[ASCIIStr.length -  Math.floor((brightness/255) * ASCIIStr.length)],
                    rgba: [R, G, B, A],
                });
            }
        }        
    }

    // clean mem
    src.delete();
    dst.delete();

    return result;
}