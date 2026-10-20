/**
 * Shared SVG filters that make strokes and text look like colored pencil on paper.
 * Rendered once in the root layout; referenced via `.pencil` (filter: url(#pencil)).
 */
export default function PencilDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale="3" xChannelSelector="R" yChannelSelector="G" result="shaky" />
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="8" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 2.2" result="grainAlpha" />
          <feComposite in="shaky" in2="grainAlpha" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}
