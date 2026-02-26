import mongoose, { Schema, Document } from 'mongoose';

export interface CandidatoDocument extends Document {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  telefono: string;
  lugarResidencia?: string;
  curriculumUrl: string;
  totalAplicaciones?: number;
  aplicacionesGanadas?: number;
  empleadoch_id?: string;
  personal_id?: string;
  convocatorias_ganadas?: string[];
}

const CandidatoSchema = new Schema<CandidatoDocument>({
  dni: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{8}$/.test(v);
      },
      message: 'DNI debe tener exactamente 8 dígitos'
    }
  },
  nombres: { type: String, required: true, trim: true },
  apellidoPaterno: { type: String, required: true, trim: true },
  apellidoMaterno: { type: String, required: true, trim: true },
  correo: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Correo debe tener formato válido'
    }
  },
  telefono: { type: String, required: true },
  lugarResidencia: { type: String, trim: true },
  curriculumUrl: { type: String, required: true },
  totalAplicaciones: { type: Number, default: 0 },
  aplicacionesGanadas: { type: Number, default: 0 },
  empleadoch_id: { type: String, index: true },
  personal_id: { type: String },
  convocatorias_ganadas: { type: [String], default: [] }
}, {
  collection: 'candidato',
  timestamps: true
});

// Índices para búsquedas eficientes
CandidatoSchema.index({ dni: 1 }, { unique: true });
CandidatoSchema.index({ correo: 1 }); // Sin unique para permitir correos duplicados
CandidatoSchema.index({ telefono: 1 });
CandidatoSchema.index({ nombres: 1, apellidoPaterno: 1, apellidoMaterno: 1 });

export const CandidatoModel = mongoose.model<CandidatoDocument>('Candidato', CandidatoSchema, 'candidato');