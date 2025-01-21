#!/usr/bin/env python3

import os
import sys
import subprocess
import platform
from pathlib import Path
import argparse

class RGAPEnvironmentSetup:
    def __init__(self, base_dir: str, env_name: str = "venv"):
        self.base_dir = Path(base_dir).resolve()
        self.env_name = env_name
        self.env_dir = self.base_dir / env_name
        self.is_windows = platform.system() == "Windows"
        self.package_groups = {
            "Core": ["pandas", "numpy"],
            "Visualization": ["matplotlib", "seaborn", "plotly"],
            "Jupyter": ["jupyter", "notebook", "ipykernel"],
            "Web": ["requests", "aiohttp", "urllib3"],
            "Data Formats": ["python-dotenv", "openpyxl", "PyYAML"],
            "Testing": ["pytest", "pytest-cov"],
            "Database": ["mysqlclient", "SQLAlchemy"],
            "Utilities": ["tqdm", "python-dateutil", "pytz"],
            "Optional": ["jupyterlab"]
        }
        # Calculate total number of packages
        self.total_packages = sum(len(packages) for packages in self.package_groups.values())

    def create_directory_structure(self):
        """Create the basic project directory structure"""
        print("  Creating directory structure...", end=' ', flush=True)
        
        directories = [
            "data/raw",
            "data/processed",
            "data/sample",
            "notebooks/exploratory",
            "notebooks/reports",
            "scripts/data",
            "scripts/utils",
            "tests",
            "client",
            "server",
            "sql",
            "docs"
        ]

        for dir_path in directories:
            (self.base_dir / dir_path).mkdir(parents=True, exist_ok=True)

        print("✓")

    def setup_virtualenv(self):
        """Create a Python virtual environment"""
        print("  Setting up virtual environment...", end=' ', flush=True)
        try:
            subprocess.run([
                sys.executable, "-m", "pip", "install", "-q", "--user", "virtualenv"
            ], check=True, capture_output=True)
            
            subprocess.run([
                sys.executable, "-m", "virtualenv", str(self.env_dir)
            ], check=True, capture_output=True)
            
            print("✓")
            
        except subprocess.CalledProcessError as e:
            print(f"\nError creating virtual environment: {e.stderr.decode()}")
            sys.exit(1)

    def get_pip_path(self):
        """Get pip path in virtual environment"""
        pip_exe = "pip.exe" if self.is_windows else "pip"
        pip_dir = "Scripts" if self.is_windows else "bin"
        return str(self.env_dir / pip_dir / pip_exe)

    def install_package(self, package: str, count: int):
        """Install a single package"""
        pip_path = self.get_pip_path()
        print(f"      [{count}/{self.total_packages}] Installing {package}...", end=' ', flush=True)
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
        print("  Installing packages...")
        current_count = 0
        
        for group_name, packages in self.package_groups.items():
            print(f"    {group_name} packages:")
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