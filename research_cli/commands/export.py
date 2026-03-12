"""
Export commands - Xuất URLs và dữ liệu
"""

import click
import json
from typing import Optional

from ..core.youtube_client import YouTubeClient
from ..core.filters import VideoFilter
from ..core.sorters import VideoSorter
from ..utils.output import print_success, print_error, print_info


@click.command()
@click.argument('query')
@click.option('--max-results', '-n', default=10, help='Số video tối đa')
@click.option('--output', '-o', type=click.Path(), help='File đầu ra (mặc định: stdout)')
@click.option('--format', '-f', type=click.Choice(['urls', 'json', 'csv']), 
              default='urls', help='Định dạng xuất')
@click.option('--min-views', type=int, help='Lượt xem tối thiểu')
@click.option('--max-views', type=int, help='Lượt xem tối đa')
@click.option('--min-duration', type=int, help='Thời lượng tối thiểu (giây)')
@click.option('--max-duration', type=int, help='Thời lượng tối đa (giây)')
@click.option('--sort-by', type=click.Choice(['views', 'date', 'duration', 'relevance']),
              default='relevance', help='Sắp xếp theo')
def export_command(query: str, max_results: int, output: Optional[str], 
                  format: str, min_views: Optional[int], max_views: Optional[int],
                  min_duration: Optional[int], max_duration: Optional[int], sort_by: str):
    """Xuất danh sách video URLs hoặc metadata
    
    Examples:
      research-cli export "AI tools" -n 5
      research-cli export "AI tools" -o urls.txt
      research-cli export "AI tools" --format json -o data.json
      research-cli export "AI tools" --format csv -o data.csv --min-views 100000
    """
    try:
        client = YouTubeClient()
        print_info(f"🔍 Tìm kiếm: {query}")
        
        # Search videos
        videos = client.search_videos(query, max_results=max_results)
        
        if not videos:
            print_error("Không tìm thấy video nào")
            return
        
        # Apply filters
        video_filter = VideoFilter()
        if min_views:
            videos = video_filter.filter_by_views(videos, min_views=min_views)
        if max_views:
            videos = video_filter.filter_by_views(videos, max_views=max_views)
        if min_duration:
            videos = video_filter.filter_by_duration(videos, min_duration=min_duration)
        if max_duration:
            videos = video_filter.filter_by_duration(videos, max_duration=max_duration)
        
        # Sort videos
        sorter = VideoSorter()
        if sort_by == 'views':
            videos = sorter.sort_by_views(videos, reverse=True)
        elif sort_by == 'date':
            videos = sorter.sort_by_date(videos, reverse=True)
        elif sort_by == 'duration':
            videos = sorter.sort_by_duration(videos, reverse=True)
        
        if not videos:
            print_error("Không có video nào sau khi lọc")
            return
        
        # Export based on format
        if format == 'urls':
            content = '\n'.join([v['url'] for v in videos])
        elif format == 'json':
            content = json.dumps(videos, indent=2, ensure_ascii=False)
        elif format == 'csv':
            import csv
            import io
            output_buffer = io.StringIO()
            writer = csv.DictWriter(output_buffer, 
                                   fieldnames=['title', 'uploader', 'view_count', 'duration', 'url', 'upload_date'])
            writer.writeheader()
            for v in videos:
                writer.writerow({
                    'title': v['title'],
                    'uploader': v['uploader'],
                    'view_count': v['view_count'],
                    'duration': v['duration'],
                    'url': v['url'],
                    'upload_date': v.get('upload_date', '')
                })
            content = output_buffer.getvalue()
        
        # Write to file or stdout
        if output:
            with open(output, 'w', encoding='utf-8') as f:
                f.write(content)
            print_success(f"✅ Đã xuất {len(videos)} video vào {output}")
        else:
            click.echo(content)
            
    except Exception as e:
        print_error(f"Xuất dữ liệu thất bại: {e}")
