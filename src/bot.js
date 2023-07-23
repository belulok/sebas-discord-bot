const Discord = require('discord.js');
const QRCode = require('qrcode');
const fetch = require('node-fetch');
const client = new Discord.Client();
const mongoose = require('mongoose');
require('dotenv').config();


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.error(err)); // This will print any initial connection errors

// Creates a schema & model
const prefixes = mongoose.model('prefixes', new mongoose.Schema({
    guildId: String,
    prefix: String
}));
// Creates a schema & model for qrCommands
const qrCommands = mongoose.model('qrCommands', new mongoose.Schema({
    word: String,
    url: String,
    createdAt: { type: Date, default: Date.now }
}));

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
    if (message.author.bot) return;

    // Get the prefix from the database
    const prefixData = await prefixes.findOne({ guildId: message.guild.id });
    const prefix = prefixData ? prefixData.prefix : '.';

    // Check if the message triggers the ping command
    if (message.content.startsWith(prefix + 'ping')) {
        message.reply('Pong!');
    }

    // Check if the message triggers the prefix change command
    if (message.content.startsWith(prefix + 'setprefix ')) {
        // Get the new prefix from the message content
        const newPrefix = message.content.slice(prefix.length + 10);

        // Update the prefix in the database
        const filter = { guildId: message.guild.id };
        const update = { prefix: newPrefix };
        await prefixes.findOneAndUpdate(filter, update, { upsert: true });

        // Confirm the prefix change to the user
        message.reply(`My prefix has been updated to "${newPrefix}".`);
    }

    // Check if the message is a direct message to the bot
    if (message.content.startsWith(prefix + 'dm')) {

        // Respond to the message
        message.reply(`I'll send you a direct message!`);

        // Send a direct message to the user
        message.author.send(`Hi there! You triggered me in the server "${message.guild.name}"`)
            .catch(error => {
                console.error(`Could not send direct message to ${message.author.tag}.`, error);
                message.reply(`I couldn't send you a direct message. Please make sure you have direct messages enabled.`);
            });
    }


    // Check if the message triggers the qr command
    if (message.content.startsWith(prefix + 'qr ')) {
        // Get the message to generate a QR code for
        const qrMessage = message.content.slice(prefix.length + 3);

        // Construct the URL to request the QR code from the API
        const url = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${qrMessage}`;

        // Store the qrMessage and url in your database
        // You would use your specific database command here
        qrCommands.create({ word: qrMessage, url: url });


        // Send the QR code image as a message attachment
        message.channel.send({
            files: [{
                attachment: url,
                name: 'qrcode.png'
            }]
        });
    }


});



// import the necessary libraries
const express = require('express');
const path = require('path');

// create an express app
const app = express();
const port = 3001;

// set the view engine to pug
app.set('view engine', 'pug');

// set the public directory for static files
app.use(express.static(path.join(__dirname, 'public')));

// render the index page
app.get('/', function(req, res) {
    // res.render('index', { title: 'Express.js', message: 'Hello world!' });
    res.render('index');
});

app.get('/commands', async(req, res) => {
    // Fetch the latest guild from the database (MongoDB)
    const latestGuild = await prefixes.findOne().sort({ createdAt: -1 });

    // Fetch the latest QR command from the database
    const latestQRCommand = await qrCommands.findOne().sort({ createdAt: -1 });

    // Render the template
    res.render('commands', {
        subtitle: 'Commands',
        latestGuild: latestGuild,
        latestQRCommand: latestQRCommand,
        categories: [
            { name: 'Commands Info', icon: 'fa fa-gavel' },
            { name: 'QR Code Info', icon: 'fa fa-database' },
            { name: 'General', icon: 'fa fa-star' },
            { name: 'Music', icon: 'fa fa-music' }
        ],
    })
});

// start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


client.login(process.env.BOT_TOKEN);