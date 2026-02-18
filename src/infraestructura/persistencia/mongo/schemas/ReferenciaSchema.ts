import mongoose, { Schema, Document } from 'mongoose';

export interface ReferenciaDocument extends Document {
  aplicacionCandidatoId: mongoose.Types.ObjectId;
  candidatoId: mongoose.Types.ObjectId;
  numero_telefono: string;
  nombresyapellidos: string;
  detalles: string;
  empresa: string;
  comentarios: string;
  archivosurl?: any[];
  created_at: Date;
  updated_at: Date;
}

const ReferenciaSchema = new Schema<ReferenciaDocument>({
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

  numero_telefono: {
    type: String,
    required: true,
    trim: true
  },

  nombresyapellidos: {
    type: String,
    required: true,
    trim: true
  },

  detalles: {
    type: String,
    required: false,
    trim: true
  },

  empresa: {
    type: String,
    required: false,
    trim: true
  },

  comentarios: {
    type: String,
    required: false,
    trim: true
  },

  archivosurl: {
    type: [Schema.Types.Mixed],
    required: false,
    default: ['urlfuturogenerada']
  }
}, {
  collection: 'referencias',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Índices para búsquedas eficientes
ReferenciaSchema.index({ aplicacionCandidatoId: 1 });
ReferenciaSchema.index({ candidatoId: 1 });
ReferenciaSchema.index({ empresa: 1 });
ReferenciaSchema.index({ created_at: -1 });

export const ReferenciaModel = mongoose.model<ReferenciaDocument>('Referencia', ReferenciaSchema, 'referencias');