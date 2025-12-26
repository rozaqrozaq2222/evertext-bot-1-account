# EverText Bot - Setup Instructions

## 1. Install Rust
If you don't have Rust installed, download it here:
https://rustup.rs/

## 2. Configuration
1. Rename the file `.env.example` to just `.env`.
2. Open `.env` with a text editor (Notepad, VS Code).
3. Paste your Discord Bot Token inside:
   DISCORD_TOKEN=OTk5...
   OWNER_ID=12345...

## 3. Database
The `db.json` file is where accounts are stored. It starts empty.
You can add accounts using the Discord command:
`/add_account name:MyAcc code:ABC12345`

## 4. Running the Bot
Open a terminal (PowerShell or Command Prompt) in this folder and run:
`cargo run`

The first time you run it, it will download dependencies (might take a minute).
Once it says "Bot successfully logged in", you are ready!

## Commands
- `/add_account` - Add a game account
- `/list_accounts` - See all accounts
- `/force_run` - Manually trigger the bot
