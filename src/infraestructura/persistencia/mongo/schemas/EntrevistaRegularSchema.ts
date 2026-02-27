import mongoose, { Schema, Document } from 'mongoose';
import { TipoEntrevista, ModalidadEntrevista } from '../../../../dominio/entidades/EntrevistaRegular';

export interface EntrevistaRegularDocument extends Document {
  aplicacionCandidatoId: mongoose.Types.ObjectId;
  candidatoId: mongoose.Types.ObjectId;
  tipo_entrevista: TipoEntrevista;
  modalidad: ModalidadEntrevista;
  fecha_entrevista: Date;
  hora_entrevista: string;
  correo_contacto: string;
  entrevistador_id: mongoose.Types.ObjectId;
  entrevistador_nombre: string;
  observaciones?: string;
  archivo_sustento?: string[];
  resultado?: string;
  created_at: Date;
  updated_at: Date;
}

const EntrevistaRegularSchema = new Schema<EntrevistaRegularDocument>({
  aplicacionCandidatoId: {
    type: Schema.Types.ObjectId,
    ref: 'AplicacionCandidato',
    required: true
  },

  candidatoId: {
    type: Schema.Types.ObjectId,
    ref: 'Candidato',
    required: true
  },

  tipo_entrevista: {
    type: String,
    enum: ['PRIMERA', 'SEGUNDA'],
    required: true
  },

  modalidad: {
    type: String,
    enum: ['PRESENCIAL', 'VIRTUAL'],
    required: false
  },

  fecha_entrevista: {
    type: Date,
    required: true
  },

  hora_entrevista: {
    type: String,
    required: true,
    trim: true
  },

  correo_contacto: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: ''
  },

  entrevistador_id: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  entrevistador_nombre: {
    type: String,
    required: true,
    trim: true
  },

  observaciones: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },

  archivo_sustento: {
    type: [String],
    required: false,
    default: []
  },

  resultado: {
    type: String,
    required: false,
    trim: true,
    default: ''
  }
}, {
  collection: 'entrevistas_regulares',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Índices para búsquedas eficientes
// Índice único: una aplicación solo puede tener una entrevista de cada tipo
EntrevistaRegularSchema.index(
  { aplicacionCandidatoId: 1, tipo_entrevista: 1 },
  { unique: true }
);

// Índices adicionales para búsquedas comunes
EntrevistaRegularSchema.index({ candidatoId: 1 });
EntrevistaRegularSchema.index({ entrevistador_id: 1 });
EntrevistaRegularSchema.index({ fecha_entrevista: -1 });
EntrevistaRegularSchema.index({ tipo_entrevista: 1 });
EntrevistaRegularSchema.index({ created_at: -1 });

export const EntrevistaRegularModel = mongoose.model<EntrevistaRegularDocument>('EntrevistaRegular', EntrevistaRegularSchema, 'entrevistas_regulares');