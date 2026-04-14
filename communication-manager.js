'use strict';

class CommunicationManager {
    constructor() {
        this.chats = [];
    }

    createChat(chatName) {
        const newChat = { id: this.chats.length + 1, name: chatName, messages: [] };
        this.chats.push(newChat);
        return newChat;
    }

    sendMessage(chatId, sender, message) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            const newMessage = { sender, content: message, timestamp: new Date() };
            chat.messages.push(newMessage);
            return newMessage;
        }
        throw new Error('Chat not found');
    }

    getMessages(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            return chat.messages;
        }
        throw new Error('Chat not found');
    }

    getChatList() {
        return this.chats.map(chat => ({ id: chat.id, name: chat.name }));
    }
}

module.exports = CommunicationManager;
