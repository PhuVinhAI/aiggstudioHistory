"""
Video filtering utilities
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class VideoFilter:
    """Advanced video filtering capabilities"""
    
    @staticmethod
    def by_view_count(videos: List[Dict], min_views: int = 0, max_views: Optional[int] = None) -> List[Dict]:
        """Filter videos by view count range
        
        Args:
            videos: List of video dictionaries
            min_views: Minimum view count
            max_views: Maximum view count (optional)
            
        Returns:
            Filtered list of videos
        """
        filtered = []
        for video in videos:
            view_count = video.get('view_count', 0)
            if view_count >= min_views:
                if max_views is None or view_count <= max_views:
                    filtered.append(video)
        
        logger.info(f"Filtered {len(videos)} videos to {len(filtered)} by view count ({min_views}-{max_views or 'unlimited'})")
        return filtered
    
    @staticmethod
    def by_duration(videos: List[Dict], min_duration: int = 0, max_duration: Optional[int] = None) -> List[Dict]:
        """Filter videos by duration range (in seconds)
        
        Args:
            videos: List of video dictionaries
            min_duration: Minimum duration in seconds
            max_duration: Maximum duration in seconds (optional)
            
        Returns:
            Filtered list of videos
        """
        filtered = []
        for video in videos:
            duration = video.get('duration', 0)
            if duration >= min_duration:
                if max_duration is None or duration <= max_duration:
                    filtered.append(video)
        
        logger.info(f"Filtered {len(videos)} videos to {len(filtered)} by duration ({min_duration}-{max_duration or 'unlimited'}s)")
        return filtered
    
    @staticmethod
    def by_upload_date(videos: List[Dict], days_ago: Optional[int] = None, 
                      after_date: Optional[str] = None, before_date: Optional[str] = None) -> List[Dict]:
        """Filter videos by upload date
        
        Args:
            videos: List of video dictionaries
            days_ago: Videos uploaded within last N days
            after_date: Videos uploaded after this date (YYYY-MM-DD)
            before_date: Videos uploaded before this date (YYYY-MM-DD)
            
        Returns:
            Filtered list of videos
        """
        filtered = []
        now = datetime.now()
        
        for video in videos:
            upload_date_str = video.get('upload_date', '')
            if not upload_date_str or len(upload_date_str) != 8:
                continue
            
            try:
                # Parse YYYYMMDD format
                upload_date = datetime.strptime(upload_date_str, '%Y%m%d')
                
                # Check days_ago filter
                if days_ago is not None:
                    cutoff_date = now - timedelta(days=days_ago)
                    if upload_date < cutoff_date:
                        continue
                
                # Check after_date filter
                if after_date:
                    after_dt = datetime.strptime(after_date, '%Y-%m-%d')
                    if upload_date < after_dt:
                        continue
                
                # Check before_date filter
                if before_date:
                    before_dt = datetime.strptime(before_date, '%Y-%m-%d')
                    if upload_date > before_dt:
                        continue
                
                filtered.append(video)
                
            except ValueError:
                logger.warning(f"Invalid upload date format: {upload_date_str}")
                continue
        
        logger.info(f"Filtered {len(videos)} videos to {len(filtered)} by upload date")
        return filtered
    
    @staticmethod
    def by_channel(videos: List[Dict], channels: List[str]) -> List[Dict]:
        """Filter videos by channel names
        
        Args:
            videos: List of video dictionaries
            channels: List of channel names to include
            
        Returns:
            Filtered list of videos
        """
        if not channels:
            return videos
        
        channels_lower = [ch.lower() for ch in channels]
        filtered = []
        
        for video in videos:
            uploader = video.get('uploader', '').lower()
            if any(channel in uploader for channel in channels_lower):
                filtered.append(video)
        
        logger.info(f"Filtered {len(videos)} videos to {len(filtered)} by channels: {channels}")
        return filtered
    
    @staticmethod
    def remove_duplicates(videos: List[Dict]) -> List[Dict]:
        """Remove duplicate videos based on video ID
        
        Args:
            videos: List of video dictionaries
            
        Returns:
            List with duplicates removed
        """
        seen_ids = set()
        unique_videos = []
        
        for video in videos:
            video_id = video.get('video_id', '')
            if video_id and video_id not in seen_ids:
                seen_ids.add(video_id)
                unique_videos.append(video)
        
        logger.info(f"Removed {len(videos) - len(unique_videos)} duplicate videos")
        return unique_videos
    
    @staticmethod
    def trending_videos(videos: List[Dict], min_views: int = 100000, 
                       recent_days: int = 30) -> List[Dict]:
        """Filter for trending videos (high views + recent)
        
        Args:
            videos: List of video dictionaries
            min_views: Minimum view count for trending
            recent_days: Consider videos from last N days
            
        Returns:
            List of trending videos
        """
        # First filter by view count
        high_view_videos = VideoFilter.by_view_count(videos, min_views)
        
        # Then filter by recent upload date
        trending = VideoFilter.by_upload_date(high_view_videos, days_ago=recent_days)
        
        logger.info(f"Found {len(trending)} trending videos (>{min_views} views, last {recent_days} days)")
        return trending