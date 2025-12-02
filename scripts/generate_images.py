import os
from PIL import Image, ImageDraw, ImageFont
import random
import shutil

def create_image(folder, filename, text, color):
    # Ensure directory exists
    if not os.path.exists(folder):
        os.makedirs(folder)
    
    # Create an image
    img = Image.new('RGB', (800, 600), color=color)
    d = ImageDraw.Draw(img)
    
    # Try to use a default font, otherwise load a simple one
    try:
        font = ImageFont.truetype("arial.ttf", 80)
    except IOError:
        font = ImageFont.load_default()
    
    # Calculate text position
    text_bbox = d.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    x = (800 - text_width) / 2
    y = (600 - text_height) / 2
    
    d.text((x, y), text, fill=(255, 255, 255), font=font)
    
    img.save(os.path.join(folder, filename))
    print(f"Created {filename} in {folder}")

fruits = [
    "Alma", "Körte", "Banán", "Narancs", "Citrom", 
    "Eper", "Málna", "Szőlő", "Barack", "Szilva", 
    "Cseresznye", "Meggy", "Ananász", "Kivi", "Dinnye"
]

vegetables = [
    "Répa", "Krumpli", "Hagyma", "Paradicsom", "Paprika", 
    "Uborka", "Brokkoli", "Karfiol", "Retek", "Zeller", 
    "Cékla", "Káposzta", "Saláta", "Tök", "Padlizsán"
]

base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

# Clean existing data to avoid duplicates with old names
if os.path.exists(base_dir):
    shutil.rmtree(base_dir)
os.makedirs(base_dir)

# Generate Fruits
fruit_dir = os.path.join(base_dir, "Gyümölcsök")
for i, fruit in enumerate(fruits):
    # Format: 01_Alma.jpg, 15_Dinnye.jpg
    prefix = f"{i+1:02d}"
    filename = f"{prefix}_{fruit}.jpg"
    color = (random.randint(50, 150), random.randint(0, 50), random.randint(50, 150)) # Darker/Purple tones
    create_image(fruit_dir, filename, fruit, color)

# Generate Vegetables
veg_dir = os.path.join(base_dir, "Zöldségek")
for i, veg in enumerate(vegetables):
    prefix = f"{i+1:02d}"
    filename = f"{prefix}_{veg}.jpg"
    color = (random.randint(0, 50), random.randint(50, 150), random.randint(0, 50)) # Darker/Green tones
    create_image(veg_dir, filename, veg, color)

print("Test images generated successfully with new naming convention.")
