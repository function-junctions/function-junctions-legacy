import { Point } from '../../types';

export const computeSVGPath = (points: { p1: Point, p2: Point }, curvature: number): string => {
  const { p1, p2 } = points;
  const { x: x1, y: y1 } = p1;
  const { x: x2, y: y2 } = p2;

  const hx1 = x1 + Math.abs(x2 - x1) * curvature;
  const hx2 = x2 - Math.abs(x2 - x1) * curvature;

  return `M ${x1} ${y1} C ${hx1} ${y1} ${hx2} ${y2} ${x2} ${y2}`;
};

export const createConnectionPath = (svg: SVGSVGElement, points: { p1: Point, p2: Point }, curvature = 0.4): void => {
  if (svg) {
    let path: SVGPathElement | undefined = svg.getElementsByClassName('main-path')?.[0] as SVGPathElement;

    if (!path) {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('main-path');
    }
  
    path.setAttribute('d', computeSVGPath(points, curvature));
  
    svg.appendChild(path);
  }
};