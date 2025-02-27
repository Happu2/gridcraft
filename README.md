
# CDP Support Agent Chatbot

A responsive web application that provides a conversational interface for answering "how-to" questions related to Customer Data Platforms (CDPs).

## Features

- Chat interface for asking questions about CDPs
- Support for four major CDP platforms:
  - Segment
  - mParticle
  - Lytics
  - Zeotap
- Ability to handle "how-to" questions for each platform
- Cross-CDP comparisons
- Sample questions for inspiration
- Mobile-responsive design

## How it Works

This application simulates a chatbot that can answer questions about different Customer Data Platforms. It's built using:

- React and TypeScript
- Tailwind CSS for styling
- Shadcn UI for component library

In a production environment, this would typically connect to an OpenAI or similar AI service API to generate responses based on CDP documentation.

## Getting Started

To run this project locally:

```sh
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Project Structure

- `src/pages/Index.tsx` - Main chatbot interface
- `src/components/ui/` - UI components from Shadcn UI

## Enhancement Ideas

- Connect to OpenAI API to generate dynamic responses
- Add document scraping to extract information from CDP documentation
- Implement a feedback system for incorrect answers
- Add authentication for user-specific chat history
- Enable offline mode with cached responses
