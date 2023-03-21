window.onscroll = e => {

  const offset = window.scrollY;
  if (offset > 10) {
    DOM.addState('header', 'scrolled');
  } else {
    DOM.remState('header', 'scrolled');

  }
}