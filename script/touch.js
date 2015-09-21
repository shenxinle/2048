function touch(dom, callback) {
    var start = {},
        end = {},
        delta = {},
        swipeDir;
    var margin = 20;

    dom.addEventListener('touchstart', touchstart, false);

    function touchstart(e) {
        start.x = e.touches[0].clientX;
        start.y = e.touches[0].clientY;
        start.time = (new Date()).getTime();

        dom.addEventListener('touchmove', touchmove, false);
        dom.addEventListener('touchend', touchend, false);
    }

    function touchmove(e) {
        end.x = e.touches[0].clientX;
        end.y = e.touches[0].clientY;
        end.time = (new Date()).getTime();
        delta.x = end.x - start.x;
        delta.y = end.y - start.y;
        delta.time = end.time - start.time;

        swipeDir = (Math.abs(delta.x) > margin || Math.abs(delta.y) > margin) ? (Math.abs(delta.x) > Math.abs(delta.y) ? (delta.x > 0 ? 'swipeRight' : 'swipeLeft') : (delta.y > 0 ? 'swipeBottom' : 'swipeTop')) : '';
    }

    function touchend(e) {
        dom.removeEventListener('touchmove', touchmove, false);
        dom.removeEventListener('touchend', touchend, false);
        callback({
            start: start,
            end: end,
            delta: delta,
            swipeDir: swipeDir
        });
    }
}
