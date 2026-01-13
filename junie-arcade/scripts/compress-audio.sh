#!/bin/bash

##############################################################################
# Audio Compression Script
# Compresses MP3 files to reduce file size while maintaining quality
#
# Requirements:
#   - ffmpeg (install with: brew install ffmpeg on macOS)
#
# Usage:
#   chmod +x scripts/compress-audio.sh
#   ./scripts/compress-audio.sh
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ Error: ffmpeg is not installed${NC}"
    echo -e "${YELLOW}📦 Install ffmpeg first:${NC}"
    echo -e "   macOS: brew install ffmpeg"
    echo -e "   Ubuntu: sudo apt-get install ffmpeg"
    echo -e "   Windows: Download from https://ffmpeg.org/download.html"
    exit 1
fi

echo -e "${BLUE}🎵 Starting audio compression...${NC}\n"

AUDIO_DIR="./public/assets/sounds/music"
BACKUP_DIR="./public/assets/sounds/music/originals"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Audio files to compress
declare -a files=(
    "music-menu.mp3"
    "music-game.mp3"
    "music-victory.mp3"
)

total_original_size=0
total_compressed_size=0
success_count=0
fail_count=0

# Function to get file size in bytes
get_file_size() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f%z "$1"
    else
        stat -c%s "$1"
    fi
}

# Function to format bytes
format_bytes() {
    local bytes=$1
    if [ $bytes -lt 1024 ]; then
        echo "${bytes}B"
    elif [ $bytes -lt 1048576 ]; then
        echo "$(bc <<< "scale=2; $bytes/1024")KB"
    else
        echo "$(bc <<< "scale=2; $bytes/1048576")MB"
    fi
}

# Process each file
for file in "${files[@]}"; do
    input_path="$AUDIO_DIR/$file"
    temp_path="$AUDIO_DIR/${file%.mp3}-compressed.mp3"
    backup_path="$BACKUP_DIR/$file"

    if [ ! -f "$input_path" ]; then
        echo -e "${YELLOW}⚠️  File not found: $file${NC}"
        ((fail_count++))
        continue
    fi

    echo -e "${BLUE}Processing: $file${NC}"

    # Get original file size
    original_size=$(get_file_size "$input_path")
    total_original_size=$((total_original_size + original_size))

    # Compress with ffmpeg
    # Using 96kbps bitrate (good balance between quality and size)
    if ffmpeg -i "$input_path" -b:a 96k -ar 44100 "$temp_path" -y -loglevel error; then
        compressed_size=$(get_file_size "$temp_path")
        total_compressed_size=$((total_compressed_size + compressed_size))

        # Calculate savings
        savings=$((original_size - compressed_size))
        percent=$(bc <<< "scale=1; $savings * 100 / $original_size")

        # Backup original
        cp "$input_path" "$backup_path"

        # Replace original with compressed
        mv "$temp_path" "$input_path"

        echo -e "${GREEN}✅ Compressed successfully${NC}"
        echo -e "   $(format_bytes $original_size) → $(format_bytes $compressed_size) (${percent}% smaller)"
        echo -e "   Original backed up to: $backup_path"
        echo ""

        ((success_count++))
    else
        echo -e "${RED}❌ Failed to compress${NC}\n"
        ((fail_count++))
        # Clean up temp file if it exists
        [ -f "$temp_path" ] && rm "$temp_path"
    fi
done

# Summary
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 COMPRESSION SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Successful: $success_count${NC}"
[ $fail_count -gt 0 ] && echo -e "${RED}❌ Failed: $fail_count${NC}"
echo -e "📦 Total original size: $(format_bytes $total_original_size)"
echo -e "📦 Total compressed size: $(format_bytes $total_compressed_size)"

if [ $total_original_size -gt 0 ]; then
    total_savings=$((total_original_size - total_compressed_size))
    total_percent=$(bc <<< "scale=1; $total_savings * 100 / $total_original_size")
    echo -e "${GREEN}💾 Total savings: $(format_bytes $total_savings) (${total_percent}%)${NC}"
fi

echo -e "${BLUE}═══════════════════════════════════════════${NC}\n"

if [ $success_count -gt 0 ]; then
    echo -e "${YELLOW}🎯 Next steps:${NC}"
    echo "1. Test the compressed audio files in your application"
    echo "2. If quality is acceptable, you can delete the backup folder"
    echo "3. If you need to restore, originals are in: $BACKUP_DIR"
    echo "4. Run: npm run build && npm run start to test"
    echo ""
fi
