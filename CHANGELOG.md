# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2025-07-25

### 🌟 Enhanced Review System
- **Added carrier-initiated review system** using `/review` command
- **Implemented anti-spam protection** with 2-hour cooldown between reviews
- **Added self-review prevention** - carriers cannot review themselves
- **Created 5-star rating system** with visual buttons (⭐⭐⭐⭐⭐ Excellent, ⭐⭐⭐⭐ Good, ⭐⭐⭐ Average, ⭐⭐ Poor)
- **Automatic service type detection** from channel names (Dungeon, Slayer, Blaze, Mastermode, Crimson)
- **JSON-based review storage** in `data/simpleReviews.json`
- **Admin leaderboard command** `/top-carriers` for viewing monthly/all-time statistics
- **Carrier notifications** for positive reviews
- **Comprehensive error handling** with specific messages for different scenarios

### 🔧 Technical Improvements
- Enhanced button interaction handling in `ticketUtils.js`
- Created modular review storage system in `utils/simpleReviews.js`
- Added comprehensive statistics tracking (average ratings, review counts, monthly/all-time data)
- Improved error messages and user feedback

### 🛡️ Security Enhancements
- Implemented review cooldown system to prevent spam
- Added validation to prevent self-reviews
- Enhanced permission checking for review submissions

### 📊 Files Added/Modified
- **New**: `commands/review.js` - Carrier-initiated review command
- **New**: `commands/top-carriers.js` - Admin statistics and leaderboard command
- **New**: `utils/simpleReviews.js` - Review storage and statistics system
- **Modified**: `utils/ticketUtils.js` - Added review button interaction handling
- **Modified**: `README.md` - Updated documentation with review system details

## [2.0.0] - Previous Version

### Core Features
- Multi-category ticket system (Dungeon, Slayer, Crimson, Mastermode, Support)
- Enhanced pricing embeds with bulk discounts
- Dynamic modal forms for different ticket types
- Role-based permissions system
- Rate limiting and error handling
- Analytics and metrics tracking
- Queue management system

### Ticket Categories
- Comprehensive dungeon carry system (F4-F7, M1-M7)
- Slayer carry services (Enderman, Blaze)
- Crimson Isle services (Kuudra, Ashfang)
- Support ticket system

### Architecture
- Modular command structure
- Utility-based architecture
- Environment-based configuration
- JSON data persistence
