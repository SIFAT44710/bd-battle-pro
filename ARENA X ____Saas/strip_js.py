import sys
import re

def strip_js(filename, new_js_path):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the <script type="module"> block that contains Firebase or large logic
    # and replace it with our external script reference.
    # We will use a regex that finds <script type="module"> up to the end of the file.
    
    # Actually, we should just match from <script type="module"> to </script> where it contains "Firebase Imports"
    pattern = re.compile(r'<script type="module">.*?Firebase Imports.*?</script>', re.DOTALL | re.IGNORECASE)
    
    match = pattern.search(content)
    if match:
        extracted_js = match.group(0)
        # Write extracted JS to a backup file
        with open(filename + '.backup.js', 'w', encoding='utf-8') as f:
            f.write(extracted_js)
            
        new_content = content[:match.start()] + f'<script type="module" src="{new_js_path}"></script>' + content[match.end():]
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Successfully stripped JS from {filename}")
    else:
        # Fallback if specific string not found
        pattern = re.compile(r'<script.*?>.*?</script>', re.DOTALL)
        scripts = pattern.findall(content)
        # Find the largest script
        if scripts:
            largest = max(scripts, key=len)
            if len(largest) > 10000: # 10KB
                new_content = content.replace(largest, f'<script type="module" src="{new_js_path}"></script>')
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Successfully stripped largest JS from {filename}")
            else:
                print("No large script found.")
        else:
            print("No scripts found.")

strip_js('player/dashboard.html', './js/player.js')
strip_js('admin/index.html', './js/admin.js')
