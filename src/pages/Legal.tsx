
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Legal = () => {
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');

  useEffect(() => {
      window.scrollTo(0,0);
  }, [location]);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="card max-w-3xl mx-auto p-8 md:p-12">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-cream-50 mb-8 border-b border-white/10 pb-4">
            {isPrivacy ? 'Politique de Confidentialité' : 'Mentions Légales'}
        </h1>

        <div className="space-y-8 text-cream-200 leading-relaxed text-sm md:text-base">
            {!isPrivacy ? (
                <>
                    <section>
                        <h2 className="text-lg font-bold text-brand-300 mb-2">1. Éditeur du site</h2>
                        <p>
                            Le site "La DDR" (Dawa Dans la Rue) est édité par l'Association DDR, organisation à but non lucratif enregistrée en Côte d'Ivoire.
                            <br/><strong>Siège Social :</strong> Yopougon Andokoi, Abidjan.
                            <br/><strong>Email :</strong> ladawahdanslarue.ddr@gmail.com
                            <br/><strong>Téléphone :</strong> +225 07 47 32 04 55
                        </p>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold text-brand-300 mb-2">2. Hébergement</h2>
                        <p>
                            Le site est hébergé par Vercel Inc. (États-Unis). Les données des formulaires sont stockées chez Supabase.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold text-brand-300 mb-2">3. Propriété Intellectuelle</h2>
                        <p>
                            L'ensemble des contenus (textes, vidéos, images) est la propriété exclusive de la DDR ou de ses partenaires. Toute reproduction sans autorisation est interdite.
                        </p>
                    </section>
                </>
            ) : (
                <>
                    <section>
                        <h2 className="text-lg font-bold text-brand-300 mb-2">1. Collecte des données</h2>
                        <p>
                            Nous collectons les informations que vous nous fournissez volontairement via les formulaires de contact, de don ou de conversion (Nom, Téléphone, Ville).
                        </p>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold text-brand-300 mb-2">2. Utilisation des données</h2>
                        <div>
                            Vos données sont utilisées uniquement pour :
                            <ul className="list-disc ml-5 mt-2 space-y-1">
                                <li>Vous recontacter suite à une demande de rendez-vous, de conversion ou à un témoignage.</li>
                                <li>Enregistrer et suivre les dons.</li>
                                <li>Vous informer des activités de la DDR (si inscrit).</li>
                            </ul>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold text-brand-300 mb-2">3. Protection</h2>
                        <p>
                            Nous ne vendons ni ne louons vos données à des tiers. Seule l’équipe de la DDR a accès aux demandes envoyées. Les messages vocaux sont supprimés après 7 jours. Pour faire effacer vos données, écrivez à ladawahdanslarue.ddr@gmail.com. Les informations de paiement ne sont pas stockées sur nos serveurs.
                        </p>
                    </section>
                </>
            )}
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-xs text-sand-500">Dernière mise à jour : {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default Legal;
