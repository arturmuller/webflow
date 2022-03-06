function throttle(ms: number, func: (...args: any) => any) {
  let ready = true;
  let timeout: NodeJS.Timeout;

  function restoreReady() {
    ready = true;
  }

  return function(...args: any) {
    if (ready) {
      func(...args);
      ready = false;
      timeout = setTimeout(restoreReady, ms);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(restoreReady, ms);
    }
  };
}

window.addEventListener('load', () => {
  attachScrollListener(
    '[data-scroll-up]',
    c => c.dataset.scrollUp!,
    e => e.deltaY < 0
  );

  attachScrollListener(
    '[data-scroll-down]',
    c => c.dataset.scrollDown!,
    e => e.deltaY > 0
  );

  attachObserver('[data-observed]');
});

function attachObserver(selector: string) {
  const observer = new IntersectionObserver(
    entries =>
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as any).click();
        }
      }),
    { root: null, threshold: 1.0 }
  );

  document.querySelectorAll(selector).forEach(element => {
    observer.observe(element);
  });
}

function attachScrollListener(
  containerSelector: string,
  getSelector: (e: HTMLElement) => string,
  shouldTrigger: (event: WheelEvent) => boolean
) {
  document.querySelectorAll(containerSelector).forEach(container => {
    if (!(container instanceof HTMLElement)) {
      return console.error(
        `Element with [${containerSelector}] is not a HTML Element`
      );
    }

    const triggerSelector = getSelector(container);
    if (!triggerSelector) {
      return console.warn(
        `The [${containerSelector}] attribute does not provide any value. Please provide selector.`
      );
    }

    const targets = document.querySelectorAll(triggerSelector);
    if (targets.length === 0) {
      return console.warn(
        `No elements matched the selector provided in [${containerSelector}="${triggerSelector}"].`
      );
    }

    container.addEventListener(
      'wheel',
      throttle(100, (event: WheelEvent) => {
        if (shouldTrigger(event)) {
          targets.forEach(element => {
            (element as any).click();
          });
        }
      })
    );
  });
}
