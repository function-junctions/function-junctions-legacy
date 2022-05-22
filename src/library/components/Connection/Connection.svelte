<style lang="scss" global>
  @import './Connection.scss';
</style>

<script lang="ts">
  import type { Point } from '../../types';

  export let connection: { p1: Point, p2: Point };

  let ref: SVGSVGElement;

  const createConnectionPath = (svg: SVGSVGElement, points: { p1: Point, p2: Point }, curvature = 0.4): void => {
    const computeSVGPath = (points: { p1: Point, p2: Point }, curvature: number): string => {
      const { p1, p2 } = points;
      const { x: x1, y: y1 } = p1;
      const { x: x2, y: y2 } = p2;
    
      const hx1 = x1 - Math.abs(x1 - x2) * curvature;
      const hx2 = x2 + Math.abs(x1 - x2) * curvature;
    
      return `M ${x1} ${y1} C ${hx1} ${y1} ${hx2} ${y2} ${x2} ${y2}`;
    };

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

  $: createConnectionPath(ref, { p1: connection.p1, p2: connection.p2 });
</script>

<svg class="function-junctions-connection" bind:this={ref} />
