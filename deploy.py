import subprocess

def run_git():
    # 1. Add all
    subprocess.run(["git", "add", "."])
    
    # 2. Commit safely without string quoting hell
    subprocess.run(["git", "commit", "-m", "fix: refactor birth data form layout styling and fix submit button disabled logic"])
    
    # 3. Push
    subprocess.run(["git", "push"])

if __name__ == "__main__":
    run_git()
