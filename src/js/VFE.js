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
    const video_test_data_base64 = 'data:video/mp4;base64,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';


    const VFE_extraction = function (
        videoEl,                                    // a html video element
        FPS,                                        // must smaller than original video's FPS
        frameCallback = () => {},                   // callback after each frame is extracted, pass the frame
        endConditionCheckFunc = () => {},           // callback before a frame is extracted
    ) {

        canvas_temp.width = videoEl.videoWidth;
        canvas_temp.height = videoEl.videoHeight;

        const extractFrame = () => {
            if (!endConditionCheckFunc()) {
                const begin = Date.now();

                // get image data
                canvas_temp_ctx.drawImage(videoEl,0,0,videoEl.videoWidth,videoEl.videoHeight);
                const imageData = canvas_temp_ctx.getImageData(0,0,videoEl.videoWidth, videoEl.videoHeight);
                
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

    const ifSupportVideoConvertion = (onSuccess, onFailure, checkingFunc) => {
        const vid_test = document.createElement('video');
        let end = false;
        let event_fired = false;

        vid_test.muted = true;
        vid_test.autoplay = true;


        vid_test.addEventListener('canplay', (e) => {
            if (!event_fired) {
                event_fired = true;
                if (vid_test.readyState >= 2) {
                    VFE.extract(vid_test, 120, (frame) => {
                        end = true;
                        if (checkingFunc()) {
                            onSuccess();
                        } else {
                            onFailure();
                        }
                    }, () => {return end});
                }
            }

        }, {once: true});

        vid_test.addEventListener('error', (e) => {
            if (!event_fired) {
                event_fired = true;
                onFailure();
            }
        }, {once: true});
    
        vid_test.src = video_test_data_base64;
    }

    const VFE = {
        extract: VFE_extraction,
        checkSupport: ifSupportVideoConvertion,
    }

    return VFE;
} ));