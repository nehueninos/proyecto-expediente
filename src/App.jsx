import React, { useState, useMemo, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AuthForm } from './components/AuthForm';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ExpedienteCard } from './components/ExpedienteCard';
import { NewExpedienteForm } from './components/NewExpedienteForm';
import { ExpedienteHistory } from './components/ExpedienteHistory';
import { TransferNotifications } from './components/TransferNotifications';
import { PendingTransfersModal } from './components/PendingTransfersModal';
import apiService from './services/api';

function App() {
  const [user, setUser] = useLocalStorage('user', null);
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [hasCheckedNotifications, setHasCheckedNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      loadExpedientes();
      checkInitialNotifications();
      const interval = setInterval(loadNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, searchTerm, selectedArea, selectedStatus]);

  const checkInitialNotifications = async () => {
    if (!hasCheckedNotifications) {
      try {
        const notifications = await apiService.getTransferNotifications();
        setNotificationCount(notifications.length);
        if (notifications.length > 0) {
          setShowPendingModal(true);
        }
        setHasCheckedNotifications(true);
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    }
  };

  const loadExpedientes = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        search: searchTerm,
        area: selectedArea,
        estado: selectedStatus,
      };
      const data = await apiService.getExpedientes(filters);
      setExpedientes(data);
    } catch (error) {
      setError('Error al cargar expedientes: ' + error.message);
      console.error('Error loading expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationCount = async () => {
    try {
      const notifications = await apiService.getTransferNotifications();
      setNotificationCount(notifications.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setHasCheckedNotifications(false);
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    setExpedientes([]);
  };

  const handleNewExpediente = async (expedienteData) => {
    try {
      await apiService.createExpediente(expedienteData);
      await loadExpedientes();
    } catch (error) {
      throw new Error('Error al crear expediente: ' + error.message);
    }
  };

  const handleTransferUpdate = async () => {
    await loadExpedientes();
    await loadNotificationCount();
  };

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        onLogout={handleLogout}
        notificationCount={notificationCount}
        onNotificationClick={() => setShowNotifications(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Gestión de Expedientes
            </h2>
            <p className="text-gray-600">
              {expedientes.length} expediente{expedientes.length !== 1 ? 's' : ''} encontrado{expedientes.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Expediente</span>
          </button>
        </div>

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {currentView === 'all' && (
          <>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Cargando expedientes...</span>
              </div>
            ) : expedientes.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || selectedArea !== 'all' || selectedStatus !== 'all'
                    ? 'No se encontraron resultados'
                    : 'No hay expedientes'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedArea !== 'all' || selectedStatus !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda.'
                    : 'Comienza creando tu primer expediente.'
                  }
                </p>
                {(!searchTerm && selectedArea === 'all' && selectedStatus === 'all') && (
                  <button
                    onClick={() => setShowNewForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Primer Expediente
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {expedientes.map(expediente => (
                  <ExpedienteCard
                    key={expediente._id}
                    expediente={expediente}
                    user={user}
                    onTransfer={handleTransferUpdate}
                    onViewHistory={setSelectedExpediente}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {currentView === 'my' && (
          <MyExpedientesView
            user={user}
            onEdit={setEditingExpediente}
          />
        )}

        {currentView === 'pending' && (
          <PendingExpedientesView
            user={user}
            onEdit={setEditingExpediente}
          />
        )}
      </main>

      {showNewForm && (
        <NewExpedienteForm
          user={user}
          onSubmit={handleNewExpediente}
          onClose={() => setShowNewForm(false)}
        />
      )}

      {selectedExpediente && (
        <ExpedienteHistory
          expediente={selectedExpediente}
          onClose={() => setSelectedExpediente(null)}
        />
      )}

      {showNotifications && (
        <TransferNotifications
          onClose={() => setShowNotifications(false)}
          onUpdate={handleTransferUpdate}
        />
      )}

      {showPendingModal && (
        <PendingTransfersModal
          count={notificationCount}
          onClose={() => setShowPendingModal(false)}
          onViewNotifications={() => setShowNotifications(true)}
        />
      )}

      {editingExpediente && (
        <EditExpedienteModal
          expediente={editingExpediente}
          onSave={handleEditExpediente}
          onClose={() => setEditingExpediente(null)}
          loading={editLoading}
        />
      )}
    </div>
  );
}

export default App;