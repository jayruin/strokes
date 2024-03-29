# Usage

## Basic

```javascript
const render = strokes({ source, format, options });
const { element } = await render(characterString);
// Add element to DOM
```

All supported sources and formats can be retrieved by calling `getSources()` and `getFormats()` respectively. `options` may be omitted if default options retrieved by calling `getFullOptions()` are satisfactory. The string passed into the `render` function should be of length 1.

## Sources

By default, sources are not included. They are included in the dist branch and releases and can be [registered](#custom-source).

- `ja-kanjivg` - Data from [KanjiVG](https://github.com/KanjiVG/kanjivg).
- `zh-hanziwriter` - Data from [Hanzi Writer Data](https://github.com/chanind/hanzi-writer-data) which is based on data from [Make Me A Hanzi](https://github.com/skishore/makemeahanzi).
- Data from [animCJK](https://github.com/parsimonhi/animCJK).
    - `ja-animcjk`
    - `ko-animcjk`
    - `zhHans-animcjk`
    - `zhHant-animcjk`

However, for convenience, a select number of sources are aliased and included. These aliases should NOT be assumed to be stable.

- `ja`: `ja-kanjivg`
- `zh`: `zh-hanziwriter`

## Formats

All formats listed below are included by default:

- `canvas-2d` - Canvas using the [CanvasRenderingContext2D API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D).
- `svg-css` - Animated SVG using [CSS animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations).
- `svg-smil` - Animated SVG using [SMIL](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL).
- `svg-wa` - Animated SVG using the [Web Animation API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API).

## Options

|Property|Type|Default
---|---|---
includeGrid|boolean|false
gridColor|string|#d3d3d3
gridRows|number|2
gridColumns|number|2
includeBackground|boolean|false
backgroundColor|string|#ffffff
includePreview|boolean|false
previewColor|string|#c0c0c0
strokeColor|string|#000000
pauseRatio|number|0.2
totalStrokeDuration|number|1

## Styling

CSS can be used to style elements. For example, `filter: invert(100%)` can be used for dark-mode compatibility. Width or height can be modified with CSS as well.

Normally, using CSS to modify the width or height of any `HTMLCanvasElement` is NOT recommended as the canvas is treated as a raster graphic instead of a vector graphic. Instead, the `width` or `height` properties on the canvas element should be set directly. This has been taken into account and returned canvas elements automatically have a `ResizeObserver` attached, which will automatically adjust the `width` and `height` properly.

## Controlling Playback

The animation returned from the  `render` function exposes functions for controlling playback.

```javascript
const render = strokes({ source, format, options });
const animation = await render(character);
// toggle state
if (animation.isPaused()) {
    animation.resume();
} else {
    animation.pause();
}

// Destructuring is possible as well
const { element, isPaused, pause, resume } = await render(character);
element.addEventListener("click", () => {
    if (isPaused()) {
        resume();
    } else {
        pause();
    }
});
```

## Advanced

If the built-in sources or formats are not enough, you can register a custom one.

See the [API Reference](api-reference.md) for the exact signatures of source and format components.

### Custom Source

A custom source can be registered using
```javascript
registerSource({ source, converter, requester, parser });
```

- `source` is any string value. Existing sources should not be used to avoid conflicts.
- `converter` (optional) is used to convert code points.
    - There are no built-in converters used or included.
    - Can be used to always render simplified characters.
    - Convert from string to code point using `String.prototype.codePointAt()` and code point to string using `String.fromCodePoint()`.
- `requester` takes a code point and returns a `Response` object.
    - Can be used to point to a backup repo if primary repo hosting the data is down.
- `parser` takes a `Response` object and returns the SVG data for that code point.
    - Can be used to modify the stroke width or the stroke/clip paths.

Existing converters/requesters/parsers can be retrieved using:
```javascript
const { converter, requester, parser } = getSourceComponents(source);
```

Example: Creating a custom requester:

```javascript
const customRequester = async (codePoint) => {
    const url = `/url/to/${codePoint}/file`;
    const response = await fetch(url); // Change request headers, body, etc
    // Validate response
    return response;
};
```

Example: Creating a custom parser which extends existing parser by doubling the stroke width:

```javascript
const { parser: existingParser } = getSourceComponents(source);
const customParser = async (response) => {
    const { strokes, transform, viewBox } = await existingParser(response);
    const newStrokes = strokes.map(s => {
        return { ...s, strokeWidth: s.strokeWidth * 2 }
    });
    return { strokes: newStrokes, transform, viewBox };
};
```

### Custom Formats

A custom format can be registered using
```javascript
registerFormat({ format, animator });
```

Built-in animators can be retrieved using:
```javascript
const { animator } = getFormatComponents(format);
```

- Can provide new implementation such as GIF or WebGL
- Can add default styling

Example: Creating a custom animator which extends existing animator by setting default width/height and making element compatible with dark mode:

```javascript
const [width, height] = [360, 360];
const { animator: existingAnimator } = getAnimator(format);
const customAnimator = (character, options) => {
    const animation = existingAnimator(character, options);
    if (animation.element instanceof HTMLCanvasElement) {
        animation.element.width = width;
        animation.element.height = height;
        animation.element.style.filter = "invert(100%)";
    } else if (animation.element instanceof SVGSVGElement) {
        animation.element.style.width = `${width}px`;
        animation.element.style.height = `${height}px`;
        animation.element.style.filter = "invert(100%)";
    }
    return animation;
};
```