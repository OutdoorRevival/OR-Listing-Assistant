# Outdoor Revival Listing Assistant

AI-powered tool to help users create perfect listings for outdoor clothing and gear, with formatted titles, categories, and detailed descriptions.

## Features

- **AI-Powered Descriptions**: Generate professional, SEO-friendly descriptions for your outdoor gear.
- **Automatic Categorization**: Smart suggestions for categories and attributes.
- **Formatted Titles**: Create catchy and informative titles that stand out.
- **Responsive Design**: Works perfectly on desktop and mobile devices.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google Gemini API
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Gemini API Key (get one at [aistudio.google.com](https://aistudio.google.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd outdoor-revival-listing-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Build

To create a production build:
```bash
npm run build
```

The output will be in the `dist` directory.

## License

MIT
