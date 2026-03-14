import subprocess

def run_git():
    # 1. Add all
    subprocess.run(["git", "add", "."])
    
    # 2. Commit safely without string quoting hell
    subprocess.run(["git", "commit", "-m", "fix: dispatch email sending as a BackgroundTask to prevent SMTP from blocking the FastAPI event loop and causing 500 timeouts", "--allow-empty"])
    
    # 3. Push
    subprocess.run(["git", "push"])

if __name__ == "__main__":
    run_git()
