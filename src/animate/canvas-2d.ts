import type { AnimationOptions, CanvasAnimator, Canvas2dContextAction, Canvas2dLineInfo, Canvas2dStrokeInfo } from "./types";
import { getPathLength } from "../svg/path";
import { getTransformMatrix } from "../svg/transform";
import { parseViewBox } from "../svg/view-box";

export const FORMAT_CANVAS_2D = "canvas-2d";

const getContextTransform = (transform: string): Canvas2dContextAction => {
    const { a, b, c, d, e, f } = getTransformMatrix(transform);
    return (context: CanvasRenderingContext2D): void => {
        context.transform(a, b, c, d, e, f);
    };
};

const drawLine = (context: CanvasRenderingContext2D, lineInfo: Canvas2dLineInfo): void => {
    context.save();
    context.lineWidth = lineInfo.width;
    context.strokeStyle = lineInfo.color;
    context.beginPath();
    context.moveTo(lineInfo.line.startPoint.x, lineInfo.line.startPoint.y);
    context.lineTo(lineInfo.line.endPoint.x, lineInfo.line.endPoint.y);
    context.stroke();
    context.restore();
};

const drawGrid = (context: CanvasRenderingContext2D, options: AnimationOptions): void => {
    if (!options.includeGrid) {
        return;
    }
    const { width, height } = context.canvas;
    for (let xCount = 1; xCount < options.gridColumns; xCount += 1) {
        const x = width * (xCount / options.gridColumns);
        drawLine(context, {
            line: { startPoint: { x, y: 0 }, endPoint: { x, y: height } },
            width: Math.ceil(width / 100),
            color: options.gridColor,
        });
    }
    for (let yCount = 1; yCount < options.gridRows; yCount += 1) {
        const y = height * (yCount / options.gridRows);
        drawLine(context, {
            line: { startPoint: { x: 0, y }, endPoint: { x: width, y } },
            width: Math.ceil(height / 100),
            color: options.gridColor,
        });
    }
};

const resetCanvas = (context: CanvasRenderingContext2D, options: AnimationOptions): void => {
    const { backgroundColor } = options;
    context.save();
    if (backgroundColor === null) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    } else {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
    context.restore();
    drawGrid(context, options);
};

const drawStroke = (context: CanvasRenderingContext2D, canvasStrokeInfo: Canvas2dStrokeInfo, progress: number): void => {
    context.save();
    const { clipPath, strokePath, strokeWidth, strokePathLength, parsedViewBox, strokeColor, contextTransform } = canvasStrokeInfo;
    context.scale(context.canvas.width / parsedViewBox.width, context.canvas.height / parsedViewBox.height);
    if (contextTransform !== null) {
        contextTransform(context);
    }
    context.fillStyle = "none";
    context.strokeStyle = strokeColor;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = strokeWidth;
    context.setLineDash([strokePathLength * progress, strokePathLength * (1 - progress)]);
    if (clipPath !== null) {
        context.clip(clipPath);
    }
    context.stroke(strokePath);
    context.restore();
};

export const animateStrokesCanvas2d: CanvasAnimator = (character, options) => {
    const { strokes, transform, viewBox } = character;
    const { strokeColor, pauseRatio, totalStrokeDuration } = options;
    const parsedViewBox = parseViewBox(viewBox);
    const contextTransform = transform === null ? null : getContextTransform(transform);
    const canvasStrokeInfos: Canvas2dStrokeInfo[] = strokes.map((stroke) => {
        const { clipPath, strokePath, strokeWidth } = stroke;
        const strokePathLength = getPathLength(strokePath);
        return {
            clipPath: clipPath === null ? null : new Path2D(clipPath),
            strokePath: new Path2D(strokePath),
            strokeWidth,
            strokePathLength,
            parsedViewBox,
            strokeColor,
            contextTransform,
        };
    });
    const canvas = document.createElement("canvas");
    canvas.width = parsedViewBox.width;
    canvas.height = parsedViewBox.height;
    const context = canvas.getContext("2d");
    if (context === null) {
        throw new Error("Cannot get 2d context from canvas.");
    }
    let previousTimestamp: number | null = null;
    let elapsed = 0;
    let paused = false;
    const totalStrokeDurationMs = totalStrokeDuration * 1000;
    const numberOfStrokes = strokes.length;
    const totalDurationMs = totalStrokeDurationMs * numberOfStrokes;
    const draw = (timestamp: number): void => {
        if (paused) {
            previousTimestamp = timestamp;
            window.requestAnimationFrame(draw);
            return;
        }
        if (previousTimestamp === null) {
            previousTimestamp = timestamp;
        }
        elapsed += timestamp - previousTimestamp;
        if (elapsed > totalDurationMs) {
            elapsed = 0;
        }
        resetCanvas(context, options);
        const strokeIndex = Math.trunc(elapsed / totalStrokeDurationMs);
        canvasStrokeInfos.slice(0, strokeIndex)
            .forEach((canvasStrokeInfo) => {
                drawStroke(context, canvasStrokeInfo, 1);
            });
        const progress = Math.min(1, (elapsed % totalStrokeDurationMs) / totalStrokeDurationMs / (1 - pauseRatio));
        drawStroke(context, canvasStrokeInfos[strokeIndex], progress);
        previousTimestamp = timestamp;
        window.requestAnimationFrame(draw);
    };
    window.requestAnimationFrame(draw);
    const reset = (): void => {
        if (!paused) {
            previousTimestamp = null;
            elapsed = 0;
        }
    };
    document.addEventListener("visibilitychange", reset);
    if (options.interactive) {
        const togglePause = (): void => {
            paused = !paused;
        };
        canvas.addEventListener("click", togglePause);
    }
    return canvas;
};
