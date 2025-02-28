import React, { useState } from 'react';
import Head from 'next/head';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Phone, Mail, Clock, Send, Check } from 'lucide-react';
import Button from '../components/UI/Button';

export default function Contact() {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Effacer l'erreur lorsque l'utilisateur commence à taper
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email est invalide';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Le sujet est requis';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simuler l'envoi du formulaire
      setFormStatus({
        submitted: true,
        success: true,
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
      });
      
      // Réinitialiser le formulaire après 5 secondes
      setTimeout(() => {
        setFormStatus({
          submitted: false,
          success: false,
          message: '',
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      }, 5000);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: 'Adresse',
      content: '123 Avenue des Champs-Élysées, 75008 Paris, France',
    },
    {
      icon: <Phone className="w-6 h-6 text-primary" />,
      title: 'Téléphone',
      content: '+33 1 23 45 67 89',
    },
    {
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: 'Email',
      content: 'contact@drivedeal.fr',
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: 'Horaires d\'ouverture',
      content: 'Lun - Ven: 9h - 18h | Sam: 10h - 16h',
    },
  ];

  return (
    <>
      <Head>
        <title>Contactez Drive Deal | Nous sommes à votre écoute</title>
        <meta name="description" content="Contactez l'équipe Drive Deal pour toute question concernant l'achat, la vente ou l'évaluation de votre véhicule. Notre équipe est à votre disposition pour vous accompagner." />
      </Head>
      
      <div className={darkMode ? 'dark' : ''}>
        <Header />
        
        <main className="pt-20">
          {/* Section Hero */}
          <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeIn">Contactez-nous</h1>
                <p className="text-xl text-gray-300 mb-8 animate-slideUp">
                  Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans votre projet automobile.
                </p>
              </div>
            </div>
          </section>
          
          {/* Section Formulaire et Informations */}
          <section className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Informations de contact */}
                <div className="lg:col-span-1">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Nos coordonnées</h2>
                  
                  <div className="space-y-6">
                    {contactInfo.map((info, index) => (
                      <div 
                        key={index} 
                        className="flex items-start p-4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-fadeIn"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      >
                        <div className="mr-4 mt-1">{info.icon}</div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{info.title}</h3>
                          <p className="text-gray-700 dark:text-gray-300">{info.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Suivez-nous</h3>
                    <div className="flex space-x-4">
                      <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                        </svg>
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                        </svg>
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                        </svg>
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Formulaire de contact */}
                <div className="lg:col-span-2 animate-fadeIn">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Envoyez-nous un message</h2>
                  
                  {formStatus.submitted && formStatus.success ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-6 animate-fadeIn">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4">
                          <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-green-800 dark:text-green-400">Message envoyé !</h3>
                      </div>
                      <p className="text-green-700 dark:text-green-300">{formStatus.message}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nom complet <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full p-3 border ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary`}
                          />
                          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full p-3 border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary`}
                          />
                          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Sujet <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className={`w-full p-3 border ${errors.subject ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary`}
                          >
                            <option value="">Sélectionnez un sujet</option>
                            <option value="achat">Achat de véhicule</option>
                            <option value="vente">Vente de véhicule</option>
                            <option value="evaluation">Évaluation gratuite</option>
                            <option value="financement">Financement</option>
                            <option value="autre">Autre demande</option>
                          </select>
                          {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows="5"
                          value={formData.message}
                          onChange={handleChange}
                          className={`w-full p-3 border ${errors.message ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary`}
                        ></textarea>
                        {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          icon={<Send className="w-5 h-5" />}
                          iconPosition="right"
                        >
                          Envoyer le message
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>
          
          {/* Section Carte */}
          <section className="py-16 bg-gray-100 dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Nous trouver</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Venez nous rendre visite dans notre showroom situé au cœur de Paris.
                </p>
              </div>
              
              <div className="rounded-xl overflow-hidden shadow-lg h-96 animate-fadeIn">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.2158582078467!2d2.2968419!3d48.8697553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fc4f8f3049b%3A0xcbb47407434935db!2sAv.%20des%20Champs-%C3%89lys%C3%A9es%2C%20Paris%2C%20France!5e0!3m2!1sfr!2sfr!4v1645524567890!5m2!1sfr!2sfr" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy"
                  title="Carte Drive Deal"
                ></iframe>
              </div>
            </div>
          </section>
          
          {/* Section FAQ */}
          <section className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Questions fréquentes</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Retrouvez les réponses aux questions les plus fréquemment posées.
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <div className="space-y-6">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 animate-fadeIn">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Comment fonctionne le processus d'achat chez Drive Deal ?</h3>
                    <p className="text-gray-700 dark:text-gray-400">
                      Notre processus d'achat est simple et transparent. Vous pouvez parcourir notre sélection de véhicules en ligne, réserver celui qui vous intéresse, puis prendre rendez-vous pour un essai. Nos conseillers vous accompagnent ensuite dans toutes les démarches administratives et financières.
                    </p>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Comment faire évaluer mon véhicule pour le vendre ?</h3>
                    <p className="text-gray-700 dark:text-gray-400">
                      Vous pouvez demander une évaluation gratuite de votre véhicule directement sur notre site ou en nous contactant. Un de nos experts vous proposera un rendez-vous pour examiner votre véhicule et vous faire une offre basée sur l'état, l'historique et les prix du marché.
                    </p>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Proposez-vous des solutions de financement ?</h3>
                    <p className="text-gray-700 dark:text-gray-400">
                      Oui, nous proposons différentes solutions de financement adaptées à vos besoins : crédit classique, location avec option d'achat (LOA) ou location longue durée (LLD). Nos conseillers financiers vous aideront à trouver la solution la plus avantageuse pour vous.
                    </p>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Quelle garantie offrez-vous sur les véhicules ?</h3>
                    <p className="text-gray-700 dark:text-gray-400">
                      Tous nos véhicules bénéficient d'une garantie minimum de 12 mois, extensible jusqu'à 36 mois selon vos besoins. Cette garantie couvre les pièces et la main d'œuvre pour les réparations mécaniques, électriques et électroniques.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
} 