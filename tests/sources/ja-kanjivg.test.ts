import { parser } from "./ja-kanjivg.source.js";
import { $23383svg } from "./ja-kanjivg.data.js";
import { blobify } from "../test-utils.js";

import { expect, test } from "vitest";

const expected23383 = {
    strokes: [
        {
            clipPath: null,
            strokePath: "M52.73,9.5c1.01,1.01,1.75,2.25,1.75,3.76c0,3.53-0.09,5.73-0.1,8.95",
            strokeWidth: 3,
        },
        {
            clipPath: null,
            strokePath: "M21.88,24c0,3.37-4.06,14.25-5.62,16.5",
            strokeWidth: 3,
        },
        {
            clipPath: null,
            strokePath: "M24.07,26.66c16.68-1.91,42.18-5.28,63-5.78c10.95-0.26,4.68,5.37,0.52,8.4",
            strokeWidth: 3,
        },
        {
            clipPath: null,
            strokePath: "M34.91,36.19c2.09,1.06,4.35,1.5,6.87,1.26c4.73-0.45,19.99-2.86,26.18-4.24c3.17-0.71,4.92,0.67,2.1,3.7c-2.15,2.31-9.34,9.46-14.25,12.73",
            strokeWidth: 3,
        },
        {
            clipPath: null,
            strokePath: "M52.71,51.03c5.42,5.22,9.29,26.84,3.67,43.18c-2.57,7.47-8.5,2.78-10.58,0.81",
            strokeWidth: 3,
        },
        {
            clipPath: null,
            strokePath: "M14.38,63.51c3.88,1.24,8.65,0.84,12.38,0.47c15.18-1.5,43-4.92,59.75-5.41c3.45-0.1,7.13-0.23,10.37,1.15",
            strokeWidth: 3,
        },
    ],
    transform: null,
    viewBox: "0 0 109 109",
};

test.each([
    [23383, $23383svg, expected23383],
])("ja parser handles %s", async (_, base64String, expected) => {
    const blob = blobify(base64String);
    const response = new Response(blob);
    const character = await parser(response);
    expect(character).toEqual(expected);
});