use clap::{Parser, Subcommand};
use anyhow::Result;

#[derive(Parser)]
#[command(name = "ai-studio-archiver")]
#[command(about = "Export Google AI Studio chat history", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Export chat history from Google Drive
    Export {
        /// Google Drive file ID
        #[arg(short, long)]
        file_id: String,
        
        /// Drive API token
        #[arg(short, long)]
        token: String,
        
        /// Output file path
        #[arg(short, long, default_value = "chat_export.md")]
        output: String,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Export { file_id, token, output } => {
            println!("Exporting chat from Drive file: {}", file_id);
            println!("Output will be saved to: {}", output);
            // TODO: Implement export logic
            Ok(())
        }
    }
}
