from pathlib import Path
try:
    from PIL import Image, ImageDraw  # type: ignore
except ImportError:
    Image = ImageDraw = None  # type: ignore


if Image is None:
    print("Thông báo: Cần cài đặt Pillow nếu muốn chạy script: pip install Pillow")
    import sys
    sys.exit(0)

folder = Path('.report_render')
files = sorted(folder.glob('page-*.png'))
thumbs = []
for file in files:
    image = Image.open(file).convert('RGB')
    image.thumbnail((320, 420))
    canvas = Image.new('RGB', (340, 450), '#dddddd')
    canvas.paste(image, ((340 - image.width) // 2, 20))
    ImageDraw.Draw(canvas).text((10, 430), file.stem, fill='black')
    thumbs.append(canvas)
sheet = Image.new('RGB', (1360, ((len(thumbs) + 3) // 4) * 450), 'white')
for index, image in enumerate(thumbs):
    sheet.paste(image, ((index % 4) * 340, (index // 4) * 450))
sheet.save(folder / 'contact-sheet.jpg', quality=88)
print(f'pages={len(files)}')
