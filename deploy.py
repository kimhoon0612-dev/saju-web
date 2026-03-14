import subprocess

def run_git():
    # 1. Add all
    subprocess.run(["git", "add", "."])
    
    # 2. Commit safely without string quoting hell
    subprocess.run(["git", "commit", "-m", "feat: Add image upload to partner expert registration form", "--allow-empty"])
    
    # 3. Push
    subprocess.run(["git", "push"])

if __name__ == "__main__":
    run_git()
