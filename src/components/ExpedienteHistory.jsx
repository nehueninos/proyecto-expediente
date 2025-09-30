import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, ArrowRight, MessageSquare } from 'lucide-react';
import { AREAS, AREA_COLORS } from '../utils/constants';
import apiService from '../services/api';

export function ExpedienteHistory({ expediente, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [expediente._id]);

  const loadHistory = async () => {
    try {
      const data = await apiService.getExpedienteHistory(expediente._id);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusLabel = (estado) => {
    const labels = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'resuelto': 'Resuelto'
    };
    return labels[estado] || estado;
  };

  const getPriorityLabel = (prioridad) => {
    const labels = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta'
    };
    return labels[prioridad] || prioridad;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{expediente.titulo}</h2>
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
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Área actual:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${AREA_COLORS[expediente.area]}`}>
                    {AREAS[expediente.area]}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Estado:</span>
                  <span className="ml-2 text-sm text-gray-600">{getStatusLabel(expediente.estado)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Prioridad:</span>
                  <span className="ml-2 text-sm text-gray-600">{getPriorityLabel(expediente.prioridad)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Creado por:</span>
                  <span className="ml-2 text-sm text-gray-600">{expediente.creator?.name || 'Usuario'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Fecha de creación:</span>
                  <span className="ml-2 text-sm text-gray-600">{formatDate(expediente.created_at)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Total de transferencias:</span>
                  <span className="ml-2 text-sm text-gray-600">{history.length}</span>
                </div>
              </div>

              {expediente.descripcion && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-700">Descripción:</span>
                  <p className="text-sm text-gray-600 mt-1">{expediente.descripcion}</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Transferencias</h3>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Este expediente aún no tiene transferencias registradas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((record, index) => (
                    <div key={record.id || index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${AREA_COLORS[record.from_area]}`}>
                            {AREAS[record.from_area]}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${AREA_COLORS[record.to_area]}`}>
                            {AREAS[record.to_area]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(record.created_at)}</span>
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(record.created_at)}</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 space-y-1">
                        <div>
                          <span className="font-medium">Enviado por:</span> {record.from_user?.name || 'Usuario'}
                        </div>
                        <div>
                          <span className="font-medium">Recibido por:</span> {record.to_user?.name || 'Usuario'}
                        </div>
                      </div>

                      {record.observaciones && (
                        <div className="mt-2 p-2 bg-white rounded border-l-4 border-blue-400">
                          <span className="text-xs font-medium text-gray-700">Observaciones:</span>
                          <p className="text-sm text-gray-600 mt-1">{record.observaciones}</p>
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