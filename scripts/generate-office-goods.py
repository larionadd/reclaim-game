from pathlib import Path

out = Path('public/art/goods')
out.mkdir(parents=True, exist_ok=True)
shapes = {
    'dogCrate': '<rect x="66" y="82" width="188" height="141" rx="12"/><path d="M93 82v141m32-141v141m32-141v141m32-141v141m32-141v141m-155-32h188"/><path d="M144 223v-57h54v57"/>',
    'dogBed': '<ellipse cx="160" cy="185" rx="112" ry="48"/><ellipse cx="160" cy="176" rx="78" ry="29"/><path d="M64 170c10-50 33-71 96-71s86 21 96 71"/>',
    'leash': '<path d="M97 106c-24-24-38 4-22 19l26 23c15 12 34-6 23-22l-27-20Zm26 42c65 17 63 80 116 64"/><circle cx="244" cy="211" r="14"/>',
    'muzzle': '<path d="M81 145c33-41 125-42 158 0l-17 70H99l-18-70Zm18 4 23 63m16-77 6 79m20-83v84m22-76-6 76m26-67-22 64M81 145l-29-33m187 33 29-33"/>',
    'internalVibrator': '<rect x="124" y="67" width="72" height="183" rx="36"/><path d="M133 185h54m-54 21h54"/><circle cx="160" cy="225" r="6"/>',
    'externalVibrator': '<path d="M110 207c-19-19-17-56 8-74l44-32c31-22 68 18 45 47l-35 43c-19 24-45 33-62 16Z"/><path d="M120 218l-20 28m29-25-17 28"/><circle cx="177" cy="134" r="7"/>',
    'analVibrator': '<path d="M160 72c-23 0-37 20-31 42l13 34-13 50c-6 24 12 35 31 35s37-11 31-35l-13-50 13-34c6-22-8-42-31-42Z"/><path d="M111 240q49-20 98 0v14h-98z"/>',
    'dildo': '<path d="M160 71c-27 0-40 18-40 44v112h80V115c0-26-13-44-40-44Z"/><path d="M102 238h116v17H102z"/>',
    'analPlug': '<path d="M160 72c-20 0-33 15-28 34l16 47-21 52c-8 20 6 31 33 31s41-11 33-31l-21-52 16-47c5-19-8-34-28-34Z"/><path d="M106 238h108v18H106z"/>',
    'gag': '<circle cx="160" cy="160" r="43"/><path d="M117 155 48 139v42l69-16m86-10 69-16v42l-69-16"/><circle cx="160" cy="160" r="15"/>',
    'handcuffs': '<circle cx="105" cy="160" r="39"/><circle cx="215" cy="160" r="39"/><path d="M143 156h34m-34 12h34M90 118v-25h30v25m80 0V93h30v25"/>',
}
for name, drawing in shapes.items():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#3a3328"/><stop offset="1" stop-color="#171e1a"/></linearGradient><linearGradient id="metal" x2="1" y2="1"><stop stop-color="#e8c78a"/><stop offset="1" stop-color="#9c6738"/></linearGradient></defs><rect width="320" height="320" rx="24" fill="url(#bg)"/><path d="M25 268h270" stroke="#6b5940" stroke-width="3"/><g fill="url(#metal)" fill-opacity=".73" stroke="#e6c98f" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">{drawing}</g></svg>'''
    (out / f'{name}.svg').write_text(svg, encoding='utf-8')
