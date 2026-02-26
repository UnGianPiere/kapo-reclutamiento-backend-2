// ============================================================================
// ESQUEMA MONGO - CONVOCATORIA (snapshot desde MS PERSONAL)
// ============================================================================

import mongoose, { Schema, Document } from 'mongoose';

export interface IConvocatoriaDocument extends Document {
  requerimiento_personal_id: string;
  codigo_convocatoria: string;
  tipo_requerimiento: string;
  estado_convocatoria: string;
  cargo_nombre?: string;
  categoria_nombre?: string;
  especialidad_nombre?: string;
  obra_nombre?: string;
  empresa_nombre?: string;
  vacantes: number;
  prioridad: string;
  requisitos?: Record<string, unknown>;
  cargo_categoria_especialidad_id?: string;
  obra_id?: string;
  empresa_id?: string;
  detalle_staff_snapshot?: Record<string, unknown>;
  link_formulario?: string;
  token_formulario?: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  ganadores_ids: string[];
}

const ConvocatoriaSchema = new Schema<IConvocatoriaDocument>(
  {
    requerimiento_personal_id: { type: String, required: true, unique: true, trim: true },
    codigo_convocatoria: { type: String, required: true, trim: true },
    tipo_requerimiento: { type: String, required: true, enum: ['obra', 'staff'], default: 'obra' },
    estado_convocatoria: { type: String, required: true, enum: ['ACTIVA', 'EN_PROCESO', 'FINALIZADA', 'CANCELADA'], default: 'ACTIVA' },
    cargo_nombre: { type: String, trim: true },
    categoria_nombre: { type: String, trim: true },
    especialidad_nombre: { type: String, trim: true },
    obra_nombre: { type: String, trim: true },
    empresa_nombre: { type: String, trim: true },
    vacantes: { type: Number, required: true, min: 0 },
    prioridad: { type: String, required: true, trim: true },
    requisitos: { type: Schema.Types.Mixed },
    cargo_categoria_especialidad_id: { type: String, trim: true },
    obra_id: { type: String, trim: true },
    empresa_id: { type: String, trim: true },
    detalle_staff_snapshot: { type: Schema.Types.Mixed },
    link_formulario: { type: String, trim: true },
    token_formulario: { type: String, trim: true },
    fecha_creacion: { type: Date, default: Date.now },
    fecha_actualizacion: { type: Date, default: Date.now },
    ganadores_ids: { type: [String], default: [] },
  },
  { collection: 'convocatorias', timestamps: false }
);

ConvocatoriaSchema.index({ estado_convocatoria: 1, fecha_creacion: -1 });

export const ConvocatoriaModel = mongoose.model<IConvocatoriaDocument>('Convocatoria', ConvocatoriaSchema, 'convocatorias');
