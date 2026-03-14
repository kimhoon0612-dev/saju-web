import subprocess

def run_git():
    # 1. Add all
    subprocess.run(["git", "add", "."])
    
    # 2. Commit safely without string quoting hell
    subprocess.run(["git", "commit", "-m", "fix: bypass Vercel proxy timeout by using absolute Render URL for auth API calls in BirthDataForm, and handle HTML error responses gracefully", "--allow-empty"])
    
    # 3. Push
    subprocess.run(["git", "push"])

if __name__ == "__main__":
    run_git()
