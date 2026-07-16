import React, { useState } from "react";
import {
  Plane,
  Shield,
  BarChart3,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Hotel,
  Users,
  CreditCard,
  Lock,
  Smartphone,
  Headphones,
  Globe,
  Star,
  Quote,
  Menu,
  X
} from "lucide-react";


// ======================================================
// DATA
// ======================================================


const services = [
  {
    icon: Plane,
    title: "Réservation de vols",
    description:
      "Trouvez et réservez les meilleurs vols professionnels rapidement."
  },
  {
    icon: Hotel,
    title: "Réservation d'hôtels",
    description:
      "Accédez aux meilleurs hôtels adaptés à vos politiques voyage."
  },
  {
    icon: BarChart3,
    title: "Analytics & rapports",
    description:
      "Analysez vos dépenses et optimisez votre budget voyage."
  }
];


const features = [
  {
    icon: Shield,
    title: "Sécurité maximale",
    description:
      "Vos données sont protégées avec les meilleurs standards."
  },
  {
    icon: Users,
    title: "Gestion d'équipe",
    description:
      "Gérez facilement vos collaborateurs et leurs voyages."
  },
  {
    icon: CreditCard,
    title: "Paiements simplifiés",
    description:
      "Centralisez vos paiements et factures."
  },
  {
    icon: Lock,
    title: "Contrôle entreprise",
    description:
      "Définissez vos règles automatiquement."
  },
  {
    icon: Smartphone,
    title: "Application mobile",
    description:
      "Gérez vos voyages depuis partout."
  },
  {
    icon: Headphones,
    title: "Support 24/7",
    description:
      "Une assistance disponible à tout moment."
  }
];


const steps = [
  {
    number: "01",
    title: "Créer un compte",
    description:
      "Inscrivez votre entreprise en quelques minutes."
  },
  {
    number: "02",
    title: "Configurer vos règles",
    description:
      "Définissez vos politiques de voyage."
  },
  {
    number: "03",
    title: "Réserver",
    description:
      "Réservez vos vols et hôtels facilement."
  },
  {
    number: "04",
    title: "Optimiser",
    description:
      "Suivez vos économies en temps réel."
  }
];


const testimonials = [
  {
    name:"Marie Dupont",
    company:"TechCorp",
    text:
    "EasyVisa nous a permis de réduire nos coûts de déplacement de manière significative.",
    rating:5
  },
  {
    name:"Jean Martin",
    company:"StartupXYZ",
    text:
    "Une plateforme simple et efficace pour gérer tous nos voyages.",
    rating:5
  },
  {
    name:"Sophie Bernard",
    company:"GlobalInc",
    text:
    "Nous avons gagné plusieurs heures chaque semaine grâce à EasyVisa.",
    rating:5
  }
];


const plans = [
  {
    name:"Starter",
    price:"Gratuit",
    features:[
      "10 utilisateurs",
      "Réservation vols",
      "Support email"
    ]
  },

  {
    name:"Business",
    price:"49€/mois",
    popular:true,
    features:[
      "50 utilisateurs",
      "Analytics avancés",
      "Support prioritaire",
      "Application mobile"
    ]
  },

  {
    name:"Enterprise",
    price:"Sur mesure",
    features:[
      "Utilisateurs illimités",
      "SSO",
      "Support dédié"
    ]
  }
];


const faqs = [
 {
  question:"Combien de temps pour démarrer ?",
  answer:
  "Votre compte peut être configuré en moins de 30 minutes."
 },
 {
  question:"Puis-je gérer plusieurs employés ?",
  answer:
  "Oui, EasyVisa permet de gérer plusieurs utilisateurs."
 },
 {
  question:"Les paiements sont-ils sécurisés ?",
  answer:
  "Oui, toutes les transactions sont protégées."
 },
 {
  question:"Existe-t-il une application mobile ?",
  answer:
  "Oui, vous pouvez gérer vos voyages depuis mobile."
 }
];



// ======================================================
// UI COMPONENTS
// ======================================================


function Container({
 children
}:{
 children:React.ReactNode
}){

 return (
  <div
   className="
    max-w-7xl
    mx-auto
    px-4
    sm:px-6
    lg:px-8
   "
  >
   {children}
  </div>
 );

}



function Button({
 children,
 secondary=false
}:{
 children:React.ReactNode;
 secondary?:boolean;
}){

return (

<button
className={`
px-6
py-3
rounded-xl
font-semibold
transition
flex
items-center
gap-2

${
secondary
?
"border border-gray-300 text-gray-700 hover:bg-gray-100"
:
"bg-[#A11B1B] text-white hover:bg-[#801515]"
}

`}
>

{children}

</button>

)

}



// ======================================================
// NAVBAR
// ======================================================


function Navbar(){

const [open,setOpen]=useState(false);


return (

<nav
className="
fixed
top-0
w-full
z-50
bg-white/90
backdrop-blur-md
border-b
"
>

<Container>

<div
className="
h-20
flex
items-center
justify-between
"
>


<div
className="
text-2xl
font-bold
text-[#A11B1B]
"
>
EasyVisa
</div>



<div
className="
hidden
md:flex
items-center
gap-8
"
>

<a>Services</a>
<a>Solution</a>
<a>Tarifs</a>
<a>FAQ</a>

<Button>
Démo
</Button>


</div>



<button
className="md:hidden"
onClick={()=>setOpen(!open)}
>

{
open
?
<X/>
:
<Menu/>
}

</button>


</div>


{
open && (

<div
className="
md:hidden
pb-5
space-y-4
"
>

<a className="block">
Services
</a>

<a className="block">
Tarifs
</a>

<a className="block">
FAQ
</a>

<Button>
Commencer
</Button>

</div>

)
}


</Container>

</nav>

)

}



// ======================================================
// HERO
// ======================================================


function Hero(){

return (

<section
className="
pt-40
pb-24
bg-gray-50
"
>

<Container>

<div
className="
grid
lg:grid-cols-2
gap-12
items-center
"
>


<div>


<span
className="
inline-block
px-4
py-2
rounded-full
bg-red-100
text-[#A11B1B]
text-sm
font-medium
"
>

Solution voyage entreprise

</span>



<h1
className="
mt-6
text-4xl
md:text-6xl
font-bold
leading-tight
text-gray-900
"
>

Simplifiez vos voyages professionnels avec EasyVisa

</h1>



<p
className="
mt-6
text-lg
text-gray-600
"
>

Réservez vos vols et hôtels,
contrôlez vos dépenses et
réduisez vos coûts grâce à une
plateforme unique.

</p>



<div
className="
mt-8
flex
flex-col
sm:flex-row
gap-4
"
>

<Button>
Créer mon compte
<ArrowRight size={18}/>
</Button>


<Button secondary>
Voir la démo
</Button>


</div>


<div
className="
mt-8
space-y-3
text-sm
text-gray-600
"
>

<p>✓ Paiement sécurisé</p>
<p>✓ Support 24/7</p>
<p>✓ Gestion multi-utilisateurs</p>


</div>


</div>



<div
className="
bg-white
rounded-3xl
shadow-xl
border
p-8
"
>

<h3
className="
font-bold
text-xl
"
>
Dashboard EasyVisa
</h3>


<div
className="
mt-6
bg-gray-50
rounded-xl
p-5
"
>

<p>
Dakar → Paris
</p>

<p className="mt-2">
12 Juin 2026
</p>


<strong
className="
block
mt-3
text-2xl
text-[#A11B1B]
"
>
450€
</strong>


</div>


</div>



</div>


</Container>


</section>

)

}
// ======================================================
// TRUST SECTION
// ======================================================

function TrustSection(){

return (

<section
className="
py-12
bg-[#A11B1B]
text-white
"
>

<Container>

<div
className="
grid
grid-cols-2
md:grid-cols-4
gap-8
text-center
"
>

<div>
<p className="text-4xl font-bold">
500+
</p>
<p className="text-white/70">
Entreprises
</p>
</div>


<div>
<p className="text-4xl font-bold">
50K+
</p>
<p className="text-white/70">
Voyages
</p>
</div>


<div>
<p className="text-4xl font-bold">
35%
</p>
<p className="text-white/70">
Économies
</p>
</div>


<div>
<p className="text-4xl font-bold">
24/7
</p>
<p className="text-white/70">
Support
</p>
</div>


</div>

</Container>

</section>

)

}




// ======================================================
// PROBLEM / SOLUTION
// ======================================================

function ProblemSolution(){

return (

<section
className="
py-24
"
>

<Container>


<div
className="
grid
md:grid-cols-2
gap-12
"
>


<div>

<h2
className="
text-4xl
font-bold
text-gray-900
"
>

Les problèmes des voyages professionnels

</h2>


<ul
className="
mt-8
space-y-5
text-gray-600
"
>

<li>
❌ Réservations longues et compliquées
</li>

<li>
❌ Difficulté à contrôler les dépenses
</li>

<li>
❌ Manque de visibilité sur les voyages
</li>

<li>
❌ Gestion manuelle des employés
</li>

</ul>


</div>




<div
className="
bg-red-50
rounded-3xl
p-8
"
>


<h3
className="
text-2xl
font-bold
text-[#A11B1B]
"
>

La solution EasyVisa

</h3>


<p
className="
mt-5
text-gray-700
leading-relaxed
"
>

Une plateforme intelligente qui centralise
la réservation, le contrôle budgétaire et
le suivi des déplacements professionnels.

</p>


<div
className="
mt-6
space-y-4
"
>

<div className="flex gap-3">
<Check className="text-green-600"/>
Automatisation complète
</div>


<div className="flex gap-3">
<Check className="text-green-600"/>
Réduction des coûts
</div>


<div className="flex gap-3">
<Check className="text-green-600"/>
Meilleure visibilité
</div>


</div>


</div>


</div>


</Container>


</section>

)

}





// ======================================================
// SERVICES
// ======================================================


function Services(){

return (

<section
className="
py-24
bg-gray-50
"
>


<Container>


<div
className="
text-center
"
>

<h2
className="
text-4xl
font-bold
"
>

Une plateforme complète

</h2>


<p
className="
mt-4
text-gray-600
"
>

Tout ce dont votre entreprise a besoin
pour gérer ses déplacements.

</p>


</div>



<div
className="
grid
md:grid-cols-3
gap-8
mt-12
"
>


{
services.map((service,index)=>{


const Icon=service.icon;


return (

<div
key={index}
className="
bg-white
border
rounded-2xl
p-8
hover:-translate-y-2
transition
"
>


<div
className="
w-14
h-14
rounded-xl
bg-red-100
flex
items-center
justify-center
"
>

<Icon
className="
text-[#A11B1B]
"
/>


</div>



<h3
className="
mt-6
text-xl
font-bold
"
>

{service.title}

</h3>



<p
className="
mt-3
text-gray-600
"
>

{service.description}

</p>


</div>

)


})

}


</div>


</Container>


</section>

)

}





// ======================================================
// FEATURES
// ======================================================


function Features(){


return (

<section
className="
py-24
"
>

<Container>


<h2
className="
text-4xl
font-bold
text-center
"
>

Des fonctionnalités puissantes

</h2>



<div
className="
grid
sm:grid-cols-2
lg:grid-cols-3
gap-6
mt-12
"
>


{
features.map((feature,index)=>{


const Icon=feature.icon;


return (

<div
key={index}
className="
border
rounded-2xl
p-6
"
>


<Icon
className="
text-[#A11B1B]
w-8
h-8
"
/>


<h3
className="
mt-5
font-bold
text-lg
"
>

{feature.title}

</h3>


<p
className="
mt-2
text-gray-600
text-sm
"
>

{feature.description}

</p>


</div>


)

})

}


</div>


</Container>


</section>

)

}





// ======================================================
// HOW IT WORKS
// ======================================================


function Workflow(){

return (

<section
className="
py-24
bg-gray-50
"
>

<Container>


<h2
className="
text-4xl
font-bold
text-center
"
>

Comment ça marche ?

</h2>



<div
className="
grid
md:grid-cols-4
gap-8
mt-12
"
>


{
steps.map((step,index)=>(


<div
key={index}
className="
text-center
"
>


<div
className="
mx-auto
w-16
h-16
rounded-full
bg-[#A11B1B]
text-white
flex
items-center
justify-center
font-bold
"
>

{step.number}

</div>



<h3
className="
mt-5
font-bold
"
>

{step.title}

</h3>



<p
className="
mt-3
text-gray-600
text-sm
"
>

{step.description}

</p>



</div>


))

}


</div>


</Container>


</section>

)

}





// ======================================================
// TESTIMONIALS
// ======================================================


function Testimonials(){

return (

<section
className="
py-24
"
>

<Container>


<h2
className="
text-4xl
font-bold
text-center
"
>

Ils nous font confiance

</h2>



<div
className="
grid
md:grid-cols-3
gap-8
mt-12
"
>


{
testimonials.map((item,index)=>(


<div
key={index}
className="
border
rounded-2xl
p-8
"
>


<div
className="
flex
"
>

{
Array.from({length:item.rating}).map((_,i)=>(

<Star
key={i}
className="
fill-yellow-400
text-yellow-400
"
/>

))

}

</div>


<Quote
className="
mt-5
text-[#A11B1B]
"
/>


<p
className="
mt-4
text-gray-600
italic
"
>

"{item.text}"

</p>



<div
className="
mt-6
font-bold
"
>

{item.name}

</div>


<p
className="
text-gray-500
text-sm
"
>

{item.company}

</p>


</div>


))

}


</div>


</Container>


</section>

)

}





// ======================================================
// PRICING
// ======================================================


function Pricing(){

return (

<section
className="
py-24
bg-gray-50
"
>

<Container>


<h2
className="
text-4xl
font-bold
text-center
"
>

Tarifs simples

</h2>



<div
className="
grid
md:grid-cols-3
gap-8
mt-12
"
>


{
plans.map((plan,index)=>(


<div
key={index}
className={`
bg-white
rounded-2xl
p-8
border

${plan.popular
?
"border-[#A11B1B] shadow-xl"
:
"border-gray-200"
}

`}
>


<h3
className="
text-xl
font-bold
"
>

{plan.name}

</h3>



<p
className="
mt-4
text-3xl
font-bold
text-[#A11B1B]
"
>

{plan.price}

</p>



<ul
className="
mt-6
space-y-3
"
>

{
plan.features.map((item)=>(

<li
key={item}
className="
flex
gap-2
"
>

<Check
className="
text-green-500
"
/>

{item}

</li>

))

}

</ul>


<div className="mt-8">

<Button>
Commencer
</Button>

</div>


</div>


))

}


</div>


</Container>


</section>

)

}
// ======================================================
// FAQ
// ======================================================

function FAQ(){

const [open,setOpen]=useState<number|null>(null);


return (

<section
className="
py-24
bg-white
"
>

<Container>


<h2
className="
text-4xl
font-bold
text-center
"
>

Questions fréquentes

</h2>



<div
className="
max-w-3xl
mx-auto
mt-12
space-y-4
"
>


{
faqs.map((faq,index)=>{


const active=open===index;


return (

<div
key={index}
className="
border
rounded-xl
overflow-hidden
"
>


<button

onClick={()=>setOpen(active?null:index)}

className="
w-full
flex
justify-between
items-center
p-5
text-left
hover:bg-gray-50
"

>

<span
className="
font-semibold
"
>

{faq.question}

</span>



{
active
?
<ChevronUp/>
:
<ChevronDown/>
}


</button>




{
active && (

<div
className="
px-5
pb-5
text-gray-600
"
>

{faq.answer}

</div>

)

}


</div>

)

})

}


</div>


</Container>


</section>

)

}





// ======================================================
// CTA
// ======================================================


function CTA(){

return (

<section
className="
py-24
bg-[#A11B1B]
text-white
"
>

<Container>


<div
className="
text-center
max-w-3xl
mx-auto
"
>


<h2
className="
text-4xl
font-bold
"
>

Prêt à transformer vos voyages professionnels ?

</h2>



<p
className="
mt-5
text-white/80
text-lg
"
>

Rejoignez les entreprises qui utilisent
EasyVisa pour simplifier leurs déplacements.

</p>



<div
className="
mt-8
flex
justify-center
"
>


<button
className="
bg-white
text-[#A11B1B]
px-8
py-4
rounded-xl
font-bold
flex
items-center
gap-2
hover:bg-gray-100
transition
"
>

Demander une démo

<ArrowRight size={20}/>

</button>


</div>


</div>


</Container>


</section>

)

}





// ======================================================
// FOOTER
// ======================================================


function Footer(){

return (

<footer
className="
bg-gray-900
text-white
py-16
"
>

<Container>


<div
className="
grid
md:grid-cols-4
gap-10
"
>



<div>

<h3
className="
text-2xl
font-bold
"
>

EasyVisa

</h3>


<p
className="
mt-4
text-gray-400
text-sm
"
>

La plateforme intelligente
de gestion des voyages professionnels.

</p>


</div>




<div>

<h4
className="
font-bold
mb-4
"
>

Produit

</h4>


<ul
className="
space-y-3
text-gray-400
text-sm
"
>

<li>
Services
</li>

<li>
Fonctionnalités
</li>

<li>
Tarifs
</li>


</ul>


</div>




<div>

<h4
className="
font-bold
mb-4
"
>

Entreprise

</h4>


<ul
className="
space-y-3
text-gray-400
text-sm
"
>

<li>
À propos
</li>

<li>
Blog
</li>

<li>
Carrières
</li>


</ul>


</div>




<div>

<h4
className="
font-bold
mb-4
"
>

Support

</h4>


<ul
className="
space-y-3
text-gray-400
text-sm
"
>

<li>
FAQ
</li>

<li>
Contact
</li>

<li>
Mentions légales
</li>


</ul>


</div>



</div>




<div
className="
mt-12
pt-8
border-t
border-gray-800
text-center
text-gray-400
text-sm
"
>

© 2026 EasyVisa. Tous droits réservés.

</div>


</Container>


</footer>

)

}





// ======================================================
// LANDING PAGE FINAL
// ======================================================


export default function Landing(){


return (

<div
className="
min-h-screen
"
>


<Navbar/>


<main>

<Hero/>

<TrustSection/>

<ProblemSolution/>

<Services/>

<Features/>

<Workflow/>

<Testimonials/>

<Pricing/>

<FAQ/>

<CTA/>

</main>



<Footer/>


</div>

)

}