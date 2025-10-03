import React from 'react';
import { X, Bell, AlertCircle } from 'lucide-react';

export function PendingTransfersModal({ count, onClose, onViewNotifications }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Nuevas Transferencias</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-900 font-medium">
                Tienes {count} solicitud{count !== 1 ? 'es' : ''} de transferencia pendiente{count !== 1 ? 's' : ''}
              </p>
              <p className="text-blue-700 text-sm mt-1">
                {count === 1
                  ? 'Hay una solicitud esperando tu aprobación.'
                  : `Hay ${count} solicitudes esperando tu aprobación.`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              onViewNotifications();
            }}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ver Solicitudes
          </button>
        </div>
      </div>
    </div>
  );
}
