export class Touch {
  private touches = new Array();
  constructor(public canvas: HTMLCanvasElement) {
    canvas.addEventListener("touchstart", (e) => this.touchStartCallback(e), false);
    canvas.addEventListener("touchend", (e) => this.touchEndCallback(e), false);
    canvas.addEventListener("touchcancel", (e) => this.touchCancelCallback(e), false);
    canvas.addEventListener("touchmove", (e) => this.touchMoveCallback(e), false);
  }
  touchStartCallback(e: TouchEvent) {
    this.touches.push(this.copyTouch(e.changedTouches));

  }
  touchEndCallback(e: TouchEvent) {

  }
  touchCancelCallback(e: TouchEvent) {

  }
  touchMoveCallback(e: TouchEvent) {

  }

  private copyTouch(touch) {
  return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}
}
