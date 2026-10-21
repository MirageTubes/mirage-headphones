from pathlib import Path
from rembg import remove, new_session

input_folder = Path("public/images/headphones-sequence")
output_folder = Path("public/images/headphones-transparent")

output_folder.mkdir(parents=True, exist_ok=True)

frames = sorted(input_folder.glob("*.jpg"))

session = new_session("u2net")

print(f"Found {len(frames)} frames.")

for index, frame in enumerate(frames, start=1):
    output_path = output_folder / f"{frame.stem}.png"

    if output_path.exists():
        print(f"Skipping {frame.name} — already processed")
        continue

    with open(frame, "rb") as file:
        image_data = file.read()

    result = remove(image_data, session=session)

    with open(output_path, "wb") as file:
        file.write(result)

    print(f"Processed {index}/{len(frames)}: {frame.name}")

print("All frames processed successfully!")