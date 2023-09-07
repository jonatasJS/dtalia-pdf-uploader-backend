// models/nota.ts
const { models, model, Schema } = require('mongoose');

const notaSchema = new Schema({
  name: {
    type: String
  },
  url: {
    type: String
  }
}, {
  timestamps: true
});

const NotaModel = models.nota || model('nota', notaSchema);

module.exports = NotaModel;
