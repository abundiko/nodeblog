//! Dom manipulation
const DOM = {
  toggleState: function (id, className) {
    document.getElementById(id).classList.toggle(className);
  },
  addState: function (id, className) {
    document.getElementById(id).classList.add(className);
  },
  remState: function (id, className) {
    document.getElementById(id).classList.remove(className);
  },
};




/*
Animation start
!Counter is included with animate-on-scroll
counter example:
<h2 class="dcounter" data-count="100" data-time="5">0</h2>
!make sure to set the initial html to 0

example:
<img class="djs-scroll fade-in" data-dos-offset="1">
!MAKE SURE TO LINK diko.animate.css

!NOTE: if you have your own onscroll listner, simply add the methob -> handleScrollAnimation(); 
*/
const scrollElements = document.querySelectorAll(".djs-scroll");
let dons = document.querySelectorAll(['.donscroll']);

const dCounter = document.querySelectorAll('.dcounter');

const elementInView = (el, dividend = 1) => {
  const elementTop = el.getBoundingClientRect().top;

  return (
    elementTop <=
    (window.innerHeight || document.documentElement.clientHeight) / dividend
  );
};

const elementOutofView = (el) => {
  const elementTop = el.getBoundingClientRect().top;

  return (
    elementTop > (window.innerHeight || document.documentElement.clientHeight)
  );
};

const displayScrollElement = (element) => {
  element.classList.add("scrolled");
};

const hideScrollElement = (element) => {
  element.classList.remove("scrolled");
};

const handleScrollAnimation = () => {
  scrollElements.forEach((el) => {
    if (elementInView(el, el.getAttribute('data-dos-offset'))) {
      displayScrollElement(el);
    } else if (elementOutofView(el)) {
      hideScrollElement(el)
    }
  });
  dCounter.forEach((el) => {
    try {

      if (el.querySelector('span').innerHTML !== '0') return;
    } catch (error) {
      if (el.innerHTML !== '0') return;

    }
    var i = 0;
    const count = Number(el.getAttribute('data-count'));
    const time = Number(el.getAttribute('data-time'));
    if (elementInView(el)) {
      var interval;
      interval = setInterval(() => {
        if (i == count) {
          clearInterval(interval);
          return;
        }
        i++;
        try {

          el.querySelector('span').innerHTML = i;
        } catch (error) {
          el.innerHTML = i;

        }
      }, (time * 100) / count);
    }
  })
}
/// handle the animations onscroll
window.addEventListener("scroll", () => {
  handleScrollAnimation();
});

//Animation end
/*
Product Slider Start
example:
<section class="dslider-container">
    <button id="dslider-prev" class="dslider-btn">prev</button>
    <article class="dslider">
      <div class="dslider-item">
        <div class="child"></div>
      </div>
      <div class="dslider-item">
        <div class="child"></div>
      </div>
      <div class="dslider-item">
        <div class="child"></div>
      </div>
      <div class="dslider-item">
        <div class="child"></div>
      </div>
      <div class="dslider-item">
        <div class="child"></div>
      </div>
    </article>
    <button id="dslider-next" class="dslider-btn">next</button>
  </section>
*/
const sliderMain = document.querySelectorAll('.dslider-container');
function checkHasOffset(slider, prev, next) {
  if (slider.scrollLeft == 0) prev.classList.add('d-none'); else prev.classList.remove('d-none')

  if (slider.scrollLeft + slider.clientWidth == slider.scrollWidth) next.classList.add(('d-none')); else next.classList.remove(('d-none'))
}
sliderMain.forEach((item) => {

  const slider = item.querySelector('.dslider');
  const sliderItem = item.querySelectorAll('.dslider-item');
  const sliderprev = item.querySelector('.dslider-btn#dslider-prev');
  const slidernext = item.querySelector('.dslider-btn#dslider-next');
  sliderprev.onclick = e => {
    const n = sliderItem[0].getBoundingClientRect().width;
    slider.scrollLeft -= n;
    setTimeout(() => {

      checkHasOffset(slider, sliderprev, slidernext);
    }, 500);
  }
  slidernext.onclick = e => {
    const n = sliderItem[0].getBoundingClientRect().width;
    slider.scrollLeft += n;
    setTimeout(() => {

      checkHasOffset(slider, sliderprev, slidernext);
    }, 500);
  }
  checkHasOffset(slider, sliderprev, slidernext);
});

/**
 * RAting Bar; for reviews and rating ⭐⭐⭐⭐⭐
 * 
 * example
 * 
  <div class="drating-bar">
    <i class="fas fa-star d-inline-block mx-1 rated"></i><i class="fas fa-star d-inline-block mx-1"></i><i class="fas fa-star d-inline-block mx-1"></i><i class="fas fa-star d-inline-block mx-1"></i><i class="fas fa-star d-inline-block mx-1"></i>
  </div>
 */
const ratingBar = document.querySelectorAll('.drating-bar');
ratingBar.forEach((bar) => {
  const stars = bar.querySelectorAll('i');
  stars.forEach((star, index) => {
    star.onclick = e => {
      for (let i = 0; i < stars.length; i++) {
        stars[i].classList.remove('rated');
      }
      for (let i = 0; i <= index; i++) {
        bar.querySelectorAll('i')[i].classList.add('rated');
      }
    }
  })
});

/*
Accordion; for FAQ
example:
<div class="daccordion">
          <div class="daccordion-item active p-2 rounded">
            <div class="daccordion-title fw-bold fs-4">Hello title</div>
            <div class="daccordion-body">
              <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi excepturi doloribus quisquam repellat
                saepe molestias maxime esse voluptatum, ullam distinctio!</p>
            </div>
          </div>
          <div class="daccordion-item p-2 rounded">
            <div class="daccordion-title fw-bold fs-4">Hello title</div>
            <div class="daccordion-body">
              <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi excepturi doloribus quisquam repellat
                saepe molestias maxime esse voluptatum, ullam distinctio!</p>
            </div>
          </div>
          <div class="daccordion-item p-2 rounded">
            <div class="daccordion-title fw-bold fs-4">Hello title</div>
            <div class="daccordion-body">
              <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi excepturi doloribus quisquam repellat
                saepe molestias maxime esse voluptatum, ullam distinctio!</p>
            </div>
          </div>
          <div class="daccordion-item p-2 rounded">
            <div class="daccordion-title fw-bold fs-4">Hello title</div>
            <div class="daccordion-body">
              <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi excepturi doloribus quisquam repellat
                saepe molestias maxime esse voluptatum, ullam distinctio!</p>
            </div>
          </div>
        </div>
        !NOTE: add class 'active' to the first accordion item
*/
const accordions = document.querySelectorAll('.daccordion');
accordions.forEach(accordion => {
  const items = accordion.querySelectorAll('.daccordion-item');
  items.forEach(item => {
    item.onclick = e => {
      items.forEach(element => {
        element.classList.remove('active');
      });
      item.classList.add('active');
    };
  });
});