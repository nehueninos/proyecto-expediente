
import React, { useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';

export function NewExpedienteForm({ user, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    numero: '',
    nombre: '',
    denunciante: '',
    denunciado: '',
    caratula: '',
    caratulaType: '', // 🔹 guardamos el tipo (image/pdf)
  });
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const now = new Date();
    const expedienteData = {
      ...formData,
      fechaCreacion: now.toLocaleDateString("es-AR"),
      horaCreacion: now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      areaActual: user?.area || "mesa_entrada",
      estado: "activo",
    };
    
    try {
      await onSubmit(expedienteData);
      onClose();
    } catch (error) {
      console.error("Error al crear expediente:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    setFormData({
      ...formData,
      caratula: e.target?.result,
      caratulaType: file.type,   // ✅ Guardamos el tipo
    });
  };
  reader.readAsDataURL(file);
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nuevo Expediente</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de expediente 
              </label>
              <input
                type="text"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="Ej: EXP-2024-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del expediente 
              </label>
              <input
                type="text"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Solicitud de licencia comercial"
              />
            </div>

<div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Denunciante 
              </label>
              <input
                type="text"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                value={formData.denunciante}
                onChange={(e) => setFormData({ ...formData, denunciante: e.target.value })}
                placeholder="Ej: Carlos Ayala"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Denunciado 
              </label>
              <input
                type="text"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                value={formData.denunciado}
                onChange={(e) => setFormData({ ...formData, denunciado: e.target.value })}
                placeholder="Ej: Los piomeros S.R.L"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carátula del expediente (imagen o PDF)
            </label>

            {formData.caratula ? (
              <div className="relative">
                {formData.caratulaType === "application/pdf" ? (
                  <embed
                    src={formData.caratula}
                    type="application/pdf"
                    className="w-full h-64 rounded-lg border"
                  />
                ) : (
                  <img
                    src={formData.caratula}
                    alt="Carátula"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, caratula: "", caratulaType: "" })}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Arrastra un archivo aquí o haz clic para seleccionar (imagen o PDF)
                </p>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Seleccionar archivo
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <Plus className="w-5 h-5" />
              <span>Crear Expediente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

