import mongoose, { Schema, Document } from 'mongoose';
import { EstadoKanban } from '../../../../dominio/entidades/EstadoKanban';

export interface AplicacionCandidatoDocument extends Document {
  candidatoId: mongoose.Types.ObjectId;
  convocatoriaId: mongoose.Types.ObjectId;

  // Respuestas del formulario dinámico
  respuestasFormulario: Record<string, unknown>;

  // Estado en el flujo del Kanban
  estadoKanban: EstadoKanban;

  // Información específica
  aniosExperienciaPuesto: number;
  aniosExperienciaGeneral: number;
  medioConvocatoria: string;
  pretensionEconomica: number;
  curriculumUrl: string;

  // Metadata
  fechaAplicacion: Date;
  aplicadoPor: 'CANDIDATO' | 'RECLUTADOR';

  // Timestamps automáticos (agregados por timestamps: true)
  createdAt: Date;
  updatedAt: Date;

  // Sistema de posibles candidatos
  ordenPrioridad?: number;
  fechaExpiracionPosibles?: Date;

  // Detección de duplicados
  posibleDuplicado: boolean;
  candidatoSimilarId?: mongoose.Types.ObjectId;
  similitudPorcentaje?: number;
  duplicadoRevisado: boolean;

  // Tracking de reactivaciones
  esRepostulacion: boolean;
  esPosibleCandidatoActivado: boolean;
  aplicacionPrincipalRechazadaId?: mongoose.Types.ObjectId;
}

const AplicacionCandidatoSchema = new Schema<AplicacionCandidatoDocument>({
  candidatoId: {
    type: Schema.Types.ObjectId,
    ref: 'Candidato',
    required: true
  },
  convocatoriaId: {
    type: Schema.Types.ObjectId,
    ref: 'Convocatoria',
    required: true
  },

  // Respuestas del formulario dinámico
  respuestasFormulario: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },

  // Estado en el flujo del Kanban
  estadoKanban: {
    type: String,
    enum: Object.values(EstadoKanban),
    required: true,
    default: EstadoKanban.CVS_RECIBIDOS
  },

  // Información específica
  aniosExperienciaPuesto: { type: Number, required: true, min: 0 },
  aniosExperienciaGeneral: { type: Number, required: false, min: 0, default: 0 },
  medioConvocatoria: { type: String, required: false, default: 'Otro' },
  pretensionEconomica: { type: Number, required: true, min: 0 },
  curriculumUrl: { type: String, required: true },

  // Metadata
  fechaAplicacion: { type: Date, required: true, default: Date.now },
  aplicadoPor: {
    type: String,
    enum: ['CANDIDATO', 'RECLUTADOR'],
    required: true,
    default: 'CANDIDATO'
  },

  // Sistema de posibles candidatos
  ordenPrioridad: { type: Number, min: 1 },
  fechaExpiracionPosibles: { type: Date },

  // Detección de duplicados
  posibleDuplicado: { type: Boolean, required: true, default: false },
  candidatoSimilarId: { type: Schema.Types.ObjectId, ref: 'Candidato' },
  similitudPorcentaje: { type: Number, min: 0, max: 100 },
  duplicadoRevisado: { type: Boolean, required: true, default: false },

  // Tracking de reactivaciones
  esRepostulacion: { type: Boolean, required: true, default: false },
  esPosibleCandidatoActivado: { type: Boolean, required: true, default: false },
  aplicacionPrincipalRechazadaId: { type: Schema.Types.ObjectId, ref: 'AplicacionCandidato' }
}, {
  collection: 'aplicacion_candidato',
  timestamps: true
});

// Índices para búsquedas eficientes
AplicacionCandidatoSchema.index({ candidatoId: 1 });
AplicacionCandidatoSchema.index({ convocatoriaId: 1 });
AplicacionCandidatoSchema.index({ candidatoId: 1, convocatoriaId: 1 }, { unique: true }); // Un candidato solo puede aplicar una vez por convocatoria
AplicacionCandidatoSchema.index({ estadoKanban: 1 });
AplicacionCandidatoSchema.index({ posibleDuplicado: 1, duplicadoRevisado: 1 });
AplicacionCandidatoSchema.index({ fechaAplicacion: -1 });
AplicacionCandidatoSchema.index({ ordenPrioridad: 1 });

export const AplicacionCandidatoModel = mongoose.model<AplicacionCandidatoDocument>('AplicacionCandidato', AplicacionCandidatoSchema, 'aplicacion_candidato');