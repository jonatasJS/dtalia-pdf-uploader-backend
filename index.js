require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3001;

// Conectar-se ao MongoDB usando a função connectMongo do utils/mongoose.js
require('./utils/mongoose').connectMongo();

// Configurar o middleware para lidar com requisições JSON
app.use(bodyParser.json());

// Configurar o middleware CORS para permitir solicitações de qualquer origem (para fins de demonstração)
app.use(cors());

// Configurar a pasta "public" para servir arquivos estáticos na raiz da rota "/"
app.use('/', express.static('public'));

// Configurar o Multer para lidar com uploads de arquivos diretamente em "public"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + '\\public');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname.replaceAll(" ", "_")}`);
  },
});

const upload = multer({ storage });

// Rota para fazer upload de arquivos
app.post('/upload', upload.single('nota'), async (req, res) => {
  try {
    // Salvar os dados do arquivo no MongoDB
    const NotaModel = require('./models/nota');
    const { originalname, filename } = req.file; // Use req.file.filename para obter o nome do arquivo salvo pelo Multer
    const nota = await NotaModel.create({
      name: originalname,
      url: `/${filename}`, // Use req.file.filename para definir a URL do arquivo
    });

    res.status(200).json({ message: 'Upload realizado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer o upload do arquivo.' });
  }
});


// Rota para listar os arquivos no MongoDB
app.get('/list-files', async (req, res) => {
  try {
    const NotaModel = require('./models/nota');
    const notas = await NotaModel.find({}, 'name url').exec();
    res.status(200).json(notas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar os arquivos.' });
  }
});

// Rota para excluir um arquivo
app.delete('/delete/:id', async (req, res) => {
  try {
    const NotaModel = require('./models/nota');
    const { id } = req.params;

    // Encontre o documento no MongoDB pelo ID e obtenha a URL do arquivo
    const nota = await NotaModel.findByIdAndDelete(id);

    if (!nota) {
      return res.status(404).json({ error: 'Arquivo não encontrado.' });
    }

    // Exclua o arquivo físico na pasta "public" usando fs
    fs.unlinkSync(`public${nota.url}`);

    console.log("sucsse")

    res.status(200).json({ message: 'Arquivo excluído com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir o arquivo.' });
  }
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
