// Shared-element page transition built on the browser's View Transitions API.
// The photo that has style `view-transition-name: listing-photo` on both pages seems to expand (or shrink) into place.
// Browsers without support, and people who prefer reduced motion, just navigate normally.

export const PHOTO_VT = "listing-photo";

type Doc = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };

function supported(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof (document as Doc).startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Runs `navigate` inside a view transition and resolves once the URL has changed and the new page has painted.
export function withPhotoTransition(navigate: () => void, photo?: HTMLElement | null) {
  if (!supported()) return navigate();

  // Rows in a list share one name at a time: give it to the tapped photo only.
  if (photo) photo.style.viewTransitionName = PHOTO_VT;
  const from = window.location.pathname;
  const old = photo ?? document.querySelector("[data-vt]");

  // Note: while the browser waits on this callback it pauses rendering (and requestAnimationFrame),
  // so poll with timers. Resolve once the new page has mounted its own named photo, or after a short grace period.
  const t = (document as Doc).startViewTransition!(
    () =>
      new Promise<void>((resolve) => {
        navigate();
        const started = performance.now();
        let pathChangedAt = 0;
        const check = () => {
          const now = performance.now();
          if (!pathChangedAt && window.location.pathname !== from) pathChangedAt = now;
          const target = document.querySelector("[data-vt]");
          const mounted = pathChangedAt && target && target !== old;
          if (mounted || (pathChangedAt && now - pathChangedAt > 600) || now - started > 1500) {
            // one more beat so the new page's layout settles
            setTimeout(resolve, 40);
          } else {
            setTimeout(check, 16);
          }
        };
        check();
      }),
  );
  t.finished.finally(() => {
    if (photo) photo.style.viewTransitionName = "";
  });
}
