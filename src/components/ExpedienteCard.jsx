
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ArrowRight, Eye, FileText, AlertCircle } from 'lucide-react';
import { AREAS, AREA_COLORS } from '../utils/constants';
import apiService from '../services/api';

export function ExpedienteCard({ expediente, user, onTransfer, onViewHistory }) {
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  const canTransfer = expediente.area === user.area;
  const availableAreas = Object.entries(AREAS).filter(([key]) =>
    key !== expediente.area
  );

  useEffect(() => {
    if (showTransferForm && selectedArea) {
      loadUsersForArea(selectedArea);
    }
  }, [selectedArea, showTransferForm]);

  const loadUsersForArea = async (area) => {
    try {
      const users = await apiService.getUsersByArea(area);
      const filteredUsers = users.filter(u => u.id !== user.id);
      setAvailableUsers(filteredUsers);
      if (filteredUsers.length > 0) {
        setSelectedUser(filteredUsers[0].id);
      }
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUser) {
      setError('Debes seleccionar un usuario');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiService.createTransferRequest(expediente._id, selectedUser, observaciones);
      setShowTransferForm(false);
      setObservaciones('');
      setSelectedArea('');
      setSelectedUser('');
      if (onTransfer) onTransfer();
    } catch (error) {
      setError('Error al enviar solicitud: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'resuelto': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-orange-100 text-orange-800';
      case 'baja': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
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
              <h3 className="text-lg font-semibold text-gray-900">{expediente.titulo}</h3>
              <p className="text-sm text-gray-600">Nº {expediente.numero}</p>
              {expediente.articulo && (
                <p className="text-xs text-blue-600 font-medium mt-1">
                  Art. {expediente.articulo} Ley 24.240
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${AREA_COLORS[expediente.area]}`}>
              {AREAS[expediente.area]}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expediente.estado)}`}>
              {expediente.estado.replace('_', ' ').charAt(0).toUpperCase() + expediente.estado.slice(1).replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(expediente.prioridad)}`}>
              {expediente.prioridad.charAt(0).toUpperCase() + expediente.prioridad.slice(1)}
            </span>
          </div>
        </div>

        {expediente.descripcion && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {expediente.descripcion}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(expediente.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs">Por: {expediente.creator?.name || 'Usuario'}</span>
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

          {canTransfer && (
            <button
              onClick={() => {
                setShowTransferForm(true);
                if (availableAreas.length > 0) {
                  setSelectedArea(availableAreas[0][0]);
                }
              }}
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
              Solicitar Transferencia
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-700">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

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

              {selectedArea && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario destinatario
                  </label>
                  {availableUsers.length > 0 ? (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      disabled={loading}
                    >
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.username})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hay usuarios disponibles en esta área</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Agregar un mensaje para el destinatario..."
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowTransferForm(false);
                  setError('');
                }}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransfer}
                disabled={loading || !selectedUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Enviar Solicitud</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

