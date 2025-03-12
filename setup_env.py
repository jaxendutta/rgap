#!/usr/bin/env python3

import os
import sys
import subprocess
import platform
from pathlib import Path
import hashlib
import json
import argparse
from typing import Dict, Set

class RGAPEnvironmentSetup:
    def __init__(self, base_dir: str, env_name: str = "venv"):
        self.base_dir = Path(base_dir).resolve()
        self.env_name = env_name
        self.env_dir = self.base_dir / env_name
        self.is_windows = platform.system() == "Windows"
        self.package_groups = {
            "Core": ["pandas", "numpy"],
            "Web": ["requests", "urllib3"],
            "Utilities": ["tqdm", "ipython"],
        }
        self.total_packages = sum(len(packages) for packages in self.package_groups.values())
        self.cache_file = self.env_dir / ".package_cache.json"

    def create_directory_structure(self):
        """Create the basic project directory structure"""
        print(f"{" "*4}==> Creating directory structure...", end=' ', flush=True)
        
        directories = [
            "data/production",
            "data/sample",
            "client",
            "server",
            "sql",
            "docs"
        ]

        for dir_path in directories:
            (self.base_dir / dir_path).mkdir(parents=True, exist_ok=True)

        print("✓")

    def get_installed_packages(self) -> Set[str]:
        """Get currently installed packages in the virtualenv"""
        if not self.env_dir.exists():
            return set()

        pip_path = self.get_pip_path()
        try:
            result = subprocess.run(
                [pip_path, "freeze"],
                capture_output=True,
                text=True
            )
            packages = set()
            for line in result.stdout.splitlines():
                package = line.split('==')[0].lower()
                packages.add(package)
            return packages
        except subprocess.CalledProcessError:
            return set()

    def get_package_versions(self) -> Dict[str, str]:
        """Get versions of all installed packages"""
        if not self.env_dir.exists():
            return {}

        pip_path = self.get_pip_path()
        versions = {}
        try:
            for package in self.get_all_required_packages():
                result = subprocess.run(
                    [pip_path, "show", package],
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0:
                    for line in result.stdout.splitlines():
                        if line.startswith("Version:"):
                            versions[package] = line.split(":", 1)[1].strip()
                            break
        except subprocess.CalledProcessError:
            pass
        return versions

    def get_all_required_packages(self) -> Set[str]:
        """Get all required packages across all groups"""
        packages = set()
        for group_packages in self.package_groups.values():
            packages.update(group_packages)
        return packages

    def calculate_project_hash(self) -> str:
        """Calculate hash of project files to detect changes"""
        hasher = hashlib.sha256()
        setup_py = self.base_dir / "setup.py"
        if setup_py.exists():
            hasher.update(setup_py.read_bytes())
        
        src_dir = self.base_dir / "src"
        if src_dir.exists():
            for root, _, files in os.walk(src_dir):
                for file in sorted(files):
                    if file.endswith('.py'):
                        path = Path(root) / file
                        hasher.update(path.read_bytes())
        
        return hasher.hexdigest()

    def load_cache(self) -> Dict:
        """Load the package installation cache"""
        if self.cache_file.exists():
            try:
                with open(self.cache_file) as f:
                    return json.load(f)
            except json.JSONDecodeError:
                pass
        return {}

    def save_cache(self, cache: Dict):
        """Save the package installation cache"""
        with open(self.cache_file, 'w') as f:
            json.dump(cache, f)

    def setup_virtualenv(self):
        """Create a Python virtual environment and update pip if needed"""
        if self.env_dir.exists():
            print(f"{" "*4}Virtual environment already exists")
            return

        print(f"{" "*4}==> Setting up virtual environment...", end=' ', flush=True)
        try:
            # Update pip first
            subprocess.run([
                sys.executable, "-m", "pip", "install", "--upgrade", "pip"
            ], check=True, capture_output=True)
            
            # Install virtualenv
            subprocess.run([
                sys.executable, "-m", "pip", "install", "-q", "--user", "virtualenv"
            ], check=True, capture_output=True)
            
            # Create virtual environment
            subprocess.run([
                sys.executable, "-m", "virtualenv", str(self.env_dir)
            ], check=True, capture_output=True)
            
            print("✓")
            
        except subprocess.CalledProcessError as e:
            print(f"\nError setting up virtual environment: {e.stderr.decode()}")
            sys.exit(1)

    def get_pip_path(self):
        """Get pip path in virtual environment"""
        pip_exe = "pip.exe" if self.is_windows else "pip"
        pip_dir = "Scripts" if self.is_windows else "bin"
        return str(self.env_dir / pip_dir / pip_exe)

    def install_package(self, package: str, count: int):
        """Install a single package"""
        pip_path = self.get_pip_path()
        print(f"{" "*8}--> [{count}/{self.total_packages}] Installing {package}...", end=' ', flush=True)
        try:
            subprocess.run(
                [pip_path, "install", "-q", package],
                check=True,
                capture_output=True
            )
            result = subprocess.run(
                [pip_path, "show", package],
                capture_output=True,
                text=True
            )
            version = "unknown"
            if result.returncode == 0:
                for line in result.stdout.splitlines():
                    if line.startswith("Version:"):
                        version = line.split(":", 1)[1].strip()
                        break
            print(f"✓ (v{version})")
            return True
        except subprocess.CalledProcessError as e:
            print("✗")
            print(f"Error installing {package}: {e.stderr.decode()}")
            return False

    def install_packages(self):
        """Install all required packages with progress tracking"""
        print(f"{" "*4}==> Installing packages...")
        current_count = 0
        
        for group_name, packages in self.package_groups.items():
            print(f"{" "*6}==> {group_name} packages:")
            for package in packages:
                current_count += 1
                if not self.install_package(package, current_count):
                    return False
        return True

    def run_setup(self):
        """Run the complete setup process"""
        try:
            self.create_directory_structure()
            self.setup_virtualenv()
            if not self.install_packages():
                print("Error: Failed to install some packages!")
                sys.exit(1)
            
        except Exception as e:
            print(f"Error during setup: {str(e)}")
            sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Set up RGAP development environment")
    parser.add_argument("--path", default=".", 
                       help="Path to project root (default: current directory)")
    parser.add_argument("--env", default="venv", 
                       help="Name of virtual environment (default: venv)")
    
    args = parser.parse_args()
    setup = RGAPEnvironmentSetup(args.path, args.env)
    setup.run_setup()

if __name__ == "__main__":
    main()