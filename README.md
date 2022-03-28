# Solana Bot

## Deployment Instructions-

1. Create a bot on discord dev portal [learn basics here](<https://dev.to/vishnudileesh/building-a-discord-bot-basic-setups-4a53>)

2. Copy the Bot Token and go to OAuth field for URL generation

3. For the permissions & scope of the bot check this insted of what is show in above article.

    Scopes
    ![image](https://user-images.githubusercontent.com/64301340/159311861-265af1db-0bec-418f-b0eb-7605f945217f.png)

    Permissions
    ![image](https://user-images.githubusercontent.com/64301340/159312215-960e614c-8821-4775-8ba9-123fc92a3b3a.png)

4. Add the Bot in your own Server using the created url

### Run Locally

 • Clone the repository

    ```
    git clone https://github.com/Vampo7152/degen.git
    ```

 • install the packages

    ```
    npm install

    yarn (optional)
    ```
  
 • Add Enviromenent Variables
    make a .env file in the root directory
    and add the following lines

    ```
    BOT_TOKEN = <bot-token>
    API_KEY_ID = <theblockchainapi-key-id>
    API_KEY_SECRET = <theblockchainapi-key-secret>
    MAGIC_DEN_KEY = <magic-den-key>
    ```

 • Run the bot

    ```
    npm run build
    npm run serve
    ```

### Host the bot for 24/7 uptime

New to Hosting Services? Check out [Railway.app](https://railway.app?referralCode=vamp)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/4BdAu9?referralCode=Tf0yEr)
