// Em: src/models/Giveaway.js
const { Schema, model } = require('mongoose');

const giveawaySchema = new Schema({
    guildId: { type: String, required: true },
    messageId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    prize: { type: String, required: true },
    endTime: { type: Date, required: true },
    winnerId: { type: String, default: null },
    // Array que guardará o ID de um usuário para cada ticket que ele comprar
    entries: [String], 
    isActive: { type: Boolean, default: true },
}, { timestamps: true }); // Adiciona campos createdAt e updatedAt automaticamente

module.exports = model('Giveaway', giveawaySchema);
