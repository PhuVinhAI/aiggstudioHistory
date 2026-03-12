"""
Info command implementation
"""

import click


@click.command()
@click.argument('video_url')
@click.option('--json', 'output_json', is_flag=True, help='Xuất kết quả dạng JSON')
@click.pass_context
def info_command(ctx, video_url: str, output_json: bool):
    """Lấy thông tin chi tiết video YouTube"""
    from ..core import YouTubeClient
    from ..utils.output import format_json_output, print_error
    
    verbose = ctx.obj.get('verbose', False)
    client = YouTubeClient(quiet=not verbose)
    
    if verbose:
        click.echo(f"🔍 Đang lấy thông tin video: {video_url}")
    
    video_info = client.get_video_info(video_url)
    
    if video_info:
        if output_json:
            click.echo(format_json_output(video_info))
        else:
            click.echo("📺 THÔNG TIN VIDEO")
            click.echo("=" * 50)
            click.echo(f"📝 Tiêu đề: {video_info['title']}")
            click.echo(f"👤 Kênh: {video_info['uploader']}")
            click.echo(f"👀 Lượt xem: {client.format_view_count(video_info['view_count'])}")
            click.echo(f"👍 Lượt thích: {client.format_view_count(video_info['like_count'])}")
            click.echo(f"⏱️  Thời lượng: {client.format_duration(video_info['duration'])}")
            click.echo(f"📅 Ngày tải: {video_info['upload_date_formatted']}")
            
            subtitles = video_info.get('subtitles', [])
            auto_captions = video_info.get('automatic_captions', [])
            
            click.echo(f"📝 Phụ đề: {', '.join(subtitles[:5]) if subtitles else 'Không có'}")
            click.echo(f"🤖 Phụ đề tự động: {', '.join(auto_captions[:5]) if auto_captions else 'Không có'}")
            
            if video_info.get('tags'):
                click.echo(f"🏷️  Tags: {', '.join(video_info['tags'][:10])}")
    else:
        print_error("Không thể lấy thông tin video.")