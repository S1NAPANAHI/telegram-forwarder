# Eitaa Login Guide

Due to the security measures of the Eitaa platform, the bot cannot fully automate the login process. When you start monitoring an Eitaa channel for the first time, you will need to manually enter a verification code.

## How it works

1.  When the bot needs to log in to Eitaa, it will open a browser window using Puppeteer.
2.  The bot will automatically fill in your phone number and navigate to the verification code page.
3.  You will receive a verification code in your Eitaa app.
4.  You need to enter this code in the browser window that the bot has opened.

## What you need to do

When you see a message in the console like "A verification code has been sent to your Eitaa account.", you need to:

1.  Open your Eitaa app and find the verification code.
2.  Switch to the browser window that the bot has opened.
3.  Enter the verification code in the input field.

Once you have entered the code, the bot will be able to log in and start monitoring the channel.
