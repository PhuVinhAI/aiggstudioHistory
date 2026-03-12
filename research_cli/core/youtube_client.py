"""
YouTube Client - Core functionality for YouTube API interactions
"""

import yt_dlp
import json
from typing import List, Dict, Optional, Union
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class YouTubeClient:
    """Professional YouTube client with advanced search and filtering capabilities"""
    
    def __init__(self, quiet: bool = True):
        """Initialize YouTube client
        
        Args:
            quiet: Suppress yt-dlp output
        """
        self.ydl_opts = {
            'quiet': quiet,
            'no_warnings': quiet,
            'extract_flat': False,
        }
    
    def search_videos(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search for videos on YouTube
        
        Args:
            query: Search query
            max_results: Maximum number of results
            
        Returns:
            List of video information dictionaries
        """
        search_url = f"ytsearch{max_results}:{query}"
        
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            try:
                search_results = ydl.extract_info(search_url, download=False)
                videos = []
                
                for entry in search_results.get('entries', []):
                    if entry:
                        video_info = self._extract_video_info(entry)
                        videos.append(video_info)
                
                return videos
                
            except Exception as e:
                logger.error(f"Search failed: {e}")
                return []
    
    def get_video_info(self, video_url: str) -> Optional[Dict]:
        """Get detailed information for a specific video
        
        Args:
            video_url: YouTube video URL or ID
            
        Returns:
            Detailed video information or None if failed
        """
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            try:
                info = ydl.extract_info(video_url, download=False)
                return self._extract_detailed_video_info(info)
                
            except Exception as e:
                logger.error(f"Failed to get video info: {e}")
                return None
    
    def download_subtitles(self, video_url: str, output_dir: str = "subtitles", 
                          languages: List[str] = None) -> bool:
        """Download video subtitles
        
        Args:
            video_url: YouTube video URL or ID
            output_dir: Output directory for subtitles
            languages: List of language codes to download
            
        Returns:
            True if successful, False otherwise
        """
        import os
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        subtitle_opts = {
            'writesubtitles': True,
            'writeautomaticsub': True,
            'skip_download': True,
            'outtmpl': f'{output_dir}/%(title)s.%(ext)s',
            'subtitleslangs': languages or ['vi', 'en', 'all'],
            'subtitlesformat': 'srt/best',
        }
        
        with yt_dlp.YoutubeDL(subtitle_opts) as ydl:
            try:
                ydl.download([video_url])
                return True
            except Exception as e:
                logger.error(f"Subtitle download failed: {e}")
                return False
    
    def _extract_video_info(self, entry: Dict) -> Dict:
        """Extract basic video information from yt-dlp entry"""
        # Parse upload date properly
        upload_date = entry.get('upload_date', '')
        formatted_date = self._format_upload_date(upload_date)
        
        return {
            'title': entry.get('title', 'N/A'),
            'uploader': entry.get('uploader', 'N/A'),
            'view_count': entry.get('view_count', 0),
            'duration': entry.get('duration', 0),
            'url': entry.get('webpage_url', ''),
            'video_id': entry.get('id', ''),
            'upload_date': upload_date,
            'upload_date_formatted': formatted_date,
            'description': self._truncate_description(entry.get('description', '')),
            'thumbnail': entry.get('thumbnail', ''),
            'channel_id': entry.get('channel_id', ''),
            'channel_url': entry.get('channel_url', ''),
        }
    
    def _extract_detailed_video_info(self, info: Dict) -> Dict:
        """Extract detailed video information"""
        upload_date = info.get('upload_date', '')
        formatted_date = self._format_upload_date(upload_date)
        
        return {
            'title': info.get('title', 'N/A'),
            'uploader': info.get('uploader', 'N/A'),
            'view_count': info.get('view_count', 0),
            'like_count': info.get('like_count', 0),
            'duration': info.get('duration', 0),
            'upload_date': upload_date,
            'upload_date_formatted': formatted_date,
            'description': info.get('description', 'N/A'),
            'tags': info.get('tags', []),
            'categories': info.get('categories', []),
            'subtitles': list(info.get('subtitles', {}).keys()) if info.get('subtitles') else [],
            'automatic_captions': list(info.get('automatic_captions', {}).keys()) if info.get('automatic_captions') else [],
            'thumbnail': info.get('thumbnail', ''),
            'channel_id': info.get('channel_id', ''),
            'channel_url': info.get('channel_url', ''),
            'age_limit': info.get('age_limit', 0),
            'average_rating': info.get('average_rating', 0),
        }
    
    def _format_upload_date(self, upload_date: str) -> str:
        """Format upload date to readable format"""
        if not upload_date or len(upload_date) != 8:
            return 'N/A'
        
        try:
            # Parse YYYYMMDD format
            year = int(upload_date[:4])
            month = int(upload_date[4:6])
            day = int(upload_date[6:8])
            
            # Validate date ranges
            if year < 2005 or year > datetime.now().year:
                return 'N/A'
            if month < 1 or month > 12:
                return 'N/A'
            if day < 1 or day > 31:
                return 'N/A'
            
            date_obj = datetime(year, month, day)
            return date_obj.strftime('%d/%m/%Y')
        except (ValueError, TypeError):
            return 'N/A'
    
    def _truncate_description(self, description: str, max_length: int = 200) -> str:
        """Truncate description to specified length"""
        if not description:
            return 'N/A'
        
        if len(description) <= max_length:
            return description
        
        return description[:max_length] + '...'
    
    @staticmethod
    def format_duration(seconds: int) -> str:
        """Convert seconds to HH:MM:SS or MM:SS format"""
        if seconds == 0:
            return "N/A"
        
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        seconds = seconds % 60
        
        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        else:
            return f"{minutes:02d}:{seconds:02d}"
    
    @staticmethod
    def format_view_count(count: int) -> str:
        """Format view count with K/M/B suffixes"""
        if count >= 1_000_000_000:
            return f"{count/1_000_000_000:.1f}B"
        elif count >= 1_000_000:
            return f"{count/1_000_000:.1f}M"
        elif count >= 1_000:
            return f"{count/1_000:.1f}K"
        else:
            return str(count)