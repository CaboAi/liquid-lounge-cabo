import { useState, useEffect, useRef } from "react";

const translations = {
  en: {
    nav: { services: "Services", work: "Work", about: "About", contact: "Contact" },
    hero: {
      tag: "AI Integrations Consultant",
      headline: "I build the systems that let your business run itself.",
      sub: "Custom websites, workflow automation, and AI strategy for businesses in Los Cabos and beyond.",
      cta: "Let's talk about your project",
      ctaSub: "Free 30-minute discovery call"
    },
    services: {
      title: "What I build",
      s1: { name: "AI-Powered Websites", desc: "Modern, bilingual websites that look premium and work hard — SEO-optimized, mobile-first, with built-in lead capture and booking systems. Your business, open 24/7." },
      s2: { name: "Workflow Automation", desc: "Stop transferring data by hand. I build systems that move information between your documents, spreadsheets, and tools automatically — saving you hours every week." },
      s3: { name: "AI Consulting & Strategy", desc: "Not sure where AI fits in your business? I'll audit your operations, find the bottlenecks, and build a roadmap to eliminate them. Workshops available for teams." }
    },
    work: {
      title: "Recent work",
      p1: { name: "EstudioCreativo", type: "Creative Agency Website", desc: "Full brand website with portfolio showcase and client intake automation." },
      p2: { name: "Los Cabos Rentals", type: "Rental Platform (SaaS)", desc: "Full-stack rental application with property listings, search, and waitlist management." },
      p3: { name: "Manufacturing Automation", type: "Document Workflow", desc: "PDF-to-Excel data extraction system eliminating hours of manual data entry for a clothing manufacturer." }
    },
    about: {
      title: "About",
      p1: "I'm Mario Polanco — an AI integrations consultant based in Cabo San Lucas, Mexico.",
      p2: "I work with business owners who know they need to modernize but don't know where to start. I speak your language (literally — English and Spanish), I understand the local market, and I build solutions that actually get used.",
      p3: "My approach is simple: find what's costing you time, automate it, and make your business look as good online as it is in person."
    },
    contact: {
      title: "Ready to automate?",
      sub: "Tell me what's slowing your business down. I'll tell you how to fix it.",
      cta: "Start a conversation",
      or: "or email directly"
    },
    lang: "ES"
  },
  es: {
    nav: { services: "Servicios", work: "Proyectos", about: "Sobre mí", contact: "Contacto" },
    hero: {
      tag: "Consultor de Integraciones con IA",
      headline: "Construyo los sistemas que hacen que tu negocio funcione solo.",
      sub: "Sitios web personalizados, automatización de procesos e inteligencia artificial para negocios en Los Cabos y más allá.",
      cta: "Hablemos de tu proyecto",
      ctaSub: "Llamada de consulta gratuita — 30 minutos"
    },
    services: {
      title: "Lo que construyo",
      s1: { name: "Sitios Web con IA", desc: "Sitios modernos y bilingües que se ven premium y trabajan duro — optimizados para Google, móvil primero, con captura de leads y reservaciones. Tu negocio, abierto 24/7." },
      s2: { name: "Automatización de Procesos", desc: "Deja de pasar datos a mano. Construyo sistemas que mueven información entre tus documentos, hojas de cálculo y herramientas automáticamente — ahorrándote horas cada semana." },
      s3: { name: "Consultoría en IA", desc: "¿No sabes dónde encaja la IA en tu negocio? Hago una auditoría de tus operaciones, encuentro los cuellos de botella y te doy un plan para eliminarlos. Talleres disponibles." }
    },
    work: {
      title: "Proyectos recientes",
      p1: { name: "EstudioCreativo", type: "Sitio Web — Agencia Creativa", desc: "Sitio web completo con portafolio y automatización de captación de clientes." },
      p2: { name: "Los Cabos Rentals", type: "Plataforma de Rentas (SaaS)", desc: "Aplicación completa de rentas con listados de propiedades, búsqueda y gestión de lista de espera." },
      p3: { name: "Automatización Manufacturera", type: "Flujo de Documentos", desc: "Sistema de extracción de datos PDF a Excel eliminando horas de captura manual para una empresa de manufactura textil." }
    },
    about: {
      title: "Sobre mí",
      p1: "Soy Mario Polanco — consultor de integraciones con IA basado en Cabo San Lucas, México.",
      p2: "Trabajo con dueños de negocios que saben que necesitan modernizarse pero no saben por dónde empezar. Hablo tu idioma, entiendo el mercado local y construyo soluciones que realmente se usan.",
      p3: "Mi enfoque es simple: encontrar lo que te cuesta tiempo, automatizarlo, y hacer que tu negocio se vea tan bien en línea como lo es en persona."
    },
    contact: {
      title: "¿Listo para automatizar?",
      sub: "Dime qué está frenando tu negocio. Te digo cómo arreglarlo.",
      cta: "Iniciar una conversación",
      or: "o escríbeme directamente"
    },
    lang: "EN"
  }
};

const serviceIcons = [
  <svg key="icon-web" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}><rect x="4" y="6" width="24" height="18" rx="2"/><path d="M4 12h24"/><circle cx="8" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="9" r="1" fill="currentColor" stroke="none"/><path d="M10 17l3 3 5-6"/></svg>,
  <svg key="icon-auto" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}><path d="M12 4v6H6"/><path d="M20 28v-6h6"/><path d="M6 10l6-6h2"/><path d="M26 22l-6 6h-2"/><rect x="4" y="12" width="10" height="8" rx="1.5"/><rect x="18" y="12" width="10" height="8" rx="1.5"/><path d="M14 16h4"/></svg>,
  <svg key="icon-consult" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}><circle cx="16" cy="16" r="10"/><path d="M16 10v6l4 3"/><path d="M26 6l1.5-1.5M6 6L4.5 4.5"/></svg>
];

// Project screenshot images — drop real screenshots as /images/project-1.png, project-2.png, project-3.png
const projectImages = [
  "/images/project-1.png", // EstudioCreativo
  "/images/project-2.png", // Los Cabos Rentals
  null                      // Manufacturing — uses inline mockup
];

function ProjectPreview({ index }) {
  const [imgError, setImgError] = useState(false);
  const src = projectImages[index];

  // If we have a real image and it hasn't errored, show it
  if (src && !imgError) {
    return (
      <div style={{
        width: "100%",
        height: 180,
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 24,
        border: "1px solid #e8e6e0",
        position: "relative"
      }}>
        {/* Browser chrome bar */}
        <div style={{
          height: 24,
          background: "#f0efeb",
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          gap: 5,
          borderBottom: "1px solid #e0ded8"
        }}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#e06050"}}/>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#e8b84a"}}/>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#5cb85c"}}/>
          <div style={{
            marginLeft: 8,
            flex: 1,
            height: 14,
            background: "#e8e6e0",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            paddingLeft: 8,
            fontSize: 8,
            color: "#999",
            fontFamily: "'DM Sans', sans-serif"
          }}>
            {["estudiocreativo.ai", "caborentalapp.com", ""][index]}
          </div>
        </div>
        <img
          src={src}
          alt={["EstudioCreativo website", "Los Cabos Rentals app", "Manufacturing automation"][index]}
          onError={() => setImgError(true)}
          style={{
            width: "100%",
            height: 156,
            objectFit: "cover",
            objectPosition: "top",
            display: "block"
          }}
        />
      </div>
    );
  }

  // Fallback to inline mockups
  return (
    <div style={{
      width: "100%",
      height: 180,
      borderRadius: 6,
      overflow: "hidden",
      marginBottom: 24,
      border: "1px solid #e8e6e0",
      position: "relative"
    }}>
      {/* Browser chrome bar */}
      <div style={{
        height: 24,
        background: "#f0efeb",
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        gap: 5,
        borderBottom: "1px solid #e0ded8"
      }}>
        <div style={{width:7,height:7,borderRadius:"50%",background:"#e06050"}}/>
        <div style={{width:7,height:7,borderRadius:"50%",background:"#e8b84a"}}/>
        <div style={{width:7,height:7,borderRadius:"50%",background:"#5cb85c"}}/>
        <div style={{
          marginLeft: 8,
          flex: 1,
          height: 14,
          background: "#e8e6e0",
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          paddingLeft: 8,
          fontSize: 8,
          color: "#999",
          fontFamily: "'DM Sans', sans-serif"
        }}>
          {["estudiocreativo.ai", "caborentalapp.com", ""][index]}
        </div>
      </div>
      {/* Inline mockup content */}
      {index === 0 && (
        <div style={{
          height: 156,
          background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b3d 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{position:"absolute",top:10,left:16,display:"flex",alignItems:"center",gap:6}}>
            <svg viewBox="0 0 16 16" style={{width:12,height:12}}><circle cx="8" cy="8" r="6" fill="none" stroke="#4ECDC4" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#4ECDC4" strokeWidth="1.5" fill="none"/></svg>
            <span style={{fontSize:9,color:"#ccc",fontWeight:600,letterSpacing:1}}>ECHO</span>
          </div>
          <p style={{fontSize:7,color:"#4ECDC4",letterSpacing:2,textTransform:"uppercase",marginBottom:6,fontWeight:600}}>Human-First Automation</p>
          <p style={{fontSize:16,fontWeight:700,color:"#fff",textAlign:"center",lineHeight:1.2,fontFamily:"'Playfair Display', serif"}}>SCALE YOUR IMPACT</p>
          <p style={{fontSize:14,fontWeight:700,textAlign:"center",lineHeight:1.2}}>
            <span style={{color:"#c0574a"}}>WITHOUT </span>
            <span style={{color:"#e07050"}}>LOSING YOUR </span>
            <span style={{color:"#c0574a"}}>SOUL.</span>
          </p>
          <div style={{marginTop:10,padding:"4px 14px",background:"#c0574a",borderRadius:2}}>
            <span style={{fontSize:6,color:"#fff",letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Explore the Echo Framework</span>
          </div>
        </div>
      )}
      {index === 1 && (
        <div style={{
          height: 156,
          background: "#f8f7f4",
          padding: 12,
          overflow: "hidden"
        }}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:10,fontWeight:700,color:"#1a1a1a"}}>LCR App</span>
            <div style={{padding:"2px 8px",background:"#c0574a",borderRadius:3}}>
              <span style={{fontSize:7,color:"#fff",fontWeight:600}}>Sign Out</span>
            </div>
          </div>
          <div style={{height:14,background:"#fff",borderRadius:4,border:"1px solid #e0e0e0",marginBottom:8,display:"flex",alignItems:"center",paddingLeft:6}}>
            <span style={{fontSize:7,color:"#bbb"}}>Search by city...</span>
          </div>
          <div style={{display:"flex",gap:4,marginBottom:8}}>
            <span style={{fontSize:6,padding:"2px 6px",background:"#c0574a",color:"#fff",borderRadius:10,fontWeight:600}}>Newest</span>
            <span style={{fontSize:6,padding:"2px 6px",background:"#eee",color:"#888",borderRadius:10}}>Price</span>
          </div>
          <div style={{background:"#fff",borderRadius:6,border:"1px solid #e8e6e0",overflow:"hidden"}}>
            <div style={{height:52,background:"linear-gradient(135deg, #87CEEB 0%, #4a90a4 50%, #2d6b4a 100%)",position:"relative"}}>
              <div style={{position:"absolute",top:4,right:4,width:14,height:14,borderRadius:"50%",background:"rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:8,color:"#ccc"}}>&#9825;</span>
              </div>
            </div>
            <div style={{padding:"6px 8px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:9,fontWeight:700}}>$85,000<span style={{fontWeight:400,fontSize:7,color:"#888"}}>/month</span></span>
                <span style={{fontSize:6,padding:"1px 4px",border:"1px solid #ddd",borderRadius:2,color:"#888"}}>VILLA</span>
              </div>
              <p style={{fontSize:7,fontWeight:600,marginTop:2}}>Villa del Mar #45</p>
              <p style={{fontSize:6,color:"#888"}}>Cabo San Lucas</p>
            </div>
          </div>
        </div>
      )}
      {index === 2 && (
        <div style={{
          height: 156,
          background: "#f4f6f8",
          padding: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8
        }}>
          <div style={{display:"flex",gap:8,alignItems:"center",width:"100%"}}>
            <div style={{flex:1,background:"#fff",borderRadius:4,border:"1px solid #e0e0e0",padding:8,textAlign:"center"}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#c0574a" strokeWidth="1.5" style={{width:18,height:18,margin:"0 auto 4px"}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <p style={{fontSize:7,fontWeight:600,color:"#444"}}>PDF Input</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" style={{width:16,height:16,flexShrink:0}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <div style={{flex:1,background:"#fff",borderRadius:4,border:"1px solid #e0e0e0",padding:8,textAlign:"center"}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#2d8a4e" strokeWidth="1.5" style={{width:18,height:18,margin:"0 auto 4px"}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>
              <p style={{fontSize:7,fontWeight:600,color:"#444"}}>Excel Output</p>
            </div>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
            {["Invoices","Orders","Inventory","Contacts"].map(label=>(
              <span key={label} style={{fontSize:6,padding:"2px 6px",background:"#e8e6e0",borderRadius:8,color:"#666",fontWeight:500}}>{label}</span>
            ))}
          </div>
          <p style={{fontSize:7,color:"#999",textAlign:"center",lineHeight:1.4}}>Automated data extraction</p>
        </div>
      )}
    </div>
  );
}

export default function Portfolio() {
  const [lang, setLang] = useState("en");
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sectionRefs = useRef({});
  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setVisible(prev => new Set([...prev, e.target.dataset.section]));
          }
        });
      },
      { threshold: 0.15 }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const ref = (name) => (el) => {
    if (el) {
      el.dataset.section = name;
      sectionRefs.current[name] = el;
    }
  };

  const isVis = (name) => visible.has(name);

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: "#1a1a1a",
      background: "#FAFAF7",
      minHeight: "100vh",
      overflow: "hidden"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet"/>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .fade-up { opacity: 0; }
        .fade-up.vis { animation: fadeUp 0.7s ease-out forwards; }
        .fade-in { opacity: 0; }
        .fade-in.vis { animation: fadeIn 0.6s ease-out forwards; }
        .slide-r { opacity: 0; }
        .slide-r.vis { animation: slideRight 0.6s ease-out forwards; }

        .nav-link {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #666;
          text-decoration: none;
          transition: color 0.2s;
          cursor: pointer;
        }
        .nav-link:hover { color: #1a1a1a; }

        .cta-btn {
          display: inline-block;
          padding: 16px 36px;
          background: #1a1a1a;
          color: #FAFAF7;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.3px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .cta-btn:hover {
          background: #333;
          transform: translateY(-1px);
        }

        .service-card {
          padding: 36px 32px;
          background: #fff;
          border: 1px solid #e8e6e0;
          transition: all 0.35s ease;
          position: relative;
          overflow: hidden;
        }
        .service-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 3px;
          background: #1a1a1a;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }
        .service-card:hover::before { transform: scaleX(1); }
        .service-card:hover {
          border-color: #ccc;
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.06);
        }

        .project-card {
          padding: 32px;
          background: #fff;
          border: 1px solid #e8e6e0;
          transition: all 0.3s ease;
        }
        .project-card:hover {
          border-color: #ccc;
          box-shadow: 0 8px 30px rgba(0,0,0,0.05);
        }

        .lang-toggle {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          padding: 6px 14px;
          border: 1.5px solid #1a1a1a;
          background: transparent;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .lang-toggle:hover {
          background: #1a1a1a;
          color: #FAFAF7;
        }

        .section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 16px;
        }

        .divider {
          width: 48px;
          height: 1.5px;
          background: #1a1a1a;
          margin: 20px 0 32px;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        @media (max-width: 640px) {
          .desktop-nav-link { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: scrolled ? "14px 40px" : "22px 40px",
        background: scrolled ? "rgba(250,250,247,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #e8e6e0" : "1px solid transparent",
        transition: "all 0.3s ease",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, letterSpacing: "-0.5px" }}>
          MP
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#services" className="nav-link desktop-nav-link">{t.nav.services}</a>
          <a href="#work" className="nav-link desktop-nav-link">{t.nav.work}</a>
          <a href="#about" className="nav-link desktop-nav-link">{t.nav.about}</a>
          <a href="#contact" className="nav-link desktop-nav-link">{t.nav.contact}</a>
          <button className="lang-toggle" onClick={() => setLang(l => l === "en" ? "es" : "en")}>
            {t.lang}
          </button>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" style={{width:22,height:22}}>
              {mobileMenuOpen
                ? <><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></>
                : <><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div style={{
          position: "fixed",
          top: 60,
          left: 0, right: 0,
          zIndex: 99,
          background: "rgba(250,250,247,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e8e6e0",
          padding: "24px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          animation: "fadeIn 0.2s ease-out"
        }}>
          {[
            { href: "#services", label: t.nav.services },
            { href: "#work", label: t.nav.work },
            { href: "#about", label: t.nav.about },
            { href: "#contact", label: t.nav.contact },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 16 }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* HERO */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "140px 40px 80px",
        maxWidth: 900,
        marginLeft: "auto",
        marginRight: "auto"
      }}>
        <div ref={ref("hero")} className={`fade-up ${isVis("hero") ? "vis" : ""}`} style={{ animationDelay: "0.1s" }}>
          <p className="section-label">{t.hero.tag}</p>
        </div>
        <h1 ref={ref("headline")} className={`fade-up ${isVis("headline") ? "vis" : ""}`} style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(36px, 5.5vw, 64px)",
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: "-1.5px",
          color: "#1a1a1a",
          marginBottom: 28,
          animationDelay: "0.25s"
        }}>
          {t.hero.headline}
        </h1>
        <p ref={ref("herosub")} className={`fade-up ${isVis("herosub") ? "vis" : ""}`} style={{
          fontSize: 18,
          lineHeight: 1.7,
          color: "#666",
          maxWidth: 560,
          marginBottom: 48,
          animationDelay: "0.4s"
        }}>
          {t.hero.sub}
        </p>
        <div ref={ref("herocta")} className={`fade-up ${isVis("herocta") ? "vis" : ""}`} style={{ animationDelay: "0.55s" }}>
          <a href="https://calendar.app.google/gzCWNSEWsEfdEkQE7" target="_blank" rel="noopener noreferrer" className="cta-btn">{t.hero.cta}</a>
          <p style={{ fontSize: 13, color: "#999", marginTop: 14, letterSpacing: "0.3px" }}>{t.hero.ctaSub}</p>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{
        padding: "100px 40px",
        maxWidth: 1000,
        margin: "0 auto"
      }}>
        <div ref={ref("svc")} className={`fade-up ${isVis("svc") ? "vis" : ""}`}>
          <p className="section-label">01</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 600,
            letterSpacing: "-1px",
            marginBottom: 8
          }}>{t.services.title}</h2>
          <div className="divider"/>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20
        }}>
          {[t.services.s1, t.services.s2, t.services.s3].map((svc, i) => (
            <div
              key={i}
              ref={ref(`svc${i}`)}
              className={`service-card slide-r ${isVis(`svc${i}`) ? "vis" : ""}`}
              style={{ animationDelay: `${0.15 * i}s` }}
            >
              <div style={{ color: "#1a1a1a", marginBottom: 20 }}>
                {serviceIcons[i]}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, letterSpacing: "-0.3px" }}>
                {svc.name}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#666" }}>
                {svc.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WORK */}
      <section id="work" style={{
        padding: "100px 40px",
        maxWidth: 1000,
        margin: "0 auto"
      }}>
        <div ref={ref("work")} className={`fade-up ${isVis("work") ? "vis" : ""}`}>
          <p className="section-label">02</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 600,
            letterSpacing: "-1px",
            marginBottom: 8
          }}>{t.work.title}</h2>
          <div className="divider"/>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[t.work.p1, t.work.p2, t.work.p3].map((proj, i) => (
            <div
              key={i}
              ref={ref(`proj${i}`)}
              className={`project-card fade-up ${isVis(`proj${i}`) ? "vis" : ""}`}
              style={{ animationDelay: `${0.12 * i}s` }}
            >
              <ProjectPreview index={i} />
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>
                {proj.type}
              </p>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: "-0.3px" }}>
                {proj.name}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#666" }}>
                {proj.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{
        padding: "100px 40px",
        maxWidth: 800,
        margin: "0 auto"
      }}>
        <div ref={ref("about")} className={`fade-up ${isVis("about") ? "vis" : ""}`}>
          <p className="section-label">03</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 600,
            letterSpacing: "-1px",
            marginBottom: 8
          }}>{t.about.title}</h2>
          <div className="divider"/>
        </div>

        <div ref={ref("abouttext")} className={`fade-up ${isVis("abouttext") ? "vis" : ""}`} style={{ animationDelay: "0.15s" }}>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "#444", marginBottom: 24 }}>{t.about.p1}</p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "#666", marginBottom: 24 }}>{t.about.p2}</p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "#666", fontStyle: "italic" }}>{t.about.p3}</p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{
        padding: "120px 40px",
        background: "#1a1a1a",
        color: "#FAFAF7",
        textAlign: "center"
      }}>
        <div ref={ref("contact")} className={`fade-up ${isVis("contact") ? "vis" : ""}`} style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 600,
            letterSpacing: "-1.5px",
            marginBottom: 20,
            color: "#FAFAF7"
          }}>
            {t.contact.title}
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#999", marginBottom: 48 }}>
            {t.contact.sub}
          </p>
          <a href="https://calendar.app.google/gzCWNSEWsEfdEkQE7" target="_blank" rel="noopener noreferrer" className="cta-btn" style={{
            background: "#FAFAF7",
            color: "#1a1a1a"
          }}>
            {t.contact.cta}
          </a>
          <p style={{ fontSize: 13, color: "#666", marginTop: 20 }}>
            {t.contact.or}: <a href="mailto:mario@mariointegrates.co" style={{ color: "#FAFAF7", borderBottom: "1px solid #444", textDecoration: "none" }}>mario@mariointegrates.co</a>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "32px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid #e8e6e0",
        fontSize: 13,
        color: "#999"
      }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 16, color: "#1a1a1a" }}>MP</span>
        <span>&copy; 2026 Mario Polanco</span>
      </footer>
    </div>
  );
}
