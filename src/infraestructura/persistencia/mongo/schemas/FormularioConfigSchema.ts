// ============================================================================
// SCHEMA FORMULARIO CONFIG - MongoDB Schema
// ============================================================================

import { Schema } from 'mongoose';

const CampoFormularioSchema = new Schema({
  id: { type: String, required: true },
  nombre: { type: String, required: true },
  etiqueta: { type: String, required: true },
      tipo: {
        type: String,
        enum: ['text', 'email', 'tel', 'number', 'textarea', 'select', 'url', 'file', 'checkbox'],
        required: true
      },
  requerido: { type: Boolean, default: false },
  habilitado: { type: Boolean, default: true },
  orden: { type: Number, required: true },
  opciones: [{ type: String }],
  placeholder: String,
      validaciones: {
        min: Number,
        max: Number,
        patron: String,
        maxSize: Number,
        maxFiles: Number,
        maxLength: Number,
        allowedTypes: [String]
      }
}, { _id: false });

const FormularioConfigSchema = new Schema({
  formularioId: { type: String }, // UUID del formulario
  convocatoriaId: {
    type: Schema.Types.ObjectId,
    ref: 'Convocatoria',
    required: true
  },
  titulo: {
    type: String,
    required: true,
    default: 'Formulario de Postulación'
  },
  descripcion: String,
  campos: [CampoFormularioSchema],
  estado: {
    type: String,
    enum: ['ACTIVO', 'INACTIVO'],
    default: 'ACTIVO'
  },

  // Link público y autenticación
  urlPublico: String,
  tokenJwt: String,

  // Fechas de vigencia automática
  fechaPublicacion: Date,
  fechaExpiracion: Date,

  creadoPor: {
    type: String,
    default: 'system'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaModificacion: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  }
});

// Índices para performance
FormularioConfigSchema.index({ convocatoriaId: 1 }, { unique: true });
FormularioConfigSchema.index({ estado: 1 });
FormularioConfigSchema.index({ creadoPor: 1 });
FormularioConfigSchema.index({ fechaCreacion: -1 });

// Middleware para actualizar fecha de modificación
FormularioConfigSchema.pre('save', function(next) {
  this.fechaModificacion = new Date();
  this.version += 1;
  next();
});

export { FormularioConfigSchema };