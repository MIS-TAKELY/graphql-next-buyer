#!/bin/bash

# Configuration
BACKUP_DIR="/home/vanijay/databasebackup"
LOG_FILE="$BACKUP_DIR/backup.log"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30 # Increased retention for smart backups

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

perform_smart_backup() {
    local container_name=$1
    local db_name=$2
    local db_user=$3
    local label=$4
    local latest_hash_file="$BACKUP_DIR/.${label}_latest_hash"
    local temp_dump="/tmp/${label}_full_temp.sql"
    local final_backup="$BACKUP_DIR/${label}_${DATE}.sql.gz"

    log "Checking for changes in $label database..."

    # Check if container is running
    if ! docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        log "Error: Container $container_name is not running. Skipping."
        return 1
    fi

    # 1. Create a full temporary dump
    # Note: We don't use pipefail here because we are piping into a file redirect which doesn't count as a pipe for pipefail in some shells, 
    # but we'll use a safer approach.
    if ! docker exec "$container_name" pg_dump -U "$db_user" "$db_name" > "$temp_dump" 2>/tmp/pg_dump_error; then
        log "Error: Failed to dump $db_name. $(cat /tmp/pg_dump_error)"
        rm -f "$temp_dump" /tmp/pg_dump_error
        return 1
    fi

    # 2. Calculate hash of "cleaned" version
    # Cleaned version removes comments and \restrict/\unrestrict lines to avoid false positives
    local current_hash=$(grep -vE '^(--|\\restrict|\\unrestrict)' "$temp_dump" | md5sum | cut -d' ' -f1)
    local previous_hash=""
    [ -f "$latest_hash_file" ] && previous_hash=$(cat "$latest_hash_file")

    # 3. Compare and Save
    if [ "$current_hash" != "$previous_hash" ]; then
        log "Changes detected in $label! Saving new backup..."
        gzip -c "$temp_dump" > "$final_backup"
        echo "$current_hash" > "$latest_hash_file"
        local size=$(du -h "$final_backup" | cut -f1)
        log "✓ $label backup completed: $(basename "$final_backup") ($size)"
    else
        log "ℹ No changes detected in $label since last backup. Skipping save."
    fi

    # Cleanup temp files
    rm -f "$temp_dump" /tmp/pg_dump_error
}

log "========================================"
log "Starting smart database backups"
log "========================================"

# Backup Buyer/Seller Database
perform_smart_backup "vanijay_buyer_seller_database" "vanijay_buyer_seller" "postgres" "buyer_seller"

# Backup Admin Database
perform_smart_backup "vanijay_admin_database" "vanijay_admin" "admin" "admin"

# Cleanup old backups (optional, but good practice)
log "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

log "Current disk usage in $BACKUP_DIR: $(du -sh $BACKUP_DIR | cut -f1)"
log "Backup process finished."
log "========================================"
