import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Camera, Upload, Check, AlertCircle } from 'lucide-react';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SellCar() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    price: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    color: '',
    description: '',
    features: [],
    images: [],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    location: '',
  });
  
  const [errors, setErrors] = useState({});

  const fuelTypes = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'];
  const transmissions = ['Manuelle', 'Automatique', 'Semi-automatique'];
  const bodyTypes = ['Berline', 'SUV', 'Break', 'Coupé', 'Cabriolet', 'Monospace', 'Citadine'];
  const commonFeatures = [
    'Climatisation', 'GPS', 'Bluetooth', 'Régulateur de vitesse', 'Caméra de recul',
    'Sièges chauffants', 'Toit ouvrant', 'Jantes alliage', 'Aide au stationnement',
    'Apple CarPlay/Android Auto', 'Système audio premium', 'Phares LED'
  ];

  // Initialiser les FAQ cachées
  useEffect(() => {
    const faqElements = document.querySelectorAll('[id^="faq-"]');
    faqElements.forEach(elem => {
      elem.style.display = 'none';
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Effacer l'erreur pour ce champ s'il est rempli
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleFeatureToggle = (feature) => {
    const updatedFeatures = [...formData.features];
    
    if (updatedFeatures.includes(feature)) {
      const index = updatedFeatures.indexOf(feature);
      updatedFeatures.splice(index, 1);
    } else {
      updatedFeatures.push(feature);
    }
    
    setFormData({
      ...formData,
      features: updatedFeatures,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Simuler le téléchargement d'images (dans une application réelle, vous utiliseriez une API)
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    
    setFormData({
      ...formData,
      images: [...formData.images, ...newImages],
    });
    
    if (errors.images) {
      setErrors({
        ...errors,
        images: '',
      });
    }
  };

  const removeImage = (imageId) => {
    setFormData({
      ...formData,
      images: formData.images.filter(img => img.id !== imageId),
    });
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) {
      if (!formData.make) newErrors.make = 'La marque est requise';
      if (!formData.model) newErrors.model = 'Le modèle est requis';
      if (!formData.year) newErrors.year = 'L\'année est requise';
      else if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
        newErrors.year = 'Année invalide';
      }
      if (!formData.mileage) newErrors.mileage = 'Le kilométrage est requis';
      if (!formData.price) newErrors.price = 'Le prix est requis';
      if (!formData.fuelType) newErrors.fuelType = 'Le type de carburant est requis';
      if (!formData.transmission) newErrors.transmission = 'La transmission est requise';
      if (!formData.bodyType) newErrors.bodyType = 'Le type de carrosserie est requis';
    } else if (stepNumber === 2) {
      if (!formData.description || formData.description.length < 50) {
        newErrors.description = 'La description doit contenir au moins 50 caractères';
      }
      if (formData.images.length === 0) {
        newErrors.images = 'Au moins une image est requise';
      }
    } else if (stepNumber === 3) {
      if (!formData.contactName) newErrors.contactName = 'Le nom est requis';
      if (!formData.contactEmail) newErrors.contactEmail = 'L\'email est requis';
      else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Email invalide';
      }
      if (!formData.contactPhone) newErrors.contactPhone = 'Le téléphone est requis';
      if (!formData.location) newErrors.location = 'La localisation est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    
    // Simuler l'envoi des données à une API
    setTimeout(() => {
      console.log('Données soumises:', formData);
      setIsSubmitting(false);
      setSuccess(true);
      
      // Rediriger vers la page d'accueil après 3 secondes
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>Vendre votre véhicule | DriveDeal</title>
        <meta name="description" content="Vendez votre véhicule rapidement et facilement sur DriveDeal. Publiez votre annonce en quelques étapes simples." />
        <link rel="stylesheet" href="/styles/sell.css" />
      </Head>

      <Header />

      <main className="min-h-screen">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Vendre votre véhicule</h1>
            <p className="mt-2 text-gray-600">
              Publiez votre annonce en quelques étapes simples
            </p>
          </div>

          {success ? (
            <div className="success-container">
              <div className="success-icon">
                <Check className="h-12 w-12" />
              </div>
              <h2 className="success-title">
                Annonce publiée avec succès !
              </h2>
              <p>
                Votre annonce a été soumise et sera visible après validation par notre équipe.
                Vous serez redirigé vers la page d'accueil dans quelques instants...
              </p>
            </div>
          ) : (
            <>
              {/* Indicateur d'étape */}
              <div className="steps-container">
                <div className={`step ${step >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <span>Informations du véhicule</span>
                </div>
                <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
                <div className={`step ${step >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <span>Description et photos</span>
                </div>
                <div className={`step-line ${step > 2 ? 'active' : ''}`}></div>
                <div className={`step ${step >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <span>Coordonnées</span>
                </div>
              </div>

              <div className="form-container">
                <form onSubmit={handleSubmit}>
                  {/* Étape 1: Informations du véhicule */}
                  {step === 1 && (
                    <div>
                      <h2 className="form-title">
                        Informations du véhicule
                      </h2>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label" htmlFor="make">Marque</label>
                          <input
                            type="text"
                            id="make"
                            name="make"
                            value={formData.make}
                            onChange={handleChange}
                            className="form-input"
                          />
                          {errors.make && <p className="form-error">{errors.make}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="model">Modèle</label>
                          <input
                            type="text"
                            id="model"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            className="form-input"
                          />
                          {errors.model && <p className="form-error">{errors.model}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="year">Année</label>
                          <input
                            type="number"
                            id="year"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="form-input"
                          />
                          {errors.year && <p className="form-error">{errors.year}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="mileage">Kilométrage</label>
                          <input
                            type="number"
                            id="mileage"
                            name="mileage"
                            value={formData.mileage}
                            onChange={handleChange}
                            className="form-input"
                          />
                          {errors.mileage && <p className="form-error">{errors.mileage}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="price">Prix (€)</label>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="form-input"
                          />
                          {errors.price && <p className="form-error">{errors.price}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="color">Couleur</label>
                          <input
                            type="text"
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="fuelType">Type de carburant</label>
                          <select
                            id="fuelType"
                            name="fuelType"
                            value={formData.fuelType}
                            onChange={handleChange}
                            className="form-select"
                          >
                            <option value="">Sélectionner</option>
                            {fuelTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          {errors.fuelType && <p className="form-error">{errors.fuelType}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="transmission">Transmission</label>
                          <select
                            id="transmission"
                            name="transmission"
                            value={formData.transmission}
                            onChange={handleChange}
                            className="form-select"
                          >
                            <option value="">Sélectionner</option>
                            {transmissions.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          {errors.transmission && <p className="form-error">{errors.transmission}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="bodyType">Type de carrosserie</label>
                          <select
                            id="bodyType"
                            name="bodyType"
                            value={formData.bodyType}
                            onChange={handleChange}
                            className="form-select"
                          >
                            <option value="">Sélectionner</option>
                            {bodyTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          {errors.bodyType && <p className="form-error">{errors.bodyType}</p>}
                        </div>
                      </div>
                      <div className="flex justify-between mt-6">
                        <button
                          type="button"
                          onClick={nextStep}
                          className="btn btn-primary ml-auto"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Étape 2: Description et photos */}
                  {step === 2 && (
                    <div>
                      <h2 className="form-title">
                        Description et photos
                      </h2>
                      <div className="form-group">
                        <label className="form-label" htmlFor="description">Description</label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows="6"
                          className="form-textarea"
                          placeholder="Décrivez votre véhicule en détail (état, options, historique d'entretien, etc.)"
                        ></textarea>
                        {errors.description && <p className="form-error">{errors.description}</p>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Équipements et options</label>
                        <div className="form-grid">
                          {commonFeatures.map(feature => (
                            <div key={feature} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`feature-${feature}`}
                                checked={formData.features.includes(feature)}
                                onChange={() => handleFeatureToggle(feature)}
                                className="mr-2"
                              />
                              <label htmlFor={`feature-${feature}`}>{feature}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Photos</label>
                        <div className="form-grid">
                          {formData.images.map(image => (
                            <div key={image.id} className="relative">
                              <img
                                src={image.url}
                                alt={image.name}
                                className="h-40 w-full object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(image.id)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <div>
                            <label htmlFor="image-upload" className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded cursor-pointer">
                              <Camera className="mb-2" />
                              <span>Ajouter des photos</span>
                            </label>
                            <input
                              type="file"
                              id="image-upload"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </div>
                        </div>
                        {errors.images && <p className="form-error">{errors.images}</p>}
                      </div>

                      <div className="flex justify-between mt-6">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="btn btn-secondary"
                        >
                          Précédent
                        </button>
                        <button
                          type="button"
                          onClick={nextStep}
                          className="btn btn-primary"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Étape 3: Coordonnées */}
                  {step === 3 && (
                    <div>
                      <h2 className="form-title">
                        Vos coordonnées
                      </h2>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label" htmlFor="contactName">Nom complet</label>
                          <input
                            type="text"
                            id="contactName"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleChange}
                            className="form-input"
                          />
                          {errors.contactName && <p className="form-error">{errors.contactName}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="contactEmail">Email</label>
                          <input
                            type="email"
                            id="contactEmail"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            className="form-input"
                          />
                          {errors.contactEmail && <p className="form-error">{errors.contactEmail}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="contactPhone">Téléphone</label>
                          <input
                            type="tel"
                            id="contactPhone"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            className="form-input"
                          />
                          {errors.contactPhone && <p className="form-error">{errors.contactPhone}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="location">Localisation</label>
                          <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Ville, Code postal"
                          />
                          {errors.location && <p className="form-error">{errors.location}</p>}
                        </div>
                      </div>

                      <div className="flex justify-between mt-6">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="btn btn-secondary"
                        >
                          Précédent
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Envoi en cours...' : 'Publier l\'annonce'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Conseils pour les vendeurs */}
              <div className="tips-container">
                <h3 className="form-title">Conseils pour vendre rapidement</h3>
                <div className="tips-grid">
                  <div className="tip-card blue">
                    <h4 className="tip-title blue">Photos de qualité</h4>
                    <p>Prenez des photos claires et sous plusieurs angles. Incluez l'intérieur, l'extérieur et le moteur.</p>
                  </div>
                  <div className="tip-card green">
                    <h4 className="tip-title green">Description détaillée</h4>
                    <p>Mentionnez l'historique d'entretien, les réparations récentes et tout défaut connu.</p>
                  </div>
                  <div className="tip-card purple">
                    <h4 className="tip-title purple">Prix compétitif</h4>
                    <p>Recherchez des véhicules similaires pour fixer un prix réaliste et attractif.</p>
                  </div>
                  <div className="tip-card amber">
                    <h4 className="tip-title amber">Réactivité</h4>
                    <p>Répondez rapidement aux demandes des acheteurs potentiels pour maximiser vos chances.</p>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="tips-container">
                <h3 className="form-title">Questions fréquentes</h3>
                
                <div className="faq-item">
                  <div className="faq-question" onClick={() => {
                    const elem = document.getElementById('faq-1');
                    elem.style.display = elem.style.display === 'none' ? 'block' : 'none';
                  }}>
                    <span>Combien de temps faut-il pour vendre un véhicule ?</span>
                    <span>+</span>
                  </div>
                  <div id="faq-1" className="faq-answer">
                    Le temps de vente varie selon plusieurs facteurs : la popularité du modèle, l'état du véhicule, le prix, etc. 
                    En moyenne, un véhicule bien présenté et correctement tarifé se vend en 2 à 4 semaines.
                  </div>
                </div>
                
                <div className="faq-item">
                  <div className="faq-question" onClick={() => {
                    const elem = document.getElementById('faq-2');
                    elem.style.display = elem.style.display === 'none' ? 'block' : 'none';
                  }}>
                    <span>Quels documents dois-je préparer pour la vente ?</span>
                    <span>+</span>
                  </div>
                  <div id="faq-2" className="faq-answer">
                    Vous devrez préparer : le certificat d'immatriculation (carte grise), le certificat de situation administrative 
                    (non-gage), les factures d'entretien, le contrôle technique de moins de 6 mois, et un formulaire de déclaration 
                    de cession.
                  </div>
                </div>
                
                <div className="faq-item">
                  <div className="faq-question" onClick={() => {
                    const elem = document.getElementById('faq-3');
                    elem.style.display = elem.style.display === 'none' ? 'block' : 'none';
                  }}>
                    <span>Comment négocier efficacement avec les acheteurs ?</span>
                    <span>+</span>
                  </div>
                  <div id="faq-3" className="faq-answer">
                    Fixez un prix légèrement supérieur à votre attente pour laisser une marge de négociation. Soyez transparent 
                    sur l'état du véhicule. Préparez-vous à justifier votre prix en montrant les factures d'entretien et en 
                    soulignant les points forts du véhicule.
                  </div>
                </div>
                
                <div className="faq-item">
                  <div className="faq-question" onClick={() => {
                    const elem = document.getElementById('faq-4');
                    elem.style.display = elem.style.display === 'none' ? 'block' : 'none';
                  }}>
                    <span>Est-ce que DriveDeal prend une commission sur la vente ?</span>
                    <span>+</span>
                  </div>
                  <div id="faq-4" className="faq-answer">
                    Non, la publication d'annonces sur DriveDeal est entièrement gratuite pour les particuliers. Nous ne prenons 
                    aucune commission sur la vente. Des options de mise en avant payantes sont disponibles pour augmenter la 
                    visibilité de votre annonce.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
