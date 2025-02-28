import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CarSearchParams } from '../models/Car';

interface Alert {
  id: string;
  criteria: CarSearchParams;
  frequency: 'daily' | 'weekly';
  active: boolean;
  createdAt: Date;
}

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Alert>>({
    criteria: {},
    frequency: 'daily',
    active: true
  });

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/alerts');
      setAlerts(response.data.alerts);
    } catch (error) {
      toast.error('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/alerts', formData);
      setAlerts(prev => [...prev, response.data.alert]);
      setShowCreateForm(false);
      setFormData({
        criteria: {},
        frequency: 'daily',
        active: true
      });
      toast.success('Alerte créée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création de l\'alerte');
    }
  };

  const handleUpdateAlert = async (alertId: string, data: Partial<Alert>) => {
    try {
      await axios.put(`/api/alerts?alertId=${alertId}`, data);
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, ...data } : alert
        )
      );
      toast.success('Alerte mise à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'alerte');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      return;
    }

    try {
      await axios.delete(`/api/alerts?alertId=${alertId}`);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success('Alerte supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'alerte');
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <h2 className="mt-2 text-lg font-medium text-gray-900">
              Connectez-vous pour gérer vos alertes
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Vous devez être connecté pour accéder à vos alertes.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mes alertes
          </h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Créer une alerte
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-6">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white shadow rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`h-3 w-3 rounded-full ${alert.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Alerte {alert.id.slice(0, 8)}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleUpdateAlert(alert.id, { active: !alert.active })}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {alert.active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Critères</h4>
                    <ul className="space-y-2">
                      {Object.entries(alert.criteria).map(([key, value]) => (
                        <li key={key} className="text-sm text-gray-700">
                          <span className="font-medium">{key}: </span>
                          {Array.isArray(value) ? value.join(', ') : value}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Paramètres</h4>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Fréquence: </span>
                      {alert.frequency === 'daily' ? 'Quotidienne' : 'Hebdomadaire'}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Créée le: </span>
                      {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucune alerte
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Créez votre première alerte pour être notifié des nouvelles annonces.
            </p>
          </div>
        )}

        {/* Modal de création d'alerte */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Créer une nouvelle alerte
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateAlert}>
                {/* Formulaire de critères de recherche */}
                {/* À implémenter avec les mêmes champs que le formulaire de recherche */}

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fréquence
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as 'daily' | 'weekly' }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="daily">Quotidienne</option>
                      <option value="weekly">Hebdomadaire</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Créer l'alerte
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 