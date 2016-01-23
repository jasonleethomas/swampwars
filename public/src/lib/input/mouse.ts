export class Mouse {
  public mouseClick = false;
  public mousePosition: { x: number, y: number };
  constructor(public canvas: HTMLCanvasElement) {
    //Mouse
    this.canvas.addEventListener('mousemove', (e) => this.mousePositionCallback(e));
    this.canvas.addEventListener('mousedown', (e) => this.mouseDownCallback(e));
    this.canvas.addEventListener('mouseup', (e) => this.mouseUpCallback(e));
  }
  mousePositionCallback(event: MouseEvent) {
    var canvasRect = this.canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = event.clientX - canvasRect.left - root.scrollLeft;
    var mouseY = event.clientY - canvasRect.top - root.scrollTop;
    this.mousePosition = { x: mouseX, y: mouseY };
  }
  mouseDownCallback(event:MouseEvent) {
    this.mouseClick = true;
  }
  mouseUpCallback(event:MouseEvent) {
    this.mouseClick = false;
  }
}
