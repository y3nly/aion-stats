"""Package the static calculator for the combined Aion tools host."""
from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parent
if __name__=='__main__':
    out=ROOT/'dist'
    out.mkdir(exist_ok=True)
    for name in ('index.html','model.js','app.js','style.css'):
        shutil.copyfile(ROOT/name,out/name)
    print(f'Built {out}')
