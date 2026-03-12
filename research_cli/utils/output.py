"""
Output formatting utilities
"""

import json
from typing import List, Dict
from ..core.youtube_client import YouTubeClient


def format_video_list(videos: List[Dict], client: YouTubeClient, verbose: bool = False) -> str:
    """Format video list for console output
    
    Args:
        videos: List of video dictionaries
        client: YouTube client for formatting utilities
        verbose: Include additional details
        
    Returns:
        Formatted string for console output
    """
    if not videos:
        return "Không có video nào."
    
    output_lines = []
    
    for i, video in enumerate(videos, 1):
        title = video.get('title', 'N/A')
        uploader = video.get('uploader', 'N/A')
        view_count = client.format_view_count(video.get('view_count', 0))
        duration = client.format_duration(video.get('duration', 0))
        upload_date = video.get('upload_date_formatted', 'N/A')
        url = video.get('url', '')
        
        # Basic info
        output_lines.append(f"{i}. {title}")
        output_lines.append(f"   📺 Kênh: {uploader}")
        output_lines.append(f"   👀 Lượt xem: {view_count}")
        output_lines.append(f"   ⏱️  Thời lượng: {duration}")
        output_lines.append(f"   📅 Ngày tải: {upload_date}")
        
        if verbose:
            # Additional details in verbose mode
            video_id = video.get('video_id', 'N/A')
            channel_id = video.get('channel_id', 'N/A')
            description = video.get('description', 'N/A')
            
            output_lines.append(f"   🆔 Video ID: {video_id}")
            output_lines.append(f"   📺 Channel ID: {channel_id}")
            output_lines.append(f"   📝 Mô tả: {description}")
        
        output_lines.append(f"   🔗 URL: {url}")
        output_lines.append("")  # Empty line between videos
    
    return "\n".join(output_lines)


def format_json_output(data: List[Dict] or Dict) -> str:
    """Format data as JSON string
    
    Args:
        data: Data to format as JSON
        
    Returns:
        JSON formatted string
    """
    return json.dumps(data, ensure_ascii=False, indent=2)


def format_trending_list(videos: List[Dict], client: YouTubeClient) -> str:
    """Format trending video list with special styling
    
    Args:
        videos: List of trending video dictionaries
        client: YouTube client for formatting utilities
        
    Returns:
        Formatted string for console output
    """
    if not videos:
        return "Không có video trending nào."
    
    output_lines = []
    output_lines.append("🔥 VIDEO TRENDING HÀNG ĐẦU:")
    output_lines.append("=" * 80)
    
    for i, video in enumerate(videos, 1):
        title = video.get('title', 'N/A')
        uploader = video.get('uploader', 'N/A')
        view_count = client.format_view_count(video.get('view_count', 0))
        duration = client.format_duration(video.get('duration', 0))
        upload_date = video.get('upload_date_formatted', 'N/A')
        url = video.get('url', '')
        
        # Trending-specific formatting with emojis
        output_lines.append(f"🏆 {i}. {title}")
        output_lines.append(f"   📺 Kênh: {uploader}")
        output_lines.append(f"   🔥 Lượt xem: {view_count}")
        output_lines.append(f"   ⏱️  Thời lượng: {duration}")
        output_lines.append(f"   📅 Ngày tải: {upload_date}")
        output_lines.append(f"   🔗 URL: {url}")
        output_lines.append("")
    
    return "\n".join(output_lines)


def format_export_summary(videos: List[Dict], export_type: str, filename: str = None) -> str:
    """Format export summary message
    
    Args:
        videos: List of exported videos
        export_type: Type of export (urls, json, csv)
        filename: Output filename if applicable
        
    Returns:
        Summary message
    """
    count = len(videos)
    
    if filename:
        return f"✅ Đã xuất {count} video ({export_type}) vào file: {filename}"
    else:
        return f"✅ Đã xuất {count} video ({export_type})"


def print_error(message: str):
    """Print error message with styling
    
    Args:
        message: Error message to display
    """
    import click
    click.echo(f"❌ Lỗi: {message}", err=True)


def print_warning(message: str):
    """Print warning message with styling
    
    Args:
        message: Warning message to display
    """
    import click
    click.echo(f"⚠️  Cảnh báo: {message}")


def print_success(message: str):
    """Print success message with styling
    
    Args:
        message: Success message to display
    """
    import click
    click.echo(f"✅ {message}")


def print_info(message: str):
    """Print info message with styling
    
    Args:
        message: Info message to display
    """
    import click
    click.echo(f"ℹ️  {message}")