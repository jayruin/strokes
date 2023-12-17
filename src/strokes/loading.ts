import { svgNS } from "./svg";

export const getPathLength = (pathD: string): number => {
    const path = document.createElementNS(svgNS, "path");
    path.setAttributeNS(null, "d", pathD);
    return Math.ceil(path.getTotalLength());
};
