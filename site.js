// #photos and slideshows for the fieldwork and training pages
// #any photo whose file isn't uploaded yet just disappears, so you can add pictures whenever

(function () {

  // #slideshow setup: arrows, dots, and swipe (swipe comes free from css scroll-snap)
  function setupSlideshow(show) {
    var track = show.querySelector('.slides');
    var prev = show.querySelector('.prev');
    var next = show.querySelector('.next');
    var dotsBox = show.querySelector('.dots');

    function slides() { return Array.prototype.slice.call(track.querySelectorAll('.slide')); }
    function current() { return Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)); }
    function goTo(i) {
      var all = slides();
      i = (i + all.length) % all.length; // #wraps around at either end
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    }

    function build() {
      var all = slides();
      // #no photos yet: hide the whole slideshow
      show.hidden = all.length === 0;
      // #one photo: no need for arrows or dots
      show.classList.toggle('single', all.length < 2);
      dotsBox.innerHTML = '';
      all.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + all.length);
        dot.addEventListener('click', function () { goTo(i); });
        dotsBox.appendChild(dot);
      });
      mark();
    }

    function mark() {
      var i = current();
      Array.prototype.forEach.call(dotsBox.children, function (d, j) {
        d.setAttribute('aria-current', j === i ? 'true' : 'false');
      });
    }

    prev.addEventListener('click', function () { goTo(current() - 1); });
    next.addEventListener('click', function () { goTo(current() + 1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(mark); });

    // #arrow keys work when the slideshow has focus
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current() - 1); }
    });

    show._rebuild = build;
    build();
  }

  document.querySelectorAll('.slideshow').forEach(setupSlideshow);

  // #missing photos: drop the slide or thumbnail instead of showing a broken image
  document.querySelectorAll('img[data-optional]').forEach(function (img) {
    function drop() {
      var slide = img.closest('.slide');
      var thumb = img.closest('.thumb');
      if (slide) {
        var show = slide.closest('.slideshow');
        slide.remove();
        if (show && show._rebuild) show._rebuild();
      } else if (thumb) {
        var row = thumb.closest('li');
        thumb.remove();
        if (row) row.classList.remove('has-photo');
      } else {
        img.remove();
      }
    }
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop);
  });

})();
