# Solana Bot

## How to deploy

### Get Bot Token

1. create a bot on discord dev portal [learn basics here](<https://dev.to/vishnudileesh/building-a-discord-bot-basic-setups-4a53>)

2. Now you have the bot token, you can use it to deploy the bot.

3. For the permissions& scope of the bot check this insted of what is show in above article
    
    Scopes
    ![image](https://user-images.githubusercontent.com/64301340/159311861-265af1db-0bec-418f-b0eb-7605f945217f.png)
    
    Permissions
    ![image](https://user-images.githubusercontent.com/64301340/159312215-960e614c-8821-4775-8ba9-123fc92a3b3a.png)


### Run Locally

1. Clone the repository

    ```bash
    git clone https://github.com/YogPanjarale/solana-bot.git
    ```

2. install the packages

    ```bash
    npm install
    ```
  
3. Add Enviromenent Variables
    make a .env file in the root directory
    and add the following lines

    ```bash
    BOT_TOKEN = <bot-token>
    ```

4. Run the bot

    ```bash
    npm run build
    npm run serve
    ```

### How to host the bot
