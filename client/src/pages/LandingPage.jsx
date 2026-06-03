import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Drag & Drop Kanban',
    desc: 'Move tasks across To Do, In Progress, and Done with buttery-smooth drag and drop.',
  },
  {
    icon: '🎯',
    title: 'Priority Tracking',
    desc: 'Tag tasks as High, Medium, or Low priority so your team always knows what to tackle first.',
  },
  {
    icon: '💬',
    title: 'Task Comments',
    desc: 'Discuss work right on the task card. No more hunting through Slack threads.',
  },
  {
    icon: '📅',
    title: 'Due Date Warnings',
    desc: 'Overdue tasks turn red automatically. Stay on schedule without micromanaging.',
  },
  {
    icon: '🔍',
    title: 'Instant Search',
    desc: 'Find any task across your entire workspace in milliseconds.',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    desc: 'See your team\'s completion rate at a glance with a live progress bar.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Product Manager, Razorpay',
    avatar: 'PS',
    color: '#6366f1',
    text: 'TaskFlow replaced three different tools for our team. The Kanban board is exactly what we needed — simple, fast, and it just works.',
  },
  {
    name: 'Arjun Mehta',
    role: 'Engineering Lead, Zepto',
    avatar: 'AM',
    color: '#10b981',
    text: 'We\'ve tried Jira, Trello, Asana. TaskFlow is the first one our engineers actually enjoy using. The drag-and-drop is incredibly smooth.',
  },
  {
    name: 'Neha Kapoor',
    role: 'Founder, BuildWithAI',
    avatar: 'NK',
    color: '#f59e0b',
    text: 'Set up in 2 minutes, organized my entire startup\'s roadmap in 20. This is how project management should feel.',
  },
]

const FAQS = [
  {
    q: 'Is TaskFlow really free?',
    a: 'Yes — completely free. No credit card required, no hidden limits. Create as many workspaces and tasks as you need.',
  },
  {
    q: 'Can I collaborate with my team?',
    a: 'Absolutely. Invite team members to any workspace. Everyone sees updates in real time.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'TaskFlow is fully responsive and works great on phones and tablets. Access your boards from anywhere.',
  },
  {
    q: 'How is my data stored?',
    a: 'All data is stored securely on our servers with encrypted connections. Your tasks are private by default.',
  },
  {
    q: 'Can I export my tasks?',
    a: 'CSV and PDF export are on our roadmap — coming very soon.',
  },
]

// ── tiny hook: track if element is in viewport ──
function useInView(ref) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true)
    }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref])
  return inView
}

function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref)
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  return (
    <div style={{ background: '#0a0f1e', color: '#e2e8f0', fontFamily: "'DM Sans', -apple-system, sans-serif", overflowX: 'hidden' }}>

      {/* ── Sticky Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 32px', height: '62px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,15,30,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            width: '32px', height: '32px', background: 'linear-gradient(135deg,#6366f1,#818cf8)',
            borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.3px' }}>TaskFlow</span>
        </div>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
          {['features', 'testimonials', 'faq'].map(id => (
            <button key={id} onClick={() => scrollTo(id)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', fontWeight: '500', cursor: 'pointer', textTransform: 'capitalize', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#f1f5f9'}
              onMouseLeave={e => e.target.style.color = '#94a3b8'}
            >
              {id}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate('/login')}
            style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s' }}
            onMouseEnter={e => { e.target.style.borderColor = '#6366f1'; e.target.style.color = '#f1f5f9' }}
            onMouseLeave={e => { e.target.style.borderColor = '#334155'; e.target.style.color = '#94a3b8' }}
          >
            Sign in
          </button>
          <button onClick={() => navigate('/register')}
            style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 80px', position: 'relative', overflow: 'hidden' }}>

        {/* Background glow blobs */}
        <div style={{
          position: 'absolute', top: '10%', left: '15%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '10%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '780px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '20px', padding: '6px 16px', marginBottom: '28px',
            animation: 'fadeUp 0.6s ease both',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
            <span style={{ fontSize: '13px', color: '#818cf8', fontWeight: '500' }}>Free forever · No credit card needed</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: '800',
            lineHeight: '1.1',
            letterSpacing: '-2px',
            margin: '0 0 24px',
            color: '#f1f5f9',
            animation: 'fadeUp 0.6s ease 0.1s both',
          }}>
            Ship faster with{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a5b4fc 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              organized teams
            </span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: '#64748b',
            lineHeight: '1.7',
            maxWidth: '560px',
            margin: '0 auto 40px',
            animation: 'fadeUp 0.6s ease 0.2s both',
          }}>
            TaskFlow is the Kanban board that gets out of your way. Create a workspace, drag tasks, hit deadlines. No setup. No bloat.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.6s ease 0.3s both' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                color: 'white', border: 'none', borderRadius: '10px',
                padding: '14px 30px', fontSize: '15px', fontWeight: '700',
                cursor: 'pointer', boxShadow: '0 0 32px rgba(99,102,241,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 40px rgba(99,102,241,0.5)' }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 0 32px rgba(99,102,241,0.4)' }}
            >
              Start for free →
            </button>
            <button
              onClick={() => scrollTo('features')}
              style={{
                background: 'rgba(255,255,255,0.04)', color: '#94a3b8',
                border: '1px solid #334155', borderRadius: '10px',
                padding: '14px 30px', fontSize: '15px', fontWeight: '600',
                cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = '#6366f1'; e.target.style.color = '#f1f5f9' }}
              onMouseLeave={e => { e.target.style.borderColor = '#334155'; e.target.style.color = '#94a3b8' }}
            >
              See features
            </button>
          </div>

          {/* Social proof numbers */}
          <div style={{
            display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '56px',
            animation: 'fadeUp 0.6s ease 0.4s both', flexWrap: 'wrap',
          }}>
            {[['500+', 'Teams using TaskFlow'], ['10k+', 'Tasks completed'], ['99%', 'Uptime']].map(([num, label]) => (
              <div key={num} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-1px' }}>{num}</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Board Preview (fake UI) ── */}
      <section style={{ padding: '0 24px 100px', display: 'flex', justifyContent: 'center' }}>
        <FadeIn style={{ width: '100%', maxWidth: '900px' }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          }}>
            {/* Fake window bar */}
            <div style={{ background: '#0f172a', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #334155' }}>
              {['#ef4444','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
              <div style={{ flex: 1, background: '#1e293b', borderRadius: '6px', height: '22px', margin: '0 16px', display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>
                <span style={{ fontSize: '11px', color: '#475569' }}>taskflow.app/workspace/my-project</span>
              </div>
            </div>

            {/* Fake nav */}
            <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>← Dashboard / My Project</span>
              <div style={{ background: '#6366f1', color: 'white', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '600' }}>+ Add task</div>
            </div>

            {/* Fake kanban */}
            <div style={{ display: 'flex', gap: '12px', padding: '20px', background: '#0f172a', overflowX: 'auto' }}>
              {[
                { label: 'To Do', color: '#64748b', tasks: [
                  { title: 'Design system audit', pri: 'high', priC: '#ef4444', due: 'Jun 1' },
                  { title: 'Write API docs', pri: 'medium', priC: '#f59e0b', due: null },
                ]},
                { label: 'In Progress', color: '#f59e0b', tasks: [
                  { title: 'Build auth flow', pri: 'high', priC: '#ef4444', due: 'Today', dueC: '#f59e0b' },
                  { title: 'Set up CI/CD pipeline', pri: 'medium', priC: '#f59e0b', due: 'Jun 3' },
                  { title: 'User onboarding copy', pri: 'low', priC: '#10b981', due: null },
                ]},
                { label: 'Done', color: '#10b981', tasks: [
                  { title: 'Landing page design', pri: 'high', priC: '#ef4444', done: true, due: null },
                  { title: 'Database schema', pri: 'medium', priC: '#f59e0b', done: true, due: null },
                ]},
              ].map(col => (
                <div key={col.label} style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{col.label}</span>
                    <span style={{ background: 'rgba(255,255,255,0.06)', color: '#475569', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>{col.tasks.length}</span>
                  </div>
                  {col.tasks.map((t, i) => (
                    <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '5px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '700', color: t.priC, background: `${t.priC}18`, padding: '2px 6px', borderRadius: '10px' }}>{t.pri}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: t.done ? '#475569' : '#e2e8f0', margin: 0, textDecoration: t.done ? 'line-through' : 'none', fontWeight: '500' }}>{t.title}</p>
                      {t.due && (
                        <span style={{ fontSize: '10px', color: t.dueC || '#475569', marginTop: '6px', display: 'block' }}>📅 {t.due}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Features</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#f1f5f9', margin: '0 0 16px', letterSpacing: '-1px' }}>
            Everything your team needs
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>
            No unnecessary complexity. Just the tools that matter for getting work done.
          </p>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 80}>
              <div
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '14px',
                  padding: '28px',
                  transition: 'border-color 0.2s, transform 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" style={{ padding: '80px 24px', background: 'rgba(99,102,241,0.03)', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeIn style={{ textAlign: 'center', marginBottom: '52px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Testimonials</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#f1f5f9', margin: 0, letterSpacing: '-1px' }}>
              Loved by teams
            </h2>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div style={{
                  background: '#1e293b', border: '1px solid #334155',
                  borderRadius: '14px', padding: '28px',
                }}>
                  <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.7', margin: '0 0 24px', fontStyle: 'italic' }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: `${t.color}22`, border: `1px solid ${t.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: '700', color: t.color,
                    }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>{t.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '80px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: '52px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>FAQ</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#f1f5f9', margin: 0, letterSpacing: '-1px' }}>
            Common questions
          </h2>
        </FadeIn>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQS.map((faq, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div
                style={{ background: '#1e293b', border: `1px solid ${openFaq === i ? '#6366f1' : '#334155'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    padding: '18px 22px', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9' }}>{faq.q}</span>
                  <span style={{ color: '#6366f1', fontSize: '20px', lineHeight: 1, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 22px 18px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.7', margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '80px 24px' }}>
        <FadeIn>
          <div style={{
            maxWidth: '760px', margin: '0 auto', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.08) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '20px', padding: '60px 32px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)', pointerEvents: 'none' }} />
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: '800', color: '#f1f5f9', margin: '0 0 16px', letterSpacing: '-1px' }}>
              Ready to get organized?
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', margin: '0 0 36px', lineHeight: '1.7' }}>
              Join hundreds of teams shipping faster with TaskFlow. Free forever.
            </p>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                color: 'white', border: 'none', borderRadius: '10px',
                padding: '14px 36px', fontSize: '15px', fontWeight: '700',
                cursor: 'pointer', boxShadow: '0 0 32px rgba(99,102,241,0.4)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >
              Create your free account →
            </button>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{ width: '24px', height: '24px', background: '#6366f1', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>TaskFlow</span>
        </div>
        <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
          © {new Date().getFullYear()} TaskFlow. Built with ❤️ as a portfolio project.
        </p>
      </footer>

      {/* Keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}