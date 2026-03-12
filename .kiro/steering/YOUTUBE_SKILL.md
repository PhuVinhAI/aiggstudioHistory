# Research CLI Tool - YouTube Search

Complete programmatic access to YouTube search and video information with advanced filtering capabilities. Built with yt-dlp for reliable video data extraction.

## Installation

```bash
pip install -e .  # Install from source
# OR
pip install research-cli  # If published to PyPI
```

## Prerequisites

**IMPORTANT:** The tool requires yt-dlp to be installed and updated:

```bash
pip install --upgrade yt-dlp click requests
```

If commands fail with API errors, update yt-dlp to the latest version.

## When This Skill Activates

**Explicit:** User says "research-cli", "youtube search", "search youtube", "find youtube videos", or mentions the tool by name

**Intent detection:** Recognize requests like:
- "Find YouTube videos about [topic] from [year]"
- "Search for tutorials on [subject] with high views"
- "Get video information from this URL"
- "Find top videos about [topic] for research"
- "Export YouTube URLs for analysis"
- "Filter videos by duration/views/date"

## Autonomy Rules

**Run automatically (no confirmation):**
- `research-cli search` - search videos with filters
- `research-cli info` - get video information
- `research-cli export` - export URLs list
- `research-cli --help` - show help

**Ask before running:**
- None - all YouTube search operations are safe

## Quick Reference

| Task | Command |
|------|---------|
| Search videos | `research-cli search "query"` |
| Search with year filter | `research-cli search "AI models" --year 2026` |
| Search with view filter | `research-cli search "query" --min-views 100000` |
| Search with duration filter | `research-cli search "query" --min-duration 300` |
| Search recent videos | `research-cli search "query" --days-ago 30` |
| Search specific channels | `research-cli search "query" --channels "channel1,channel2"` |
| Search JSON output | `research-cli search "query" --json` |
| Get video info | `research-cli info "VIDEO_URL"` |
| Get video info JSON | `research-cli info "VIDEO_URL" --json` |
| Export URLs only | `research-cli export "query" -n 5` |
| Export URLs to file | `research-cli export "query" -o urls.txt` |
| Show help | `research-cli --help` |

## Advanced Search Filters

The CLI supports comprehensive filtering options:

**View Count Filters:**
```bash
research-cli search "AI models" --min-views 100000 --max-views 1000000
```

**Duration Filters:**
```bash
research-cli search "tutorials" --min-duration 300 --max-duration 1800  # 5-30 minutes
```

**Date Filters:**
```bash
research-cli search "AI news" --year 2026                    # Videos from 2026
research-cli search "AI news" --days-ago 30                  # Last 30 days
research-cli search "AI news" --after-date 2026-01-01        # After specific date
research-cli search "AI news" --before-date 2026-12-31       # Before specific date
```

**Channel Filters:**
```bash
research-cli search "AI" --channels "OpenAI,DeepMind,Google AI"
```

**Sorting Options:**
```bash
research-cli search "AI" --sort-by views      # By view count
research-cli search "AI" --sort-by date       # By upload date
research-cli search "AI" --sort-by duration   # By video length
research-cli search "AI" --sort-by relevance  # By relevance (default)
```

## Command Output Formats

Commands with `--json` return structured data for parsing:

**Search videos:**
```bash
research-cli search "AI tools" --json
```
Returns:
```json
[
  {
    "title": "Video Title",
    "uploader": "Channel Name", 
    "view_count": 1000000,
    "duration": 600,
    "url": "https://www.youtube.com/watch?v=...",
    "video_id": "...",
    "upload_date": "20260101",
    "description": "Video description..."
  }
]
```

**Video information:**
```bash
research-cli info "https://youtube.com/watch?v=..." --json
```
Returns:
```json
{
  "title": "Video Title",
  "uploader": "Channel Name",
  "view_count": 1000000,
  "like_count": 50000,
  "duration": 600,
  "upload_date": "20260101",
  "description": "Full description",
  "tags": ["tag1", "tag2"],
  "categories": ["Education"],
  "subtitles": ["en", "es"],
  "automatic_captions": ["en", "es", "fr"]
}
```

**Export URLs:**
```bash
research-cli export "AI business" -n 5
```
Returns plain text URLs, one per line.

## Integration with External Tools

**Common workflow:** Search YouTube → Export URLs → Use with other tools

```bash
# 1. Search and export URLs
research-cli export "AI tools for business" -n 5 -o ai_videos.txt

# 2. Use URLs with other tools (NotebookLM, etc.)
cat ai_videos.txt
```

**Automated integration example:**
```bash
# Search for videos and process URLs
research-cli export "digital marketing AI" -n 3 | while read url; do
  echo "Processing: $url"
  # Add your processing logic here
done
```

## Common Workflows

### Video Research Discovery
**Time:** 1-2 minutes

1. `research-cli search "topic" -n 10` — *search for relevant videos*
2. Review results and select interesting videos
3. `research-cli info "VIDEO_URL"` — *get detailed information*
4. `research-cli export "topic" -o research_urls.txt` — *export for other tools*

### Advanced Filtering Workflow
**Time:** 2-3 minutes

1. `research-cli search "topic" --year 2026 --min-views 100000 --json` — *get structured data*
2. Parse JSON to extract URLs and metadata
3. Filter and analyze results programmatically

### Content Analysis Pipeline
**Time:** 2-5 minutes

1. `research-cli search "topic" --json` — *get structured data*
2. Parse JSON to extract URLs and metadata
3. Use video information for content analysis

## Output Style

**Progress updates:** Brief status for each step
- "Searching for 'AI tools'..."
- "Found 5 videos"
- "Getting video information..."
- "Downloading subtitles..."

**Structured output:** Use `--json` flag for machine-readable output
**Plain text:** Default human-readable format with formatted numbers and durations

## Error Handling

**On failure, offer the user a choice:**
1. Retry with updated yt-dlp
2. Try different search terms
3. Skip problematic videos and continue

**Error decision tree:**

| Error | Cause | Action |
|-------|-------|--------|
| "No module named yt_dlp" | Not installed | Run `pip install yt-dlp` |
| API/extraction errors | Outdated yt-dlp | Run `pip install --upgrade yt-dlp` |
| "No results found" | Bad search query | Try different keywords |
| Subtitle download fails | No subtitles available | Check video has captions |
| Rate limiting | Too many requests | Wait and retry |

## Known Limitations

**Rate limiting:** YouTube may throttle requests if too many are made quickly
**Geo-restrictions:** Some videos may not be available in all regions  
**Private/deleted videos:** Cannot access private or removed content
**Filter limitations:** Complex date ranges may need multiple queries

**Workarounds:**
- Use smaller batch sizes for bulk operations
- Add delays between requests for large datasets
- Check video accessibility before processing
- Verify filter parameters are within valid ranges

## Features

| Feature | Command | Description |
|---------|---------|-------------|
| **Video search** | `search "query"` | Find videos by keywords with advanced filters |
| **Detailed info** | `info "URL"` | Get comprehensive video metadata |
| **URL export** | `export "query"` | Export video URLs for other tools |
| **JSON output** | `--json` flag | Machine-readable structured data |
| **Year filtering** | `--year 2026` | Filter videos by specific year |
| **View filtering** | `--min-views 100000` | Filter by view count range |
| **Duration filtering** | `--min-duration 300` | Filter by video length |
| **Channel filtering** | `--channels "name1,name2"` | Filter by specific channels |
| **Date filtering** | `--days-ago 30` | Filter by recent uploads |
| **Batch processing** | Multiple commands | Process multiple videos efficiently |

## Troubleshooting

```bash
research-cli --help                    # Show all commands
pip install --upgrade yt-dlp          # Update extractor
python -c "import yt_dlp; print(yt_dlp.version.__version__)"  # Check version
```

**Common issues:**
- **Import errors:** Install missing packages with pip
- **Extraction failures:** Update yt-dlp to latest version  
- **No results:** Try broader or different search terms
- **Filter issues:** Check filter parameters are valid