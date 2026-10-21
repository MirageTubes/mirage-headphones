// Generated from /images/design-character.jpg (853×1280). Coordinates are in
// source-image pixels so they scale with the SVG viewBox at any display size.
export const CHAMELEON_SIZE = { w: 853, h: 1280 } as const;

export type ChameleonEye = {
  id: "left" | "right";
  cx: number;
  cy: number;
  r: number;
  iris: { src: string; x: number; y: number; w: number; h: number };
  socket: { src: string; x: number; y: number; w: number; h: number };
  opening: string;
};

export const CHAMELEON_EYES: readonly ChameleonEye[] = [
  {
    id: "left",
    // Iris centre and radius, in source-image pixels
    cx: 228.0,
    cy: 583.79,
    r: 59.68,
    // Iris/pupil layer (full disc, reconstructed under the lids)
    iris: { src: "/images/chameleon/iris-left.png", x: 151, y: 507, w: 154, h: 153 },
    // Sclera patch that conceals the original iris inside the eye opening
    socket: { src: "/images/chameleon/socket-left.jpg", x: 121, y: 562, w: 176, h: 98 },
    // Visible eye opening; everything outside it (lids, face) stays untouched
    opening: "M133.1 612.2 L136.9 607.8 L140.7 603.7 L144.6 599.8 L148.6 596.1 L152.7 592.7 L156.8 589.5 L161.0 586.5 L165.3 583.8 L169.7 581.2 L174.1 578.9 L178.7 576.8 L183.3 574.8 L188.0 573.0 L192.7 571.3 L197.6 569.9 L202.5 568.6 L207.5 567.4 L212.4 566.5 L217.3 565.7 L222.0 565.0 L226.7 564.6 L231.3 564.3 L235.9 564.1 L240.3 564.2 L244.7 564.3 L248.9 564.6 L253.0 564.9 L256.9 565.2 L260.6 565.6 L264.2 566.1 L267.7 566.6 L270.9 567.2 L274.1 567.8 L277.0 568.6 L279.7 569.5 L282.1 570.6 L284.4 571.9 L286.4 573.3 L288.2 574.8 L289.8 576.6 L291.2 578.4 L292.3 580.5 L293.1 582.7 L293.7 585.0 L294.0 587.5 L294.1 590.2 L293.9 593.0 L293.4 595.9 L292.6 599.1 L291.7 602.1 L290.5 605.1 L289.1 608.0 L287.4 610.8 L285.6 613.5 L283.5 616.2 L281.2 618.8 L278.8 621.2 L276.2 623.7 L273.5 626.0 L270.8 628.3 L268.0 630.5 L265.1 632.6 L262.1 634.6 L259.1 636.6 L255.9 638.4 L252.7 640.2 L249.5 642.0 L246.1 643.6 L242.7 645.2 L239.1 646.6 L235.5 648.0 L231.9 649.4 L228.1 650.6 L224.3 651.8 L220.4 652.8 L216.4 653.7 L212.3 654.5 L208.2 655.1 L204.0 655.7 L199.7 656.1 L195.3 656.4 L191.0 656.6 L186.8 656.7 L182.7 656.6 L178.6 656.5 L174.6 656.2 L170.7 655.8 L166.9 655.3 L163.1 654.7 L159.5 654.0 L156.1 653.2 L152.8 652.3 L149.7 651.4 L146.7 650.4 L143.9 649.3 L141.2 648.1 L138.8 646.9 L136.4 645.5 L134.2 644.1 L132.2 642.7 L130.3 641.1 L128.6 639.5 L127.0 637.7 L125.6 635.9 L124.4 634.1 L123.8 631.9 L123.8 629.4 L124.4 626.6 L125.6 623.4 L127.5 620.0 L130.0 616.2 Z",
  },
  {
    id: "right",
    // Iris centre and radius, in source-image pixels
    cx: 606.74,
    cy: 514.37,
    r: 65.85,
    // Iris/pupil layer (full disc, reconstructed under the lids)
    iris: { src: "/images/chameleon/iris-right.png", x: 524, y: 432, w: 166, h: 165 },
    // Sclera patch that conceals the original iris inside the eye opening
    socket: { src: "/images/chameleon/socket-right.jpg", x: 523, y: 484, w: 211, h: 97 },
    // Visible eye opening; everything outside it (lids, face) stays untouched
    opening: "M535.9 510.1 L539.1 508.4 L542.4 506.8 L546.0 505.1 L549.8 503.5 L553.9 502.0 L558.2 500.4 L562.7 498.9 L567.5 497.5 L572.5 496.0 L577.7 494.7 L583.0 493.5 L588.4 492.3 L594.1 491.3 L599.8 490.4 L605.8 489.5 L611.9 488.8 L618.1 488.2 L624.3 487.7 L630.4 487.3 L636.4 487.1 L642.3 486.9 L648.2 486.9 L654.0 487.1 L659.7 487.3 L665.3 487.7 L670.8 488.2 L676.1 488.8 L681.2 489.6 L686.2 490.4 L691.1 491.4 L695.8 492.6 L700.3 493.8 L704.7 495.2 L708.8 496.5 L712.5 497.9 L715.9 499.2 L719.1 500.5 L721.9 501.8 L724.4 503.1 L726.6 504.4 L728.4 505.6 L729.8 507.0 L730.8 508.6 L731.2 510.3 L731.2 512.2 L730.8 514.2 L729.8 516.4 L728.4 518.8 L726.6 521.2 L724.5 523.8 L722.1 526.5 L719.5 529.2 L716.7 532.0 L713.7 534.9 L710.4 537.9 L706.9 540.9 L703.1 544.1 L699.2 547.0 L695.2 549.8 L690.9 552.5 L686.6 554.9 L682.0 557.2 L677.3 559.4 L672.5 561.3 L667.5 563.2 L662.3 564.9 L657.0 566.6 L651.6 568.2 L645.9 569.8 L640.2 571.3 L634.2 572.7 L628.1 574.1 L621.9 575.4 L615.8 576.5 L609.8 577.4 L604.1 578.0 L598.4 578.4 L593.0 578.6 L587.7 578.5 L582.5 578.2 L577.5 577.8 L572.8 577.2 L568.4 576.5 L564.4 575.8 L560.6 575.0 L557.2 574.2 L554.1 573.3 L551.2 572.3 L548.8 571.2 L546.4 569.9 L544.1 568.4 L542.0 566.7 L539.9 564.8 L538.0 562.6 L536.2 560.2 L534.5 557.7 L533.0 554.8 L531.6 551.9 L530.3 548.9 L529.2 545.8 L528.3 542.6 L527.5 539.3 L526.9 535.8 L526.4 532.3 L526.1 528.7 L526.2 525.3 L526.8 522.2 L527.7 519.3 L529.1 516.6 L531.0 514.2 L533.2 512.0 Z",
  },
];

/**
 * Head motion rig, in source-image pixels. Everything above `fadeStart`
 * (head, crest, headphones, eyes) moves rigidly; the neck between
 * `fadeStart` and `fadeEnd` bends; the body and arms below stay still.
 */
export const CHAMELEON_HEAD = {
  /** Rotation pivot at the base of the neck. */
  pivot: { x: 440, y: 905 },
  /** Point the head "aims" from when looking toward the cursor. */
  center: { x: 430, y: 540 },
  fadeStart: 790,
  fadeEnd: 950,
} as const;
