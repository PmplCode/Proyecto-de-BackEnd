const { Schema, model } = require("mongoose");

const coctelSchema = new Schema(
  {
    name: {
      type: String,
      require: true
    },
    alcohol:{
      type: [String]
      // enum:["Whisky", "Vodka", "Tequila", "Ron", "Ginebra", "Pisco", "Orujo","Brandy", "Coñac", "Cointreau", "Licor de grosella", "Champagne", "Cava","Vermut","Vino", "Licor de fruta"]
    },
    ingredientes: String,
    procedimiento: String,
    descripcion: String,
    origen: String,
    puntuacion: {
      type: Number,
      enum: [1, 2, 3, 4, 5]
    },
    imageUrl: String,
    creador: {type: Schema.Types.ObjectId, ref: "User"}
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Coctel = model("Coctel", coctelSchema);

module.exports = Coctel;

