import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const formRef = useRef(null)

  useEffect(() => {
    const inputs = document.querySelectorAll('input')
    const handleFocus = () => document.documentElement.style.setProperty('--neon-glow', 'rgba(195, 204, 140, 0.6)')
    const handleBlur = () => document.documentElement.style.setProperty('--neon-glow', 'rgba(195, 204, 140, 0.3)')
    inputs.forEach(input => {
      input.addEventListener('focus', handleFocus)
      input.addEventListener('blur', handleBlur)
    })
    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focus', handleFocus)
        input.removeEventListener('blur', handleBlur)
      })
    }
  }, [])

  const [isShowPassword, setIsShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = e.currentTarget.querySelector('input[type="text"]').value;
    const password = e.currentTarget.querySelector('input[type="password"]').value;
    const btn = e.currentTarget.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;

    btn.disabled = true;
    btn.classList.add('opacity-80');
    btn.innerHTML = `<span class="material-symbols-outlined animate-spin">sync</span><span class="font-label-caps uppercase tracking-widest">Verifying Identity...</span>`;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('kavachUser', JSON.stringify(data));
        btn.innerHTML = `<span class="material-symbols-outlined text-[#00ff41]">verified</span><span class="font-label-caps uppercase tracking-widest text-[#00ff41]">Access Granted</span>`;
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        throw new Error(data.message || 'Access Denied');
      }
    } catch (error) {
      btn.innerHTML = `<span class="material-symbols-outlined text-error">error</span><span class="font-label-caps uppercase tracking-widest text-error">${error.message}</span>`;
      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('opacity-80');
        btn.innerHTML = originalContent;
      }, 2000);
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-4 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        :root { --neon-glow: rgba(195, 204, 140, 0.3); --error-glow: rgba(255, 180, 171, 0.3); }
      `}</style>
      <div className="scanline"></div>
      <div className="fixed top-8 left-8 hidden lg:block opacity-40 pointer-events-none">
        <div className="border-l-2 border-primary pl-4 py-2">
          <div className="font-label-caps text-label-caps text-primary mb-1">LAT_COORD: 28.6139° N</div>
          <div className="font-label-caps text-label-caps text-primary">LONG_COORD: 77.2090° E</div>
        </div>
      </div>
      <div className="fixed top-8 right-8 hidden lg:block opacity-40 pointer-events-none text-right">
        <div className="border-r-2 border-primary pr-4 py-2">
          <div className="font-label-caps text-label-caps text-primary mb-1">AUTH_ENC: AES-256-GCM</div>
          <div className="font-label-caps text-label-caps text-primary">NODE_ID: HQ-NORTH-SEC-4</div>
        </div>
      </div>
      <main className="w-full max-w-lg relative z-20 px-2 sm:px-0">
        <div className="flex flex-col items-center mb-6 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-6 mb-3 sm:mb-4">
            <div className="w-12 sm:w-20 h-12 sm:h-20">
              <img className="w-full h-full object-contain" alt="Official Indian Army crest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp0r2dcvoxSahpWSE-_Sldv-NgFupovcUsvs6inV132DduCYowUoSy3ly3pWzncfMW90r8W2KRIBhwIMJ7JCECROXmlGVWGx7kzyutwMtG_dzFV0kyzWamlFw9fqirgR6ljLrpD9isBmombsdTfTYhJbddsLz8ZEfmCPsulfenQF9DTZ6bZhPSnJDXHK16gkX9cEkRgEgXKR3YHRo_WUhsUS5fRbLvdOWXZmD561UYnsVWGY0j7d37x11DfUJqrHa0VKT5VsoTp6g" />
            </div>
            <div className="h-12 sm:h-16 w-px bg-outline-variant/30"></div>
            <div className="text-left">
              <h1 className="font-headline-md text-xl sm:text-headline-md font-black text-primary tracking-tighter leading-none">EPMS Portal</h1>
              <p className="font-label-caps text-[10px] sm:text-label-caps text-on-surface-variant mt-1 tracking-widest uppercase">505 Army Base Workshop</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full border border-outline-variant/30">
            <span className="led-indicator bg-primary"></span>
            <span className="font-label-caps text-[9px] sm:text-[10px] text-primary-fixed uppercase tracking-wider">SECURE LINK ESTABLISHED</span>
          </div>
        </div>
        <div className="glass-panel p-5 sm:p-8 rounded-lg tactical-border">
          <div className="mb-6 sm:mb-8">
            <h2 className="font-headline-md text-base sm:text-headline-md text-on-surface font-bold">COMMAND AUTHENTICATION</h2>
            <div className="h-1 w-12 bg-primary mt-2"></div>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant flex justify-between">
                <span>SERVICE ID / UNIT CODE</span>
                <span className="text-primary/50 text-[10px]">REQUIRED</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors">person_pin</span>
                <input className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface font-data-numeric pl-12 py-4 transition-all placeholder:text-outline/30" placeholder="EX: 1234567-X" type="text" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant flex justify-between">
                <span>COMMAND PASSCODE</span>
                <span className="text-primary/50 text-[10px]">ENCRYPTED</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors">vibration</span>
                <input className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface font-data-numeric pl-12 py-4 transition-all placeholder:text-outline/30" placeholder="••••••••" type={`${!isShowPassword ? "password" : "text"}`} />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors" type="button" onClick={() => setIsShowPassword(!isShowPassword)}>
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              </div>
            </div>
            <button className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-4 rounded-sm flex items-center justify-center gap-3 glitch-hover transition-all group overflow-hidden relative" type="submit">
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-20deg]"></div>
              <span className="material-symbols-outlined">verified_user</span>
              <span className="font-headline-md text-[18px] tracking-widest uppercase">Execute Log-In</span>
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-col items-center gap-4">
            <a className="font-label-caps text-label-caps text-primary hover:text-primary-fixed underline underline-offset-4 decoration-primary/30 transition-colors uppercase" href="#">
              Command Registration
            </a>
            <div className="flex items-center gap-6">
              <a className="text-[10px] font-label-caps text-on-surface-variant hover:text-on-surface transition-colors" href="#">RESET_KEY</a>
              <div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
              <a className="text-[10px] font-label-caps text-on-surface-variant hover:text-on-surface transition-colors" href="#">SUPPORT_HQ</a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center space-y-2 opacity-50">
          <p className="font-label-caps text-[10px] tracking-widest text-on-surface-variant">RESTRICTED ACCESS: AUTHORIZED PERSONNEL ONLY</p>
          <p className="font-label-caps text-[9px] text-on-surface-variant">ILLEGAL ACCESS ATTEMPTS ARE LOGGED AND REPORTED TO COMMAND HQ</p>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 w-full h-24 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#c3cc8c 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
    </div>
  )
}