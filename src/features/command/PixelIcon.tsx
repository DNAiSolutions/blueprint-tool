import { getIcon } from "./data/icons";

type Props = {
  name: string;
  size?: number;
  color?: string;
  className?: string;
};

export function PixelIcon({ name, size = 24, color, className }: Props) {
  const icon = getIcon(name);
  const tint = color || icon.c;
  const pixelSize = size / 8;
  const cells: JSX.Element[] = [];
  icon.p.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell) return;
      // left half
      cells.push(
        <rect key={`l-${x}-${y}`} x={x * pixelSize} y={y * pixelSize} width={pixelSize} height={pixelSize} fill={tint} />
      );
      // mirrored right half
      cells.push(
        <rect key={`r-${x}-${y}`} x={(7 - x) * pixelSize} y={y * pixelSize} width={pixelSize} height={pixelSize} fill={tint} />
      );
    });
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      className={className}
    >
      {cells}
    </svg>
  );
}
