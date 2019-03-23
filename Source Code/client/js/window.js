const remote = require('electron').remote;

(function handleWindowControls() {
    // When document has loaded, initialise
    document.onreadystatechange = () => {
        if (document.readyState == "complete") {
            init();
        }
    };

    function init() {
        let window = remote.getCurrentWindow();
        const minButton = document.getElementById('min-button'),
            closeButton = document.getElementById('close-button');

        minButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.minimize();
        });
        // Toggle maximise/restore buttons when maximisation/unmaximisation
        // occurs by means other than button clicks e.g. double-clicking
        // the title bar:

        closeButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            if (isServerRunning) {
                window.hide();
            } else {
                window.close();
            }

        });

    }
})();
// VGhpcyBzb2Z0d2FyZSB3YXMgbWFkZSBieSBBbGVrc2FuZGVyIEV2ZW5zZW46IGh0dHBzOi8vZ2l0aHViLmNvbS9BbGVrc2FuZGVyRXZlbnNlbg==
