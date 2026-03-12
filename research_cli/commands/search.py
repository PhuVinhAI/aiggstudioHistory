"""
Search command implementation
"""

import click
import json
from typing import Optional

from ..core import YouTubeClient, VideoFilter, VideoSorter
from ..utils.output import format_video_list, format_json_output


@click.command()
@click.argument('query')
@click.option('--max-results', '-n', default=10, help='Số lượng kết quả tối đa')
@click.option('--sort-by', '-s', default='relevance', 
              type=click.Choice(['relevance', 'views', 'date', 'duration', 'title', 'channel']),
              help='Sắp xếp theo tiêu chí')
@click.option('--min-views', '-m', default=0, help='Lượt xem tối thiểu')
@click.option('--max-views', default=None, type=int, help='Lượt xem tối đa')
@click.option('--min-duration', default=0, help='Thời lượng tối thiểu (giây)')
@click.option('--max-duration', default=None, type=int, help='Thời lượng tối đa (giây)')
@click.option('--days-ago', default=None, type=int, help='Video trong N ngày qua')
@click.option('--year', default=None, type=int, help='Lọc theo năm (VD: 2024)')
@click.option('--after-date', default=None, help='Video sau ngày này (YYYY-MM-DD)')
@click.option('--before-date', default=None, help='Video trước ngày này (YYYY-MM-DD)')
@click.option('--channels', default=None, help='Lọc theo kênh (phân cách bằng dấu phẩy)')
@click.option('--json', 'output_json', is_flag=True, help='Xuất kết quả dạng JSON')
@click.option('--verbose', '-v', is_flag=True, help='Hiển thị thông tin chi tiết')
def search_command(query: str, max_results: int, sort_by: str, min_views: int, 
                  max_views: Optional[int], min_duration: int, max_duration: Optional[int],
                  days_ago: Optional[int], year: Optional[int], after_date: Optional[str], 
                  before_date: Optional[str], channels: Optional[str], output_json: bool, verbose: bool):
    """Tìm kiếm video trên YouTube với bộ lọc nâng cao"""
    
    if verbose:
        click.echo(f"🔍 Đang tìm kiếm: '{query}'")
        click.echo(f"📊 Tham số: max={max_results}, sort={sort_by}, min_views={min_views}")
    
    # Initialize client
    client = YouTubeClient(quiet=not verbose)
    
    # Search with expanded results for filtering
    search_limit = max(max_results * 3, 30)
    videos = client.search_videos(query, search_limit)
    
    if not videos:
        click.echo("❌ Không tìm thấy video nào.")
        return
    
    # Apply filters
    if min_views > 0 or max_views is not None:
        videos = VideoFilter.by_view_count(videos, min_views, max_views)
    
    if min_duration > 0 or max_duration is not None:
        videos = VideoFilter.by_duration(videos, min_duration, max_duration)
    
    if days_ago is not None:
        videos = VideoFilter.by_upload_date(videos, days_ago=days_ago)
    
    if year is not None:
        # Convert year to date range
        after_date = f"{year}-01-01"
        before_date = f"{year}-12-31"
        videos = VideoFilter.by_upload_date(videos, after_date=after_date, before_date=before_date)
    elif after_date or before_date:
        videos = VideoFilter.by_upload_date(videos, after_date=after_date, before_date=before_date)
    
    if channels:
        channel_list = [ch.strip() for ch in channels.split(',')]
        videos = VideoFilter.by_channel(videos, channel_list)
    
    # Remove duplicates
    videos = VideoFilter.remove_duplicates(videos)
    
    if not videos:
        click.echo("❌ Không có video nào thỏa mãn điều kiện lọc.")
        return
    
    # Sort videos
    videos = VideoSorter.sort_videos(videos, sort_by, reverse=True)
    
    # Limit final results
    videos = videos[:max_results]
    
    # Output results
    if output_json:
        click.echo(format_json_output(videos))
    else:
        click.echo(f"✅ Tìm thấy {len(videos)} video (sắp xếp theo {sort_by}):")
        click.echo("=" * 80)
        click.echo(format_video_list(videos, client, verbose=verbose))