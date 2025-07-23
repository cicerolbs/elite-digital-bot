// Em: /root/elite-bot/src/models/User.js

// Importamos as ferramentas necessárias do Mongoose para criar o Schema e o Model.
// 'Schema' é a planta, o projeto de como os dados devem ser.
// 'model' é a ferramenta que pega essa planta e constrói o objeto que usaremos para interagir com o banco de dados.
const { Schema, model } = require('mongoose');

// Aqui criamos a nossa "planta" para os dados do usuário.
const userSchema = new Schema({
    // O ID do usuário no Discord. Essencial para saber de quem são os pontos.
    userId: {
        type: String,     // O ID será guardado como texto (String).
        required: true,   // Este campo é obrigatório.
        unique: true,     // Garante que não teremos dois registros para o mesmo usuário.
    },
    // O campo para armazenar a pontuação do usuário.
    points: {
        type: Number,     // A pontuação será um número.
        default: 0,       // Se um novo usuário for criado, ele começará com 0 pontos por padrão.
    },
});

// Agora, exportamos o modelo.
// O Mongoose pegará o nome 'User', o transformará em 'users' (minúsculo e no plural)
// e criará/usará uma coleção com esse nome no nosso banco de dados MongoDB.
// É este 'model' que usaremos em nossos comandos para encontrar, criar e atualizar usuários.
module.exports = model('User', userSchema);
