"""
Batch-strip the background from the 192 scrollytelling frames using rembg
(U2-Net). Output: WebP with alpha, roughly 1/4 the size of PNG+alpha.

Resumes if interrupted — skips frames whose output already exists.
"""
import os
import sys
import time
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

SRC_DIR = Path(r"C:/Users/Mirag/nothing-headphones/public/images/headphones-sequence")
DST_DIR = Path(r"C:/Users/Mirag/nothing-headphones/public/images/headphones-sequence-cut")
MODEL = "isnet-general-use"  # crisper edges than u2net, especially around shadows
WEBP_QUALITY = 82         # 80-85 is a good spot for photographic alpha PNGs
TARGET_WIDTH = 1280       # downsample from 1920 — tiny visual loss, big byte win


def main(argv: list[str]) -> int:
    only = None
    if len(argv) > 1:
        only = int(argv[1])  # process just one frame index for a sanity check

    DST_DIR.mkdir(parents=True, exist_ok=True)
    session = new_session(MODEL)

    frames = sorted(SRC_DIR.glob("*.jpg"))
    if only is not None:
        frames = [SRC_DIR / f"{only:04d}.jpg"]

    total = len(frames)
    done = 0
    skipped = 0
    t0 = time.time()

    for src in frames:
        dst = DST_DIR / (src.stem + ".webp")
        if dst.exists() and only is None:
            skipped += 1
            done += 1
            continue

        with Image.open(src) as im:
            im = im.convert("RGBA")
            if TARGET_WIDTH and im.width > TARGET_WIDTH:
                h = round(im.height * TARGET_WIDTH / im.width)
                im = im.resize((TARGET_WIDTH, h), Image.LANCZOS)
            cut = remove(im, session=session)

        cut.save(dst, "WEBP", quality=WEBP_QUALITY, method=6)
        done += 1
        elapsed = time.time() - t0
        rate = done / elapsed if elapsed > 0 else 0
        eta = (total - done) / rate if rate > 0 else 0
        print(
            f"{done:3d}/{total}  {src.name} -> {dst.name}  "
            f"{dst.stat().st_size/1024:5.1f} KB  "
            f"eta {eta/60:4.1f} min",
            flush=True,
        )

    print(f"done. {done} written, {skipped} skipped, {time.time()-t0:.1f}s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
