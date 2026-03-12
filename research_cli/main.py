"""
Main CLI entry point for Research CLI Tool
"""

import click
import logging
import sys
import os

# Add the package directory to Python path
package_dir = os.path.dirname(os.path.abspath(__file__))
if package_dir not in sys.path:
    sys.path.insert(0, os.path.dirname(package_dir))

from research_cli.commands.search import search_command
from research_cli.commands.info import info_command
from research_cli.commands.export import export_command
from research_cli import __version__


def setup_logging(verbose: bool = False):
    """Setup logging configuration"""
    level = logging.INFO if verbose else logging.WARNING
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )


@click.group()
@click.version_option(version=__version__, prog_name="research-cli")
@click.option('--verbose', '-v', is_flag=True, help='Bật chế độ verbose')
@click.pass_context
def cli(ctx, verbose: bool):
    """Research CLI Tool - YouTube Search
    
    Công cụ tìm kiếm YouTube chuyên nghiệp với bộ lọc nâng cao
    
    Examples:
      research-cli search "AI tools" --min-views 100000 --year 2026
      research-cli info "https://youtube.com/watch?v=..."
      research-cli export "AI trends" -n 5 -o urls.txt
    """
    ctx.ensure_object(dict)
    ctx.obj['verbose'] = verbose
    setup_logging(verbose)


# Register all command groups
cli.add_command(search_command, name='search')
cli.add_command(info_command, name='info')
cli.add_command(export_command, name='export')


if __name__ == '__main__':
    cli()