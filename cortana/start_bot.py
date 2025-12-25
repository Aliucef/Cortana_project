"""
Safe bot starter - ensures only one instance runs
"""
import sys
import os
import psutil
import signal

def kill_existing_instances():
    """Kill any existing Python processes running main.py"""
    current_pid = os.getpid()
    killed = 0

    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            # Check if it's a Python process
            if proc.info['name'] and 'python' in proc.info['name'].lower():
                # Check if it's running main.py
                cmdline = proc.info.get('cmdline')
                if cmdline and 'main.py' in ' '.join(cmdline):
                    # Don't kill ourselves
                    if proc.info['pid'] != current_pid:
                        print(f"Killing existing instance (PID: {proc.info['pid']})")
                        proc.terminate()
                        proc.wait(timeout=5)
                        killed += 1
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

    if killed > 0:
        print(f"Killed {killed} existing instance(s)")
    else:
        print("No existing instances found")

if __name__ == "__main__":
    print("Checking for existing bot instances...")
    kill_existing_instances()

    print("\nStarting Cortana AI Assistant...")

    # Import and run main
    import main
