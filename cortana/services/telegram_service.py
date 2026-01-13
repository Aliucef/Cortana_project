"""
Telegram Bot Service - Handle Telegram messages
"""
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from config.settings import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class TelegramService:
    """Telegram bot service for handling messages"""

    def __init__(self):
        self.bot_token = settings.telegram_bot_token
        self.allowed_user_id = int(settings.telegram_user_id)
        self.application = None
        self.processed_updates = set()  # Track processed update IDs to prevent duplicates

    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        telegram_user_id = str(update.effective_user.id)

        # Check if user is linked
        from services.telegram_link_service import get_user_by_telegram_id
        from config.database import SessionLocal

        db = SessionLocal()
        try:
            user = get_user_by_telegram_id(telegram_user_id, db)

            if not user:
                await update.message.reply_text(
                    "🔷 *Welcome to Cortana!*\n\n"
                    "I'm your AI-powered personal assistant.\n\n"
                    "*To get started:*\n"
                    "1. Register at the web dashboard\n"
                    "2. You'll receive a linking code\n"
                    "3. Send `/link YOUR-CODE` here\n\n"
                    "Once linked, I can help you with:\n"
                    "💰 Finance tracking\n"
                    "💪 Workout planning\n"
                    "📰 News updates\n"
                    "And much more!\n\n"
                    "Questions? Send /help",
                    parse_mode='Markdown'
                )
                return
        finally:
            db.close()

        welcome_message = f"""
*Cortana online.* 🔷

I'm your AI-powered financial advisor - think of me as your personal UNSC finance officer, minus the bureaucracy.

*What I can do:*
💰 Track every credit you spend
📊 Generate tactical financial summaries
🎯 Set budgets (and actually make you stick to them)
📈 Provide detailed analytics
⏰ Schedule reminders
🎤 Process voice commands

*Quick start:*
• "I spent $50 on groceries"
• "Send me my weekly summary"
• "Set my monthly budget to $2000"
• Or just send a voice message - I'll handle it.

Fair warning: I *will* call you out on bad spending habits. Ready to get your finances under control? 😏
        """
        await update.message.reply_text(welcome_message)

    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command"""
        help_text = """
📚 *Cortana Finance Assistant Commands*

*Logging Expenses:*
• "I spent $50 on groceries"
• "Got paid $3000 today"
• "Spent 20 on lunch and 10 on coffee"

*Summaries & Reports:*
• "Send me my weekly summary"
• "Show monthly summary"
• "Give me a detailed report"
• "Show me insights" or "Give me predictions"
• "Export my report as PDF" or "Send me Excel report"

*Budgets & Goals:*
• "Set my monthly budget to $2000"
• "I want to spend max $500 on food per month"

*Managing Transactions:*
• "Delete my last expense"
• "Change that $50 to $45"

*Settings:*
• "Change my daily reminder to 7 PM"
• "Send weekly summaries on Friday at 5 PM"

*Receipt Scanning:*
📸 Just send a photo of your receipt!

*Recurring Expenses:*
💳 "Add Netflix subscription for $15 monthly"
📋 "Show my subscriptions"
❌ "Cancel my Netflix subscription"

*Voice Messages:*
🎤 Just record and send! I'll transcribe it.

*Lebanese News Briefing:*
🇱🇧 "Send me today's news" (8 articles, Lebanese focus)
📰 "Give me tech news" (Category: business, tech, sports, health, science)
📍 "News from Beirut" (Location: beirut, tripoli, sidon, etc.)
🌍 "Give me global news" (BBC, Reuters, CNN)
🔍 "Search news about elections"
⚙️ "I'm interested in technology and business"

*Scheduled Delivery:*
⏰ Daily Lebanese news sent automatically at 8:00 AM

Need help? Just ask me anything! 😊
        """
        await update.message.reply_text(help_text, parse_mode='Markdown')

    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle incoming text messages"""
        # Prevent duplicate processing
        update_id = update.update_id
        if update_id in self.processed_updates:
            logger.info(f"Skipping duplicate update {update_id}")
            return
        self.processed_updates.add(update_id)

        # Keep only last 1000 update IDs to prevent memory growth
        if len(self.processed_updates) > 1000:
            self.processed_updates = set(list(self.processed_updates)[-1000:])

        telegram_user_id = str(update.effective_user.id)
        message_text = update.message.text

        # Import here to avoid circular imports
        from services.telegram_message_handler import process_telegram_message
        from services.telegram_link_service import get_user_by_telegram_id
        from config.database import SessionLocal

        db = SessionLocal()
        try:
            # Check if user has linked their account
            user = get_user_by_telegram_id(telegram_user_id, db)

            if not user:
                await update.message.reply_text(
                    "🔷 *Account Not Linked*\n\n"
                    "Your Telegram account is not linked to Cortana yet.\n\n"
                    "*To get started:*\n"
                    "1. Register at the web dashboard\n"
                    "2. Copy your linking code\n"
                    "3. Send `/link YOUR-CODE` here\n\n"
                    "Need help? Send /help",
                    parse_mode='Markdown'
                )
                return

            logger.info(f"Telegram message from {user.username} (ID: {user.id}): {message_text}")

            # Process message with actual user_id from database
            response = await process_telegram_message(
                user_id=user.id,  # Use the database user ID
                message_text=message_text,
                db=db,
                context_data=context.user_data
            )

            # Check if response is export request
            if isinstance(response, dict) and response.get("type") == "export":
                await self.handle_export_request(update, db, response.get("format", "pdf"))
            # Check if response is a list of chunks (long message split for Telegram)
            elif isinstance(response, list):
                for i, chunk in enumerate(response):
                    await update.message.reply_text(chunk, parse_mode='Markdown')
                    if i < len(response) - 1:
                        import asyncio
                        await asyncio.sleep(0.5)  # Small delay between chunks
            else:
                await update.message.reply_text(response)
        except Exception as e:
            logger.error(f"Error processing Telegram message: {str(e)}")
            await update.message.reply_text(
                "Sorry, I encountered an error processing your message. Please try again."
            )
        finally:
            db.close()

    async def handle_voice(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle incoming voice messages"""
        telegram_user_id = str(update.effective_user.id)

        # Check if user is linked
        from services.telegram_link_service import get_user_by_telegram_id
        from config.database import SessionLocal

        db = SessionLocal()
        try:
            user = get_user_by_telegram_id(telegram_user_id, db)
            if not user:
                await update.message.reply_text(
                    "Please link your account first using /link command."
                )
                return
        finally:
            db.close()

        logger.info(f"Telegram voice message from {user.username} (ID: {user.id})")

        # Get the voice file
        voice = update.message.voice
        file = await context.bot.get_file(voice.file_id)

        # Download to temporary location
        import tempfile
        import os

        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.ogg')
        await file.download_to_drive(temp_file.name)

        try:
            # Transcribe using our audio service
            from services.audio_transcription import AudioTranscriptionService

            transcription_service = AudioTranscriptionService()
            transcription = transcription_service.transcribe_audio(temp_file.name)

            if not transcription:
                await update.message.reply_text(
                    "Sorry, I couldn't understand your voice message. Please try again or send a text message."
                )
                return

            logger.info(f"Transcribed: {transcription}")

            # Process the transcribed text
            from services.telegram_message_handler import process_telegram_message
            from config.database import SessionLocal

            db = SessionLocal()
            try:
                response = await process_telegram_message(
                    user_id=self.allowed_user_id,
                    message_text=transcription,
                    db=db
                )
                await update.message.reply_text(f"🎤 *You said:* {transcription}\n\n{response}", parse_mode='Markdown')
            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error processing voice message: {str(e)}")
            await update.message.reply_text(
                "Sorry, I couldn't process your voice message. Please try again."
            )
        finally:
            # Clean up temp file
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)

    async def handle_export_request(self, update: Update, db, format: str = "pdf"):
        """Handle export report requests"""
        await update.message.reply_text(f"Generating your {format.upper()} report... 📄")

        try:
            from services.finance_agent import FinanceAgent
            from services.report_export import ReportExporter
            from models.user import User

            # Get user data
            user = db.query(User).filter(User.id == 1).first()

            # Get financial summary
            agent = FinanceAgent(db, user.id)
            weekly_summary = agent.get_weekly_summary()

            # Get recent transactions
            from models.finance import FinanceRecord
            transactions = db.query(FinanceRecord).filter(
                FinanceRecord.user_id == user.id
            ).order_by(FinanceRecord.transaction_date.desc()).limit(50).all()

            # Format transactions for export
            recent_transactions = []
            for trans in transactions:
                recent_transactions.append({
                    'date': trans.transaction_date,
                    'description': trans.description,
                    'category': trans.category,
                    'amount': trans.amount,
                    'type': trans.transaction_type.value
                })

            weekly_summary['recent_transactions'] = recent_transactions

            # Generate report
            exporter = ReportExporter()

            if format == "pdf":
                file_path = exporter.generate_pdf_report(weekly_summary, user.full_name, period="weekly")
                caption = "📄 Here's your PDF financial report!"
            else:  # excel
                file_path = exporter.generate_excel_report(weekly_summary, user.full_name, period="weekly")
                caption = "📊 Here's your Excel financial report!"

            # Send file
            with open(file_path, 'rb') as file:
                await update.message.reply_document(
                    document=file,
                    filename=f"Cortana_Financial_Report.{format}",
                    caption=caption
                )

            # Cleanup
            exporter.cleanup_file(file_path)

        except Exception as e:
            logger.error(f"Error generating {format} report: {str(e)}")
            await update.message.reply_text(
                f"Sorry, I encountered an error generating the {format.upper()} report. Please try again."
            )

    async def handle_photo(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle incoming photos (receipt scanning)"""
        telegram_user_id = str(update.effective_user.id)

        # Check if user is linked
        from services.telegram_link_service import get_user_by_telegram_id
        from config.database import SessionLocal

        db = SessionLocal()
        try:
            user = get_user_by_telegram_id(telegram_user_id, db)
            if not user:
                await update.message.reply_text(
                    "Please link your account first using /link command."
                )
                return
        finally:
            db.close()

        logger.info(f"Telegram photo message from {user.username} (ID: {user.id})")
        await update.message.reply_text("Scanning receipt... 🔍")

        # Get the largest photo (best quality)
        photo = update.message.photo[-1]
        file = await context.bot.get_file(photo.file_id)

        # Download to bytes
        import io
        photo_bytes = io.BytesIO()
        await file.download_to_memory(photo_bytes)
        photo_bytes.seek(0)

        try:
            # Scan receipt
            from services.receipt_scanner import ReceiptScanner

            scanner = ReceiptScanner()
            result = scanner.scan_receipt_from_bytes(photo_bytes.read())

            if not result.get("success"):
                await update.message.reply_text(
                    f"⚠️ {result.get('error_message', 'Could not read receipt')}\n\n"
                    "Try taking a clearer photo with good lighting!"
                )
                return

            # Format the scanned data
            merchant = result.get("merchant", "Unknown")
            total = result.get("total_amount", 0)
            category = result.get("suggested_category", "other")
            items = result.get("items", [])

            # Ask user to confirm
            message = f"📸 *Receipt Scanned!*\n\n"
            message += f"🏪 Merchant: {merchant}\n"
            message += f"💰 Total: ${total:.2f}\n"
            message += f"📁 Category: {category}\n"

            if items:
                message += f"\n*Items:*\n"
                for item in items[:5]:  # Show max 5 items
                    message += f"• {item.get('description', 'Item')}: ${item.get('amount', 0):.2f}\n"

            message += f"\n*Should I add this expense?*\n"
            message += f"Reply 'yes' to confirm or tell me the correct amount/category."

            await update.message.reply_text(message, parse_mode='Markdown')

            # Store in context for confirmation
            context.user_data['pending_receipt'] = {
                'amount': total,
                'category': category,
                'merchant': merchant,
                'description': f"{merchant} - {category}"
            }

        except Exception as e:
            logger.error(f"Error processing receipt photo: {str(e)}")
            await update.message.reply_text(
                "Sorry, I couldn't process that receipt. Try again with a clearer photo!"
            )

    async def link_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /link command to link Telegram account to web dashboard"""
        telegram_user_id = str(update.effective_user.id)

        # Check if arguments provided
        if not context.args or len(context.args) == 0:
            await update.message.reply_text(
                "🔷 *Link Your Telegram Account*\n\n"
                "Usage: `/link YOUR-CODE`\n\n"
                "Get your linking code from the web dashboard after signing up:\n"
                "1. Register at the dashboard\n"
                "2. Copy your linking code\n"
                "3. Send `/link YOUR-CODE` here\n\n"
                "Example: `/link TG-ABC123XY`",
                parse_mode='Markdown'
            )
            return

        linking_code = context.args[0].strip().upper()

        # Import services
        from services.telegram_link_service import verify_and_link_telegram
        from config.database import SessionLocal

        db = SessionLocal()
        try:
            result = verify_and_link_telegram(linking_code, telegram_user_id, db)

            if result["success"]:
                user = result["user"]
                await update.message.reply_text(
                    f"✅ *Account Linked Successfully!*\n\n"
                    f"Your Telegram is now linked to: {user.email}\n\n"
                    f"You can now use all Cortana features:\n"
                    f"• 'I spent $50 on groceries'\n"
                    f"• 'Send me my weekly summary'\n"
                    f"• 'What's my workout plan?'\n\n"
                    f"Type /help to see all available commands!",
                    parse_mode='Markdown'
                )
            else:
                await update.message.reply_text(
                    f"❌ *Linking Failed*\n\n"
                    f"{result['message']}\n\n"
                    f"Please check your code and try again.",
                    parse_mode='Markdown'
                )
        except Exception as e:
            logger.error(f"Error in link command: {str(e)}", exc_info=True)
            await update.message.reply_text(
                f"❌ An error occurred while linking your account.\n\n"
                f"Error: {str(e)}\n\n"
                f"Please try again later or contact support."
            )
        finally:
            db.close()

    def setup_handlers(self):
        """Set up message handlers"""
        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CommandHandler("link", self.link_command))
        self.application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message))
        self.application.add_handler(MessageHandler(filters.VOICE, self.handle_voice))
        self.application.add_handler(MessageHandler(filters.PHOTO, self.handle_photo))

    async def start_polling(self):
        """Start the bot with polling"""
        try:
            # Build application without job queue to avoid weak reference error
            builder = Application.builder().token(self.bot_token)

            # Disable job queue (we're using APScheduler anyway)
            builder.job_queue(None)

            # Increase timeouts for slower connections
            builder.connect_timeout(30.0)
            builder.read_timeout(30.0)
            builder.write_timeout(30.0)

            self.application = builder.build()
            self.setup_handlers()

            logger.info("Starting Telegram bot polling...")
            await self.application.initialize()
            await self.application.start()
            await self.application.updater.start_polling()
            logger.info("✅ Telegram bot is now listening for messages!")

        except Exception as e:
            logger.error(f"⚠️ Failed to start Telegram bot: {str(e)}")
            logger.error("This could be due to:")
            logger.error("  - Network/firewall blocking Telegram")
            logger.error("  - VPN/Proxy needed in your region")
            logger.error("  - Invalid bot token")
            logger.error("The server will continue running without Telegram support.")

    async def stop_polling(self):
        """Stop the bot"""
        if self.application:
            await self.application.updater.stop()
            await self.application.stop()
            await self.application.shutdown()
            logger.info("Telegram bot stopped")
