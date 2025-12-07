import base64
import os
import json

chest_path = r'c:\Users\Rishikesh\PS\AI Based Personal Trainer\frontend\Workout  GIFS\Chest'
shoulder_path = r'c:\Users\Rishikesh\PS\AI Based Personal Trainer\frontend\Workout  GIFS\Shoulder'

gifs_mapping = {
    'Bench Press.gif': None,
    'Dumbell Flies.gif': None,
    'Incline Bench Press.gif': None,
    'Push ups.gif': None,
    'Face Pull.gif': None,
    'Front Raises.gif': None,
    'Lateral Raises.gif': None,
    'Overhead press.gif': None,
}

# Process Chest
for gif_file in os.listdir(chest_path):
    if gif_file.endswith('.gif'):
        filepath = os.path.join(chest_path, gif_file)
        with open(filepath, 'rb') as f:
            encoded = base64.b64encode(f.read()).decode()
        gifs_mapping[gif_file] = f'data:image/gif;base64,{encoded}'
        print(f'✓ {gif_file} ({len(encoded)} chars)')

# Process Shoulder
for gif_file in os.listdir(shoulder_path):
    if gif_file.endswith('.gif'):
        filepath = os.path.join(shoulder_path, gif_file)
        with open(filepath, 'rb') as f:
            encoded = base64.b64encode(f.read()).decode()
        gifs_mapping[gif_file] = f'data:image/gif;base64,{encoded}'
        print(f'✓ {gif_file} ({len(encoded)} chars)')

# Generate JavaScript code
js_code = "// GIF Database - Embedded Base64 GIFs for portability\n"
js_code += "// These GIFs work on any system without file dependencies\n\n"
js_code += "const gifDatabase = {\n"

for name, data_url in gifs_mapping.items():
    if data_url:
        # Create a safe key name
        key_name = name.replace(' ', '_').replace('.gif', '').lower()
        js_code += f"    '{name}': '{data_url}',\n"

js_code += "};\n\n"

# Save to file
output_path = r'c:\Users\Rishikesh\PS\AI Based Personal Trainer\frontend\js\gif_database.js'
with open(output_path, 'w') as f:
    f.write(js_code)

print(f'\n✅ Generated {output_path}')
print(f'File size: {len(js_code)} characters')
