
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ArrowRight, Eye, FileText } from 'lucide-react';
import { AREAS, AREA_COLORS } from '../utils/constants';

export function ExpedienteCard({ expediente, user, onTransfer, onViewHistory }) {
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [selectedArea, setSelectedArea] = useState('mesa_entrada');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const canTransfer = user.role === 'admin' || expediente.areaActual === user.area;
  const availableAreas = Object.entries(AREAS).filter(([key]) =>
    key !== expediente.areaActual && (user.role === 'admin' || key !== user.area)
  );

  const handleTransfer = async () => {
    setLoading(true);
    try {
      await onTransfer(expediente._id, selectedArea, observaciones);
      setShowTransferForm(false);
      setObservaciones('');
    } catch (error) {
      console.error('Error al transferir:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'archivado': return 'bg-gray-100 text-gray-800';
      case 'finalizado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{expediente.nombre}</h3>
              <p className="text-sm text-gray-600">Nº {expediente.numero}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${AREA_COLORS[expediente.areaActual]}`}>
              {AREAS[expediente.areaActual]}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expediente.estado)}`}>
              {expediente.estado.charAt(0).toUpperCase() + expediente.estado.slice(1)}
            </span>
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

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{expediente.fechaCreacion}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{expediente.horaCreacion}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{expediente.pases?.length || 0} pases</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => onViewHistory(expediente)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Eye className="w-4 h-4" />
            <span>Ver historial</span>
          </button>

          {canTransfer && expediente.estado === 'activo' && (
            <button
              onClick={() => setShowTransferForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Transferir</span>
            </button>
          )}
        </div>
      </div>

      {showTransferForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Transferir Expediente
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área de destino
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  disabled={loading}
                >
                  {availableAreas.map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones (opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Agregar observaciones sobre el pase..."
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTransferForm(false)}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransfer}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Confirmar Transferencia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

