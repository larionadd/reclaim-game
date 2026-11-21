"""Generate one consistent SVG illustration for every medical procedure."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'src/data/medical/procedures.json'
OUT = ROOT / 'public/art/procedures'
OUT.mkdir(parents=True, exist_ok=True)

HEAD = '<path d="M312 93c-42 0-69 29-69 67 0 23 10 41 26 55 11 10 15 19 15 29v19h62v-19c0-10 5-20 16-29 17-15 27-34 27-55 0-38-31-67-77-67Z"/><path d="M283 276h63m-51 17h51"/>'
LEG = '<path d="M283 86h79l-9 89-23 48-5 67 42 16v19h-99v-25l28-18 5-65-20-43Z"/><path d="M282 176h70m-51 42h30m-34 71h66"/>'
ARM = '<path d="M277 90c-15 0-24 11-23 28l12 91 23 22 6 66h44l8-65 27-34 6-70c1-16-8-27-22-27-12 0-21 9-23 21l-5 31-9-43c-3-12-14-20-25-20Z"/><path d="M268 209l72 13m-47 20h49m-38 39h31"/>'
EYES = '<path d="M170 180c41-53 102-53 143 0-41 52-102 52-143 0Zm157 0c41-53 102-53 143 0-41 52-102 52-143 0Z"/><circle cx="241" cy="180" r="25"/><circle cx="399" cy="180" r="25"/><circle cx="241" cy="180" r="9" fill="#d0a15e"/><circle cx="399" cy="180" r="9" fill="#d0a15e"/>'
TORSO = '<path d="M251 102c13 18 32 24 69 24s56-6 69-24l23 56-15 129H243l-15-129Z"/><path d="M260 191c19-15 39-15 60-2 21-13 41-13 60 2m-60-64v130"/>'
VIAL = '<path d="M275 99h90v28h-90Zm15 29v22l-25 34v88c0 14 10 23 23 23h64c13 0 23-9 23-23v-88l-25-34v-22m-84 93h108m-63 41h26"/>'

def icon(key):
    if key == 'support_brace': return LEG+'<path class="accent" d="M278 176v108m80-108v108m-77-81h75m-72 58h70"/><circle cx="319" cy="221" r="14"/>'
    if key == 'functional_prosthesis': return LEG+'<path class="accent" d="M302 219h41m-21 0v72m-30-67 62 58m-48 10h54"/><circle cx="322" cy="219" r="18"/>'
    if key == 'diagnostic_neural_interface': return HEAD+'<path class="accent" d="M276 145h26l19 21 26-26m-70 61h28l21-21 28 12m-33-27v59"/><circle cx="321" cy="166" r="13"/>'
    if key == 'powered_arm': return ARM+'<path class="accent" d="M286 180h76m-62 47h43m-22-47v47m-18 42 34-11"/><circle cx="321" cy="205" r="17"/>'
    if key == 'synthetic_lung': return '<path d="M320 94v99m0-50c-28-37-43-26-58-14-38 28-63 89-55 136 8 36 47 40 72 15 15-15 27-38 41-51m0-86c28-37 43-26 58-14 38 28 63 89 55 136-8 36-47 40-72 15-15-15-27-38-41-51"/><path class="accent" d="M232 184c-8 19-12 37-12 57m200-57c8 19 12 37 12 57M250 260l37-30m103 30-37-30"/>'
    if key == 'synthetic_heart': return '<path d="M320 288c-58-47-106-80-106-129 0-39 28-62 59-62 23 0 39 12 47 29 8-17 24-29 47-29 31 0 59 23 59 62 0 49-48 82-106 129Z"/><path d="M245 195h38l18-31 18 63 20-32h54"/><circle class="accent" cx="320" cy="191" r="31"/>'
    if key == 'replacement_eyes': return EYES+'<path class="accent" d="M241 140v-24m158 24v-24m-158 105v24m158-24v24"/>'
    if key.startswith('replacement_') and ('arm' in key or 'leg' in key):
        x=269 if 'left' in key else 372
        return (ARM if 'arm' in key else LEG)+f'<path class="accent" d="M{x} 104v182m-11-91h22m-11-11v22"/><circle class="accent" cx="{x}" cy="195" r="24"/>'
    if key in ('breast_replacement','breast_enlargement'):
        result=TORSO+'<circle class="accent" cx="280" cy="198" r="25"/><circle class="accent" cx="360" cy="198" r="25"/>'
        return result+('<path class="accent" d="M280 174v48m80-48v48"/>' if key=='breast_replacement' else '<path class="accent" d="M201 205h35m-17-17v35m185-18h35m-17-17v35"/>')
    if key == 'oviposition_uterus': return '<path d="M231 137c4 28 25 40 54 42 6 39 19 69 35 87 16-18 29-48 35-87 29-2 50-14 54-42m-178 0-20-18m198 18 20-18M278 178c5-31 19-42 42-42s37 11 42 42"/><ellipse class="accent" cx="320" cy="206" rx="23" ry="31"/><path class="accent" d="M320 170v68"/>'
    if key == 'lactation_hormones': return VIAL+'<path class="accent" d="M320 172c0 20-23 39-23 57 0 15 10 25 23 25s23-10 23-25c0-18-23-37-23-57Z"/>'
    if key == 'hair_growth_hormones': return HEAD+'<path class="accent" d="M251 153q16-69 67-71 58 2 64 71m-119-39-18-24m56-3-3-27m52 29 17-25m-75 65 5-27m37 26 10-28"/>'
    if key == 'hair_loss_hormones': return HEAD+'<path class="accent" stroke-dasharray="8 11" d="M249 148q21-66 69-64 54 3 65 64m-85-57-13-27m49 27 13-27"/>'
    if key == 'weight_gain_hormones': return VIAL+'<path class="accent" d="M188 268h73m-36 0v-80m-20 20 20-20 20 20m149 60h73m-36 0v-80m-20 20 20-20 20 20"/>'
    raise ValueError(key)

def illustration(key,index):
    tint=['#a4b9a0','#a6bcb0','#afb69a','#b5ac93'][index%4]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#2a3830"/><stop offset="1" stop-color="#111b18"/></linearGradient><radialGradient id="halo"><stop stop-color="#526a4d" stop-opacity=".54"/><stop offset="1" stop-color="#17231e" stop-opacity="0"/></radialGradient><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#b6b08c" opacity=".08"/></pattern></defs><rect width="640" height="360" fill="url(#bg)"/><rect width="640" height="360" fill="url(#grid)"/><circle cx="320" cy="180" r="170" fill="url(#halo)"/><path d="M28 28h94m-94 0v72m584-72h-94m94 0v72M28 332h94m-94 0v-72m584 72h-94m94 0v-72" stroke="#be9864" stroke-width="2" opacity=".8" fill="none"/><circle cx="320" cy="180" r="139" fill="#1f3029" fill-opacity=".42" stroke="#8f8766" stroke-width="2"/><circle cx="320" cy="180" r="124" fill="none" stroke="#c4b387" opacity=".36" stroke-width="1" stroke-dasharray="3 11"/><g fill="none" stroke="{tint}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"><style>.accent{{stroke:#d7a966;stroke-width:7;fill:none}}</style>{icon(key)}</g><path d="M32 307h73m430 0h73" stroke="#be9864" opacity=".7"/><circle cx="86" cy="307" r="4" fill="#d9af6d"/><circle cx="554" cy="307" r="4" fill="#d9af6d"/></svg>'''

rows=json.loads(DATA.read_text(encoding='utf-8'))
for index,row in enumerate(rows):
    filename=f"{row['id']}.svg"
    (OUT/filename).write_text(illustration(row['id'],index),encoding='utf-8')
    row['image']=f'/art/procedures/{filename}'
DATA.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Wrote {len(rows)} medical illustrations')

