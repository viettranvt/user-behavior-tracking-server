function getScrollPercentage() {
  $(document).ready(function() {
    $(window).scroll(function(e) {
      let scrollTop = $(window).scrollTop();
      let docHeight = $(document).height();
      let winHeight = $(window).height();
      let scrollPercent = scrollTop / (docHeight - winHeight);
      let scrollPercentRounded = Math.round(scrollPercent * 100);
      oldScroll = scrollPercentRounded > newScroll ? newScroll : oldScroll;
      newScroll = scrollPercentRounded > newScroll ? scrollPercentRounded : newScroll;
    });
  });
}
