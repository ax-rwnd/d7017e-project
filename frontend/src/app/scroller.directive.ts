import { Directive, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[appScroller]'
})

// This directive prevent the parent elements from scrolling when the scroller element scrolls to the bottom or the top
export class ScrollerDirective {

  constructor(private elRef: ElementRef, private renderer: Renderer) {
    renderer.listen(elRef.nativeElement, 'wheel', (e) => {
        const element = elRef.nativeElement;
        const isScrollable = element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;

        if (isScrollable) {
          if (element.scrollTop + element.offsetHeight > element.scrollHeight) {
            if (e.deltaY > 0) {
              e = e || window.event;
            if (e.preventDefault) {
              e.preventDefault();
            }
            e.returnValue = false;
            }
          } else if (element.scrollTop === 0 && e.deltaY < 0) {
            if (e.preventDefault) {
              e.preventDefault();
            }
          }
        }
    });
  }
}
