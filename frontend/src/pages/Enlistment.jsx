import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

export default function Enlistment() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let painting = false

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect()
      if (e.touches && e.touches[0]) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const startPos = (e) => { painting = true; draw(e) }
    const endPos = () => { painting = false; ctx.beginPath() }
    const draw = (e) => {
      if (!painting) return
      const { x, y } = getPos(e)
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#c3cc8c'
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    canvas.addEventListener('mousedown', startPos)
    canvas.addEventListener('mouseup', endPos)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPos(e) })
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); endPos() })
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e) })

    return () => {
      canvas.removeEventListener('mousedown', startPos)
      canvas.removeEventListener('mouseup', endPos)
      canvas.removeEventListener('mousemove', draw)
    }
  }, [])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  return (
    <div className="bg-background text-on-background font-body-base selection:bg-primary selection:text-on-primary min-h-screen flex flex-col overflow-x-hidden">
      {/* Top Bar */}
      <header className="bg-surface-container/60 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-50 flex flex-wrap md:flex-nowrap justify-between items-center w-full px-4 sm:px-6 md:px-8 min-h-16 py-2 sm:py-0 shadow-lg shadow-primary/5 gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="font-headline-md text-base sm:text-headline-md font-black text-primary tracking-tighter">ARMOR-DT</span>
          <div className="h-4 sm:h-6 w-[1px] bg-outline-variant/50"></div>
          <span className="font-label-caps text-[10px] sm:text-label-caps text-on-surface-variant">PERSONNEL_ENLISTMENT_PORTAL</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden md:flex gap-4">
            <span className="text-primary font-bold border-b-2 border-primary py-4">REGISTRATION</span>
            <span className="text-on-surface-variant font-medium hover:text-primary transition-all duration-300 py-4 cursor-pointer">VERIFICATION</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="material-symbols-outlined text-primary text-sm sm:text-base">security</span>
            <span className="font-data-numeric text-[10px] sm:text-data-numeric text-secondary">ENCRYPTED_LINK: ACTIVE</span>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 gap-8 max-w-[1440px] mx-auto w-full relative z-10">
        {/* Left Column */}
        <aside className="lg:w-1/3 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-lg flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
              <h2 className="font-label-caps text-label-caps text-primary">OFFICIAL DOCUMENTATION</h2>
            </div>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg leading-tight uppercase font-black text-on-surface">System Access Authorization</h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Personnel assigned to maintenance duties for the <span className="text-primary">Arjun MK1A Fleet</span> must complete this secure enlistment form. All data is cross-referenced with Central Command Databases.
            </p>
            <div className="mt-4 p-4 border-l-2 border-secondary bg-secondary/5">
              <span className="font-label-caps text-[10px] text-secondary-fixed">ATTENTION</span>
              <p className="text-xs text-on-secondary-container mt-1">Unauthorized attempts to register or falsification of service records are punishable under the Army Act.</p>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-lg">
            <img className="w-full h-48 object-cover rounded opacity-80 grayscale hover:grayscale-0 transition-all duration-500" alt="Arjun MK1A maintenance hangar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTTmz1n9Bo-B5QWrpg1QPN1N_ys6zxCnxqyXJrWyvQGsiwe81lDv0u41dobinBf6UC37ddiVx-MhF7P6JJkRGoAfZ0ofOtDsqry7bkjaymnEmzpXTMsr3dgvbgdv1cW_INM0CcVAzm_aKPG89EKJgY22OEOyNxqvHsOcsWqDxHQT4-phHGCJlsZxPHvcvYbE3JIq_B1pNmcG3Q9yCIk0AURK2Z9Cl-JmdbwOtw4jNBOwXTtshIzF8DpbDn7UwFXPX5aEi-daF0CWk" />
            <div className="mt-4 flex justify-between items-end">
              <div>
                <div className="text-[10px] font-label-caps text-outline">SECURE_ID_TAG</div>
                <div className="font-data-numeric text-primary text-lg">AX-992-DELTA</div>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-4xl">fingerprint</span>
            </div>
          </div>
        </aside>
        {/* Right Column */}
        <section className="lg:w-2/3 flex flex-col gap-6">
          <form className="glass-panel p-8 rounded-lg flex flex-col gap-10 relative overflow-hidden" onSubmit={async (e) => { 
            e.preventDefault(); 
            const form = e.target;
            const data = {
              fullName: form.fullName.value,
              rank: form.rank.value,
              armyId: form.armyId.value,
              unit: form.unit.value,
              securityClearance: form.clearance.value || 'L1: BASIC'
            };
            try {
              await api.enlistPersonnel(data);
              alert('ENLISTMENT SUCCESSFUL. SYNCED WITH COMMAND CENTER.');
              form.reset();
              clearCanvas();
            } catch(err) {
              alert('ENLISTMENT FAILED: ' + err.message);
            }
          }}>
            <div className="tactical-scanline"></div>
            {/* Section 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full border-b border-outline-variant/30 pb-2 mb-2">
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em]">01. Personnel Identity</span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">Full Legal Name</label>
                <input name="fullName" required className="bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-body-base p-3 transition-all placeholder:text-outline-variant/50" placeholder="ENTER NAME AS PER RECORDS" type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">Rank / Designation</label>
                <select name="rank" required className="bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-body-base p-3 transition-all">
                  <option>Subedar Major</option>
                  <option>Subedar</option>
                  <option>Naib Subedar</option>
                  <option>Havildar</option>
                  <option>Naik</option>
                  <option>Maintenance Specialist</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">Service Number (Army ID)</label>
                <input name="armyId" required className="bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-data-numeric p-3 transition-all" placeholder="SN-XXXXX-XX" type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">Unit / Regiment</label>
                <input name="unit" required className="bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-body-base p-3 transition-all" placeholder="e.g. 75 ARMOURED REGIMENT" type="text" />
              </div>
            </div>
            {/* Section 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full border-b border-outline-variant/30 pb-2 mb-2">
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em]">02. Security Clearance</span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">Clearance Level</label>
                <div className="flex gap-2">
                  {[['L1: BASIC', 'clearance1'], ['L2: TACTICAL', 'clearance2'], ['L3: COMMAND', 'clearance3']].map(([lbl, id]) => (
                    <label key={id} className="flex-1 cursor-pointer">
                      <input className="hidden peer" name="clearance" value={lbl} type="radio" id={id} defaultChecked={id === 'clearance1'} />
                      <div className="p-3 text-center border border-outline-variant peer-checked:bg-primary peer-checked:text-on-primary transition-all font-label-caps text-[12px]">{lbl}</div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">Authorization Code</label>
                <div className="relative">
                  <input className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-data-numeric p-3 pr-10" placeholder="••••••••" type="password" />
                  <span className="material-symbols-outlined absolute right-3 top-3 text-outline-variant">vpn_key</span>
                </div>
              </div>
            </div>
            {/* Section 3 */}
            <div className="flex flex-col md:flex-row gap-8 mt-4">
              <div className="flex-1 flex flex-col gap-3">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">Personnel Digital Signature</label>
                <div className="h-32 border border-dashed border-outline-variant/50 rounded bg-surface-container-low/50 flex items-center justify-center relative cursor-crosshair hover:bg-surface-container-low transition-colors">
                  <span className="text-[10px] text-outline-variant font-label-caps">USE MOUSE/STYLUS TO SIGN</span>
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" width={400} height={128}></canvas>
                </div>
                <button className="text-[10px] font-label-caps text-secondary underline text-left" type="button" onClick={clearCanvas}>CLEAR SIGNATURE</button>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase">Command Authorization Hub</label>
                <div className="flex flex-col gap-2 p-4 bg-primary/10 border border-primary/20 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">verified_user</span>
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-primary">PENDING AUTH</div>
                      <div className="text-[10px] text-on-primary-container">Requires Commanding Officer Approval</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-on-surface-variant italic">
                    &quot;System access will be provisioned within 15 minutes of CO verification.&quot;
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <input className="rounded border-outline-variant text-primary focus:ring-primary bg-surface-container" type="checkbox" id="protocol-agree" />
                <label className="text-[11px] text-on-surface-variant" htmlFor="protocol-agree">I acknowledge the <a className="text-secondary" href="#">Security Protocols</a> and Operational Orders.</label>
              </div>
              <button className="bg-primary text-on-primary font-label-caps px-10 py-4 flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary/20 hover:brightness-110" type="submit">
                SUBMIT_ENLISTMENT
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </form>
        </section>
      </main>
      <footer className="mt-auto p-4 md:p-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-label-caps text-outline-variant tracking-widest gap-4">
        <div className="flex items-center gap-4">
          <span>© 2024 INDIAN ARMY - DIGITAL TWIN DIVISION</span>
          <span className="hidden md:block">|</span>
          <span>SYSTEM_BUILD: 4.2.0-STABLE</span>
        </div>
        <div className="flex gap-6">
          {['CORE_SYSTEMS: GO', 'UPLINK: STABLE', 'ENCRYPTION: AES-256'].map(l => (
            <div key={l} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              {l}
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}
