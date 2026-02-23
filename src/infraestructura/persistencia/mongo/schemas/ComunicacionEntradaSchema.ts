import mongoose, { Schema, Document } from 'mongoose';

export interface ComunicacionEntradaDocument extends Document {
  aplicacionCandidatoId: mongoose.Types.ObjectId;
  candidatoId: mongoose.Types.ObjectId;
  llamadaConfirmada: boolean;
  comunicacionConfirmada: boolean;
  created_at: Date;
  updated_at: Date;
}

const ComunicacionEntradaSchema = new Schema<ComunicacionEntradaDocument>({
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

  llamadaConfirmada: {
    type: Boolean,
    required: true,
    default: false
  },

  comunicacionConfirmada: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  collection: 'comunicacion_entrada',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Índices para búsquedas eficientes
ComunicacionEntradaSchema.index(
  { aplicacionCandidatoId: 1 },
);
ComunicacionEntradaSchema.index({ candidatoId: 1 });
ComunicacionEntradaSchema.index({ created_at: -1 });

export const ComunicacionEntradaModel = mongoose.model<ComunicacionEntradaDocument>('ComunicacionEntrada', ComunicacionEntradaSchema, 'comunicacion_entrada');
