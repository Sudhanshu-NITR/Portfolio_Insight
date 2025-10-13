import os

root_dir = r"D:\\Portfolio_Insight\\Project\\portfolio-insight\\flask-backend"

with open("folder_contents.txt", "w", encoding="utf-8") as outfile:
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            file_path = os.path.join(root, file)
            outfile.write(f"\n--- {file_path} ---\n")
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    outfile.write(f.read())
            except Exception as e:
                outfile.write(f"[Could not read file: {e}]\n")

print("✅ All file contents saved to folder_contents.txt")
