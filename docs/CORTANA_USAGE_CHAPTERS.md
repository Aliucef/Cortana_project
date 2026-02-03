# Cortana AI Assistant - User Guide & Features Documentation

**Additional Chapters for Graduation Report**

---

# Chapter 11: Web Dashboard - User Interface & Features

## 11.1 Introduction to the Web Dashboard

The Cortana web dashboard serves as the primary control center for managing your personal finances, tracking health activities, staying updated with news, and interacting with the AI assistant. Built with React.js and featuring a modern, intuitive interface, the dashboard provides a comprehensive view of all your data in one place.

**Access:** The web dashboard is accessible through any modern web browser at `http://localhost:3000` after authentication.

---

## 11.2 Authentication & User Onboarding

### 11.2.1 Registration Process

New users begin their Cortana experience through a streamlined registration process:

1. **Sign Up Screen**
   - Users enter their basic information: full name, username, email, and password
   - Password strength validation ensures security requirements are met
   - Real-time field validation provides immediate feedback
   - Upon successful registration, users are automatically logged in

**[SCREENSHOT: Registration screen showing the signup form]**

### 11.2.2 Login Experience

Returning users access their personalized dashboard through the login screen:

1. **Login Screen**
   - Username and password fields with "Remember Me" option
   - Password visibility toggle for user convenience
   - "Forgot Password" link for account recovery
   - Error messages guide users if credentials are incorrect

**[SCREENSHOT: Login screen with username and password fields]**

### 11.2.3 Session Management

- Sessions persist across browser tabs and windows
- Automatic logout after 7 days of inactivity for security
- Seamless token refresh ensures uninterrupted usage
- Multi-device support allows access from different browsers

---

## 11.3 Main Dashboard Overview

### 11.3.1 Dashboard Layout

The main dashboard presents a comprehensive overview of all user activities and financial status:

**[SCREENSHOT: Main dashboard showing all widgets and statistics]**

**Key Components:**

1. **Navigation Sidebar** (Left)
   - Dashboard (Home)
   - Finance Management
   - Health & Fitness
   - News Feed
   - AI Chat
   - Profile Settings
   - Logout option

2. **Header Bar** (Top)
   - Welcome message with user's name
   - Current date and time
   - Notification bell icon
   - Quick search functionality
   - User profile avatar

3. **Main Content Area** (Center)
   - Financial summary cards
   - Quick action buttons
   - Recent transactions widget
   - Health statistics
   - News highlights
   - AI insights panel

### 11.3.2 Financial Overview Cards

The dashboard prominently displays three key financial metrics:

**[SCREENSHOT: Financial summary cards showing Total Balance, Income, and Expenses]**

1. **Total Balance Card**
   - Displays net balance (Income - Expenses)
   - Color-coded: Green (positive), Red (negative)
   - Animated counter shows balance changes
   - Period selector (This Week, This Month, All Time)

2. **Total Income Card**
   - Shows cumulative income for selected period
   - Upward trend arrow with percentage change
   - Green gradient background
   - Click to filter income transactions

3. **Total Expenses Card**
   - Displays total expenses for selected period
   - Downward trend arrow with percentage change
   - Red gradient background
   - Click to filter expense transactions

### 11.3.3 Quick Action Buttons

Four prominent action buttons enable rapid task execution:

**[SCREENSHOT: Quick action buttons row]**

1. **Add Expense** (Orange/Red gradient)
   - Opens expense entry modal
   - Quick expense logging in under 5 seconds

2. **Add Income** (Green gradient)
   - Opens income entry modal
   - Record salary, freelance work, or other income

3. **View Reports** (Blue gradient)
   - Generates detailed financial reports
   - PDF export available

4. **Ask Cortana** (Purple gradient)
   - Opens AI chat interface
   - Get instant financial insights

---

## 11.4 Finance Management Module

### 11.4.1 Finance Dashboard

The Finance section provides comprehensive tools for managing personal finances:

**[SCREENSHOT: Finance dashboard with all components visible]**

**Main Components:**

1. **Period Selector**
   - Weekly view: Shows last 7 days
   - Monthly view: Shows current month
   - Custom range: Select specific date range
   - Year-to-date option

2. **Budget Progress Bar**
   - Visual representation of spending vs. budget
   - Color indicators: Green (<70%), Yellow (70-90%), Red (>90%)
   - Remaining budget amount displayed
   - Days left in current period

**[SCREENSHOT: Budget progress bar showing percentage and amount]**

3. **Category Breakdown Chart**
   - Interactive pie chart showing expense distribution
   - Categories: Food, Transport, Shopping, Entertainment, Bills, Health, Other
   - Hover to see exact amounts and percentages
   - Click category to filter transactions

**[SCREENSHOT: Pie chart with category breakdown]**

4. **Spending Trends Graph**
   - Line chart showing daily/weekly spending patterns
   - Compare current period with previous period
   - Identify spending spikes and trends
   - Interactive data points with tooltips

**[SCREENSHOT: Spending trends line chart]**

### 11.4.2 Adding Transactions

#### Manual Entry

Users can manually add transactions through an intuitive form:

**[SCREENSHOT: Add transaction modal form]**

**Transaction Entry Process:**

1. **Select Transaction Type**
   - Toggle between "Expense" and "Income"
   - Different color schemes for each type

2. **Enter Amount**
   - Numeric input with currency symbol
   - Supports decimal values
   - Validates positive numbers

3. **Choose Category**
   - Dropdown menu with predefined categories
   - Expense categories: Food, Transport, Shopping, Entertainment, Bills, Health, Education, Other
   - Income categories: Salary, Freelance, Business, Investment, Gift, Other

4. **Add Description** (Optional)
   - Text field for transaction details
   - Useful for future reference
   - Supports up to 200 characters

5. **Select Date**
   - Calendar picker for transaction date
   - Defaults to current date
   - Can backdate transactions

6. **Upload Receipt** (Optional)
   - Photo upload button
   - Supports JPG, PNG formats
   - Automatic OCR processing
   - Extracts amount and merchant name

**[SCREENSHOT: Receipt upload interface]**

#### Natural Language Entry via AI Chat

Users can add transactions conversationally through the AI chat:

**[SCREENSHOT: Chat interface showing natural language transaction entry]**

**Example Conversations:**

User: "I spent $45 on groceries at Walmart"
Cortana: "✅ I've logged an expense of $45.00 in the Food category for Walmart. Your remaining budget this month is $755."

User: "Add income of $2500 from freelance work"
Cortana: "✅ Great! I've added $2,500.00 as income in the Freelance category. Your total income this month is now $5,250."

User: "I bought coffee for $4.50"
Cortana: "☕ I've recorded $4.50 as an expense in the Food category. Would you like to track coffee purchases separately?"

### 11.4.3 Transaction History

The transaction history provides a comprehensive log of all financial activities:

**[SCREENSHOT: Transaction history list with filters]**

**Features:**

1. **Transaction List**
   - Chronologically sorted (newest first)
   - Each entry shows: Date, Category icon, Description, Amount (color-coded)
   - Edit button (pencil icon) to modify transaction
   - Delete button (trash icon) with confirmation prompt

2. **Advanced Filters**
   - Date range selector
   - Transaction type filter (Income/Expense/All)
   - Category filter (multi-select)
   - Amount range slider
   - Search by description

**[SCREENSHOT: Filter panel with multiple filter options]**

3. **Bulk Actions**
   - Select multiple transactions
   - Delete selected
   - Export to CSV
   - Generate PDF report

4. **Transaction Details Modal**
   - Click any transaction to see full details
   - Edit any field inline
   - View attached receipt image
   - See AI-extracted data from OCR
   - Transaction history/audit trail

**[SCREENSHOT: Transaction details modal]**

### 11.4.4 Budget Management

#### Setting Budgets

Users can set monthly or weekly budgets to control spending:

**[SCREENSHOT: Budget setting form]**

**Budget Configuration:**

1. **Budget Amount**
   - Set overall spending limit
   - Separate budgets for weekly/monthly periods
   - Currency-formatted input

2. **Budget Period**
   - Weekly (resets every Monday)
   - Monthly (resets on 1st of month)
   - Custom period

3. **Alert Thresholds**
   - Warning at 70% (yellow alert)
   - Danger at 90% (red alert)
   - Push notifications via Telegram bot

4. **Rollover Settings**
   - Option to roll over unused budget to next period
   - Or reset to fixed amount each period

#### Budget Tracking

Real-time budget monitoring keeps users informed:

**[SCREENSHOT: Budget tracking dashboard]**

**Visual Indicators:**

1. **Progress Bar**
   - Green: Under 70% budget used (On track ✅)
   - Yellow: 70-90% budget used (Warning ⚠️)
   - Red: Over 90% budget used (Danger ⛔)

2. **Budget Status Card**
   - Amount spent: $1,234.56
   - Budget limit: $1,500.00
   - Remaining: $265.44
   - Days left: 12 days

3. **Daily Average**
   - Shows average spending per day
   - Recommended daily limit to stay on budget
   - "You can spend $22.12 per day for the next 12 days"

### 11.4.5 Category Goals

Set specific spending limits for individual categories:

**[SCREENSHOT: Category goals management screen]**

**Features:**

1. **Category Goal Setup**
   - Set limits for each spending category
   - Example: Food: $400, Transport: $150, Entertainment: $100
   - Visual progress bars for each category

2. **Goal Tracking**
   - Real-time updates as expenses are added
   - Color-coded status (on track, approaching limit, exceeded)
   - Notifications when nearing category limits

3. **Goal History**
   - Track performance over time
   - Monthly comparison charts
   - Success rate percentage

**[SCREENSHOT: Category goal progress bars]**

### 11.4.6 Financial Reports & Analytics

#### Summary Reports

Generate comprehensive financial reports:

**[SCREENSHOT: Financial report summary page]**

**Report Sections:**

1. **Income Summary**
   - Total income by source
   - Month-over-month comparison
   - Income trends chart
   - Top income sources

2. **Expense Summary**
   - Total expenses by category
   - Category breakdown chart
   - Expense trends over time
   - Top merchants/vendors

3. **Net Balance Analysis**
   - Monthly profit/loss statement
   - Savings rate calculation
   - Financial health score
   - Budget adherence percentage

4. **Spending Patterns**
   - Day-of-week analysis (which days you spend most)
   - Time-of-month patterns (beginning vs. end of month)
   - Recurring expenses identification
   - Unusual spending alerts

**[SCREENSHOT: Spending patterns analysis chart]**

#### Export Options

Reports can be exported in multiple formats:

1. **PDF Report**
   - Formatted professional document
   - Includes all charts and graphs
   - Suitable for printing
   - Password protection option

**[SCREENSHOT: PDF export dialog]**

2. **Excel/CSV Export**
   - Raw transaction data
   - Pivot table ready
   - Import into other financial software
   - Includes all transaction metadata

3. **Print View**
   - Printer-friendly layout
   - Optimized for A4/Letter paper
   - Black & white friendly

### 11.4.7 Recurring Expenses Tracking

Manage subscriptions and recurring charges:

**[SCREENSHOT: Recurring expenses list]**

**Features:**

1. **Add Recurring Expense**
   - Service name (e.g., Netflix, Spotify)
   - Amount
   - Frequency (daily, weekly, monthly, yearly)
   - Start date and end date (if applicable)
   - Category assignment

2. **Recurring Expense Dashboard**
   - List of all active subscriptions
   - Total monthly recurring cost
   - Upcoming renewals calendar
   - "Cancel" button for each subscription

3. **Automatic Logging**
   - Cortana automatically logs recurring expenses on due dates
   - Sends reminder notifications 1 day before
   - Tracks payment history

**[SCREENSHOT: Recurring expenses calendar view]**

---

## 11.5 AI Chat Interface

### 11.5.1 Chat Window Overview

The AI chat is the core conversational interface with Cortana:

**[SCREENSHOT: AI chat interface full screen]**

**Interface Elements:**

1. **Chat Header**
   - Cortana avatar image
   - "Cortana AI Assistant" title
   - Online status indicator
   - Options menu (clear chat, settings)

2. **Message Area**
   - Scrollable conversation history
   - Message bubbles (user messages: blue, Cortana: gray)
   - Timestamps for each message
   - Typing indicator when Cortana is responding

3. **Input Area**
   - Text input field with placeholder "Ask me anything..."
   - Send button (paper plane icon)
   - Voice input button (microphone icon)
   - Emoji picker button
   - File attachment button (for receipts)

**[SCREENSHOT: Chat input area with buttons]**

### 11.5.2 Conversational Features

#### Financial Queries

Users can ask about their finances naturally:

**[SCREENSHOT: Chat showing financial query examples]**

**Example Queries:**

**Q:** "How much did I spend this month?"
**A:** "You've spent $1,234.56 this month. That's 15% less than last month! Your biggest expense categories are Food ($450) and Transport ($280). 🎉"

**Q:** "What's my balance?"
**A:** "Your current balance is $3,456.78. You have $765.22 remaining in your budget for this month (18 days left). You're on track! ✅"

**Q:** "Show me my coffee expenses"
**A:** "You've spent $142.50 on coffee this month across 31 transactions. That's about $4.60 per coffee. Your most frequent spot is Starbucks (18 visits). ☕"

**Q:** "When is my next bill due?"
**A:** "Your upcoming bills:
- Internet: $59.99 (due in 3 days)
- Phone: $45.00 (due in 8 days)
- Netflix: $15.99 (due in 12 days)
Total: $120.98 📱"

#### Budget Advice

Cortana provides personalized financial advice:

**[SCREENSHOT: Chat showing budget advice]**

**Example Conversations:**

**Q:** "Should I buy a $200 gadget?"
**A:** "Based on your budget, you have $265 remaining this month. Buying a $200 gadget would leave you with only $65 for 12 days. That's $5.42 per day. I'd recommend waiting until next month or checking if it's really necessary. 🤔"

**Q:** "How can I save more money?"
**A:** "I've analyzed your spending patterns! Here are 3 ways you could save:

1. **Coffee shops ($142/month)**: Making coffee at home could save ~$100/month
2. **Food delivery ($230/month)**: Cooking at home 2-3 more times/week could save ~$80/month
3. **Unused subscriptions**: You have Hulu ($12.99) but haven't used it in 2 months

Potential savings: **$192.99/month** or **$2,315.88/year**! 💰"

#### Transaction Logging via Chat

Add transactions conversationally without forms:

**[SCREENSHOT: Chat showing transaction logging]**

**Natural Language Examples:**

✅ "I spent $45 on groceries"
✅ "Paid $1200 for rent today"
✅ "Got paid $3500 for freelance work"
✅ "Coffee was $4.50 at Starbucks"
✅ "Bought lunch for $12"
✅ "Filled gas for $55 yesterday"
✅ "Received $50 as a gift from mom"

**Cortana's Response:**
"✅ Logged! I've added $45.00 as an expense in the Food category. Your remaining budget is $720.50 for this month."

### 11.5.3 Voice Input Feature

Speak to Cortana instead of typing:

**[SCREENSHOT: Voice input active state with waveform animation]**

**How to Use Voice Input:**

1. Click the microphone icon in the chat input area
2. Allow microphone permissions (first time only)
3. Speak your message clearly
4. Click stop or it auto-stops after silence
5. Review transcribed text before sending
6. Edit if needed, then send

**Voice Command Examples:**

🎤 "Add expense fifty dollars shopping"
🎤 "What did I spend on food this week"
🎤 "Show my balance"
🎤 "I bought coffee for five dollars"

**Features:**

- Real-time speech-to-text conversion
- Supports English and Arabic
- Background noise filtering
- Automatic punctuation
- Speaker adaptation (learns your voice)

**[SCREENSHOT: Voice transcription being converted to text]**

### 11.5.4 Receipt OCR via Chat

Upload receipt photos for automatic expense extraction:

**[SCREENSHOT: Receipt upload interface in chat]**

**How Receipt OCR Works:**

1. **Upload Receipt**
   - Click attachment button in chat
   - Select receipt photo from device
   - Or drag & drop image into chat
   - Supports JPG, PNG formats

**[SCREENSHOT: Receipt photo being uploaded]**

2. **OCR Processing**
   - Cortana analyzes the receipt image
   - Extracts: Total amount, merchant name, date, line items
   - Processing takes 2-3 seconds
   - Shows "Analyzing receipt..." message

**[SCREENSHOT: OCR processing animation]**

3. **Confirmation & Editing**
   - Cortana displays extracted data:
     ```
     📄 Receipt Detected!
     Merchant: Walmart
     Date: January 26, 2026
     Total: $67.43

     Items found:
     - Milk $3.99
     - Bread $2.50
     - Eggs $4.99
     - Chicken $12.95
     - Vegetables $8.00
     ...

     Category suggestion: Food

     Is this correct? (Yes/No/Edit)
     ```

**[SCREENSHOT: Extracted receipt data with confirmation buttons]**

4. **Save or Edit**
   - Click "Yes" to save automatically
   - Click "Edit" to modify any field
   - Click "No" to discard and re-upload

5. **Transaction Created**
   - Expense logged with receipt attached
   - Receipt image stored for future reference
   - Can view receipt anytime from transaction details

**[SCREENSHOT: Transaction saved with receipt attachment]**

**OCR Accuracy:**
- Typical accuracy: 90-95% for clear receipts
- Handles handwritten receipts (lower accuracy)
- Works with faded or creased receipts
- Supports multiple languages

### 11.5.5 AI-Powered Insights

Cortana proactively provides financial insights:

**[SCREENSHOT: AI insights in chat]**

**Automatic Insights:**

1. **Spending Alerts**
   - "⚠️ You've spent $450 on dining out this month, which is 50% more than usual. Consider cooking at home more often!"

2. **Budget Warnings**
   - "🚨 Alert: You've used 85% of your monthly budget with 10 days remaining. Try to limit spending to $15/day."

3. **Savings Opportunities**
   - "💡 Insight: You typically spend $200 more in the first week of each month. Planning ahead could help smooth out your spending."

4. **Pattern Recognition**
   - "📊 I noticed you always order food on Fridays ($40-60). Meal prepping on Thursday could save you ~$200/month!"

5. **Bill Reminders**
   - "⏰ Reminder: Your electricity bill ($89.50) is due in 2 days. Make sure you have sufficient funds."

6. **Unusual Activity**
   - "🔍 Unusual spending detected: $450 at Electronics Store. This is above your typical purchase. Was this intentional?"

### 11.5.6 Chat History & Context

Cortana maintains conversation context:

**[SCREENSHOT: Chat history showing continuous conversation]**

**Context Awareness:**

**Conversation 1:**
User: "How much did I spend on transport?"
Cortana: "You spent $280 on transport this month."

User: "How does that compare to last month?"
Cortana: "That's $35 more than last month ($245). The increase is mainly from Uber rides (+$50) offset by less gas spending (-$15)."

User: "Why did I use Uber more?"
Cortana: "Looking at the dates, you had 8 Uber rides during the week of January 10-17. Your car was in the shop that week (I see the mechanic bill on Jan 10)."

**Features:**
- Remembers conversation history within session
- Can reference previous questions and answers
- Maintains context for follow-up questions
- Clears context when starting a new topic

---

## 11.6 News Aggregation Feature

### 11.6.1 News Dashboard

Stay informed with personalized news feeds:

**[SCREENSHOT: News dashboard with multiple news categories]**

**News Dashboard Layout:**

1. **Category Tabs**
   - All News (default)
   - Lebanese News
   - Technology
   - Business
   - Sports
   - Entertainment
   - Health
   - Science

2. **News Cards**
   - Article headline
   - Source logo and name
   - Publication date/time
   - Short excerpt (2-3 lines)
   - Featured image
   - "Read More" button
   - Share button

**[SCREENSHOT: Individual news card design]**

3. **Filter Options**
   - Sort by: Latest, Most Popular, Relevance
   - Source filter (select specific news outlets)
   - Date range selector

### 11.6.2 Lebanese News Focus

Dedicated section for Lebanese current affairs:

**[SCREENSHOT: Lebanese news feed]**

**Lebanese News Sources:**

- L'Orient Today
- The Daily Star Lebanon
- LBCI News
- MTV Lebanon
- An-Nahar
- Executive Magazine
- Beirut.com
- Lebanon Files

**Features:**

- Bilingual support (English & Arabic)
- Location-based relevance (Beirut, Tripoli, Sidon, etc.)
- Categories: Politics, Economy, Society, Culture
- Real-time updates from RSS feeds

### 11.6.3 News Summaries

AI-generated summaries for quick reading:

**[SCREENSHOT: News article with AI summary]**

**Summary Feature:**

1. **Automatic Summarization**
   - Click "Summarize" button on any article
   - Cortana generates 3-4 sentence summary
   - Highlights key points
   - Takes 2-3 seconds to generate

2. **Summary Example:**

   **Original Article:** (1500 words)
   **AI Summary:**
   "Lebanon's central bank announced new monetary policies aimed at stabilizing the local currency. The measures include increased reserve requirements for banks and stricter lending criteria. Economic experts predict this could reduce inflation by 2-3% over the next quarter. However, some analysts worry about potential impacts on business loans."

3. **Reading Time Saved**
   - Original: 6 minutes
   - Summary: 30 seconds
   - Time saved: 5.5 minutes ⚡

**[SCREENSHOT: Reading time comparison]**

### 11.6.4 Daily News Briefing

Receive personalized daily news digests:

**[SCREENSHOT: Daily briefing interface]**

**Briefing Delivery:**

1. **Email Digest** (8:00 AM daily)
   - Top 5 Lebanese news stories
   - 3 personalized news items (based on your interests)
   - Weather forecast
   - Your financial summary for yesterday

2. **Telegram Notification**
   - Push notification at scheduled time
   - Tap to read in Telegram bot
   - Quick replies: "Read more", "Not interested", "Save for later"

3. **In-App Banner**
   - News briefing appears on dashboard
   - Swipeable news cards
   - Dismiss or read individual items

**[SCREENSHOT: Daily briefing notification]**

**Customization Options:**

- Set briefing time (default: 8:00 AM)
- Choose news categories to include
- Enable/disable email/Telegram delivery
- Adjust number of articles (3-10)

### 11.6.5 News Preferences

Customize your news feed:

**[SCREENSHOT: News preferences settings page]**

**Preference Options:**

1. **Category Interests**
   - Select favorite categories (multi-select)
   - Slider for each category (Low/Medium/High interest)
   - Affects article recommendations

2. **Source Selection**
   - Choose trusted news sources
   - Block specific sources
   - Prioritize favorite outlets

3. **Language Preferences**
   - English articles only
   - Arabic articles only
   - Both languages (bilingual)

4. **Notification Settings**
   - Breaking news alerts (on/off)
   - Daily briefing time
   - Push notification channels (Email, Telegram, In-app)

5. **Content Filters**
   - Hide sensitive content
   - Filter by keywords
   - Mature content settings

---

## 11.7 Health & Fitness Tracking

### 11.7.1 Health Dashboard

Track your fitness journey:

**[SCREENSHOT: Health dashboard overview]**

**Dashboard Components:**

1. **Current Stats**
   - Current weight with trend arrow
   - BMI calculation with indicator
   - Weight change this month (+/- lbs)
   - Target weight progress

2. **Weight Tracking Chart**
   - Line graph showing weight over time
   - Date range selector (1 month, 3 months, 6 months, 1 year)
   - Milestone markers
   - Trend line with projection

**[SCREENSHOT: Weight tracking chart]**

3. **Workout Summary**
   - Workouts this week: 4/6
   - Total workout time: 4h 30m
   - Calories burned: 1,850 kcal
   - Active days streak: 12 days 🔥

4. **Quick Actions**
   - Log Weight button
   - Log Workout button
   - View Workout Plans button
   - Generate Report button

### 11.7.2 Workout Plans

Access pre-built and custom workout routines:

**[SCREENSHOT: Workout plans library]**

**Available Plans:**

1. **Beginner Full Body** (3 days/week)
   - Focus: Building foundation
   - Duration: 45 minutes per session
   - Equipment: Minimal (dumbbells, bodyweight)

2. **Intermediate Strength** (4 days/week)
   - Focus: Muscle building
   - Duration: 60 minutes per session
   - Equipment: Full gym access

3. **Cardio & Conditioning** (5 days/week)
   - Focus: Endurance and fat loss
   - Duration: 30-45 minutes per session
   - Equipment: Treadmill, bike, or outdoor

4. **Advanced Powerlifting** (5 days/week)
   - Focus: Strength maximization
   - Duration: 90 minutes per session
   - Equipment: Barbell, power rack, plates

**[SCREENSHOT: Individual workout plan details]**

**Plan Details Include:**

- Exercise list with sets/reps/rest
- Video demonstrations (link to exercise library)
- Progressive overload schedule
- Deload weeks
- Success metrics

### 11.7.3 Logging Workouts

Record your training sessions:

**[SCREENSHOT: Workout logging form]**

**Workout Entry Form:**

1. **Workout Type**
   - Strength Training
   - Cardio
   - Sports
   - Flexibility/Yoga
   - Other

2. **Exercise Details** (for strength training)
   - Exercise name (searchable dropdown)
   - Sets
   - Reps
   - Weight used
   - Rest time between sets
   - Add another exercise (+ button)

3. **Cardio Details**
   - Activity type (Running, Cycling, Swimming, etc.)
   - Duration (minutes)
   - Distance (optional)
   - Intensity (Low/Medium/High)
   - Average heart rate (if available)

4. **Additional Info**
   - Workout notes
   - How did you feel? (emoji selector: 😫😐😊💪🔥)
   - Duration
   - Calories burned (auto-calculated or manual)

**[SCREENSHOT: Workout entry with multiple exercises]**

**Quick Log Feature:**
- One-tap logging for recent/frequent workouts
- "Repeat Last Workout" button
- Template saving for routines

### 11.7.4 Weight Logging

Track your weight progress:

**[SCREENSHOT: Weight logging interface]**

**Weight Entry:**

1. **Simple Form**
   - Weight input (lbs or kg)
   - Date picker (defaults to today)
   - Optional notes
   - Photo attachment (progress photo)

2. **Automatic Calculations**
   - BMI update
   - Change from last entry
   - Change from starting weight
   - Weekly/monthly average

3. **Weight History**
   - List of all weight entries
   - Edit/delete past entries
   - Export to CSV

**[SCREENSHOT: Weight history list]**

### 11.7.5 Progress Analytics

Visualize your fitness progress:

**[SCREENSHOT: Fitness analytics page]**

**Analytics Include:**

1. **Weight Progress Chart**
   - Line graph with target weight line
   - Color-coded zones (above/below target)
   - Projected date to reach goal

2. **Workout Consistency**
   - Calendar heatmap (GitHub-style)
   - Streak counter
   - Best streak record
   - Missed workout days highlighted

**[SCREENSHOT: Workout consistency heatmap]**

3. **Exercise Volume Over Time**
   - Total weight lifted per week
   - Volume by muscle group
   - Progressive overload tracking

4. **Personal Records**
   - PRs for each exercise
   - Date achieved
   - Video proof (if uploaded)
   - "Beat This!" challenges

**[SCREENSHOT: Personal records list]**

---

## 11.8 Profile & Settings

### 11.8.1 User Profile

Manage your account information:

**[SCREENSHOT: Profile page]**

**Profile Sections:**

1. **Personal Information**
   - Full Name
   - Username (display name)
   - Email address
   - Phone number
   - Profile picture upload

**[SCREENSHOT: Profile edit form]**

2. **Account Settings**
   - Change password
   - Email preferences
   - Privacy settings
   - Data export (GDPR compliance)
   - Delete account option

3. **Financial Settings**
   - Default currency (USD, LBP, EUR, etc.)
   - Decimal places (0, 2)
   - First day of week (for weekly budgets)
   - Fiscal year start month

4. **Notification Preferences**
   - Email notifications (on/off per type)
   - Push notifications
   - Telegram bot integration
   - SMS alerts (if phone number provided)

**[SCREENSHOT: Notification preferences panel]**

### 11.8.2 Telegram Bot Integration

Connect your Telegram account for mobile notifications:

**[SCREENSHOT: Telegram integration page]**

**Integration Steps:**

1. **Connect Telegram**
   - Click "Connect Telegram" button
   - System generates 6-digit code: `ABC123`
   - Valid for 10 minutes

**[SCREENSHOT: Telegram connection code display]**

2. **In Telegram App**
   - Open Telegram
   - Search for `@CortanaAIBot`
   - Start conversation: `/start`
   - Send verification code: `/verify ABC123`
   - Confirmation message: "✅ Connected successfully!"

**[SCREENSHOT: Telegram bot conversation]**

3. **Connected Features**
   - Receive daily financial summaries
   - Get budget alerts
   - Log expenses via Telegram
   - Ask Cortana questions from mobile
   - Receive news briefings
   - Workout reminders

**[SCREENSHOT: Telegram integration status - connected]**

4. **Telegram Bot Commands**

   `/help` - Show all available commands
   `/balance` - Check current balance
   `/budget` - View budget status
   `/add [amount] [category] [description]` - Add expense
     Example: `/add 25 food Lunch at cafe`
   `/income [amount] [description]` - Add income
   `/summary` - Get weekly financial summary
   `/news` - Get latest news briefing
   `/workout` - Log today's workout
   `/unlink` - Disconnect Telegram

**[SCREENSHOT: Telegram bot help command output]**

### 11.8.3 Data Privacy & Security

**[SCREENSHOT: Privacy settings page]**

**Security Features:**

1. **Two-Factor Authentication (2FA)**
   - Enable 2FA with authenticator app
   - Backup codes generation
   - SMS fallback option

2. **Active Sessions**
   - List all logged-in devices
   - Location and last active time
   - "Log out other sessions" option

3. **Data Export**
   - Download all your data (JSON format)
   - Includes: transactions, workouts, chat history
   - GDPR compliant

4. **Account Deletion**
   - Permanent account deletion
   - 30-day grace period
   - Data is irrecoverably deleted after confirmation

---

## 11.9 Advanced Features

### 11.9.1 Multi-Currency Support

Handle multiple currencies for international users:

**[SCREENSHOT: Currency settings]**

**Features:**

- Primary currency selection
- Automatic conversion using live exchange rates
- Display transactions in original currency or converted
- Dual currency display (LBP/USD) for Lebanese users
  Example: "56,000 LBP ($37.33 USD)"

**[SCREENSHOT: Transaction showing dual currency]**

### 11.9.2 Data Visualization Options

Customize how you view your data:

**[SCREENSHOT: Visualization settings]**

**Chart Types:**

- Pie charts (category breakdown)
- Bar charts (monthly comparison)
- Line charts (trends over time)
- Area charts (cumulative totals)
- Donut charts (alternative to pie)

**Customization:**

- Color scheme selection
- Show/hide labels
- Animation toggle
- Export chart as image

### 11.9.3 Keyboard Shortcuts

Power user features for efficiency:

**[SCREENSHOT: Keyboard shortcuts help panel]**

**Available Shortcuts:**

- `Ctrl/Cmd + K` - Quick command palette
- `Ctrl/Cmd + N` - New transaction
- `Ctrl/Cmd + /` - Focus search
- `Ctrl/Cmd + B` - Toggle sidebar
- `Ctrl/Cmd + ,` - Open settings
- `Esc` - Close modal/dialog
- `?` - Show keyboard shortcuts help

### 11.9.4 Dark Mode

Toggle between light and dark themes:

**[SCREENSHOT: Side-by-side light and dark mode]**

**Dark Mode Benefits:**

- Reduced eye strain in low light
- OLED-friendly (saves battery on mobile)
- Preference saved per device
- Automatic theme switching (based on system)

---

## 11.10 Performance & Optimization

### 11.10.1 Real-Time Updates

Dashboard updates automatically without page refresh:

- New transactions appear instantly
- Budget bars update in real-time
- Chat messages stream live
- Notifications appear as toasts

### 11.10.2 Offline Support (PWA)

Progressive Web App capabilities:

**[SCREENSHOT: Install app prompt]**

**Features:**

- Install as desktop/mobile app
- Works offline (cached data)
- Background sync when connection restored
- Push notifications even when browser closed

**Installation:**

1. Click browser's "Install" button (appears automatically)
2. Or use "Add to Home Screen" in settings
3. App opens in standalone window
4. Updates automatically

### 11.10.3 Responsive Design

Optimized for all screen sizes:

**[SCREENSHOT: Dashboard on desktop, tablet, mobile]**

**Breakpoints:**

- Mobile: < 640px (single column, bottom navigation)
- Tablet: 640px - 1024px (adapted layout)
- Desktop: > 1024px (full sidebar, multi-column)

---

## 11.11 Troubleshooting & Support

### Common Issues

**1. Can't Log In**
- Check username/password (case-sensitive)
- Clear browser cache and cookies
- Try password reset
- Ensure caps lock is off

**2. Transactions Not Appearing**
- Refresh the page (F5)
- Check date filter settings
- Verify transaction was saved (check confirmation message)
- Try logging out and back in

**3. Budget Not Updating**
- Ensure budget is set for current period
- Check if budget start date is correct
- Verify transactions are in the correct date range
- Clear cache and hard reload (Ctrl+Shift+R)

**4. OCR Not Working**
- Use clear, well-lit receipt photos
- Ensure text is readable
- Try cropping image to just the receipt
- Supported formats: JPG, PNG (max 5MB)

**5. Telegram Bot Not Responding**
- Check bot connection status in settings
- Try re-linking Telegram account
- Ensure bot isn't blocked in Telegram
- Verify internet connection

### Getting Help

**[SCREENSHOT: Help & Support page]**

**Support Channels:**

1. **In-App Help Center**
   - Searchable FAQ
   - Video tutorials
   - Feature guides

2. **Contact Support**
   - Email: support@cortana-ai.com
   - Response time: 24-48 hours
   - Include screenshots if possible

3. **Community Forum**
   - User discussions
   - Tips and tricks
   - Feature requests
   - Bug reports

---

**[End of Chapter 11]**

---

# Chapter 12: Mobile Application - User Interface & Features

## 12.1 Introduction to the Cortana Mobile App

The Cortana mobile application brings the full power of the web dashboard to your smartphone, optimized for on-the-go financial management and lifestyle tracking. Built with Flutter for cross-platform compatibility, the mobile app provides a native-like experience on both iOS and Android devices.

**Download:** Available on Google Play Store and Apple App Store (search "Cortana AI Assistant")

**Requirements:**
- Android 6.0+ or iOS 12.0+
- 50MB storage space
- Internet connection (offline mode available for basic features)

---

## 12.2 Mobile App Installation & Setup

### 12.2.1 First-Time Installation

**[SCREENSHOT: App store listing page]**

**Installation Steps:**

1. **Download from App Store**
   - Search "Cortana AI Assistant"
   - Tap "Install" or "Get"
   - Wait for download (approximately 45MB)
   - Tap "Open" when installation completes

2. **Welcome Screen**
   - Swipe through feature introduction screens
   - Key features highlighted:
     * Smart expense tracking
     * AI-powered insights
     * Voice and photo input
     * Real-time budget monitoring
     * Secure and private

**[SCREENSHOT: Welcome carousel screens]**

3. **Permission Requests**
   - **Camera**: For receipt scanning (optional)
   - **Microphone**: For voice commands (optional)
   - **Notifications**: For budget alerts and reminders (recommended)
   - **Location**: For location-tagged expenses (optional)

**[SCREENSHOT: Permission request dialogs]**

### 12.2.2 Account Setup

**New User Registration:**

**[SCREENSHOT: Mobile signup screen]**

1. **Sign Up Form**
   - Full Name
   - Email Address
   - Username
   - Password (with strength indicator)
   - Confirm Password
   - "I agree to Terms & Conditions" checkbox

2. **Email Verification**
   - Verification code sent to email
   - Enter 6-digit code
   - 5-minute expiration
   - "Resend Code" option

**[SCREENSHOT: Email verification screen]**

3. **Profile Setup**
   - Optional profile photo
   - Phone number (for SMS alerts)
   - Currency preference
   - Starting budget amount

**Existing User Login:**

**[SCREENSHOT: Mobile login screen]**

- Enter username and password
- "Remember me" toggle
- Biometric login option (fingerprint/Face ID)
- "Forgot Password?" link

---

## 12.3 Mobile App Home Screen

### 12.3.1 Dashboard Overview

The mobile home screen presents your financial snapshot at a glance:

**[SCREENSHOT: Mobile app home dashboard]**

**Dashboard Layout:**

1. **Header Section**
   - Welcome message: "Good morning, Ali! ☀️"
   - Current date: "Sunday, January 26, 2026"
   - Notification bell icon (badge shows unread count)
   - Profile picture (tap to access settings)

2. **Balance Card** (Prominent at top)
   - Large display of current balance
   - Gradient background (purple to blue)
   - Format: "$3,456.78"
   - Period indicator: "This Month"
   - Small income/expense indicators below

**[SCREENSHOT: Balance card close-up]**

3. **Quick Stats Row**
   - Two cards side-by-side:

   **Income Card** (Green)
   - Icon: Upward arrow
   - Amount: "$5,250.00"
   - Label: "Income"
   - Percentage: "+12% ↑"

   **Expenses Card** (Red)
   - Icon: Downward arrow
   - Amount: "$1,793.22"
   - Label: "Expenses"
   - Percentage: "-5% ↓"

**[SCREENSHOT: Quick stats cards]**

4. **Quick Actions** (4 buttons)
   - **Add Expense** (Orange icon)
   - **Add Income** (Green icon)
   - **Scan Receipt** (Camera icon)
   - **Ask Cortana** (Chat icon)

**[SCREENSHOT: Quick action buttons]**

5. **Recent Transactions**
   - Title: "Recent Transactions" with "View All >" link
   - Last 5 transactions shown
   - Each transaction shows:
     * Category icon (colored circle)
     * Transaction name
     * Date/time
     * Amount (color-coded: green for income, red for expense)

**[SCREENSHOT: Recent transactions list]**

6. **Budget Progress Widget**
   - "Budget This Month" header
   - Progress bar (color changes based on percentage)
   - Text: "$1,793 / $2,500" and "72% used"
   - "12 days remaining" countdown

**[SCREENSHOT: Budget progress widget]**

### 12.3.2 Bottom Navigation Bar

Persistent navigation across all screens:

**[SCREENSHOT: Bottom navigation bar]**

**Navigation Tabs:**

1. **Home** (House icon)
   - Default landing screen
   - Dashboard overview

2. **Transactions** (List icon)
   - Full transaction history
   - Filter and search

3. **Add** (Large circular button, center)
   - Quick add transaction
   - Prominent for easy access

4. **Analytics** (Chart icon)
   - Visual reports
   - Spending insights

5. **Profile** (Person icon)
   - Account settings
   - App preferences

**Design:**
- Active tab highlighted in blue
- Icons turn blue when selected
- Label appears under active icon
- Smooth transition animations

---

## 12.4 Adding Transactions on Mobile

### 12.4.1 Quick Add Button

The central "+ Add" button provides the fastest way to log transactions:

**[SCREENSHOT: Quick add button highlighted]**

**Quick Add Flow:**

1. **Tap Central + Button**
   - Bottom sheet slides up
   - Expense selected by default

**[SCREENSHOT: Add transaction bottom sheet]**

2. **Transaction Type Toggle**
   - Large toggle at top: "Expense" | "Income"
   - Tap to switch between types
   - Color changes (red for expense, green for income)

3. **Amount Input**
   - Large number pad at bottom
   - Display shows: "$ 0.00"
   - Backspace button to delete digits
   - Decimal point button

**[SCREENSHOT: Number pad for amount entry]**

4. **Category Selection**
   - Horizontal scrollable category chips
   - Visual icons for each category
   - Pre-selected: "Food" (most common)

   **Expense Categories:**
   🍔 Food | 🚗 Transport | 🛍️ Shopping | 🎮 Entertainment |
   💡 Bills | 🏥 Health | 📚 Education | 📌 Other

   **Income Categories:**
   💼 Salary | 💻 Freelance | 📈 Investment | 🎁 Gift | 📌 Other

**[SCREENSHOT: Category chips selection]**

5. **Description** (Optional)
   - Text field: "Add a note..."
   - Keyboard appears when tapped
   - Auto-suggestions based on past transactions
   - Example: Typing "star" suggests "Starbucks"

6. **Date Picker** (Optional)
   - Defaults to today
   - Tap to open calendar
   - Quick options: Today, Yesterday, 2 days ago

**[SCREENSHOT: Date picker interface]**

7. **Save Button**
   - Large "Save Transaction" button at bottom
   - Validates amount > 0
   - Shows success animation (checkmark)
   - Bottom sheet closes automatically

**[SCREENSHOT: Success animation]**

### 12.4.2 Voice Input for Transactions

Add transactions by speaking naturally:

**[SCREENSHOT: Voice input screen]**

**How to Use Voice Input:**

1. **Access Voice Input**
   - Tap microphone icon on quick add screen
   - Or say "Hey Cortana, add expense" (if enabled)
   - Permission prompt for microphone (first time)

2. **Speak Your Transaction**
   - Microphone icon pulses (listening state)
   - Waveform animation shows audio levels
   - Speak clearly: "Twenty-five dollars for lunch at Chipotle"

**[SCREENSHOT: Voice input active with waveform]**

3. **Speech Processing**
   - Real-time transcription appears on screen
   - Shows: "25 dollars for lunch at Chipotle"
   - Processing indicator: "Understanding..."

4. **AI Parsing**
   - Cortana extracts details:
     * Amount: $25.00
     * Category: Food (auto-detected)
     * Description: Lunch at Chipotle
     * Date: Today

**[SCREENSHOT: Parsed transaction details]**

5. **Confirmation Screen**
   - Shows extracted data
   - Edit buttons next to each field
   - "Correct" or "Edit" options
   - Tap "Save" to confirm

**Natural Language Examples:**

✅ "I spent forty-five dollars on groceries"
✅ "Add fifty dollars gas expense yesterday"
✅ "Coffee five dollars Starbucks"
✅ "Paid rent twelve hundred dollars"
✅ "Got paid three thousand dollars salary"
✅ "Fifteen dollars Uber to downtown"
✅ "Lunch was thirty-two fifty at the restaurant"

**Voice Features:**

- Understands natural conversational style
- Handles various date formats ("yesterday", "last Tuesday", "January 20")
- Recognizes common merchant names
- Multi-language support (English, Arabic)
- Background noise cancellation
- Works offline (basic functionality)

### 12.4.3 Receipt Scanning (OCR)

Photograph receipts to automatically extract transaction details:

**[SCREENSHOT: Receipt scanning interface]**

**Receipt Scanning Process:**

1. **Open Scanner**
   - Tap "Scan Receipt" quick action
   - Or use camera icon in add transaction screen
   - Camera permission required (first time)

2. **Take Photo**
   - Camera viewfinder opens
   - Guide box shows optimal receipt position
   - Tips displayed: "Ensure receipt is flat and well-lit"
   - Flash toggle button
   - Gallery button (use existing photo)

**[SCREENSHOT: Camera viewfinder with receipt alignment guide]**

3. **Capture & Processing**
   - Tap capture button
   - Photo preview with "Use This" or "Retake" options
   - Processing animation: "Reading receipt... 📄"
   - Takes 3-5 seconds

**[SCREENSHOT: Receipt processing animation]**

4. **OCR Results**
   - Receipt data displayed:

   ```
   📄 Receipt Scanned Successfully

   Merchant: Whole Foods Market
   Date: Jan 26, 2026 | 2:43 PM
   Total Amount: $67.43

   Items Detected:
   - Organic Bananas     $3.99
   - Almond Milk         $4.49
   - Chicken Breast      $12.95
   - Mixed Vegetables    $6.00
   - Bread               $3.50
   - Coffee Beans        $14.99
   - Greek Yogurt        $5.98
   - Apples              $4.53
   - Tax                 $11.00

   Suggested Category: 🍔 Food
   ```

**[SCREENSHOT: OCR results screen]**

5. **Review & Edit**
   - All fields are editable
   - Tap any field to modify
   - Change category if needed
   - Add/remove line items
   - Adjust total if OCR missed something

6. **Save with Receipt Attached**
   - "Save Transaction" button
   - Receipt image attached to transaction
   - Can view receipt later from transaction details
   - Image stored locally and synced to cloud

**[SCREENSHOT: Transaction saved with receipt attachment indicator]**

**OCR Tips for Best Results:**

- ✅ Flatten receipt on a contrasting surface
- ✅ Ensure good lighting (natural light is best)
- ✅ Capture entire receipt including header and footer
- ✅ Hold phone parallel to receipt
- ❌ Avoid shadows across receipt
- ❌ Don't use blurry or folded receipts
- ❌ Avoid reflective surfaces

**OCR Capabilities:**

- Extracts: Total amount, merchant name, date, time, line items, tax
- Supports: Thermal receipts, printed receipts, handwritten bills
- Accuracy: 85-95% depending on receipt quality
- Languages: English, Arabic, French (for Lebanese businesses)
- Handles faded receipts (adjusts contrast automatically)
- Works offline (basic OCR, syncs details when online)

### 12.4.4 Location-Tagged Expenses

Automatically tag expenses with location:

**[SCREENSHOT: Location permission and tagged transaction]**

**Location Features:**

1. **Automatic Location Capture**
   - GPS coordinates saved with transaction
   - Reverse geocoded to address
   - Example: "Starbucks - 123 Main St, Beirut"
   - Only with user permission

2. **Location-Based Insights**
   - See expenses on a map
   - "You spend most at locations near your office"
   - Identify spending patterns by area
   - Filter transactions by location

**[SCREENSHOT: Expense map view]**

3. **Privacy Controls**
   - Toggle location tagging on/off
   - Delete location data from past transactions
   - Location never shared with third parties

---

## 12.5 Transactions Screen (Mobile)

### 12.5.1 Transaction List View

Browse all your financial history:

**[SCREENSHOT: Transactions list screen]**

**Screen Layout:**

1. **Search Bar** (Top)
   - Placeholder: "Search transactions..."
   - Real-time filtering as you type
   - Searches: description, category, amount, date

2. **Filter Chips** (Below search)
   - Horizontal scrollable chips:
     * All (default)
     * Income (green badge)
     * Expenses (red badge)
     * This Week
     * This Month
     * Custom Range

**[SCREENSHOT: Filter chips]**

3. **Grouped Transaction List**
   - Grouped by date: "Today", "Yesterday", "January 24", etc.
   - Each transaction card shows:
     * Category icon (colored)
     * Transaction description
     * Date/time (small gray text)
     * Amount (large, color-coded)

**[SCREENSHOT: Grouped transaction list]**

4. **Swipe Actions**
   - Swipe left: Delete (red background, trash icon)
   - Swipe right: Edit (blue background, pencil icon)
   - Confirmation dialog before deletion

**[SCREENSHOT: Swipe-to-delete action]**

### 12.5.2 Transaction Details View

Tap any transaction to see full details:

**[SCREENSHOT: Transaction details modal]**

**Details Screen:**

1. **Header**
   - Large amount display
   - Transaction type badge (Income/Expense)
   - Delete and Edit icons (top right)

2. **Information Cards**
   - **Category**: Food 🍔
   - **Description**: Lunch at Chipotle
   - **Date & Time**: Jan 26, 2026 | 12:45 PM
   - **Payment Method**: Cash (if tracked)
   - **Location**: 123 Main St, Beirut (if available)
   - **Recurring**: No (or Yes if recurring)

3. **Receipt Section** (if attached)
   - Thumbnail of receipt image
   - Tap to view full-screen
   - Pinch to zoom
   - "Download Receipt" button

**[SCREENSHOT: Receipt viewing in full-screen]**

4. **AI Insights** (if available)
   - "This is $5 more than your average lunch"
   - "You've eaten at Chipotle 8 times this month"
   - "Consider meal prepping to save ~$150/month"

5. **Action Buttons**
   - Edit Transaction
   - Delete Transaction
   - Share (export as text/image)
   - Add to Recurring

### 12.5.3 Advanced Filters

Access detailed filtering options:

**[SCREENSHOT: Advanced filters panel]**

**Filter Options:**

1. **Date Range**
   - Quick options: Today, Week, Month, Year, All Time
   - Custom range: Calendar date picker (start/end)

2. **Transaction Type**
   - All
   - Income only
   - Expenses only

3. **Categories** (Multi-select)
   - Checkboxes for each category
   - "Select All" / "Deselect All" options

4. **Amount Range**
   - Slider with min/max values
   - Example: $0 - $500
   - Or manual input

5. **Sort Options**
   - Date (newest first)
   - Date (oldest first)
   - Amount (highest first)
   - Amount (lowest first)
   - Category (alphabetical)

6. **Tags & Labels**
   - Filter by custom tags
   - Example: "Gifts", "Work Expenses", "Tax Deductible"

**[SCREENSHOT: Amount range slider]**

**Apply Filters:**
- "Apply" button at bottom
- Shows count: "245 transactions match filters"
- "Clear All" to reset filters
- Filters persist until manually cleared

### 12.5.4 Bulk Actions

Manage multiple transactions at once:

**[SCREENSHOT: Bulk selection mode]**

**How to Use:**

1. **Enter Selection Mode**
   - Long-press any transaction
   - Or tap "Select" button in top menu
   - Checkboxes appear next to each transaction

2. **Select Transactions**
   - Tap to select/deselect
   - Select All button at top
   - Counter shows: "12 selected"

3. **Bulk Actions Available**
   - Delete Selected (with confirmation)
   - Export to CSV
   - Change Category (batch edit)
   - Add Tag to All
   - Generate Report

**[SCREENSHOT: Bulk actions menu]**

---

## 12.6 Mobile Analytics Dashboard

### 12.6.1 Analytics Home

Visual insights into your spending:

**[SCREENSHOT: Mobile analytics dashboard]**

**Dashboard Sections:**

1. **Period Selector**
   - Tabs: Week | Month | Year
   - Swipe left/right to change period
   - Current period highlighted

2. **Key Metrics Cards**
   - **Net Balance**: $3,456.78 (+15% vs last month)
   - **Total Income**: $5,250.00
   - **Total Expenses**: $1,793.22
   - **Savings Rate**: 66% 🎉

**[SCREENSHOT: Key metrics cards]**

3. **Spending by Category (Pie Chart)**
   - Interactive pie chart
   - Tap segment to see category details
   - Legend shows percentages
   - Top 5 categories displayed, rest as "Other"

**[SCREENSHOT: Category pie chart]**

4. **Spending Trends (Line Chart)**
   - Daily/weekly spending over time
   - Compare current vs previous period (dotted line)
   - Pinch to zoom
   - Tap data points to see exact values

**[SCREENSHOT: Spending trends line chart]**

5. **Top Merchants**
   - List of top 5 spending locations
   - Each shows: Name, logo, total spent, transaction count
   - Example: Starbucks - $142.50 (31 transactions)

**[SCREENSHOT: Top merchants list]**

### 12.6.2 Category Deep Dive

Drill down into specific category spending:

**[SCREENSHOT: Category detail screen]**

**Category Screen Shows:**

1. **Category Header**
   - Category icon and name
   - Total spent this period
   - Percentage of total spending
   - Trend indicator

2. **Spending Trend**
   - Bar chart showing daily/weekly spending in this category
   - Highlights peak days

3. **Transactions in Category**
   - List of all transactions
   - Filter and sort options
   - Swipe actions available

4. **Category Insights**
   - "You spent 25% more on Food this month"
   - "Your most expensive Food purchase was $87.50 at Whole Foods"
   - "You could save $80/month by reducing dining out by 2 days/week"

5. **Set Category Goal**
   - Button to set spending limit for this category
   - If goal set, shows progress bar

**[SCREENSHOT: Category goal progress]**

### 12.6.3 Budget Analytics

Detailed budget performance tracking:

**[SCREENSHOT: Budget analytics screen]**

**Budget Analysis:**

1. **Budget Overview Card**
   - Circular progress indicator (donut chart)
   - Center shows: "$706.78 left"
   - Outer ring color: green/yellow/red based on usage
   - Days remaining: "12 days left"

2. **Daily Spending Recommendation**
   - "You can spend $58.90 per day to stay on budget"
   - Based on remaining budget and days left
   - Updates daily

3. **Budget History Chart**
   - Line chart showing budget adherence over past 6 months
   - Green months: under budget
   - Red months: over budget
   - Tap month to see details

**[SCREENSHOT: Budget history chart]**

4. **Spending Pace Analysis**
   - Compares current spending pace vs. budget pace
   - "You're spending 10% faster than last month"
   - Projection: "At current pace, you'll exceed budget by $150"

5. **Budget Alerts**
   - List of active budget warnings
   - Example: "⚠️ Transport budget 85% used with 12 days left"
   - Tap to see category details

### 12.6.4 Income vs Expense Comparison

Visualize cash flow over time:

**[SCREENSHOT: Income vs expenses chart]**

**Comparison View:**

1. **Stacked Bar Chart**
   - Green bars: Income
   - Red bars: Expenses
   - Net shown above each bar
   - Monthly or weekly view

2. **Net Balance Line**
   - Running balance line overlay
   - Shows cumulative savings/losses
   - Trend direction arrow

3. **Savings Rate**
   - Percentage saved each period
   - Target savings rate goal line
   - Color-coded: above/below target

**[SCREENSHOT: Savings rate gauge]**

---

## 12.7 AI Chat on Mobile

### 12.7.1 Mobile Chat Interface

Optimized chat experience for mobile:

**[SCREENSHOT: Mobile chat screen]**

**Chat Interface:**

1. **Chat Header**
   - Cortana avatar (circular)
   - "Cortana" title
   - Status: "Online" (green dot)
   - Menu button (three dots): Clear chat, Settings

2. **Message List**
   - Scrollable conversation history
   - Message bubbles:
     * User: Blue gradient, right-aligned
     * Cortana: Light gray, left-aligned with avatar
   - Timestamps appear on long-press
   - Automatic scrolling to latest message

**[SCREENSHOT: Chat message bubbles]**

3. **Input Area**
   - Text input field: "Ask Cortana anything..."
   - Three action buttons:
     * Attachment (receipt upload)
     * Microphone (voice input)
     * Send (paper plane icon)

4. **Typing Indicator**
   - Animated dots when Cortana is responding
   - "Cortana is typing..."

**[SCREENSHOT: Typing indicator animation]**

5. **Quick Reply Suggestions**
   - Appear after Cortana's message
   - Chip buttons with common responses
   - Example after "How much did you spend?":
     * "Show breakdown"
     * "Compare to last month"
     * "Set a budget"

**[SCREENSHOT: Quick reply chips]**

### 12.7.2 Voice Chat

Have spoken conversations with Cortana:

**[SCREENSHOT: Voice chat active screen]**

**Voice Chat Flow:**

1. **Activate Voice Chat**
   - Tap and hold microphone button
   - Or say "Hey Cortana" (if wake word enabled)
   - Screen shows pulsing animation

2. **Speak Your Query**
   - Real-time transcription appears
   - Audio waveform visualizes your speech
   - Release button when done (or auto-stops after silence)

**[SCREENSHOT: Voice input with waveform]**

3. **Cortana's Voice Response**
   - Text response appears as usual
   - Optional: Voice readback (text-to-speech)
   - Speaker icon to replay voice answer

4. **Voice-to-Voice Mode**
   - Enable "Conversation Mode" in settings
   - Continuous back-and-forth without button presses
   - Cortana automatically listens after responding
   - Perfect for hands-free usage (driving, cooking)

**[SCREENSHOT: Conversation mode toggle]**

**Voice Command Examples:**

🎤 "What's my balance?"
🎤 "Add fifty dollars gas expense"
🎤 "How much did I spend on food this week?"
🎤 "Am I on track with my budget?"
🎤 "Show me my spending trends"
🎤 "When is my next bill due?"
🎤 "Create a budget of two thousand dollars"

### 12.7.3 Receipt Upload via Chat

Send receipt photos directly in chat:

**[SCREENSHOT: Receipt sent in chat]**

**Upload Process:**

1. **Tap Attachment Icon**
   - Options appear:
     * Take Photo
     * Choose from Gallery
     * Choose from Files

2. **Select/Capture Receipt**
   - Camera opens or gallery appears
   - Select receipt image
   - Crop tool appears (optional)

3. **Receipt Sends in Chat**
   - Image appears in chat bubble
   - "Processing receipt..." status below
   - Progress indicator

**[SCREENSHOT: Receipt processing in chat]**

4. **Cortana Analyzes and Responds**
   - Cortana: "I found a receipt from Walmart for $67.43. I've logged this as a Food expense. Here's what I extracted:"
   - Structured data shown in card format
   - Buttons: "Confirm" | "Edit" | "Delete"

**[SCREENSHOT: Receipt data extraction card in chat]**

5. **Confirm or Edit**
   - Tap "Confirm" to save automatically
   - Or "Edit" to modify details
   - Transaction saved and appears in history

### 12.7.4 Financial Queries via Chat

Ask Cortana about your finances conversationally:

**[SCREENSHOT: Financial Q&A in chat]**

**Example Conversations:**

**User:** "How much did I spend this month?"
**Cortana:** "You've spent $1,793.22 this month, which is 15% less than last month ($2,109.87). Great job! 🎉 Your biggest categories are:
1. Food: $587.50 (33%)
2. Transport: $380.00 (21%)
3. Shopping: $295.00 (16%)

You have $706.78 left in your budget."

---

**User:** "Why did I spend so much on transport?"
**Cortana:** "Looking at your Transport expenses ($380), here's the breakdown:
- Gas: $215.00 (8 fill-ups)
- Uber/Lyft: $135.00 (14 rides)
- Parking: $30.00 (3 payments)

You took 6 more Uber rides than usual this month, mostly between Jan 10-17. I see your car was in the shop then (repair bill on Jan 10). Makes sense! 🚗"

---

**User:** "Can I afford to buy a $300 PlayStation?"
**Cortana:** "Let me check! 🤔

**Your Current Situation:**
- Balance: $3,456.78
- Budget remaining: $706.78 (12 days left)
- Daily budget: $58.90/day

**PlayStation Cost:** $300

**Impact Analysis:**
- After purchase, you'd have $406.78 left for 12 days
- That's $33.90/day (vs. recommended $58.90/day)
- You'd be cutting it close, but feasible

**My Recommendation:**
If this is important to you, go for it! But watch your spending for the rest of the month. Maybe cook at home more (you've been ordering out a lot lately).

Alternative: Wait 12 days and buy it from next month's budget! 🎮"

---

**User:** "Give me tips to save money"
**Cortana:** "Based on your spending patterns, here are personalized money-saving tips:

💰 **Top 3 Opportunities:**

1. **Coffee Shops ($142.50/month)**
   - You average 31 coffees/month at $4.60 each
   - Making coffee at home 4 days/week: Save $80/month
   - Annual savings: $960 ☕

2. **Food Delivery ($287/month)**
   - 18 DoorDash/Uber Eats orders averaging $15.94
   - Cooking 3 extra meals/week: Save $120/month
   - Annual savings: $1,440 🍕

3. **Unused Subscriptions**
   - Spotify Premium: Active ✓
   - Netflix: Last used 42 days ago ⚠️
   - Hulu: Last used 68 days ago ❌
   - Gym: Only 2 visits this month ❌
   - Cancel unused: Save $45/month
   - Annual savings: $540 📱

**Total Potential Savings:** $2,940/year

Start with just one! Which would you like to work on?"

### 12.7.5 Chat History Management

Manage your conversation history:

**[SCREENSHOT: Chat menu options]**

**Chat Management Features:**

1. **Search Chat History**
   - Search icon in header
   - Finds messages by keyword
   - Highlights matching messages
   - Jump to message button

2. **Export Conversation**
   - Menu → Export Chat
   - Formats: Text file, PDF
   - Share via email, messaging apps

3. **Clear Chat**
   - Menu → Clear Chat
   - Confirmation dialog
   - Permanent deletion warning
   - Cannot be undone

4. **Pin Important Messages**
   - Long-press message → Pin
   - Pinned messages accessible from menu
   - Example: Pin budget advice, savings tips

**[SCREENSHOT: Pinned messages list]**

---

## 12.8 Mobile Budget & Goal Management

### 12.8.1 Budget Setup Wizard

Easy step-by-step budget creation:

**[SCREENSHOT: Budget setup wizard]**

**Setup Steps:**

1. **Welcome Screen**
   - "Let's set up your budget"
   - Benefits explained: "Stay on track", "Get alerts", "Save money"
   - "Get Started" button

2. **Choose Budget Period**
   - Options: Weekly, Monthly, Bi-weekly
   - Most popular: Monthly (highlighted)
   - Custom option available

**[SCREENSHOT: Period selection]**

3. **Set Budget Amount**
   - Large amount input
   - Number pad interface
   - Suggestion based on past spending
   - Example: "Based on last 3 months, we suggest $2,000"

**[SCREENSHOT: Budget amount input]**

4. **Budget Breakdown (Optional)**
   - Allocate budget across categories
   - Pie chart visualization
   - Percentage sliders for each category
   - Auto-calculate based on past spending

**[SCREENSHOT: Budget allocation sliders]**

5. **Alert Preferences**
   - When to notify:
     * 50% budget used
     * 75% budget used
     * 90% budget used
     * Over budget
   - Notification methods: Push, Email, Telegram

6. **Confirmation**
   - Summary of budget settings
   - "Activate Budget" button
   - Budget starts immediately

**[SCREENSHOT: Budget confirmation summary]**

### 12.8.2 Budget Dashboard

Monitor your budget in real-time:

**[SCREENSHOT: Budget dashboard]**

**Dashboard Components:**

1. **Main Budget Card**
   - Large circular progress ring
   - Percentage in center
   - Color: Green (<70%), Yellow (70-89%), Red (≥90%)
   - Amount spent / Total budget
   - Days remaining

**[SCREENSHOT: Circular budget progress]**

2. **Budget Status Alert**
   - Banner at top if needed
   - Green: "You're doing great! On track for the month ✅"
   - Yellow: "Getting close! 75% of budget used ⚠️"
   - Red: "Budget exceeded by $50 ⛔"

3. **Category Budget Cards**
   - One card per category
   - Mini progress bar
   - Amount spent / Limit
   - Status icon

**[SCREENSHOT: Category budget cards]**

4. **Spending Pace Indicator**
   - Graph comparing actual vs. ideal spending pace
   - "You're spending 15% faster than recommended"
   - Projection line showing when budget will be exhausted

**[SCREENSHOT: Spending pace graph]**

5. **Quick Actions**
   - Adjust Budget button
   - View Insights button
   - Export Report button

### 12.8.3 Category Goals

Set and track category-specific spending limits:

**[SCREENSHOT: Category goals screen]**

**Goal Management:**

1. **Category Goal List**
   - All categories shown
   - Each card displays:
     * Category icon and name
     * Goal amount (if set)
     * Spent so far
     * Progress bar
     * Edit button

2. **Set Category Goal**
   - Tap category card
   - Enter goal amount
   - Choose period (weekly/monthly)
   - Set alert threshold (optional)

**[SCREENSHOT: Set category goal form]**

3. **Goal Tracking**
   - Real-time updates as expenses added
   - Visual indicators:
     * Green: < 70% of goal
     * Yellow: 70-90% of goal
     * Red: > 90% of goal
     * Checkmark: Goal achieved (stayed under)

4. **Goal Insights**
   - Success rate: "You stayed under your Food goal 8/10 months"
   - Suggestions: "Consider lowering Transport goal by $50 - you never use the full amount"

**[SCREENSHOT: Goal success rate chart]**

### 12.8.4 Savings Goals

Set and track savings targets:

**[SCREENSHOT: Savings goals screen]**

**Savings Features:**

1. **Create Savings Goal**
   - Goal name: "New Laptop", "Vacation", "Emergency Fund"
   - Target amount: $1,500
   - Deadline: June 1, 2026
   - Optional image upload

**[SCREENSHOT: Create savings goal form]**

2. **Goal Tracking Card**
   - Progress bar showing saved vs. target
   - Amount saved: $450 / $1,500 (30%)
   - Days remaining: 127 days
   - "Add Contribution" button

**[SCREENSHOT: Savings goal card]**

3. **Automatic Savings**
   - Toggle: "Auto-save surplus at end of month"
   - Rule: "Save 20% of remaining budget"
   - Example: "$141.36 will be saved on Jan 31"

4. **Milestones**
   - Set milestone checkpoints
   - Example: 25%, 50%, 75%, 100%
   - Celebrate achievements with animations

**[SCREENSHOT: Milestone celebration]**

---

## 12.9 Health & Fitness on Mobile

### 12.9.1 Health Dashboard

Track fitness from your phone:

**[SCREENSHOT: Mobile health dashboard]**

**Dashboard Layout:**

1. **Current Weight Card**
   - Large display: "165.3 lbs"
   - Trend arrow: ↓ 2.1 lbs (this week)
   - Mini chart showing weight trend
   - "Log Weight" button

**[SCREENSHOT: Weight card with mini chart]**

2. **BMI Indicator**
   - BMI value: 24.3
   - Category: "Normal Weight"
   - Color-coded gauge

3. **Workout Streak**
   - "12 Day Streak 🔥"
   - Calendar heatmap (last 30 days)
   - Green squares for workout days
   - Tap to see workout details

**[SCREENSHOT: Workout streak calendar]**

4. **This Week's Activity**
   - Workouts completed: 4/6
   - Total time: 4h 32m
   - Calories burned: 1,847 kcal
   - Progress ring for weekly goal

### 12.9.2 Log Weight

Quick weight logging:

**[SCREENSHOT: Log weight screen]**

**Weight Entry:**

1. **Simple Interface**
   - Large weight input with number pad
   - Unit toggle: lbs / kg
   - Date picker (defaults to today)
   - Optional notes field
   - "Save" button

2. **Weight Graph**
   - Line chart below input
   - Shows last 30 days
   - Trend line overlay
   - Goal weight marker

**[SCREENSHOT: Weight trend graph]**

3. **Progress Photo** (Optional)
   - Camera icon to take progress photo
   - Gallery to view past photos
   - Side-by-side comparison view

**[SCREENSHOT: Progress photo comparison]**

### 12.9.3 Log Workout

Record gym sessions on the go:

**[SCREENSHOT: Log workout screen]**

**Workout Logging:**

1. **Workout Type**
   - Quick select buttons:
     * 💪 Strength
     * 🏃 Cardio
     * 🧘 Yoga
     * ⚽ Sports
     * 🚴 Cycling

2. **Exercise Entry** (for Strength)
   - Exercise name (searchable dropdown)
   - Sets and Reps
   - Weight used
   - "Add Exercise" button
   - Timer between sets

**[SCREENSHOT: Exercise entry with timer]**

3. **Cardio Details**
   - Activity type: Running, Cycling, Swimming
   - Duration (timer or manual)
   - Distance (optional)
   - Pace/Speed
   - Calories (auto-calculated)

**[SCREENSHOT: Cardio workout entry]**

4. **Workout Summary**
   - Total duration
   - Exercises completed
   - Total volume (weight × reps)
   - "How was it?" emoji selector
   - Notes field
   - "Complete Workout" button

**[SCREENSHOT: Workout completion screen]**

### 12.9.4 Workout Plans

Access pre-built routines:

**[SCREENSHOT: Workout plans library]**

**Plans Screen:**

1. **Featured Plans**
   - Swipeable cards
   - Plan name and description
   - Difficulty level
   - Duration per session
   - Days per week

2. **Plan Details**
   - Full exercise list
   - Sets/reps/rest for each
   - Video demonstrations (play button)
   - "Start Plan" button

**[SCREENSHOT: Plan details with exercise list]**

3. **Active Plan Tracking**
   - Current day highlighted
   - Progress: Day 12 of 90
   - Today's workout: "Push Day"
   - "Start Workout" button

**[SCREENSHOT: Active plan progress]**

---

## 12.10 News on Mobile

### 12.10.1 Mobile News Feed

Stay informed on the go:

**[SCREENSHOT: Mobile news feed]**

**News Feed Layout:**

1. **Category Tabs**
   - Horizontal scrollable tabs
   - All | Lebanese | Tech | Business | Sports | Health

2. **News Cards**
   - Featured image
   - Headline (bold)
   - Source and time (e.g., "BBC • 2h ago")
   - Excerpt (2 lines)
   - Bookmark icon
   - Share icon

**[SCREENSHOT: News card design]**

3. **Pull to Refresh**
   - Drag down to refresh feed
   - Animated loading indicator
   - New articles appear at top

4. **Infinite Scroll**
   - Load more as you scroll
   - Loading spinner at bottom
   - "No more articles" message when done

### 12.10.2 Article Reading Experience

Optimized for mobile reading:

**[SCREENSHOT: Article reading view]**

**Article View:**

1. **Clean Reading Layout**
   - Full-screen article
   - Large, readable font
   - Dark mode toggle
   - No ads or distractions

2. **Article Header**
   - Full-width featured image
   - Headline
   - Author and publication
   - Publish date and time
   - Reading time estimate

3. **Action Bar**
   - Bookmark (save for later)
   - Share (multiple apps)
   - Text size adjustment
   - Summarize button
   - Read aloud (text-to-speech)

**[SCREENSHOT: Article action bar]**

4. **Related Articles**
   - 3-4 related articles at bottom
   - "You might also like..."
   - Swipeable cards

### 12.10.3 AI Article Summaries

Get the gist quickly:

**[SCREENSHOT: Article summary]**

**Summary Feature:**

1. **Tap "Summarize"**
   - Button in article action bar
   - Processing: 2-3 seconds
   - Summary appears at top

2. **Summary Card**
   - "AI Summary" badge
   - 3-4 sentence summary
   - Key points in bullet format
   - "Read Full Article" button

**[SCREENSHOT: Summary card]**

3. **Reading Time Saved**
   - "5 min article → 30 sec summary"
   - Time saved: 4m 30s ⚡

### 12.10.4 Daily Briefing

Morning news delivered:

**[SCREENSHOT: Daily briefing notification]**

**Briefing Delivery:**

1. **Push Notification**
   - Arrives at 8:00 AM (customizable)
   - "Your daily briefing is ready"
   - Tap to open app

2. **Briefing Screen**
   - "Good Morning! ☀️" header
   - Today's date
   - Top 5 stories (swipeable cards)
   - Each card:
     * Headline
     * Source
     * Summary (1-2 sentences)
     * "Read More" button

**[SCREENSHOT: Daily briefing cards]**

3. **Quick Actions**
   - Read All (opens full articles)
   - Dismiss All
   - Customize (change preferences)

---

## 12.11 Profile & Settings (Mobile)

### 12.11.1 Mobile Profile Screen

Manage your account:

**[SCREENSHOT: Mobile profile screen]**

**Profile Layout:**

1. **Profile Header**
   - Profile photo (circular)
   - Name
   - Username (@handle)
   - Email
   - "Edit Profile" button

2. **Account Settings**
   - Personal Information
   - Change Password
   - Email Preferences
   - Privacy Settings

**[SCREENSHOT: Account settings list]**

3. **App Settings**
   - Currency
   - Language
   - Notifications
   - Theme (Light/Dark/Auto)
   - Biometric Login

4. **Connected Services**
   - Telegram Bot (status: Connected ✓)
   - Bank Sync (coming soon)
   - Calendar Integration

**[SCREENSHOT: Connected services]**

5. **Support & Info**
   - Help Center
   - Contact Support
   - Privacy Policy
   - Terms of Service
   - App Version

6. **Logout Button**
   - Red button at bottom
   - Confirmation dialog
   - Clears local cache

### 12.11.2 Notification Settings

Customize your alerts:

**[SCREENSHOT: Notification settings]**

**Notification Categories:**

1. **Budget Alerts**
   - Budget threshold warnings (toggle)
   - Daily spending updates (toggle)
   - Budget exceeded alerts (toggle)
   - Time: Customize per alert

2. **Transaction Notifications**
   - Large transaction alerts (> $100)
   - Daily transaction summary
   - Weekly spending report

3. **Bill Reminders**
   - Upcoming bill notifications
   - Days before: 1, 3, 7 days
   - Overdue bill alerts

4. **News Updates**
   - Breaking news (toggle)
   - Daily briefing time selector
   - Category preferences

**[SCREENSHOT: Notification time pickers]**

5. **Delivery Channels**
   - Push Notifications (toggle)
   - Email (toggle)
   - Telegram (toggle)
   - SMS (toggle, premium)

6. **Quiet Hours**
   - Enable Do Not Disturb
   - Start time: 10:00 PM
   - End time: 8:00 AM
   - Exception: Urgent alerts only

**[SCREENSHOT: Quiet hours settings]**

### 12.11.3 Privacy & Security

Protect your data:

**[SCREENSHOT: Privacy settings]**

**Security Options:**

1. **Biometric Login**
   - Toggle: Fingerprint/Face ID
   - "Use biometric authentication to unlock app"
   - Fallback to password

2. **App Lock**
   - Require authentication when opening app
   - Auto-lock after: 1 min, 5 min, 15 min, 1 hour
   - Lock on device sleep

3. **Two-Factor Authentication**
   - Enable 2FA (toggle)
   - Setup authenticator app
   - Backup codes

**[SCREENSHOT: 2FA setup]**

4. **Data & Privacy**
   - View what data is collected
   - Download your data (GDPR)
   - Delete specific data types
   - Account deletion

5. **Session Management**
   - Active devices list
   - Location and last active
   - "Log out other devices" button

**[SCREENSHOT: Active sessions list]**

---

## 12.12 Mobile-Specific Features

### 12.12.1 Widget Support

Home screen widgets for quick access:

**[SCREENSHOT: iOS/Android home screen with widgets]**

**Available Widgets:**

1. **Balance Widget** (Small)
   - Shows current balance
   - Today's expenses
   - Tap to open app

2. **Quick Add Widget** (Small)
   - Single button to add expense
   - Opens directly to add transaction screen

3. **Budget Progress Widget** (Medium)
   - Progress ring
   - Amount spent / budget
   - Days remaining
   - Visual color indicator

**[SCREENSHOT: Budget widget]**

4. **Recent Transactions Widget** (Large)
   - Last 5 transactions
   - Scroll to see more
   - Tap transaction to view details

**Widget Installation:**
- iOS: Long press home screen → + → Search "Cortana"
- Android: Long press home screen → Widgets → Cortana

### 12.12.2 Shortcuts & Siri Integration (iOS)

Voice control with Siri:

**[SCREENSHOT: Siri shortcuts setup]**

**Available Shortcuts:**

- "Hey Siri, add expense" → Opens add transaction
- "Hey Siri, check my balance" → Shows balance card
- "Hey Siri, what did I spend today?" → Shows today's expenses
- "Hey Siri, log workout" → Opens workout logging

**Custom Shortcuts:**
- Create custom phrases in Settings → Shortcuts
- Example: "Coffee run" → Logs $5 Starbucks expense

### 12.12.3 Share Sheet Integration

Share to Cortana from other apps:

**[SCREENSHOT: Share sheet with Cortana]**

**Share Options:**

1. **Share Receipt from Photos**
   - Select receipt in Photos app
   - Tap Share → Cortana
   - Auto-OCR and saves transaction

2. **Share Link from Browser**
   - Share article URL
   - Saves to reading list
   - Appears in News section

3. **Share Location**
   - Share from Maps
   - Tags transaction with location

### 12.12.4 Apple Watch / Wear OS Support

Quick glances on your wrist:

**[SCREENSHOT: Smartwatch complications]**

**Watch Features:**

1. **Complications**
   - Show balance on watch face
   - Budget progress ring
   - Today's expenses

2. **Quick Actions**
   - "Add expense" → Voice input
   - "Check balance" → Shows card
   - "Start workout" → Logs to Cortana

3. **Notifications**
   - Budget alerts on wrist
   - Bill reminders
   - Workout streak updates

**[SCREENSHOT: Watch app screens]**

---

## 12.13 Offline Mode

### 12.13.1 Offline Functionality

Use Cortana without internet:

**[SCREENSHOT: Offline mode indicator]**

**Offline Features:**

1. **View Cached Data**
   - Last synced transactions visible
   - Charts based on cached data
   - "Last updated: 2 hours ago" indicator

2. **Add Transactions Offline**
   - Transactions saved locally
   - Queued for sync
   - "Pending sync" badge

**[SCREENSHOT: Pending sync transactions]**

3. **Auto-Sync When Online**
   - Automatic sync when connection restored
   - Sync progress indicator
   - Conflict resolution (if needed)

4. **Offline Voice Input**
   - Basic OCR works offline
   - Voice transcription limited
   - Full AI features require internet

### 12.13.2 Data Syncing

Seamless sync across devices:

**[SCREENSHOT: Sync status screen]**

**Sync Features:**

- Real-time sync when online
- Last sync timestamp shown
- Manual "Sync Now" button
- Sync status: All synced ✓ | Syncing... | Error ⚠️

---

## 12.14 Accessibility Features

### 12.14.1 Inclusive Design

App accessible to all users:

**[SCREENSHOT: Accessibility settings]**

**Accessibility Options:**

1. **Visual**
   - Larger text support (follows system settings)
   - High contrast mode
   - Color blind friendly color schemes
   - Dark mode (OLED-friendly)

2. **Motor**
   - Large touch targets (44px minimum)
   - Swipe gesture alternatives (buttons)
   - Voice control support
   - Switch control compatible

3. **Hearing**
   - Visual notifications (flashes/vibrations)
   - Closed captions on videos
   - No audio-only features

4. **Cognitive**
   - Simple, clear language
   - Consistent navigation
   - Undo actions available
   - Confirmation dialogs for destructive actions

**[SCREENSHOT: Accessibility features in action]**

---

## 12.15 Performance & Battery Optimization

### 12.15.1 Efficient Data Usage

Minimal data consumption:

**Features:**

- Compressed image uploads
- Progressive image loading
- WiFi-only sync option
- Data saver mode

**[SCREENSHOT: Data usage settings]**

### 12.15.2 Battery Optimization

Long-lasting battery life:

**Optimizations:**

- Background sync limits
- Dark mode (OLED power saving)
- Location services only when needed
- Efficient caching

---

## 12.16 Updates & New Features

### 12.16.1 In-App Updates

Seamless update experience:

**[SCREENSHOT: Update available banner]**

**Update Process:**

- Banner notification: "Update available"
- What's New changelog
- Install now or later
- Background download
- No data loss

---

**[End of Chapter 12]**

---

# Chapter 13: Advanced AI Features Deep Dive

## 13.1 Natural Language Processing

### 13.1.1 Understanding Conversational Input

Cortana's NLP engine understands various ways of expressing the same transaction:

**Examples of Equivalent Inputs:**

**For "$25 lunch at Chipotle":**
- "I spent $25 on lunch at Chipotle"
- "Lunch was 25 dollars at Chipotle"
- "Paid 25 bucks for Chipotle"
- "Chipotle lunch $25"
- "Twenty-five dollars Chipotle food"

**[SCREENSHOT: Various input formats being understood]**

**NLP Capabilities:**

1. **Entity Extraction**
   - Amount: Recognizes "$25", "25 dollars", "twenty-five dollars"
   - Category: Infers "lunch" = Food category
   - Merchant: Extracts "Chipotle" as location/description
   - Date: Understands "yesterday", "last Tuesday", "on the 15th"

2. **Intent Recognition**
   - Add expense: "I bought", "Spent", "Paid for"
   - Add income: "Got paid", "Earned", "Received"
   - Query: "How much", "What's my", "Show me"
   - Command: "Set budget", "Create goal", "Delete transaction"

3. **Context Awareness**
   - Remembers conversation history
   - Resolves pronouns ("it", "that", "this")
   - Handles follow-up questions

**[SCREENSHOT: Context-aware conversation example]**

### 13.1.2 Multi-Language Support

**Supported Languages:**

1. **English** (Primary)
   - Full feature support
   - Slang and colloquialisms recognized
   - Multiple dialects (US, UK, Australian)

2. **Arabic** (Beta)
   - Lebanese Arabic dialect optimized
   - Bilingual code-switching support
   - Example: "صرفت $50 على groceries" ("I spent $50 on groceries")

**[SCREENSHOT: Arabic input being processed]**

3. **French** (Limited)
   - Basic transaction logging
   - Common in Lebanese context
   - Example: "J'ai payé 30 dollars pour le taxi"

---

## 13.2 OCR Technology Deep Dive

### 13.2.1 Receipt Processing Pipeline

**[SCREENSHOT: OCR processing flow diagram]**

**Processing Steps:**

1. **Image Pre-processing**
   - Deskewing (straighten tilted receipts)
   - Contrast enhancement
   - Noise reduction
   - Binarization (black & white conversion)

2. **Text Detection**
   - Locate text regions
   - Identify receipt boundaries
   - Separate printed text vs. logos

3. **Character Recognition**
   - OCR engine (Tesseract)
   - Multiple passes for accuracy
   - Confidence scoring per character

4. **Data Extraction**
   - Regex patterns for amounts ($XX.XX)
   - Merchant name identification (top of receipt)
   - Date parsing (multiple formats)
   - Line item extraction

5. **Validation & Correction**
   - Checksum validation (if present)
   - Amount reasonableness check
   - Duplicate receipt detection

**[SCREENSHOT: Step-by-step OCR visualization]**

### 13.2.2 Supported Receipt Types

**Receipt Formats:**

1. **Thermal Receipts** (Most common)
   - Gas stations
   - Grocery stores
   - Restaurants
   - Accuracy: 90-95%

**[SCREENSHOT: Thermal receipt example]**

2. **Printed Receipts**
   - Department stores
   - Online order printouts
   - Accuracy: 85-92%

3. **Handwritten Bills**
   - Restaurant checks
   - Service invoices
   - Accuracy: 65-75% (lower)

**[SCREENSHOT: Handwritten bill example]**

4. **Digital Receipts** (Screenshots)
   - Email receipts
   - App purchase confirmations
   - Accuracy: 95-98% (highest)

5. **Faded Receipts**
   - Old thermal receipts
   - Image enhancement applied
   - Accuracy: 70-80%

**[SCREENSHOT: Faded receipt before/after enhancement]**

### 13.2.3 OCR Limitations & Tips

**When OCR May Struggle:**

❌ Crumpled or torn receipts
❌ Water-damaged receipts
❌ Receipts with heavy handwriting over print
❌ Multi-language mixed receipts
❌ Very small font (< 8pt)

**Best Practices:**

✅ Flatten receipt on contrasting surface
✅ Ensure adequate lighting (natural light best)
✅ Capture immediately (thermal fades over time)
✅ Hold phone parallel to receipt
✅ Avoid shadows and glare

**[SCREENSHOT: Good vs bad receipt photos side-by-side]**

---

## 13.3 Voice Recognition Technology

### 13.3.1 Speech-to-Text Engine

**Technology Stack:**

- Engine: Google Speech Recognition API (primary)
- Fallback: Apple Speech Framework (iOS)
- Offline: On-device speech recognition (limited)

**Voice Processing:**

1. **Audio Capture**
   - Sample rate: 16kHz
   - Format: PCM 16-bit
   - Noise cancellation active

2. **Voice Activity Detection**
   - Detects start of speech
   - Auto-stops after 2 seconds silence
   - Filters background noise

3. **Speech Recognition**
   - Streams audio to cloud API
   - Real-time transcription
   - Confidence scoring

4. **Post-Processing**
   - Punctuation insertion
   - Capitalization
   - Number formatting ("twenty five" → "25")

**[SCREENSHOT: Voice processing waveform]**

### 13.3.2 Voice Command Accuracy

**Factors Affecting Accuracy:**

1. **Audio Quality**
   - Clear speech: 95%+ accuracy
   - Background noise: 80-85%
   - Loud environments: 60-75%

2. **Accent & Dialect**
   - Standard English accents: 95%
   - Heavy accents: 85-90%
   - Non-native speakers: 80-85%

3. **Speech Clarity**
   - Normal pace: 95%
   - Fast speech: 85-90%
   - Mumbling: 70-80%

**Optimization Tips:**

✅ Speak at normal conversational pace
✅ Pronounce numbers clearly ("twenty-five", not "twenny-five")
✅ Use in quiet environments when possible
✅ Hold phone 6-12 inches from mouth
✅ Avoid wind noise (cover mic outdoors)

**[SCREENSHOT: Voice accuracy indicators]**

---

## 13.4 AI-Powered Financial Insights

### 13.4.1 Spending Pattern Analysis

**Machine Learning Models:**

1. **Anomaly Detection**
   - Identifies unusual spending
   - Based on your historical patterns
   - Example alert: "You spent $450 at Best Buy, which is 5x your average electronics purchase"

**[SCREENSHOT: Anomaly detection alert]**

2. **Trend Forecasting**
   - Predicts future spending based on patterns
   - "At current pace, you'll spend $2,100 this month (vs. $2,500 budget)"
   - Confidence intervals shown

**[SCREENSHOT: Spending forecast chart]**

3. **Seasonal Pattern Recognition**
   - "You typically spend 30% more in December (holidays)"
   - "Your transport costs spike on weekends"
   - Helps with budgeting

4. **Merchant Clustering**
   - Groups similar merchants
   - "Coffee shops" includes Starbucks, Dunkin, local cafes
   - Aggregate insights across merchants

### 13.4.2 Personalized Recommendations

**Recommendation Engine:**

**Based on Your Data:**

1. **Budget Optimization**
   - "Based on your income ($5,000) and fixed expenses ($2,000), I recommend a discretionary budget of $2,500 with $500 saved"

2. **Savings Opportunities**
   - "You spend $142/month on coffee shops. Reducing by 30% saves $42/month or $504/year"
   - Personalized to your actual spending

3. **Bill Negotiation Tips**
   - "Your internet bill ($79.99) is higher than average ($59.99). Consider calling for a better rate"

**[SCREENSHOT: Personalized savings suggestions]**

4. **Subscription Management**
   - Tracks recurring charges
   - Identifies unused subscriptions
   - "Netflix: Last used 45 days ago. Cancel to save $143.88/year"

### 13.4.3 Predictive Budgeting

**AI Budget Suggestions:**

1. **Income-Based Budgeting**
   - Analyzes your income pattern
   - Suggests budget based on 50/30/20 rule
   - Adjusts for your lifestyle

2. **Category Predictions**
   - "Based on past months, you'll likely spend:
     - Food: $550
     - Transport: $280
     - Shopping: $320"

3. **Bill Forecasting**
   - "Your electricity bill averages $87 in winter months"
   - Budget accordingly

**[SCREENSHOT: Predictive budget breakdown]**

---

## 13.5 Intelligent Notifications

### 13.5.1 Smart Alert Timing

**Notification Optimization:**

1. **Behavioral Learning**
   - Learns when you typically check the app
   - Sends notifications at optimal times
   - Avoids "Do Not Disturb" hours

2. **Urgency Levels**
   - Critical: Budget exceeded (immediate)
   - High: Bill due tomorrow (morning notification)
   - Medium: Spending insight (evening summary)
   - Low: News briefing (scheduled time)

3. **Alert Fatigue Prevention**
   - Limits notifications to 3-5 per day
   - Groups related alerts
   - Snooze option available

**[SCREENSHOT: Notification priority levels]**

### 13.5.2 Contextual Notifications

**Location-Aware Alerts:**

1. **Near Merchants**
   - "You're near Starbucks. You've spent $142 there this month"
   - Helps make conscious decisions

2. **Geo-Fenced Reminders**
   - "You're at the grocery store. Your budgeted amount for groceries this week is $50 (already spent $23)"

**Time-Based Alerts:**

1. **Morning Summary**
   - 8:00 AM: "Good morning! Your balance: $3,456. Budget remaining: $706"

2. **Evening Recap**
   - 8:00 PM: "Today's expenses: $87. You're on track for the month"

**[SCREENSHOT: Morning and evening notifications]**

---

## 13.6 Data Security & Privacy

### 13.6.1 Encryption

**Data Protection:**

1. **At Rest**
   - AES-256 encryption for stored data
   - Encrypted database (SQLCipher)
   - Secure key storage (Keychain/Keystore)

2. **In Transit**
   - TLS 1.3 for all API calls
   - Certificate pinning
   - No plain-text data transmission

3. **Receipt Images**
   - Encrypted before upload
   - Stored on secure cloud (AWS S3)
   - Access-controlled URLs

**[SCREENSHOT: Security indicators]**

### 13.6.2 Privacy Controls

**User Data Control:**

1. **Data Minimization**
   - Only collects necessary data
   - No tracking cookies
   - No third-party analytics

2. **Data Portability**
   - Export all data (JSON/CSV)
   - GDPR compliant
   - Complete data download

3. **Right to Deletion**
   - Delete account option
   - 30-day grace period
   - Permanent removal after confirmation

4. **No Data Selling**
   - Your data is never sold
   - No advertising partners
   - No data sharing with third parties

**[SCREENSHOT: Privacy policy highlights]**

---

## 13.7 Continuous Learning & Improvement

### 13.7.1 Model Updates

**AI Improvement Process:**

1. **User Feedback Loop**
   - "Was this correct?" prompts
   - Feedback improves categorization
   - OCR corrections train models

2. **Model Retraining**
   - Monthly model updates
   - Improved accuracy over time
   - Personalized to your spending patterns

3. **Feature Rollouts**
   - A/B testing of new features
   - Gradual rollout based on feedback
   - Opt-in beta program

### 13.7.2 Personalization Engine

**Adaptive Intelligence:**

1. **Category Learning**
   - Learns your category preferences
   - "Starbucks" → always categorized as Food (based on your past corrections)

2. **Merchant Recognition**
   - Remembers merchant names
   - Auto-completes from history
   - Suggests frequently visited places

3. **Spending Behavior**
   - Adapts insights to your lifestyle
   - Understands your priorities
   - Personalized savings tips

**[SCREENSHOT: Personalization in action]**

---

**[End of Chapter 13]**

---

# Summary

These three comprehensive chapters provide a complete user guide for the Cortana AI Assistant, covering:

- **Chapter 11**: In-depth web dashboard features and usage
- **Chapter 12**: Complete mobile app functionality and experience
- **Chapter 13**: Advanced AI capabilities and technology deep-dive

**Total Page Estimate:** ~80-100 pages with screenshots

**Screenshot Placeholders:** 150+ locations marked for images

The documentation covers every feature from basic transaction logging to advanced AI insights, voice commands, OCR, budgeting, health tracking, news aggregation, and cross-platform functionality. Each feature is explained with:

- Step-by-step usage instructions
- Visual examples (screenshot placeholders)
- Tips and best practices
- Real-world scenarios
- Troubleshooting guidance

This user-centric documentation complements your existing technical chapters and provides a complete picture of what users can do with Cortana.
