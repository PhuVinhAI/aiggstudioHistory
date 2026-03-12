"""
Setup script for YouTube CLI Tool
"""

from setuptools import setup, find_packages
import os

# Read README file
def read_readme():
    with open('README.md', 'r', encoding='utf-8') as f:
        return f.read()

# Read requirements
def read_requirements():
    with open('requirements.txt', 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip() and not line.startswith('#')]

setup(
    name='research-cli-pro',
    version='2.0.0',
    description='Professional YouTube search and analysis CLI tool',
    long_description=read_readme(),
    long_description_content_type='text/markdown',
    author='YouTube CLI Team',
    author_email='team@youtube-cli.com',
    url='https://github.com/youtube-cli/youtube-cli-pro',
    packages=find_packages(),
    include_package_data=True,
    install_requires=read_requirements(),
    entry_points={
        'console_scripts': [
            'research-cli=research_cli.main:cli',
            'ytcli=research_cli.main:cli',
        ],
    },
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Multimedia :: Video',
        'Topic :: Software Development :: Libraries :: Python Modules',
    ],
    python_requires='>=3.8',
    keywords='youtube, cli, video, search, analysis, trending, api',
    project_urls={
        'Bug Reports': 'https://github.com/youtube-cli/youtube-cli-pro/issues',
        'Source': 'https://github.com/youtube-cli/youtube-cli-pro',
        'Documentation': 'https://youtube-cli-pro.readthedocs.io/',
    },
)