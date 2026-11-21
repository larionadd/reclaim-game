from pathlib import Path

out = Path(__file__).resolve().parents[1] / 'public/art/goods'
out.mkdir(parents=True, exist_ok=True)

shapes = {
    'droneFrame': '<path d="M80 83 49 54m31 29 31-29M80 83 49 112m31-29 31 29"/><rect x="65" y="68" width="30" height="30" rx="6"/><circle cx="45" cy="51" r="9"/><circle cx="115" cy="51" r="9"/><circle cx="45" cy="115" r="9"/><circle cx="115" cy="115" r="9"/>',
    'droneBattery': '<rect x="43" y="57" width="74" height="54" rx="8"/><path d="M55 57v-9h14v9m22 0v-9h14v9M61 85h13m-6-6v13m23-7h13"/><path d="M81 68 69 89h13l-5 17 17-26H80z" fill="#c69b54" stroke="none"/>',
    'droneMotors': '<circle cx="53" cy="82" r="22"/><circle cx="107" cy="82" r="22"/><circle cx="53" cy="82" r="8"/><circle cx="107" cy="82" r="8"/><path d="M37 60V45h32v15m22 0V45h32v15M37 104v12h32v-12m22 0v12h32v-12"/>',
    'dronePropellers': '<circle cx="80" cy="82" r="11"/><path d="M76 71C49 34 28 50 53 70l16 10M91 78c44-17 46-42 13-34L84 69M84 92c16 43 41 42 33 10L94 85M70 86c-39 12-41 38-10 35l18-26"/>',
    'droneController': '<rect x="43" y="48" width="74" height="70" rx="6"/><rect x="58" y="65" width="44" height="36" rx="3"/><path d="M54 48V35m16 13V35m20 13V35m16 13V35M54 118v13m16-13v13m20-13v13m16-13v13M43 60H30m13 18H30m13 18H30m87-36h-13m13 18h-13m13 18h-13"/>',
    'droneCamera': '<rect x="39" y="56" width="82" height="57" rx="8"/><circle cx="81" cy="85" r="22"/><circle cx="81" cy="85" r="10"/><path d="M52 56 62 44h34l10 12M42 113l-10 12m86-12 10 12"/>',
    'droneRadio': '<rect x="48" y="62" width="64" height="53" rx="6"/><path d="M58 62 43 31m59 31 15-31M80 62V40M58 92h44m-44 12h26"/><circle cx="95" cy="104" r="4" fill="#c69b54"/>',
}

for name, shape in shapes.items():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#333c2b"/><stop offset="1" stop-color="#141b16"/></linearGradient></defs>
<rect width="160" height="160" rx="14" fill="url(#bg)"/><rect x="9" y="9" width="142" height="142" rx="9" fill="none" stroke="#705f39"/>
<g fill="#4f5c4b" stroke="#d9b475" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">{shape}</g>
</svg>'''
    (out / f'{name}.svg').write_text(svg, encoding='utf-8')
