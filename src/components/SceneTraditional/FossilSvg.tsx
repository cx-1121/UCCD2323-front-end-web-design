import './FossilSvg.module.css';

/**
 * Fossil-energy visual: buried pipes, smokestacks with a flame, two meshing
 * gears, and a pump-jack. Ported verbatim from past_landing_page.html
 * lines 895-947 (as real JSX, not dangerouslySetInnerHTML).
 * `#fossil-flame` and `#fossil-pump-beam` already flicker/swing via plain
 * CSS animation (ported above) in the resting state; the gear rotation and
 * scene-entrance choreography are GSAP-driven and wired up in M2.
 */
function FossilSvg() {
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax meet" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="fire-gradient" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ff3300" />
          <stop offset="60%" stopColor="#ff9900" />
          <stop offset="100%" stopColor="#ffff00" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* 盘根错节管道背景 */}
      <g id="fossil-pipes" opacity={0.25}>
        <path d="M0,520 L400,520 L400,420 L600,420 L600,500 L1000,500" fill="none" stroke="#080505" strokeWidth={14} />
        <path d="M150,520 L150,300 L200,300 L200,520" fill="none" stroke="#080505" strokeWidth={8} />
        <path d="M850,500 L850,280 L800,280 L800,500" fill="none" stroke="#080505" strokeWidth={10} />
      </g>
      {/* 炼油塔与燃烧火焰 */}
      <g id="fossil-stacks">
        <rect x={220} y={240} width={45} height={280} fill="#120c0c" />
        <polygon points="215,240 270,240 260,260 225,260" fill="#120c0c" />
        <path
          id="fossil-flame"
          d="M232,240 C220,215 228,170 242.5,130 C257,170 265,215 253,240 Z"
          fill="url(#fire-gradient)"
        />
        <rect x={150} y={320} width={30} height={200} fill="#0f0909" />
        <rect x={290} y={290} width={25} height={230} fill="#0b0606" />
      </g>
      {/* 咬合齿轮组 */}
      <g id="fossil-gears" transform="translate(620, 480)" fill="#120c0c">
        <g id="fossil-gear-large" style={{ transformOrigin: '0px 0px' }}>
          <circle cx={0} cy={0} r={45} />
          <rect x={-8} y={-55} width={16} height={20} rx={3} />
          <rect x={-8} y={35} width={16} height={20} rx={3} />
          <rect x={-55} y={-8} width={20} height={16} rx={3} />
          <rect x={35} y={-8} width={20} height={16} rx={3} />
          <circle cx={0} cy={0} r={15} fill="#3a0d0d" />
        </g>
        <g id="fossil-gear-small" transform="translate(75, -5)" style={{ transformOrigin: '0px 0px' }}>
          <circle cx={0} cy={0} r={30} />
          <rect x={-6} y={-38} width={12} height={15} rx={2} />
          <rect x={-6} y={23} width={12} height={15} rx={2} />
          <rect x={-38} y={-6} width={15} height={12} rx={2} />
          <rect x={23} y={-6} width={15} height={12} rx={2} />
          <circle cx={0} cy={0} r={10} fill="#3a0d0d" />
        </g>
      </g>
      {/* 抽油机 */}
      <g id="fossil-pumpjack">
        <rect x={680} y={500} width={220} height={20} rx={3} fill="#120c0c" />
        <polygon points="780,500 830,500 805,330" fill="#120c0c" />
        <g id="fossil-pump-beam" style={{ transformOrigin: '805px 330px' }}>
          <line x1={565} y1={330} x2={565} y2={480} stroke="#120c0c" strokeWidth={4} />
          <rect x={560} y={320} width={310} height={20} rx={4} fill="#120c0c" />
          <path d="M540,280 C560,280 575,310 568,350 L560,380 C548,390 535,370 540,280 Z" fill="#120c0c" />
          <line x1={860} y1={330} x2={840} y2={440} stroke="#120c0c" strokeWidth={3} />
        </g>
      </g>
    </svg>
  );
}

export default FossilSvg;
