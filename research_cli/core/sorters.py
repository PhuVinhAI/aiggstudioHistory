"""
Video sorting utilities
"""

from typing import List, Dict, Literal
import logging

logger = logging.getLogger(__name__)

SortBy = Literal['views', 'date', 'duration', 'relevance', 'title', 'channel']


class VideoSorter:
    """Advanced video sorting capabilities"""
    
    @staticmethod
    def sort_videos(videos: List[Dict], sort_by: SortBy = 'relevance', 
                   reverse: bool = True) -> List[Dict]:
        """Sort videos by specified criteria
        
        Args:
            videos: List of video dictionaries
            sort_by: Sorting criteria
            reverse: Sort in descending order if True
            
        Returns:
            Sorted list of videos
        """
        if sort_by == 'relevance':
            # Keep original order for relevance (YouTube's ranking)
            logger.info(f"Keeping relevance order for {len(videos)} videos")
            return videos
        
        try:
            if sort_by == 'views':
                sorted_videos = sorted(videos, key=lambda x: x.get('view_count', 0), reverse=reverse)
            elif sort_by == 'date':
                sorted_videos = sorted(videos, key=lambda x: x.get('upload_date', ''), reverse=reverse)
            elif sort_by == 'duration':
                sorted_videos = sorted(videos, key=lambda x: x.get('duration', 0), reverse=reverse)
            elif sort_by == 'title':
                sorted_videos = sorted(videos, key=lambda x: x.get('title', '').lower(), reverse=reverse)
            elif sort_by == 'channel':
                sorted_videos = sorted(videos, key=lambda x: x.get('uploader', '').lower(), reverse=reverse)
            else:
                logger.warning(f"Unknown sort criteria: {sort_by}, keeping original order")
                return videos
            
            logger.info(f"Sorted {len(videos)} videos by {sort_by} ({'desc' if reverse else 'asc'})")
            return sorted_videos
            
        except Exception as e:
            logger.error(f"Sorting failed: {e}")
            return videos
    
    @staticmethod
    def get_top_videos(videos: List[Dict], count: int, 
                      sort_by: SortBy = 'views') -> List[Dict]:
        """Get top N videos by specified criteria
        
        Args:
            videos: List of video dictionaries
            count: Number of top videos to return
            sort_by: Sorting criteria
            
        Returns:
            Top N videos
        """
        sorted_videos = VideoSorter.sort_videos(videos, sort_by, reverse=True)
        top_videos = sorted_videos[:count]
        
        logger.info(f"Selected top {len(top_videos)} videos by {sort_by}")
        return top_videos
    
    @staticmethod
    def rank_by_engagement(videos: List[Dict]) -> List[Dict]:
        """Rank videos by engagement score (views + likes + comments)
        
        Args:
            videos: List of video dictionaries
            
        Returns:
            Videos sorted by engagement score
        """
        def calculate_engagement_score(video: Dict) -> float:
            """Calculate engagement score for a video"""
            views = video.get('view_count', 0)
            likes = video.get('like_count', 0)
            
            # Basic engagement score: views + (likes * 10)
            # Likes are weighted more heavily as they indicate active engagement
            score = views + (likes * 10)
            
            # Normalize by video age (newer videos get slight boost)
            upload_date = video.get('upload_date', '')
            if upload_date and len(upload_date) == 8:
                try:
                    from datetime import datetime
                    upload_dt = datetime.strptime(upload_date, '%Y%m%d')
                    days_old = (datetime.now() - upload_dt).days
                    
                    # Slight boost for newer videos (max 20% boost for videos < 30 days old)
                    if days_old < 30:
                        age_boost = 1 + (0.2 * (30 - days_old) / 30)
                        score *= age_boost
                except ValueError:
                    pass
            
            return score
        
        try:
            ranked_videos = sorted(videos, key=calculate_engagement_score, reverse=True)
            logger.info(f"Ranked {len(videos)} videos by engagement score")
            return ranked_videos
        except Exception as e:
            logger.error(f"Engagement ranking failed: {e}")
            return videos