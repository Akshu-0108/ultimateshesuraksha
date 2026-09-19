const DOTS = [
  [6, 11, 'tiny', 0], [14, 26, 'small', 2], [22, 8, 'medium', 4], [31, 72, 'tiny', 1],
  [42, 18, 'small', 5], [51, 84, 'large', 3], [62, 37, 'tiny', 6], [70, 14, 'medium', 2],
  [78, 68, 'small', 7], [87, 28, 'tiny', 4], [94, 81, 'medium', 1], [97, 47, 'small', 6],
]

function AmbientDots({ variant = 'light' }) {
  return <div className={`ambient-dots ambient-dots--${variant}`} aria-hidden="true">
    {DOTS.map(([left, top, size, delay]) => <i key={`${left}-${top}`} className={`ambient-dot ambient-dot--${size}`} style={{ left: `${left}%`, top: `${top}%`, '--dot-delay': `${delay * -0.55}s` }} />)}
  </div>
}

export default AmbientDots
