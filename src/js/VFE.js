// extract frames from a video

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.VFE = factory();
    }
}(this, function () {
    const canvas_temp = document.createElement('canvas');
    const canvas_temp_ctx = canvas_temp.getContext('2d');

    const VFE = function (
        videoEl,                                    // a html video element
        FPS,                                        // must smaller than original video's FPS
        frameCallback = () => {},                   // callback after each frame is extracted, pass the frame
        endConditionCheckFunc = () => {},           // callback before a frame is extracted
    ) {
        const extractFrame = () => {
            if (!endConditionCheckFunc()) {
                const begin = Date.now();

                // get image data
                canvas_temp_ctx.drawImage(videoEl);
                const imageData = canvas_temp_ctx.getImageData(0,0,canvas_temp.width, canvas_temp.height);
                
                // return frame
                new Promise(() => {
                    const frame = {data: imageData}
                    frameCallback(frame);
                }); 
                
                // next frame
                setTimeout(extractFrame, 1000/FPS - (Date.now() - begin));
            }
        };

        extractFrame();
    };

    return VFE;
} ));