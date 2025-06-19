import React from "react"

const CircuitBackground: React.FC = () => (
    <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
        <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b42ca" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#c476eb" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#9C5AA6" stopOpacity="0.6" />
            </linearGradient>
        </defs>

        {/* Líneas horizontales */}
        <g className="circuit-lines">
            <path
                d="M0,100 H1000 M0,300 H1000 M0,500 H1000 M0,700 H1000 M0,900 H1000"
                stroke="#5E3583"
                strokeWidth="1"
                strokeOpacity="0.3"
            />
        </g>

        {/* Líneas verticales */}
        <g className="circuit-lines">
            <path
                d="M100,0 V1000 M300,0 V1000 M500,0 V1000 M700,0 V1000 M900,0 V1000"
                stroke="#5E3583"
                strokeWidth="1"
                strokeOpacity="0.3"
            />
        </g>

        {/* Caminos de circuito animados */}
        <g className="circuit-paths">
            {/* Camino 1 */}
            <path
                id="circuit-path-1"
                className="circuit-path"
                d="M0,100 H300 L400,200 H700 L800,300 V700 L700,800 H300 L200,700 V500 L100,400 V200 L0,100"
                stroke="url(#circuitGradient)"
                strokeWidth="2"
                fill="none"
            />
            <circle r="7" fill="#fff" opacity="0.9">
                <animateMotion dur="30s" repeatCount="indefinite">
                    <mpath href="#circuit-path-1" />
                </animateMotion>
            </circle>
            {/* Camino 2 */}
            <path
                id="circuit-path-2"
                className="circuit-path"
                d="M1000,300 H700 L600,400 V600 L500,700 H200 L100,800 V1000"
                stroke="url(#circuitGradient)"
                strokeWidth="2"
                fill="none"
                style={{ animationDelay: "-5s" }}
            />
            <circle r="7" fill="#fff" opacity="0.9">
                <animateMotion dur="30s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" begin="-5s">
                    <mpath href="#circuit-path-2" />
                </animateMotion>
            </circle>
            {/* Camino 3 */}
            <path
                id="circuit-path-3"
                className="circuit-path"
                d="M500,0 V200 L600,300 H900 L1000,400"
                stroke="url(#circuitGradient)"
                strokeWidth="2"
                fill="none"
                style={{ animationDelay: "-10s" }}
            />
            <circle r="7" fill="#fff" opacity="0.9">
                <animateMotion dur="30s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" begin="-10s">
                    <mpath href="#circuit-path-3" />
                </animateMotion>
            </circle>
            {/* Camino 4 */}
            <path
                id="circuit-path-4"
                className="circuit-path"
                d="M0,600 H200 L300,500 H600 L700,400 V200 L800,100 H1000"
                stroke="url(#circuitGradient)"
                strokeWidth="2"
                fill="none"
                style={{ animationDelay: "-10s" }}
            />
            <circle r="7" fill="#fff" opacity="0.9">
                <animateMotion dur="30s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" begin="-10s">
                    <mpath href="#circuit-path-4" />
                </animateMotion>
            </circle>
            {/* Camino diagonal */}
            <path
                id="circuit-path-5"
                className="circuit-path"
                d="M0,0 L1000,1000 M1000,0 L0,1000"
                stroke="url(#circuitGradient)"
                strokeWidth="1"
                strokeOpacity="0.5"
                fill="none"
                style={{ animationDelay: "-7s" }}
            />
            <circle r="5" fill="#fff" opacity="0.7">
                <animateMotion dur="30s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" begin="-7s">
                    <mpath href="#circuit-path-5" />
                </animateMotion>
            </circle>
        </g>

        {/* Nodos de circuito */}
        <g className="circuit-nodes">
            {[
                [ 100, 100 ],
                [ 300, 300 ],
                [ 500, 500 ],
                [ 700, 700 ],
                [ 900, 900 ],
                [ 200, 800 ],
                [ 800, 200 ],
                [ 400, 600 ],
                [ 600, 400 ],
            ].map(([ x, y ], i) => (
                <g key={i} className="circuit-node" style={{ animationDelay: `${i * 0.3}s` }}>
                    <circle cx={x} cy={y} r="6" fill="#5E3583" fillOpacity="0.8" />
                    <circle cx={x} cy={y} r="10" stroke="#c95dff" strokeWidth="1" fill="none" />
                </g>
            ))}
        </g>

        {/* Componentes de circuito */}
        <g className="circuit-components">
            {/* Chip 1 */}
            <rect x="400" y="200" width="80" height="40" rx="5" fill="#1a1a2e" stroke="#5E3583" strokeWidth="1" />
            <line x1="400" y1="210" x2="380" y2="210" stroke="#5E3583" strokeWidth="1" />
            <line x1="400" y1="230" x2="380" y2="230" stroke="#5E3583" strokeWidth="1" />
            <line x1="480" y1="210" x2="500" y2="210" stroke="#5E3583" strokeWidth="1" />
            <line x1="480" y1="230" x2="500" y2="230" stroke="#5E3583" strokeWidth="1" />
            {/* Chip 2 */}
            <rect x="600" y="600" width="80" height="40" rx="5" fill="#1a1a2e" stroke="#5E3583" strokeWidth="1" />
            <line x1="600" y1="610" x2="580" y2="610" stroke="#5E3583" strokeWidth="1" />
            <line x1="600" y1="630" x2="580" y2="630" stroke="#5E3583" strokeWidth="1" />
            <line x1="680" y1="610" x2="700" y2="610" stroke="#5E3583" strokeWidth="1" />
            <line x1="680" y1="630" x2="700" y2="630" stroke="#5E3583" strokeWidth="1" />
            {/* Resistencias */}
            <rect x="200" y="400" width="30" height="10" fill="#5E3583" fillOpacity="0.8" />
            <rect x="700" y="300" width="30" height="10" fill="#5E3583" fillOpacity="0.8" />
            <rect x="500" y="800" width="30" height="10" fill="#5E3583" fillOpacity="0.8" />
            {/* Capacitores */}
            <g>
                <line x1="350" y1="650" x2="350" y2="670" stroke="#5E3583" strokeWidth="6" />
                <line x1="360" y1="650" x2="360" y2="670" stroke="#5E3583" strokeWidth="6" />
            </g>
            <g>
                <line x1="850" y1="450" x2="850" y2="470" stroke="#5E3583" strokeWidth="6" />
                <line x1="860" y1="450" x2="860" y2="470" stroke="#5E3583" strokeWidth="6" />
            </g>
        </g>

        {/* Patrones de datos */}
        <g className="data-patterns">
            <text
                x="420"
                y="225"
                fontFamily="monospace"
                fontSize="10"
                fill="#7B4397"
                opacity="0.8"
                className="circuit-path"
                style={{ animationDelay: "-3s" }}
            >
                10110101
            </text>
            <text
                x="620"
                y="625"
                fontFamily="monospace"
                fontSize="10"
                fill="#7B4397"
                opacity="0.8"
                className="circuit-path"
                style={{ animationDelay: "-8s" }}
            >
                01001101
            </text>
        </g>
    </svg>
)

export default CircuitBackground 