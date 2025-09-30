import React, { useState, useEffect } from 'react';
import { X, Check, XCircle, Clock, User, FileText, AlertCircle } from 'lucide-react';
import apiService from '../services/api';

export function TransferNotifications({ onClose, onUpdate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTransferNotifications();
      setNotifications(data);
    } catch (err) {
      setError('Error al cargar notificaciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (notificationId) => {
    try {
      setProcessingId(notificationId);
      setError('');
      await apiService.acceptTransferRequest(notificationId);
      await loadNotifications();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Error al aceptar transferencia: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (notificationId) => {
    try {
      setProcessingId(notificationId);
      setError('');
      await apiService.rejectTransferRequest(notificationId);
      await loadNotifications();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Error al rechazar transferencia: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Solicitudes de Transferencia</h2>
              <p className="text-sm text-gray-600">
                {notifications.length} solicitud{notifications.length !== 1 ? 'es' : ''} pendiente{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay solicitudes pendientes
              </h3>
              <p className="text-gray-600">
                Cuando alguien te envíe una solicitud de transferencia, aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-1">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {notification.from_user.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {notification.from_user.area}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>

                  <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                    <div className="flex items-start space-x-2 mb-2">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Expediente: {notification.expediente.numero}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.expediente.titulo}
                        </p>
                      </div>
                    </div>
                    {notification.message && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Mensaje:</span> {notification.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAccept(notification.id)}
                      disabled={processingId === notification.id}
                      className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === notification.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Aceptar</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(notification.id)}
                      disabled={processingId === notification.id}
                      className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === notification.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          <span>Rechazar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
