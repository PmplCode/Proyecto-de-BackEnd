const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: false,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    descripcion: String,
    fotoPerfil: {
      type: String,
      default: "https://c1.alamy.com/thumbs/2fntnx5/icono-de-perfil-de-messenger-sobre-fondo-blanco-aislado-ilustracion-2fntnx5.jpg"
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;