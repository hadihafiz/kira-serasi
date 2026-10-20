/** Decorative hand-drawn doodles in the margins (purely visual). */
export default function Doodles() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg className="pencil absolute top-8 right-10 hidden w-20 rotate-12 opacity-80 sm:block" viewBox="0 0 64 64">
        <path d="M32 54C14 40 8 29 13 21c4-7 14-6 19 2 5-8 15-9 19-2 5 8-1 19-19 31z" fill="none" stroke="var(--color-pencil-red)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 25c1-3 4-5 8-4" fill="none" stroke="var(--color-pencil-orange)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <svg className="pencil absolute bottom-24 left-6 hidden w-12 -rotate-12 opacity-70 sm:block" viewBox="0 0 64 64">
        <path d="M32 6l7 17 18 2-14 12 5 18-16-10-16 10 5-18L7 25l18-2z" fill="none" stroke="var(--color-pencil-yellow)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg className="pencil absolute top-1/3 right-2 hidden w-16 opacity-60 md:block" viewBox="0 0 80 40">
        <path d="M4 20c8-16 16-16 24 0s16 16 24 0 16-16 24 0" fill="none" stroke="var(--color-pencil-blue)" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      <svg className="pencil absolute bottom-6 right-6 w-12 rotate-6 opacity-70" viewBox="0 0 64 64">
        <path d="M32 32m0 0c0-4 4-4 4 0s-8 8-8 0 12-12 12 0-16 16-16 0 20-20 20 0" fill="none" stroke="var(--color-pencil-purple)" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
