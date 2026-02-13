// ============================================================================
// ESQUEMA MONGO - HISTORIAL CANDIDATO
// ============================================================================

import mongoose, { Schema, Document } from 'mongoose';
import { HistorialCandidato } from '../../../../dominio/entidades/HistorialCandidato';

export interface IHistorialCandidatoDocument extends Omit<HistorialCandidato, 'id'>, Document {
  id: string;
}

const HistorialCandidatoSchema = new Schema<IHistorialCandidatoDocument>({
  // Referencias
  candidatoId: {
    type: String,
    required: true,
    ref: 'Candidato',
    index: true
  },
  aplicacionId: {
    type: String,
    required: true,
    ref: 'AplicacionCandidato',
    index: true
  },

  // Información del cambio
  estadoAnterior: {
    type: String,
    required: true,
    enum: [
      'CVS_RECIBIDOS',
      'POR_LLAMAR',
      'ENTREVISTA_PREVIA',
      'PROGRAMAR_1RA_ENTREVISTA',
      'PROGRAMAR_2DA_ENTREVISTA',
      'REFERENCIAS',
      'EVALUACION_ANTISOBORNO',
      'APROBACION_GERENCIA',
      'LLAMAR_COMUNICAR_ENTRADA',
      'FINALIZADA',
      'RECHAZADO_POR_CANDIDATO',
      'DESCARTADO',
      'POSIBLES_CANDIDATOS'
    ]
  },
  estadoNuevo: {
    type: String,
    required: true,
    enum: [
      'CVS_RECIBIDOS',
      'POR_LLAMAR',
      'ENTREVISTA_PREVIA',
      'PROGRAMAR_1RA_ENTREVISTA',
      'PROGRAMAR_2DA_ENTREVISTA',
      'REFERENCIAS',
      'EVALUACION_ANTISOBORNO',
      'APROBACION_GERENCIA',
      'LLAMAR_COMUNICAR_ENTRADA',
      'FINALIZADA',
      'RECHAZADO_POR_CANDIDATO',
      'DESCARTADO',
      'POSIBLES_CANDIDATOS'
    ]
  },
  tipoCambio: {
    type: String,
    required: true,
    enum: ['APROBACION', 'RECHAZO', 'MOVIMIENTO', 'REACTIVACION'],
    index: true
  },

  // Quién y cuándo
  realizadoPor: {
    type: String,
    required: true,
    ref: 'Usuario',
    index: true
  },
  realizadoPorNombre: {
    type: String,
    required: true,
    index: true
  },
  fechaCambio: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },

  // Motivos y comentarios (opcionales)
  motivo: {
    type: String,
    maxlength: 500
  },
  comentarios: {
    type: String,
    maxlength: 1000
  },

  // Metadata adicional
  tiempoEnEstadoAnterior: {
    type: Number,
    min: 0
  },
  etapaProceso: {
    type: String,
    index: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false // No necesitamos updated_at para historial
  },
  collection: 'historial_candidato'
});

// ============================================================================
// ÍNDICES COMPUESTOS PARA CONSULTAS FRECUENTES
// ============================================================================

// Índice para filtrar por aplicación y fecha (ordenado por fecha descendente)
HistorialCandidatoSchema.index({ aplicacionId: 1, fechaCambio: -1 });

// Índice para filtrar por candidato y fecha
HistorialCandidatoSchema.index({ candidatoId: 1, fechaCambio: -1 });

// Índice para estadísticas por tipo de cambio y fecha
HistorialCandidatoSchema.index({ tipoCambio: 1, fechaCambio: -1 });

// Índice para estadísticas por estado y fecha
HistorialCandidatoSchema.index({ estadoNuevo: 1, fechaCambio: -1 });

// Índice para estadísticas por usuario y fecha
HistorialCandidatoSchema.index({ realizadoPor: 1, fechaCambio: -1 });

// Índice para estadísticas por etapa y fecha
HistorialCandidatoSchema.index({ etapaProceso: 1, fechaCambio: -1 });

// ============================================================================
// MIDDLEWARES
// ============================================================================

// Middleware para validar referencias antes de guardar
HistorialCandidatoSchema.pre('save', async function(next) {
  try {
    // Validar que las referencias existan (opcional, puede ser costoso)
    // Se puede implementar validación de existencia de candidato y aplicación
    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

// ============================================================================
// MÉTODOS ESTÁTICOS
// ============================================================================

HistorialCandidatoSchema.statics = {
  // Método para obtener estadísticas rápidas
  async obtenerEstadisticasRapidas(fechaDesde?: Date, fechaHasta?: Date) {
    const match: any = {};
    if (fechaDesde || fechaHasta) {
      match.fechaCambio = {};
      if (fechaDesde) match.fechaCambio.$gte = fechaDesde;
      if (fechaHasta) match.fechaCambio.$lte = fechaHasta;
    }

    return this.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalMovimientos: { $sum: 1 },
          tiposCambio: { $addToSet: '$tipoCambio' },
          estadosDestino: { $addToSet: '$estadoNuevo' }
        }
      }
    ]);
  }
};

export const HistorialCandidatoModel = mongoose.model<IHistorialCandidatoDocument>(
  'HistorialCandidato',
  HistorialCandidatoSchema
);