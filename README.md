# SBC Discord Bot - Enhanced Version

A comprehensive Discord bot for managing Skyblock carry services with advanced features including ticket management, rate limiting, error handling, and analytics.

## 🚀 Features

### Core Functionality
- **Multi-Category Ticket System**: Dungeon, Slayer, Crimson, Mastermode, and Support tickets
- **Enhanced Pricing Embeds**: Beautiful embeds with detailed pricing, bulk discounts, and requirements
- **Dynamic Modal Forms**: Specialized forms for each ticket type with service-specific questions
- **Comprehensive Pricing System**: Built-in pricing calculator with bulk discount support
- **Role-Based Permissions**: Comprehensive permission system for different user roles
- **Rate Limiting**: Prevents spam and abuse with configurable cooldowns
- **Error Handling**: Robust error tracking and recovery
- **Analytics & Metrics**: Performance tracking and usage statistics
- **Queue Management**: Priority-based ticket processing

### 🌟 Enhanced Review System
- **Carrier-Initiated Reviews**: Carriers can request reviews using `/review` in ticket channels
- **Smart Service Detection**: Automatically detects service type from channel name (Dungeon, Slayer, Blaze, Mastermode, Crimson)
- **5-Star Rating System**: ⭐⭐⭐⭐⭐ Excellent, ⭐⭐⭐⭐ Good, ⭐⭐⭐ Average, ⭐⭐ Poor
- **Anti-Spam Protection**: 2-hour cooldown prevents review spam
- **Self-Review Prevention**: Carriers cannot review themselves
- **JSON Storage**: Reviews stored in `data/simpleReviews.json` with full metadata
- **Admin Leaderboards**: `/top-carriers` command for viewing monthly/all-time rankings
- **Automatic Notifications**: Carriers get notified for positive reviews
- **Detailed Statistics**: Track average ratings, review counts, and performance metrics

### Enhanced Embed System

#### 🏰 Mastermode Embeds
- **S Score Carries**: M1 (1.2m), M2 (2.3m), M3 (3.5m), M5 (5.6m), M6 (7.5m), M7 (32m)
- **Completion Carries**: M4 (14m completion)
- **Bulk Pricing**: 5+ carries get discounted rates
- **Visual Design**: Custom emojis and detailed formatting

#### 🔥 Crimson Isle Embeds  
- **Boss Carries**: Ashfang (10m, bulk 8m)
- **Kuudra Tiers**: Basic (8m), Hot (12m), Burning (14m), Fiery (19m), Infernal (40m)
- **Requirements Display**: Shows faction rep and completion requirements
- **Bulk Discounts**: 3+ carries get reduced pricing

#### 🏰 Dungeon Embeds
- **Floor Pricing**: F4 (6m), F5 (8m), F6 (12m), F7 (20m)
- **Service Details**: Full completion with secrets and loot included

#### ⚔️ Slayer Embeds
- **Voidgloom Seraph**: T4 Enderman (5m per carry)
- **Blaze Slayer**: T2 (2m), T3 (3m), T4 (4m)
- **Service Guarantees**: Fast completion with all loot and XP

### Advanced Pricing System
- **Dynamic Price Calculator**: Real-time pricing with bulk discount detection
- **Service Categories**: Organized pricing by service type
- **Bulk Thresholds**: Automatic bulk pricing (5+ for Mastermode, 3+ for Crimson)
- **Pricing Command**: `/pricing` command for detailed price information

### Ticket Categories

#### 🏰 Dungeon Tickets
- All dungeon floors (Entrance through Floor 7)
- Master Mode variants
- Specialized pricing and requirements

#### ⚔️ Slayer Tickets
- All slayer types (Zombie, Spider, Wolf, Enderman, Blaze, Vampire)
- Tier-based pricing
- Experience and completion tracking

#### � Crimson Isle Tickets
- Kuudra carries (Basic through Infernal)
- Crimson Isle services
- Special requirements handling

#### 🎯 Mastermode Tickets
- Master Mode dungeon carries
- Enhanced difficulty and pricing
- Special team requirements

#### 🆘 Support Tickets
- **Technical Support**: Bug reports and technical issues
- **General Questions**: General inquiries and help
- **Payment Support**: Payment issues and refunds
- **User Reports**: Report problematic users or behavior
- **Feature Requests**: Suggest new features
- **Bug Reports**: Report bot bugs

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v18 or higher
- Discord.js v14
- A Discord bot token
- Server with appropriate permissions

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure all required variables:

```env
# Bot Configuration
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_server_id_here
CLIENT_ID=your_bot_client_id_here

# Channels
TICKET_LOG_CHANNEL=ticket_log_channel_id
AUDIT_LOG_CHANNEL=audit_log_channel_id

# Roles
OWNER_ROLE=owner_role_id
STAFF_ROLE=staff_role_id
HELPER_ROLE=helper_role_id
CUSTOMER_ROLE=customer_role_id

# Features
ENABLE_RATE_LIMITING=true
ENABLE_METRICS=true
ENABLE_QUEUE_SYSTEM=true
MAX_TICKETS_PER_USER=3
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=5

# Database (Optional)
DATABASE_URL=your_database_url_here
ENABLE_PERSISTENCE=false
```

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/sbc-discord-bot.git
cd sbc-discord-bot

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Discord bot credentials and server IDs
# See "Configuration" section below for details

# Start the bot
npm start

# Development mode with auto-restart
npm run dev
```

### 📋 Configuration

1. **Create a Discord Bot**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application and bot
   - Copy the bot token to your `.env` file
   - Enable all necessary intents (Guild Members, Message Content, etc.)

2. **Server Setup**:
   - Invite your bot to your Discord server with Administrator permissions
   - Get your server ID (right-click server name → Copy Server ID)
   - Create all necessary roles and channels
   - Copy their IDs to your `.env` file

3. **Role Configuration**:
   - Create carrier roles for each service type
   - Set up admin and staff roles
   - Configure logging channels
   - Update all role IDs in `.env`

4. **Command Registration**:
   ```bash
   # Register slash commands (run once)
   node deployCommands.js
   ```

## 🚀 Quick Start Guide

1. **Fork this repository** on GitHub
2. **Clone your fork** locally
3. **Install dependencies**: `npm install`
4. **Configure environment**: Copy `.env.example` to `.env` and fill in your details
5. **Deploy commands**: `node deployCommands.js` (if available)
6. **Start the bot**: `npm start`
7. **Use `/setup` command** in your Discord server to initialize ticket system

## 📋 Commands Reference

### Review System Commands
- **`/review`** - Carrier-initiated review request (use in ticket channels)
- **`/top-carriers`** - Admin command to view carrier leaderboards and statistics

### Core Bot Commands  
- **`/setup`** - Initialize ticket system (Admin only)
- **`/health`** - Check bot status and performance (Admin only)
- **`/ticket`** - Manage tickets (create, close, etc.)

## 📁 Project Structure

```
sbc-discord-bot/
├── commands/           # Slash commands
│   ├── review.js      # Enhanced review system
│   ├── top-carriers.js # Admin carrier statistics  
│   ├── setup.js       # Ticket system setup
│   └── ...
├── utils/             # Utility functions
│   ├── simpleReviews.js # Review storage & statistics
│   ├── ticketUtils.js   # Ticket management
│   └── ...
├── constants/         # Application constants
├── data/             # JSON data storage (reviews, etc.)
├── .env.example      # Environment template
├── .gitignore        # Git ignore rules
└── index.js          # Main bot file
```

## 🔐 Security & Best Practices

- **Never commit your `.env` file** - It contains sensitive bot tokens
- **Use environment variables** for all configuration
- **Review permissions** regularly to ensure security
- **Monitor bot logs** for unusual activity
- **Keep dependencies updated** for security patches

## 🐛 Troubleshooting

### Common Issues

1. **Bot not responding to commands**:
   - Check bot permissions in your server
   - Ensure bot has necessary intents enabled
   - Verify command registration

2. **Review system not working**:
   - Check channel permissions for customers
   - Verify role IDs in environment variables
   - Ensure `data/` directory exists

3. **Missing dependencies**:
   ```bash
   npm install
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m "Add feature"`
4. Push to your fork: `git push origin feature-name`
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏗️ Architecture

### Core Modules

#### `/constants/`
- Application-wide constants
- Configuration values
- Emoji mappings
- Timeout settings

#### `/utils/`
- **errorHandler.js**: Centralized error handling with context tracking
- **rateLimiter.js**: User and global rate limiting with automatic cleanup
- **metrics.js**: Performance tracking and analytics with persistent storage
- **queueSystem.js**: Priority-based ticket queue management
- **permissions.js**: Role-based access control and security
- **validators/**: Input validation and sanitization
- **ticketUtils.js**: Core ticket functionality and management
- **pricingUtils.js**: Dynamic pricing system with bulk discount calculations

#### `/commands/`
- **setup.js**: Initialize ticket system and categories
- **health.js**: Bot health monitoring and diagnostics
- **pricing.js**: View detailed pricing information for all services

## 🔧 Commands

### `/setup`
**Permission**: Administrator only
- Creates all ticket categories and channels
- Sets up permission overrides  
- Initializes ticket system
- Supports: dungeon, slayer, crimson, mastermode, support

### `/health`
**Permission**: Administrator only
- Shows bot uptime and performance metrics
- Memory usage statistics
- Queue status and ticket counts
- Error tracking information

### `/pricing`
**Permission**: Everyone
- View comprehensive pricing information
- Filter by category (mastermode, crimson, dungeon, slayer)
- Calculate bulk pricing for multiple carries
- Show service requirements and details

## 📊 Monitoring & Analytics

### Metrics Tracking
- Command execution counts
- Error occurrence rates
- Ticket creation statistics
- User activity patterns
- Performance benchmarks

### Error Handling
- Automatic error logging with context
- User-friendly error messages
- Fallback mechanisms
- Recovery procedures

### Queue Management
- Priority-based ticket processing
- Position tracking for users
- Load balancing across staff
- Automatic timeout handling

## 🔒 Security Features

### Rate Limiting
- Per-user cooldowns
- Global rate limits
- Automatic cleanup of expired limits
- Configurable thresholds

### Permission System
- Role-based access control
- Granular permissions per feature
- Security validation on all interactions
- Administrative override capabilities

### Input Validation
- Sanitization of all user inputs
- Length limits and format checking
- XSS prevention
- Injection attack protection

## 🎨 Customization

### Adding New Ticket Types
1. Add category to `config.js` TICKET_CATEGORIES
2. Create modal form in `ticketUtils.js`
3. Add button handler logic
4. Implement channel creation function
5. Update validation arrays

### Modifying Permissions
1. Update role IDs in `.env`
2. Modify permission overrides in channel creation
3. Adjust command permission requirements
4. Update security validations

### Custom Metrics
1. Add new metric types to `metrics.js`
2. Implement tracking in relevant functions
3. Update health command display
4. Configure persistence if needed

## 🚨 Troubleshooting

### Common Issues

#### "Double /setup commands"
- **Fixed**: Removed duplicate command registration
- Commands now register once per guild only

#### "Unknown integration errors"
- **Fixed**: Improved error handling and validation
- Better integration with Discord API

#### Missing Support Category
- **Fixed**: Added SUPPORT to TICKET_CATEGORIES
- Full support ticket system implemented

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` in your environment.

### Health Checks
Use `/health` command to diagnose:
- Memory usage issues
- Queue backlogs
- Error rates
- Performance problems

## 📈 Performance Optimization

- **Memory Management**: Automatic cleanup of expired data
- **Rate Limiting**: Prevents resource exhaustion
- **Queue System**: Efficient ticket processing
- **Error Recovery**: Graceful failure handling
- **Caching**: Optimized data retrieval

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support with this bot:
1. Create a support ticket using the bot
2. Check the troubleshooting section
3. Use the `/health` command for diagnostics
4. Contact the development team

---

**Version**: 2.0.0 Enhanced
**Last Updated**: January 2024
**Discord.js Version**: 14.x
  - T4 Blaze: **4M coins** per carry
  - Dungeon: **10M coins** per carry
  - Crimson: **8M coins** per carry
- Smart coin formatting (25.0M, 3.5K display)
- Live updates showing Total Payment, Remaining Payment, and Paid Amount

### 📊 **Interactive Carry Tracker**
- ➕/➖ buttons for incrementing/decrementing completed carries
- **Claimer-only access** - only the person who claimed the ticket can modify
- **Always at bottom** - tracker message automatically moves to channel bottom
- Smart button states (disabled when appropriate)
- Visual progress indicators with color changes

### 🔄 **Progress Preservation System**
- Preserves carry progress when tickets are unclaimed
- Seamless re-claiming with restored progress from where previous carrier left off
- Visual indicators for re-claimed tickets
- Progress notifications during unclaim operations

### 🔐 **Advanced Permission System**
- Role-based claim permissions for each ticket type
- Specific carrier roles for different slayer types
- General slayer carrier role (can claim any slayer ticket)
- Staff override capabilities for all ticket types
- Secure user-specific button access

### 📝 **Comprehensive Logging System**
- **Separated logging channels** by ticket type:
  - Voidgloom logs for Enderman tickets
  - Blaze logs for Blaze tickets
  - Dungeon logs for Dungeon tickets
  - Crimson logs for Crimson tickets
- Complete chat transcripts with file attachments
- Detailed closure reports with timestamps and statistics
- Automatic file cleanup after logging

### 🛡️ **Robust Error Handling**
- Advanced interaction timeout prevention
- Graceful error recovery with fallback mechanisms
- No-crash design with comprehensive error logging
- Professional user feedback for all operations

## 📋 Requirements

### **System Requirements**
- Node.js v18.0.0 or higher
- Discord.js v14.11.0 or higher
- A Discord bot token with necessary permissions

### **Discord Permissions Required**
- `Send Messages`
- `Embed Links`
- `Attach Files`
- `Manage Channels`
- `Read Message History`
- `Use Slash Commands`
- `Manage Messages`

### **Environment Variables**
Create a `.env` file with the following variables:

```env
# Bot Configuration
DISCORD_TOKEN=your_discord_bot_token
GUILD_ID=your_discord_server_id

# Staff Roles
DUNGEON_STAFF=role_id_for_dungeon_staff
SLAYER_STAFF=role_id_for_slayer_staff
CRIMSON_STAFF=role_id_for_crimson_staff

# Logging Channels
TICKET_LOGS_CHANNEL=general_ticket_logs_channel_id
VOIDGLOOM_LOGS_CHANNEL=enderman_logs_channel_id
BLAZE_LOGS_CHANNEL=blaze_logs_channel_id
DUNGEON_LOGS_CHANNEL=dungeon_logs_channel_id
CRIMSON_LOGS_CHANNEL=crimson_logs_channel_id

# Carrier Roles
T4_EMAN_BRUISER_CARRIER=t4_eman_bruiser_carrier_role_id
T4_EMAN_SEPULTURE_CARRIER=t4_eman_sepulture_carrier_role_id
T2_BLAZE_CARRIER=t2_blaze_carrier_role_id
T3_BLAZE_CARRIER=t3_blaze_carrier_role_id
T4_BLAZE_CARRIER=t4_blaze_carrier_role_id
SLAYER_CARRIER=general_slayer_carrier_role_id
DUNGEON_CARRIER=dungeon_carrier_role_id
CRIMSON_CARRIER=crimson_carrier_role_id
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sbc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Fill in all required values

4. **Start the bot**
   ```bash
   npm start
   # or
   node index.js
   ```

## 📖 Usage Guide

### **Setting Up Ticket Panels**
Use the `/setup` command to create ticket panels in your channels:

```
/setup
```

This creates interactive buttons for users to open different types of tickets.

### **Opening Tickets**
1. Click the appropriate ticket button (Slayer/Dungeon/Crimson)
2. Select specific ticket type from the dropdown
3. Fill out the modal form with required information
4. Ticket channel is automatically created

**Note:** Users can only have **one open ticket at a time**. You must close your existing ticket before creating a new one.

### **Claiming Tickets**
1. **Carriers** with appropriate roles can click the "🔖 Claim" button
2. System checks permissions automatically
3. Payment tracker appears with real-time calculations
4. Only the claimer can use ➕/➖ buttons

### **Tracking Progress**
- Use ➕ button to increment completed carries
- Use ➖ button to decrement if needed
- Payment information updates automatically
- Tracker always stays at bottom of channel

### **Unclaiming/Re-claiming**
1. Click "🔓 Unclaim" to release the ticket
2. Progress is automatically preserved
3. New carriers can claim with "🔖 Claim" button
4. Previous progress is restored seamlessly

### **Closing Tickets**
- Only **Staff** can close tickets using "🔒 Close" button
- Complete chat transcript is generated
- Logs are sent to appropriate logging channels
- Channel is automatically deleted

## 🎮 Slash Commands

### `/setup`
Creates the main ticket panel with buttons for opening tickets.

### `/ticket [category]`
Alternative way to open tickets directly via command.

### `/carrystats`
View carry statistics (if implemented).

## 📊 Payment Calculator Details

The payment system automatically calculates:

- **Total Payment**: Full amount owed for all requested carries
- **Remaining Payment**: Amount still owed (updates as carries complete)
- **Paid Amount**: Amount earned so far based on completed carries

Example for 5x T4 Blaze carries:
```
💰 Total Payment: 20.0M coins
💸 Remaining Payment: 12.0M coins  
✨ Paid Amount: 8.0M coins
(After completing 2 out of 5 carries)
```

## 🔧 Configuration

### **Customizing Prices**
Edit `config.js` to modify carry prices:

```javascript
export const CARRY_PRICES = {
  'T4 Enderman Bruiser': 5000000, // 5M coins
  'T4 Enderman Sepulture': 5000000, // 5M coins
  'T2 Blaze': 2000000, // 2M coins
  'T3 Blaze': 3000000, // 3M coins
  'T4 Blaze': 4000000, // 4M coins
  'Dungeon': 10000000, // 10M coins
  'Crimson': 8000000, // 8M coins
};
```

### **Adding New Ticket Types**
1. Update `TICKET_CATEGORIES` in `config.js`
2. Add corresponding role IDs to `.env`
3. Update modal forms in `utils/ticketUtils.js`
4. Add pricing to `CARRY_PRICES`

## 🔒 Security Features

- **Role-based permissions** for claiming tickets
- **User-specific button access** for carry tracking
- **Staff-only closure** capabilities
- **One ticket per user** restriction to prevent spam
- **Comprehensive audit logging**
- **Interaction timeout protection**

## 📁 File Structure

```
sbc/
├── commands/           # Slash commands
├── events/            # Discord event handlers
├── utils/             # Utility functions
│   └── ticketUtils.js # Core ticket system logic
├── config.js          # Configuration and pricing
├── index.js           # Main bot entry point
├── .env              # Environment variables
└── README.md         # This documentation
```

## 🐛 Troubleshooting

### **Common Issues**

**Bot not responding to interactions:**
- Check bot permissions in Discord server
- Verify bot token is correct
- Ensure all environment variables are set

**Role permissions not working:**
- Double-check role IDs in `.env` file
- Verify users have the correct roles assigned
- Check bot has permission to read server roles

**Logging not working:**
- Verify logging channel IDs are correct
- Ensure bot has permission to send messages in log channels
- Check if channels exist and are accessible

**Payment calculations incorrect:**
- Verify pricing in `config.js`
- Check if ticket type detection is working correctly
- Review carry count extraction from forms

## 🎯 Best Practices

1. **Set up dedicated logging channels** for each ticket type
2. **Create specific carrier roles** for better permission management
3. **Regularly backup your configuration** and environment variables
4. **Monitor bot logs** for any errors or issues
5. **Test thoroughly** before deploying to production server

## 📞 Support

For issues, feature requests, or questions:
- Check the troubleshooting section above
- Review Discord.js documentation for interaction handling
- Ensure all requirements are met and properly configured

---

## 🏆 Credits

Built with Discord.js v14 for Hypixel Skyblock carry service management.

**Features:** Complete ticket system, payment calculator, progress preservation, role-based permissions, comprehensive logging, and robust error handling.

### `/ticket reopen <ticketId>`
- **Description**: Reopens a closed ticket (if closed within 24 hours).
- **Permission**: Staff only.

### `/ticket stats`
- **Description**: Displays ticket stats (open, claimed, closed).
- **Permission**: Staff only.

## File Overview
- **commands/setupTickets.js**: Handles `/setupTickets` command.
- **commands/ticket.js**: Manages `/ticket reopen` and `/ticket stats` commands.
- **events/interactionCreate.js**: Handles button interactions and modal submissions.
- **utils/openai.js**: Summarizes ticket messages using OpenAI.
- **utils/supabase.js**: Logs and updates tickets in Supabase.
- **config.js**: Stores constants and environment variables.
- **index.js**: Entry point for the bot.

## Notes
- Ensure all environment variables are correctly set.
- Use Node.js v16 or higher for compatibility with discord.js v15.
- Handle errors gracefully and check logs for debugging.

## License
This project is licensed under the MIT License.
# SBC-Tickets
