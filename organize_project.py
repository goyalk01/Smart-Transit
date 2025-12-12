import os
import shutil

print("🚧 Starting Professional Restructuring...")

def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"📁 Created: {path}")

def move_file(src, dst):
    try:
        if os.path.exists(src):
            # If destination is a folder, create full path
            if not os.path.basename(dst): 
                shutil.move(src, dst)
            else:
                shutil.move(src, dst)
            print(f"📦 Moved: {src} -> {dst}")
        else:
            print(f"⚠️ Skipped (Not found): {src}")
    except Exception as e:
        print(f"❌ Error moving {src}: {e}")

# 1. Create Industry-Standard Directory Hierarchy
directories = [
    "frontend/assets",
    "backend/app/routers",
    "backend/app/core",
    "backend/app/db",
    "backend/tests",
    "simulation/data",
    "ml_engine/models",
    "hardware/face_detection",
    "docs",
    "scripts"
]

for d in directories:
    create_dir(d)

# 2. Frontend Migration
move_file("index.html", "frontend/")
move_file("style.css", "frontend/assets/")
move_file("app.js", "frontend/assets/")

# 3. Backend Migration
# Rename old main.py to keep as backup
if os.path.exists("backend/main.py"):
    os.rename("backend/main.py", "backend/app/main_old.py")
    print("📦 Moved & Renamed: backend/main.py -> backend/app/main_old.py")

move_file("backend/schema.sql", "backend/app/db/")
move_file("backend/docker-compose.yml", "./docker-compose.yml") # Move to root

# 4. Simulation & ML Migration
move_file("bus_simulator.py", "simulation/")
move_file("config.json", "simulation/data/")

# Move face detection files if the folder exists
if os.path.exists("face_detection"):
    for file in os.listdir("face_detection"):
        src_path = os.path.join("face_detection", file)
        if os.path.isfile(src_path):
            move_file(src_path, "hardware/face_detection/")
    # Try to remove empty folder
    try:
        os.rmdir("face_detection")
    except:
        pass

# 5. Scripts
move_file("backend/init_db_data.py", "scripts/")

print("\n✅ Project Structure Updated Successfully!")