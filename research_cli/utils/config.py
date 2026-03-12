"""
Configuration management for research CLI
"""

import json
import os
from pathlib import Path
from typing import Dict, Any

def get_config_path() -> Path:
    """Get the configuration file path"""
    home = Path.home()
    config_dir = home / '.research_cli'
    config_dir.mkdir(exist_ok=True)
    return config_dir / 'config.json'

def load_config() -> Dict[str, Any]:
    """Load configuration from file"""
    config_path = get_config_path()
    
    if not config_path.exists():
        return {}
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}

def save_config(config: Dict[str, Any]) -> None:
    """Save configuration to file"""
    config_path = get_config_path()
    
    try:
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
    except IOError as e:
        print(f"Warning: Could not save config: {e}")