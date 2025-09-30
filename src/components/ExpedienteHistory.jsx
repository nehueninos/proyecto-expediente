import React from 'react';
import { X, Calendar, Clock, ArrowRight, MessageSquare } from 'lucide-react';
import { AREAS, AREA_COLORS } from '../utils/constants';

export function ExpedienteHistory({ expediente, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{expediente.nombre}</h2>
            <p className="text-gray-600">Expediente Nº {expediente.numero}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información básica */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Estado actual:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${AREA_COLORS[expediente.areaActual]}`}>
                    {AREAS[expediente.areaActual]}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Fecha de creación:</span>
                  <span className="ml-2 text-sm text-gray-600">{expediente.fechaCreacion}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Hora de creación:</span>
                  <span className="ml-2 text-sm text-gray-600">{expediente.horaCreacion}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Denunciante:</span>
                  <span className="ml-2 text-sm text-gray-600">{expediente.denunciante}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Denunciado:</span>
                  <span className="ml-2 text-sm text-gray-600">{expediente.denunciado}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Total de pases:</span>
                  <span className="ml-2 text-sm text-gray-600">{expediente.pases?.length || 0}</span>
                </div>
              </div>

              {expediente.caratula && (
          <div className="mb-4">
            {expediente.caratulaType === "application/pdf" ? (
              <embed
                src={expediente.caratula}
                type="application/pdf"
                className="w-full h-32 rounded-lg border"
              />
            ) : (
              <img
                src={expediente.caratula}
                alt="Carátula del expediente"
                className="w-full h-32 object-cover rounded-lg border"
              />
            )}
          </div>
        )}
            </div>

            {/* Historial de pases */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Pases</h3>
              
              {!expediente.pases || expediente.pases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Este expediente aún no tiene pases registrados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expediente.pases
                    .sort((a, b) => new Date(b.fecha + ' ' + b.hora).getTime() - new Date(a.fecha + ' ' + a.hora).getTime())
                    .map((pase, index) => (
                    <div key={pase._id || index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${AREA_COLORS[pase.areaOrigen]}`}>
                            {AREAS[pase.areaOrigen]}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${AREA_COLORS[pase.areaDestino]}`}>
                            {AREAS[pase.areaDestino]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>{pase.fecha}</span>
                          <Clock className="w-3 h-3" />
                          <span>{pase.hora}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Transferido por:</span> {pase.usuario}
                      </div>
                      
                      {pase.observaciones && (
                        <div className="mt-2 p-2 bg-white rounded border-l-4 border-blue-400">
                          <span className="text-xs font-medium text-gray-700">Observaciones:</span>
                          <p className="text-sm text-gray-600 mt-1">{pase.observaciones}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}