# BotBingAIApp

BotBingAIApp is a web application that allows users to interact with a neural network powered by Microsoft's Bing. This application is similar to a chatbot, and users can make requests to the neural network by typing in their queries.

## Installation

To install BotBingAIApp, you will need to have Node.js installed on your machine. Once you have Node.js installed, you can use the pnpm package manager to install the application. Simply run the following command in your terminal:

```bash
pnpm install
```

This will install all of the necessary dependencies for the application.

To authenticate with the Bing API and make requests to the neural network, users must provide a valid cookie in the form of a `COOKIE=YOUR_COOKIE` string. To do this, create a `.env` file in the root directory of the project and add the `COOKIE` variable with your cookie value. This will allow the application to authenticate with the Bing API and make requests to the neural network.

Note that the `COOKIE` value should not be shared with anyone else, as it grants access to your Bing account. Keep this value secure and private.

## Usage

To start the application, run the following command in your terminal:

```bash
pnpm start
```

This will start the application on your local server. You can then access the application by navigating to `http://localhost:3000` in your web browser.

Once you are in the application, you can start chatting with the neural network by typing in your queries. All of your requests and chats will be saved to JSON files for later reference.

## Contributing

If you would like to contribute to BotBingAIApp, please fork the repository and make any necessary changes. Once you have made your changes, submit a pull request and we will review your changes.