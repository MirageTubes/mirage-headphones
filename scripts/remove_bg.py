from PIL import Image
from collections import deque
import sys

SRC = r"C:/Users/Mirag/nothing-headphones/public/images/product/nothing.jpg"
DST = r"C:/Users/Mirag/nothing-headphones/public/images/product/nothing.png"

TOL = 28           # per-channel colour tolerance from the seed sample
FEATHER = 2        # soft edge in pixels


def remove_bg(src: str, dst: str) -> None:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    r0, g0, b0, _ = px[0, 0]

    alpha = [[255] * w for _ in range(h)]
    visited = [[False] * w for _ in range(h)]

    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    q: deque[tuple[int, int]] = deque()
    for x, y in seeds:
        q.append((x, y))
        visited[y][x] = True

    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        if abs(r - r0) <= TOL and abs(g - g0) <= TOL and abs(b - b0) <= TOL:
            alpha[y][x] = 0
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                    visited[ny][nx] = True
                    q.append((nx, ny))

    # Feather the alpha edge so antialiased pixels along the headphone silhouette
    # blend to transparent instead of leaving a hard white halo.
    for _ in range(FEATHER):
        new_alpha = [row[:] for row in alpha]
        for y in range(h):
            for x in range(w):
                if alpha[y][x] == 255:
                    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                        if 0 <= nx < w and 0 <= ny < h and alpha[ny][nx] == 0:
                            new_alpha[y][x] = 128
                            break
        alpha = new_alpha

    out = Image.new("RGBA", (w, h))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            op[x, y] = (r, g, b, alpha[y][x])

    out.save(dst, "PNG", optimize=True)
    print(f"wrote {dst} ({w}x{h})")


if __name__ == "__main__":
    remove_bg(SRC, DST)
